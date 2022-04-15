const DOMAIN_NAME_PATTERN = /((?!-)[A-Za-z0-9-]+(?<!-)\.)+[A-Za-z]+/;

export default class DomainName {
  #hostname;

  static containsDomainName(url) {
    return DOMAIN_NAME_PATTERN.test(url);
  }

  static ofUrl(url) {
    const matches = DOMAIN_NAME_PATTERN.exec(url);
    if (matches === null) {
      throw new Error(`Invalid URL: ${url}`)
    }
    return new DomainName(matches[0]);
  }

  static ofHostname(hostname) {
    return new DomainName(hostname);
  }

  constructor(hostname) {
    this.#hostname = hostname;
  }

  get hostname() {
    return this.#hostname;
  }

  isSubdomainOfOrEqual(otherDomainName) {
    if (typeof this.hostname !== "string") {
      return false;
    }
    return (
      this.hostname === otherDomainName?.hostname ||
      this.hostname.endsWith(`.${otherDomainName?.hostname}`)
    );
  }

  toString() {
    return this.#hostname;
  }
}
