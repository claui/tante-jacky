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
  #upstreamIdentityProvider;

  constructor(dependencies) {
    ({
      frontendVersionProvider: this.#frontendVersionProvider,
      upstreamIdentityProvider: this.#upstreamIdentityProvider,
    } = { ...this.#defaultDependencies, ...dependencies });
  }

  async *run() {
    yield* this.#mustSucceed(
      new FrontendVersionCheck(this.#frontendVersionProvider).run(),
      new TlsCertificateCheck(this.#upstreamIdentityProvider).run(),
      new WebsiteIdentityCheck(this.#upstreamIdentityProvider).run()
    );

    yield new TanChallengeCheck().run();
  }

  async *#mustSucceed(...checks) {
    for (const check of checks) {
      yield check;
      await check.didEnterSuccessState;
    }
  }
}
