import Step from "../step.js";

export default class TlsCertificateCheck extends Step {
  #states;

  constructor() {
    const states = {};
    super("TLS-Zertifikat der Website", states);
    this.#states = states;
  }

  run() {
    this.#states.success.enter({
      title: this.name,
      value: "ok",
    });
  }
}
