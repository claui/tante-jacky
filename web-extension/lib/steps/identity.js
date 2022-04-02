import Step from "../step.js";

export default class WebsiteIdentityCheck extends Step {
  #states;

  constructor() {
    const states = {};
    super(states);
    this.#states = states;
  }

  run() {
    this.#states.success.enter({
      title: "Identität der Website",
      value: "ok",
      details: "spk-aschaffenburg.de",
    });
    return this;
  }
}
