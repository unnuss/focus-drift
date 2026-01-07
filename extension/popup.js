const statusEl = document.getElementById("status");

function setStatus(text) {
  statusEl.textContent = `Status: ${text}`;
}

async function refreshStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ type: "GET_STATUS" });
    if (response?.active) setStatus("Session running");
    else setStatus("Idle");
  } catch (e) {
    // If service worker is sleeping, Chrome will wake it on next interaction.
    setStatus("Idle");
  }
}

document.getElementById("startBtn").addEventListener("click", async () => {
  chrome.runtime.sendMessage({ type: "START_SESSION" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Start session error:", chrome.runtime.lastError);
      setStatus("Error starting");
      return;
    }
    if (response?.status === "already_active") setStatus("Already running");
    else setStatus("Session running");
  });
});

document.getElementById("endBtn").addEventListener("click", async () => {
  chrome.runtime.sendMessage({ type: "END_SESSION" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("End session error:", chrome.runtime.lastError);
      setStatus("Error ending");
      return;
    }

    if (response?.status === "no_active_session") {
      setStatus("Idle (no active session)");
      return;
    }

    if (response?.session) {
      // Keep this log so you can copy JSON for backend tests
      console.log("session.json:", response.session);
      setStatus("Session ended (JSON in console)");
    } else {
      setStatus("Session ended");
    }
  });
});

// Update status every time popup opens
refreshStatus();
