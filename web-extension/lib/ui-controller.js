import FrontendVersionCheck from "./steps/frontend-version.js";
import TlsCertificateCheck from "./steps/tls-cert.js";
import WebsiteIdentityCheck from "./steps/identity.js";

export default class UiController {
  async *run() {
    yield new FrontendVersionCheck().run();
    yield new TlsCertificateCheck().run();
    yield new WebsiteIdentityCheck().run();
  }
}
