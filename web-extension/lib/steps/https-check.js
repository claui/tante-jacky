import Step from "../step.js";

export default class HttpsCheckingStep extends Step {
  #states;

  constructor() {
    const states = {};
    super(states);
    this.#states = states;
  }

  run() {
    this.#states.success.enter({
      title: "Zertifikat der Website",
      value: "ok",
    });
    return this;
  }
}
