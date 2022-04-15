import Step from "../step.js";

export default class IncognitoCheck extends Step {
  #states;
  #appName;
  #siteIdentityProvider;

  constructor({ metadataProvider, siteIdentityProvider }) {
    const states = {};
    super("Browsermodus", states);
    this.#states = states;
    this.#appName = metadataProvider.getAppName();
    this.#siteIdentityProvider = siteIdentityProvider;
  }

  async run() {
    const isIncognito = await this.#siteIdentityProvider.isIncognito();

    if (isIncognito) {
      this.#states.running.enter({
        title: this.name,
        value: "Privates Fenster",
        details:
          `Soll ${this.#appName} trotzdem fortfahren?` +
          " Log‑Einträge können in der Konsole deines Browsers landen, und" +
          " das Backend kann Log‑Einträge auf dem Gerät hinterlassen." +
          " In den Logs können Namen besuchter Webseiten sichtbar sein." +
          " Wenn du trotzdem fortfahren möchtest, dann leere hinterher deine" +
          " Browser-Konsole und lösche die Logs im Backend.",
        icon: "warning",
        button: {
          name: "continue",
          textContent: "Weiter",
          onAction: () =>
            this.#states.success.enter({
              title: this.name,
              value: "Privates Fenster",
            }),
        },
      });
      return;
    }

    this.#states.success.enter({
      title: this.name,
      value: "Standard",
    });
  }
}
