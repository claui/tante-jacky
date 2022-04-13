import StepFailedError from "../errors/step-failed.js";
import Step from "../step.js";

export default class TanChallengeCheck extends Step {
  #states;

  constructor() {
    const states = {};
    super("Seite verlangt eine TAN", states);
    this.#states = states;
  }

  run() {
    throw new StepFailedError(
      "Diese Seite fordert gerade keine TAN für eine Zahlung. " +
        "Veranlasse eine Zahlung, die eine TAN verlangt.",
        { result: "nein" },
    );
  }
}
