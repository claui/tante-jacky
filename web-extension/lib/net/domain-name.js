export default class DomainName {
  #hostname;

  static of(hostname) {
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
