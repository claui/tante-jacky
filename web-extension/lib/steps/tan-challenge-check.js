import StepFailedError from "../errors/step-failed.js";
import Step from "../step.js";
import TanMechanism from "../tan/tan-mechanism.js";

export default class TanChallengeCheck extends Step {
  #states;
  #tanChallengeProvider;

  constructor(tanChallengeProvider) {
    const states = {};
    super("Seite verlangt eine TAN", states);
    this.#states = states;
    this.#tanChallengeProvider = tanChallengeProvider;
  }

  async run() {
    this.#states.running.enter({
      title: this.name,
      value: "Auf Webseite warten",
    });

    const tanMechanism = await this.#tanChallengeProvider.detectTanMechanism();

    if (!tanMechanism) {
      throw new StepFailedError(
        "Diese Seite fordert gerade keine TAN für eine Zahlung." +
          " Veranlasse eine Zahlung, die eine TAN verlangt.",
        { result: "nein" }
      );
    }

    if (tanMechanism !== TanMechanism.OPTICAL_FLICKER) {
      throw new StepFailedError(
        `Diese Seite nutzt ${this.#describeTanMechanism(tanMechanism)}.` +
          " Ändere das Verfahren auf Flickercode und probiere es nochmal.",
        { result: "Nicht unterstützt" }
      );
    }

    const tanChallenge =
      await this.#tanChallengeProvider.scrapeOpticalTanChallenge();

    this.#states.success.enter({
      title: this.name,
      value: "ja",
      details: `Die TAN-Challenge lautet: ${tanChallenge.hhdTanChallengeHex}`,
    });
  }

  #describeTanMechanism(tanMechanism) {
    switch (tanMechanism) {
      case TanMechanism.OPTICAL_FLICKER:
        return "das optische TAN-Verfahren mit Flickercode";
      case TanMechanism.OPTICAL_QR:
        return "das optische TAN-Verfahren über QR-Code";
      case TanMechanism.MANUAL:
        return "das manuelle TAN-Verfahren";
      default:
        throw new Error(`Unbekannter TAN-Mechanismus: ${tanMechanism}`);
    }
  }
}
