import Step from "../step.js";

export default class FrontendVersionCheck extends Step {
  #frontendVersionProvider;
  #states;

  constructor(frontendVersionProvider) {
    const states = {};
    super(states);
    this.#frontendVersionProvider = frontendVersionProvider;
    this.#states = states;
  }

  run() {
    this.#states.success.enter({
      title: "Frontend-Version",
      value: this.#frontendVersionProvider.get(),
    });
    return this;
  }
}
