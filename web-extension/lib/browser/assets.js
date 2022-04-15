const ASSETS = {
  warning: "assets/iso7010-w001.svg",
};

export const assetUrl = (assetName) =>
  browser.runtime.getURL(ASSETS[assetName]);
