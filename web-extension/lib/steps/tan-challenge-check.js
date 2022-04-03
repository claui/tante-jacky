import Step from "../step.js";

export default class TanChallengeCheck extends Step {
  #states;

  constructor() {
    const states = {};
    super("Seite fordert TAN für eine Zahlung", states);
    this.#states = states;
  }

  run() {
    this.#states.failed.enter({
      title: this.name,
      value: "fehlgeschlagen",
      details:
        "Ihr Browser fordert gerade keine TAN für eine Zahlung." +
        "Veranlassen Sie eine Zahlung, die eine TAN erfordert.",
    });
    return this;
  }
}
