import DomainName from "./net/domain-name.js";
import UiController from "./ui-controller.js";

const ASSETS = {
  warning: "assets/iso7010-w001.svg",
};

const upstreamIdentityProvider = {
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

async function run() {
  const controller = new UiController({ upstreamIdentityProvider });
  const steps = document.getElementById("steps");

  for await (const step of controller.run()) {
    step.didEnterSuccessState.then((descriptor) => {
      steps.appendChild(makeStep(descriptor));
    });

    step.didEnterFailureState.then((descriptor) => {
      steps.appendChild(
        makeStep({
          icon: "warning",
          ...descriptor,
        })
      );
    });
  }
}

run();
