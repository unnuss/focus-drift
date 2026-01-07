import {
  startSession,
  endSession,
  logEvent,
  isSessionActive
} from "./session_manager.js";

/* =============================
   Message handling
============================= */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_SESSION") {
    startSession();
    sendResponse({ status: "started" });
    return true;
  }

  if (message.type === "END_SESSION") {
    const session = endSession();
    sendResponse({ status: "ended", session });
    return true;
  }
});

/* =============================
   Event logging
============================= */

// TAB CREATED
chrome.tabs.onCreated.addListener((tab) => {
  if (!isSessionActive()) return;

  logEvent({
    timestamp: new Date().toISOString(),
    event_type: "TAB_CREATED",
    tab_id: String(tab.id),
    window_id: String(tab.windowId),
    domain: null
  });
});

// TAB REMOVED
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (!isSessionActive()) return;

  logEvent({
    timestamp: new Date().toISOString(),
    event_type: "TAB_REMOVED",
    tab_id: String(tabId),
    window_id: String(removeInfo.windowId),
    domain: null
  });
});

// TAB SWITCH
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (!isSessionActive()) return;

  let domain = null;
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url && tab.url.startsWith("http")) {
      domain = new URL(tab.url).hostname;
    }
  } catch (e) {
    domain = null;
  }

  logEvent({
    timestamp: new Date().toISOString(),
    event_type: "TAB_SWITCH",
    tab_id: String(activeInfo.tabId),
    window_id: String(activeInfo.windowId),
    domain: domain
  });
});

// WINDOW FOCUS
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (!isSessionActive()) return;
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;

  logEvent({
    timestamp: new Date().toISOString(),
    event_type: "WINDOW_FOCUS",
    tab_id: null,
    window_id: String(windowId),
    domain: null
  });
});
