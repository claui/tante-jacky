import Step from "../step.js";

export default class FrontendVersionCheck extends Step {
  #metadataProvider;
  #states;

  constructor({ metadataProvider }) {
    const states = {};
    super("Frontend-Version", states);
    this.#metadataProvider = metadataProvider;
    this.#states = states;
  }

  run() {
    this.#states.success.enter({
      title: this.name,
      value: this.#metadataProvider.getAppVersion() ?? "nicht verfügbar",
    });
  }
}
