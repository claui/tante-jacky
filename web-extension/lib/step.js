export default class Step {
  #states = {
    running: {},
    success: {},
  };

  didEnterRunningState;

  constructor(states) {
    Object.assign(states, this.#states);

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
