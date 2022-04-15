import DomainName from "../net/domain-name.js";
import { queryActiveTab } from "./tab.js";

export default class SiteIdentityProvider {
  #_activeTab;

  async #activeTab() {
    if (this.#_activeTab) {
      return this.#_activeTab;
    }
    this.#_activeTab = await queryActiveTab();
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
}
