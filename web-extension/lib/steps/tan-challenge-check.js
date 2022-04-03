import StepFailedError from "../errors/step-failed.js";
import Step from "../step.js";

export default class TanChallengeCheck extends Step {
  #states;

  constructor() {
    const states = {};
    super("Seite fordert TAN für eine Zahlung", states);
    this.#states = states;
  }

  run() {
    throw new StepFailedError(
      "Ihr Browser fordert gerade keine TAN für eine Zahlung. " +
        "Veranlassen Sie eine Zahlung, die eine TAN erfordert."
    );
  }
}
