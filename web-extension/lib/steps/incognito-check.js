import { APP_NAME } from "../version.js";
import Step from "../step.js";

export default class IncognitoCheck extends Step {
  #states;
  #siteIdentityProvider;

  constructor(siteIdentityProvider) {
    const states = {};
    super("Browsermodus", states);
    this.#states = states;
    this.#siteIdentityProvider = siteIdentityProvider;
  }

  async run() {
    const isIncognito = await this.#siteIdentityProvider.isIncognito();

    if (isIncognito) {
      this.#states.running.enter({
        title: this.name,
        value: "Privates Fenster",
        details:
          `Soll ${APP_NAME} trotzdem fortfahren? ` +
          "Bedenke: Log-Einträge können in der Konsole deines Browsers landen. " +
          `Außerdem kann das Backend von ${APP_NAME} Log-Einträge auf deinem ` +
          "Gerät hinterlassen. In den Logs können Namen besuchter Webseiten " +
          "sichtbar sein. Wenn du trotzdem fortfahren möchtest, dann leere " +
          "hinterher deine Browser-Konsole und lösche die Logs im Backend.",
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
