import StepFailedError from "../errors/step-failed.js";
import DomainName from "../net/domain-name.js";
import Step from "../step.js";

export default class WebsiteIdentityCheck extends Step {
  static ALLOWED_DOMAIN_NAMES = Object.freeze(
    ["spk-aschaffenburg.de"].map(DomainName.ofHostname)
  );

  #states;
  #metadataProvider;
  #siteIdentityProvider;

  constructor({ metadataProvider, siteIdentityProvider }) {
    const states = {};
    super("Identität der Website", states);
    this.#states = states;
    this.#metadataProvider = metadataProvider;
    this.#siteIdentityProvider = siteIdentityProvider;
  }

  async run() {
    if (!(await this.#siteIdentityProvider.hasDomainName())) {
      throw new StepFailedError(
        "Besuche eine Webseite, die eine TAN verlangt.",
        { result: "Keine Seite aufgerufen" }
      );
    }
    const domainName = await this.#siteIdentityProvider.getDomainName();

    const allowlistedParentDomainName =
      WebsiteIdentityCheck.#findAllowlistedParentDomainName(domainName);

    if (!allowlistedParentDomainName) {
      const appName = this.#metadataProvider.getAppName();
      throw new StepFailedError(
        `${appName} kennt die Seite „${domainName}“ nicht.` +
          " Gehe auf eine andere Webseite und probiere es nochmal.",
        { result: "Seite nicht freigegeben" }
      );
    }

    this.#states.success.enter({
      title: this.name,
      value: "ok",
      details:
        `Die Domain „${allowlistedParentDomainName.hostname}“` +
        " ist in Ordnung.",
    });
  }

  static #findAllowlistedParentDomainName(domainName) {
    return this.ALLOWED_DOMAIN_NAMES.find((candidate) =>
      domainName.isSubdomainOfOrEqual(candidate)
    );
  }
}
