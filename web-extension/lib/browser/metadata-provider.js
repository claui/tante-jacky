export default class MetadataProvider {
  #appName;
  #appVersion;

  constructor() {
    const manifest = browser.runtime.getManifest();
    this.#appName = manifest.name;
    this.#appVersion = manifest.version;
  }

  getAppName() {
    return this.#appName;
  }

  getAppVersion() {
    return this.#appVersion;
  }
}
