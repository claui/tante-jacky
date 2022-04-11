let makeStep = function ({ title, value, icon, description, button }) {
  const steps = document.getElementById("steps");
  const step = document
    .getElementById("template-step-success")
    .content.cloneNode(true)
    .querySelector(".step");

  step.querySelector("h2").textContent = title;

  if (value) {
    step.querySelector("p").textContent = value;
  }

  if (icon) {
    step.querySelector(".icon").textContent = icon;
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

steps.appendChild(
  makeStep({
    title: "Frontend-Version",
    value: "0.1.0",
  })
);

steps.appendChild(
  makeStep({
    title: "TLS-Zertifikat der Website",
    icon: "ø",
    value: "ok",
    button: { name: "show", textContent: "Details …" },
  })
);

steps.appendChild(
  makeStep({
    title: "Identität der Website",
    value: "spk-aschaffenburg.de",
    description: "Sparkasse Aschaffenburg-Alzenau",
  })
);
