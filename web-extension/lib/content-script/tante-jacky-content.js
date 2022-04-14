(() => {
  if (window.isContentScriptSourced) {
    return;
  }
  window.isContentScriptSourced = true;

  const Command = {
    DETECT_TAN_MECHANISM: "detectTanMechanism",
    SCRAPE_OPTICAL_TAN_CHALLENGE: "scrapeOpticalTanChallenge",
  };

  const ResponseStatus = {
    OK: "ok",
    NOT_FOUND: "notFound",
    UNKNOWN_COMMAND: "unknownCommand",
  };

  const TanMechanism = {
    OPTICAL_FLICKER: "opticalFlicker",
    OPTICAL_QR: "opticalQr",
    MANUAL: "manual",
  };

  const detectTanMechanism = () => {
    if (document.querySelector("#opttan")) {
      return TanMechanism.OPTICAL_FLICKER;
    }
    if (document.querySelector(".phototan .image")) {
      return TanMechanism.OPTICAL_QR;
    }
    if (
      [...document.querySelectorAll("form .block strong")].some(
        (node) => node.textContent === "chipTAN manuell"
      )
    ) {
      return TanMechanism.MANUAL;
    }
    return null;
  };

  const scrapeOpticalTanChallenge = () => {
    if (!document.querySelector("#opttan")) {
      throw new Error("Requested TAN mechanism not found");
    }
    const opticalTanPattern = /showOpttan\("([^"]+)"/;
    const matchingScripts = [...document.querySelectorAll("#opttan script")]
      .map((node) => node.textContent)
      .filter((text) => text.includes("showOpttan"));
    if (matchingScripts.length !== 1) {
      throw new Error(`Unable to find script content: ${matchingScripts}`);
    }
    const matchingGroups = opticalTanPattern.exec(matchingScripts[0]);
    if (matchingGroups.length < 2) {
      throw new Error(`Insufficient matching groups: ${matchingGroups}`);
    }
    const hhdTanChallengeHex = matchingGroups[1];
    return {
      type: TanMechanism.OPTICAL_FLICKER,
      hhdTanChallengeHex,
    };
  };

  browser.runtime.onMessage.addListener((message) => {
    const originalRequest = message;

    switch (message.command) {
      case Command.DETECT_TAN_MECHANISM:
        console.log(
          "Die Extension erfragt beim Content-Skript, welches" +
            " TAN-Verfahren aktiv ist."
        );
        const tanMechanism = detectTanMechanism();
        if (!tanMechanism) {
          return Promise.resolve({
            status: ResponseStatus.NOT_FOUND,
            originalRequest,
          });
        }
        return Promise.resolve({
          status: ResponseStatus.OK,
          payload: tanMechanism,
          originalRequest,
        });

      case Command.SCRAPE_OPTICAL_TAN_CHALLENGE:
        console.log(
          "Die Extension erfragt bei der Bezahlseite den Inhalt" +
            " der TAN-Challenge."
        );
        return Promise.resolve({
          status: ResponseStatus.OK,
          payload: scrapeOpticalTanChallenge(),
          originalRequest,
        });

      default:
        console.warn(
          "Die Extension hat ein unbekanntes Kommando geschickt:" +
            ` „${message.command}“`
        );
        return Promise.resolve({
          status: ResponseStatus.UNKNOWN_COMMAND,
          originalRequest,
        });
    }
  });
})();
