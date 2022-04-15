import StateBlockedError from "./errors/state-blocked.js";

export default class Step {
  #name;

  #states = {
    failed: { id: "failed" },
    running: { id: "running" },
    success: { id: "success" },
  };

  #policiesByName = {
    failed: {
      allowReject: false,
      handlerName: "didEnterFailureState",
    },
    running: {
      allowReject: false,
      handlerName: "didEnterRunningState",
    },
    success: {
      allowReject: true,
      handlerName: "didEnterSuccessState",
    },
  };

  didEnterFailureState;
  didEnterRunningState;
  didEnterSuccessState;

  constructor(name, states) {
    this.#name = name;
    Object.assign(states, this.#states);

    // Initialize private controllers for states
    for (const [name, policy] of Object.entries(this.#policiesByName)) {
      this.#states[name].promise = new Promise((resolve, reject) => {
        if (policy.allowReject) {
          this.#states[name].raise = reject;
        }
        this.#states[name].enter = resolve;
      });
      // Expose the promise as a public field
      this[policy.handlerName] = this.#states[name].promise;
    }

    // Interlock to reject contradicting states
    const preventStates = (
      { details: message, ...stateDescriptor },
      ...stateControllers
    ) => {
      for (const state of stateControllers) {
        // Toss the reference to the resolver, making it unfulfillable
        state.enter = (fulfillmentValue) => {
          throw new StateBlockedError(message, {
            blockedState: state.id,
            fulfillmentValue,
            ...stateDescriptor,
          });
        };
      }
    };

    this.didEnterFailureState.then((stateDescriptor) => {
      preventStates(
        stateDescriptor,
        this.#states.running,
        this.#states.success
      );
    });

    this.didEnterSuccessState.then((stateDescriptor) => {
      preventStates(stateDescriptor, this.#states.failed, this.#states.running);
    });
  }

  start() {
    try {
      Promise.resolve(this.run()).catch((error) => this.#handleError(error));
    } catch (error) {
      this.#handleError(error);
    }
    return this;
  }

  get name() {
    return this.#name;
  }

  toString() {
    return this.#name;
  }

  #handleError(error) {
    this.#states.failed.enter({
      title: this.name,
      value: error?.result ?? "Fehler",
      details: error.message,
      cause: error,
    });
  }
}
