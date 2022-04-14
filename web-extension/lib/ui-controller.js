import StateBlockedError from "./errors/state-blocked.js";
import {
  FrontendVersionCheck,
  IncognitoCheck,
  WebsiteIdentityCheck,
  TanChallengeCheck,
} from "./steps.js";

import { APP_VERSION } from "./version.js";

export default class UiController {
  #defaultDependencies = {
    frontendVersionProvider: { get: () => APP_VERSION },
  };

  #frontendVersionProvider;
  #siteIdentityProvider;
  #tanChallengeProvider;

  constructor(dependencies) {
    ({
      frontendVersionProvider: this.#frontendVersionProvider,
      siteIdentityProvider: this.#siteIdentityProvider,
      tanChallengeProvider: this.#tanChallengeProvider,
    } = { ...this.#defaultDependencies, ...dependencies });
  }

  async *run() {
    try {
      yield* this.#waitForAllToSucceedInOrder(
        new FrontendVersionCheck(this.#frontendVersionProvider),
        new IncognitoCheck(this.#siteIdentityProvider),
        new WebsiteIdentityCheck(this.#siteIdentityProvider)
      );

      yield new TanChallengeCheck(this.#tanChallengeProvider).start();
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
