import ConsoleFriendlyError from "./console/console-friendly-error.js";
import DomainName from "./net/domain-name.js";
import UiController from "./ui-controller.js";

const ASSETS = {
  warning: "assets/iso7010-w001.svg",
};

const siteIdentityProvider = {
  getDomainName: () => new DomainName("spk-aschaffenburg.de"),
};

function assetUrl(assetName) {
  return browser.runtime.getURL(ASSETS[assetName]);
}

function makeStep({ title, value, icon, details, button }) {
  const step = document
    .getElementById("template-step-success")
    .content.cloneNode(true)
    .querySelector(".step");

  step.querySelector("h2").textContent = title;

  if (value) {
    step.querySelector("p").textContent = value;
  }

  if (icon) {
    const iconElement = step.querySelector(".icon");
    iconElement.classList.add(icon);
    iconElement.setAttribute(
      "style",
      `background-image: url(${assetUrl(icon)});`
    );
  } else {
    step.querySelector(".icon").remove();
  }

  if (details) {
    step.querySelector("small").textContent = details;
  } else {
    step.querySelector("small").remove();
  }

  if (button) {
    const buttonElement = step.querySelector("form button");
    buttonElement.setAttribute("name", button.name);
    buttonElement.textContent = button.textContent;
  } else {
    step.querySelector("form").remove();
  }

  return step;
}

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
  const controller = new UiController({ siteIdentityProvider });
  const steps = document.getElementById("steps");

  for await (const step of controller.run()) {
    step.didEnterSuccessState.then((descriptor) => {
      steps.appendChild(makeStep(descriptor));
    });

    step.didEnterFailureState.then((descriptor) => {
      logError(descriptor);

      steps.appendChild(
        makeStep({
          icon: "warning",
          ...descriptor,
        })
      );
    });
  }
})();
