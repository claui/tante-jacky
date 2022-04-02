import FrontendVersionStep from "./steps/frontend-version.js";
import HttpsCheckingStep from "./steps/https-check.js";

export default class UiController {
  async *run() {
    yield new FrontendVersionStep().run();
    yield new HttpsCheckingStep().run();
  }
}
