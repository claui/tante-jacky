import DomainName from "../net/domain-name.js";

export default class SiteIdentityProvider {
  #_activeTab;

  async #activeTab() {
    if (this.#_activeTab) {
      return this.#_activeTab;
    }
    const tabsQueryResult = await browser.tabs.query({
      active: true,
      currentWindow: true,
    })
    if (tabsQueryResult.length < 1
      || typeof tabsQueryResult[0].url !== "string") {
      throw new Error("Unable to query the active tab in the current window");
    }
    this.#_activeTab = tabsQueryResult[0];
    return this.#_activeTab;
  }

  async getDomainName() {
    const tab = await this.#activeTab();
    return DomainName.ofUrl(tab.url);
  }

  async hasDomainName() {
    const tab = await this.#activeTab();
    return DomainName.containsDomainName(tab.url);
  }

  async isIncognito() {
    const tab = await this.#activeTab();
    return tab.incognito;
  }
};
