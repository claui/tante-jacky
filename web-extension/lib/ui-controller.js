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
    yield new FrontendVersionCheck(this.#frontendVersionProvider).run();
    yield new TlsCertificateCheck(this.#upstreamIdentityProvider).run();
    yield new WebsiteIdentityCheck(this.#upstreamIdentityProvider).run();
    yield new TanChallengeCheck().run();
  }
}
