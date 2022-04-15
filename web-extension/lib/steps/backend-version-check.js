import Step from "../step.js";

export default class BackendVersionCheck extends Step {
  #backendService;
  #states;

  constructor({ backendService }) {
    const states = {};
    super("Verbindung zum Python-Backend", states);
    this.#backendService = backendService;
    this.#states = states;
  }

  async run() {
    const backendVersion = await this.#backendService.getHelperVersion();
    this.#states.success.enter({
      title: this.name,
      value: "ok",
      details: `Backend-Version ${backendVersion}`,
    });
  }
}
