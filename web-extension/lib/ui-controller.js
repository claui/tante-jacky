import StateBlockedError from "./errors/state-blocked.js";
import {
  FrontendVersionCheck,
  IncognitoCheck,
  WebsiteIdentityCheck,
  TanChallengeCheck,
} from "./steps.js";

export default class UiController {
  #defaultDependencies = {
    metadataProvider: {
      getAppName: () => "Tante Jacky",
      getAppVersion: () => null,
    },
  };

  #metadataProvider;
  #siteIdentityProvider;
  #tanChallengeProvider;

  constructor(dependencies) {
    ({
      metadataProvider: this.#metadataProvider,
      siteIdentityProvider: this.#siteIdentityProvider,
      tanChallengeProvider: this.#tanChallengeProvider,
    } = { ...this.#defaultDependencies, ...dependencies });
  }

  async *run() {
    try {
      const metadataProvider = this.#metadataProvider;
      const siteIdentityProvider = this.#siteIdentityProvider;
      const tanChallengeProvider = this.#tanChallengeProvider;

      yield* this.#waitForAllToSucceedInOrder(
        new FrontendVersionCheck({ metadataProvider }),
        new IncognitoCheck({ metadataProvider, siteIdentityProvider }),
        new WebsiteIdentityCheck({ metadataProvider, siteIdentityProvider })
      );

      yield new TanChallengeCheck({ tanChallengeProvider }).start();
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
