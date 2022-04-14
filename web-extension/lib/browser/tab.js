export const queryActiveTab = async () => {
  const tabsQueryResult = await browser.tabs.query({
    active: true,
    currentWindow: true,
  })
  if (tabsQueryResult.length < 1
    || typeof tabsQueryResult[0].url !== "string") {
    throw new Error("Unable to query the active tab in the current window");
  }
  return tabsQueryResult[0];
};
