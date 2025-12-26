let focusTimer = null;
const DISTRACTION_THRESHOLD = 30 * 1000; // 30 seconds for testing

chrome.tabs.onActivated.addListener((activeInfo) => {
  checkTab(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    checkTab(tabId);
  }
});

function checkTab(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    if (!tab || !tab.url) return;

    chrome.storage.local.get("sessions", (result) => {
      const sessions = result.sessions || [];
      if (sessions.length === 0) return;

      // Take last session
      const lastSession = sessions[sessions.length - 1];
      const sessionUrls = lastSession.tabs.map(t => t.url);

      // If current tab is not in session, start timer
      if (!sessionUrls.includes(tab.url)) {
        if (focusTimer) clearTimeout(focusTimer);
        focusTimer = setTimeout(() => {
            chrome.notifications.create({
                type: "basic",
                iconUrl: "Images/icon.png",
                title: "Hey! Stay focused",
                message: "You're on a non-work tab. Consider returning to your session."
            });
              
        }, DISTRACTION_THRESHOLD);
      } else {
        // On work tab → cancel reminder
        if (focusTimer) clearTimeout(focusTimer);
      }
    });
  });
}
