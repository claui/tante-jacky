import ConsoleFriendlyError from "./console/console-friendly-error.js";
import UiController from "./ui-controller.js";
import {
  MetadataProvider,
  SiteIdentityProvider,
  TanChallengeProvider,
} from "./browser.js";
import { makeStepSection } from "./popup/dom.js";

function logError(error) {
  /*
   * The `UiController` class is responsible for how errors
   * interact with the control flow.
   *
   * Now all we want to do is log the error to the browser console.
   * We’ve waited until now to do that because we want to make it
   * immediately clear to developers that the error comes from
   * this extension, and from nowhere else.
   * At this point in the call stack, logging the error makes the
   * file name of this module appear right next to the logged error.
   */
  const errorToLog = error?.cause ?? error?.details ?? error;
  console.error(errorToLog.message, new ConsoleFriendlyError(errorToLog));
}

(async function () {
  const metadataProvider = new MetadataProvider();
  const appName = metadataProvider.getAppName();
  const controller = new UiController({
    metadataProvider,
    siteIdentityProvider: new SiteIdentityProvider(),
    tanChallengeProvider: new TanChallengeProvider(),
  });

  document.querySelector("title").textContent = appName;
  document.querySelector("#appName").textContent = appName;

  const stepSections = document.getElementById("steps");

  for await (const step of controller.run()) {
    const stepSection = { element: null };

    const appendOrReplace = (newElement) => {
      if (stepSection.element === null) {
        stepSections.appendChild(newElement);
      } else {
        stepSection.element.replaceWith(newElement);
      }
      stepSection.element = newElement;
    };

    step.didEnterSuccessState.then((descriptor) =>
      appendOrReplace(makeStepSection(descriptor))
    );

    step.didEnterFailureState.then((descriptor) => {
      logError(descriptor);

      appendOrReplace(
        makeStepSection({
          icon: "warning",
          ...descriptor,
        })
      );
    });

    step.didEnterRunningState.then((descriptor) =>
      appendOrReplace(makeStepSection(descriptor))
    );
  }
})();
