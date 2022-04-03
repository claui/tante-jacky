import DomainName from "../net/domain-name.js";
import Step from "../step.js";

export default class WebsiteIdentityCheck extends Step {
  static ALLOWED_DOMAIN_NAMES = Object.freeze(
    ["spk-aschaffenburg.de"].map(DomainName.of)
  );

  #states;
  #upstreamIdentityProvider;

  constructor(upstreamIdentityProvider) {
    const states = {};
    super("Identität der Website", states);
    this.#states = states;
    this.#upstreamIdentityProvider = upstreamIdentityProvider;
  }

  run() {
    this.#assertDomainNameAllowed().catch(console.error);
    return this;
  }

  async #assertDomainNameAllowed() {
    const domainName = await this.#upstreamIdentityProvider.getDomainName();

    const allowlistedParentDomainName =
      WebsiteIdentityCheck.#findAllowlistedParentDomainName(domainName);

    if (allowlistedParentDomainName) {
      this.#states.success.enter({
        title: this.name,
        value: "ok",
        details: allowlistedParentDomainName.hostname,
      });
    } else {
      this.#states.failed.enter({
        title: this.name,
        value: "fehlgeschlagen",
        details: `Die Domain „${domainName}“ ist für dieses Verfahren nicht freigegeben.`,
      });
    }
  }

  static #findAllowlistedParentDomainName(domainName) {
    return this.ALLOWED_DOMAIN_NAMES.find((candidate) =>
      domainName.isSubdomainOfOrEqual(candidate)
    );
  }
}
