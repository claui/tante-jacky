import StepFailedError from "../errors/step-failed.js";
import DomainName from "../net/domain-name.js";
import Step from "../step.js";

export default class WebsiteIdentityCheck extends Step {
  static ALLOWED_DOMAIN_NAMES = Object.freeze(
    ["spk-aschaffenburg.de"].map(DomainName.of)
  );

  #states;
  #siteIdentityProvider;

  constructor(siteIdentityProvider) {
    const states = {};
    super("Identität der Website", states);
    this.#states = states;
    this.#siteIdentityProvider = siteIdentityProvider;
  }

  async run() {
    const domainName = await this.#siteIdentityProvider.getDomainName();

    const allowlistedParentDomainName =
      WebsiteIdentityCheck.#findAllowlistedParentDomainName(domainName);

    if (allowlistedParentDomainName) {
      this.#states.success.enter({
        title: this.name,
        value: "ok",
        details: allowlistedParentDomainName.hostname,
      });
    } else {
      throw new StepFailedError(
        `Die Domain „${domainName}“ ist für dieses Verfahren nicht freigegeben.`
      );
    }
  }

  static #findAllowlistedParentDomainName(domainName) {
    return this.ALLOWED_DOMAIN_NAMES.find((candidate) =>
      domainName.isSubdomainOfOrEqual(candidate)
    );
  }
}
