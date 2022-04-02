export default class Step {
  #states = {
    failed: {},
    running: {},
    success: {},
  };

  didEnterFailureState;
  didEnterRunningState;
  didEnterSuccessState;

  constructor(states) {
    Object.assign(states, this.#states);

    this.didEnterFailureState = new Promise((resolve, reject) => {
      this.#states.failed.enter = resolve;
      this.#states.failed.fail = reject;
    });

    this.didEnterRunningState = new Promise((resolve, reject) => {
      this.#states.running.enter = resolve;
      this.#states.running.fail = reject;
    });

    this.didEnterSuccessState = new Promise((resolve, reject) => {
      this.#states.success.enter = resolve;
      this.#states.success.fail = reject;
    });
  }
}
