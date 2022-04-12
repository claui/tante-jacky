import { sleep } from "./time.js";

const ASSETS = {
  warning: "assets/iso7010-w001.svg",
}

function assetUrl(assetName) {
  return browser.runtime.getURL(ASSETS[assetName]);
}

function makeStep({ title, value, icon, description, button }) {
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
    iconElement.classList.add(icon)
    iconElement.setAttribute("style", `background-image: url(${assetUrl(icon)});`);
  } else {
    step.querySelector(".icon").remove();
  }

  if (description) {
    step.querySelector("small").textContent = description;
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
};

async function appendSteps() {
  const steps = document.getElementById("steps");

  await sleep(1000);

  steps.appendChild(
    makeStep({
      title: "Frontend-Version",
      value: "0.1.0",
    })
  );

  await sleep(1000);

  steps.appendChild(
    makeStep({
      title: "TLS-Zertifikat der Website",
      icon: "warning",
      value: "kapott",
      button: { name: "show", textContent: "Details …" },
    })
  );

  await sleep(1000);

  steps.appendChild(
    makeStep({
      title: "Identität der Website",
      value: "spk-aschaffenburg.de",
      description: "Sparkasse Aschaffenburg-Alzenau",
    })
  );
}

appendSteps();
