import { assetUrl } from "../browser.js";

export const makeStepSection = ({ title, value, icon, details, button }) => {
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
    if (button.onAction) {
      buttonElement.addEventListener("click", button.onAction);
    }
  } else {
    step.querySelector("form").remove();
  }

  return step;
};
