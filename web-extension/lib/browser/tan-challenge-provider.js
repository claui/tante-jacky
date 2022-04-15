import Command from "../content-script/commands.js";
import ContentScriptResponseError from "../errors/content-script-response.js";
import MetadataProvider from "./metadata-provider.js";
import ResponseStatus from "../content-script/responses.js";
import TanMechanism from "../tan/tan-mechanism.js";
import { queryActiveTab } from "./tab.js";

export default class TanChallengeProvider {
  #appName = new MetadataProvider().getAppName();

  async detectTanMechanism() {
    return await this.#sendContentScriptCommand(Command.DETECT_TAN_MECHANISM);
  }

  async scrapeOpticalTanChallenge() {
    return await this.#sendContentScriptCommand(
      Command.SCRAPE_OPTICAL_TAN_CHALLENGE
    );
  }

  async #sendContentScriptCommand(command) {
    const activeTab = await queryActiveTab();
    if (activeTab.id === browser.tabs.TAB_ID_NONE) {
      return null;
    }

    await browser.tabs.executeScript({
      file: "/lib/content-script/tante-jacky-content.js",
    });

    const initResponse = await browser.tabs.sendMessage(activeTab.id, {
      init: {
        commandConstants: Command,
        responseStatusConstants: ResponseStatus,
        tanMechanismConstants: TanMechanism,
      },
    });
    if (typeof initResponse !== "object") {
      throw new ContentScriptResponseError(
        "Das Content-Skript ließ sich nicht initialisieren.",
        initResponse
      );
    }

    const response = await browser.tabs.sendMessage(activeTab.id, { command });
    if (!response) {
      throw new ContentScriptResponseError(
        "Das Content-Skript antwortet nicht.",
        response
      );
    }

    switch (response.status) {
      case ResponseStatus.OK:
        return response.payload;

      case ResponseStatus.NOT_FOUND:
        return null;

      case ResponseStatus.UNKNOWN_COMMAND:
        throw new ContentScriptResponseError(
          "Das Content-Skript kennt das Kommando" +
            ` „${response.originalRequest.command}“ nicht.`,
          response
        );

      default:
        throw new ContentScriptResponseError(
          `${this.#appName} versteht die Antwort „${response.status}“ nicht.`,
          response
        );
    }
  }
}
