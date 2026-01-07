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
    startSession().then((status) => {
      sendResponse({ status });
    });
    return true;
  }

  if (message.type === "END_SESSION") {
    endSession().then((result) => {
      // result can be {status: "..."} or {status: "...", session: {...}}
      sendResponse(result);
    });
    return true;
  }

  if (message.type === "GET_STATUS") {
    isSessionActive().then((active) => {
      sendResponse({ active });
    });
    return true;
  }
});

/* =============================
   Event logging
============================= */

// TAB CREATED
chrome.tabs.onCreated.addListener((tab) => {
  isSessionActive().then((active) => {
    if (!active) return;

    logEvent({
      timestamp: new Date().toISOString(),
      event_type: "TAB_CREATED",
      tab_id: tab?.id != null ? String(tab.id) : null,
      window_id: tab?.windowId != null ? String(tab.windowId) : null,
      domain: null
    });
  });
});

// TAB REMOVED
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  isSessionActive().then((active) => {
    if (!active) return;

    logEvent({
      timestamp: new Date().toISOString(),
      event_type: "TAB_REMOVED",
      tab_id: tabId != null ? String(tabId) : null,
      window_id: removeInfo?.windowId != null ? String(removeInfo.windowId) : null,
      domain: null
    });
  });
});

// TAB SWITCH
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const active = await isSessionActive();
  if (!active) return;

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
    domain
  });
});

// WINDOW FOCUS
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;

  isSessionActive().then((active) => {
    if (!active) return;

    logEvent({
      timestamp: new Date().toISOString(),
      event_type: "WINDOW_FOCUS",
      tab_id: null,
      window_id: String(windowId),
      domain: null
    });
  });
});
