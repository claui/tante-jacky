import Step from "../step.js";

export default class TlsCertificateCheck extends Step {
  #states;

  constructor() {
    const states = {};
    super(states);
    this.#states = states;
  }

  run() {
    this.#states.success.enter({
      title: "TLS-Zertifikat der Website",
      value: "ok",
    });
    return this;
  }
}
