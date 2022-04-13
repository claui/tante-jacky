import StateBlockedError from "./errors/state-blocked.js";
import {
  FrontendVersionCheck,
  TlsCertificateCheck,
  WebsiteIdentityCheck,
  TanChallengeCheck,
} from "./steps.js";

import { VERSION } from "./version.js";

export default class UiController {
  #defaultDependencies = {
    frontendVersionProvider: { get: () => VERSION },
  };

  #frontendVersionProvider;
  #siteIdentityProvider;

  constructor(dependencies) {
    ({
      frontendVersionProvider: this.#frontendVersionProvider,
      siteIdentityProvider: this.#siteIdentityProvider,
    } = { ...this.#defaultDependencies, ...dependencies });
  }

  async *run() {
    try {
      yield* this.#waitForAllToSucceedInOrder(
        new FrontendVersionCheck(this.#frontendVersionProvider),
        new TlsCertificateCheck(this.#siteIdentityProvider),
        new WebsiteIdentityCheck(this.#siteIdentityProvider)
      );

      yield new TanChallengeCheck().start();
    } catch (error) {
      if (error instanceof StateBlockedError) {
        // Already handled through `state.failed`.
        // All we need to do now is stop.
      } else {
        throw error;
      }
    }
  }

  async *#waitForAllToSucceed(...steps) {
    for (const step of steps) {
      step.start();
      yield step;
    }
    await Promise.all(steps.map((step) => step.didEnterSuccessState));
  }

  async *#waitForAllToSucceedInOrder(...steps) {
    for (const step of steps) {
      step.start();
      yield step;
      await step.didEnterSuccessState;
    }
  }
}
