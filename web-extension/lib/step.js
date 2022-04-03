import StateBlockedError from "./errors/state-blocked.js";
import StepFailedError from "./errors/step-failed.js";

export default class Step {
  #name;

  #states = {
    failed: { id: "failed" },
    running: { id: "running" },
    success: { id: "success" },
  };

  didEnterFailureState;
  didEnterRunningState;
  didEnterSuccessState;

  constructor(name, states) {
    this.#name = name;
    Object.assign(states, this.#states);

    this.didEnterFailureState = new Promise((resolve, reject) => {
      this.#states.failed.enter = resolve;
      this.#states.failed.prevent = reject;
    });

    this.didEnterRunningState = new Promise((resolve, reject) => {
      this.#states.running.enter = resolve;
      this.#states.running.prevent = reject;
    });

    this.didEnterSuccessState = new Promise((resolve, reject) => {
      this.#states.success.enter = resolve;
      this.#states.success.prevent = reject;
    });

    const preventStates = (
      { details: message, ...stateDescriptor },
      ...blockedStates
    ) => {
      for (const state of blockedStates) {
        state.prevent(
          stateDescriptor?.cause ??
            new StateBlockedError(message, {
              blockedState: state.id,
              ...stateDescriptor,
            })
        );
        state.prevent = () => {};
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
    if (error instanceof StepFailedError) {
      this.#states.failed.enter({
        title: this.name,
        value: error.result,
        details: error.message,
      });
      return;
    }

    this.#states.failed.enter({
      title: this.name,
      value: "Fehler",
      details: error.name,
      cause: error,
    });
  }
}
