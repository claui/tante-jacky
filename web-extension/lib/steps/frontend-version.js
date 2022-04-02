import Step from "../step.js";

const FRONTEND_VERSION = "0.1.0";

export default class FrontendVersionStep extends Step {
  #states;

  constructor() {
    const states = {};
    super(states);
    this.#states = states;
  }

  run() {
    this.#states.success.enter({
      title: "Frontend-Version",
      value: FRONTEND_VERSION,
    });
    return this;
  }
}
