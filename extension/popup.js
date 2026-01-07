document.getElementById("startBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage(
    { type: "START_SESSION" },
    () => {
      // Session started silently
    }
  );
});

document.getElementById("endBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage(
    { type: "END_SESSION" },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error("End session error:", chrome.runtime.lastError);
        return;
      }

      if (response && response.session) {
        console.log("session.json:", response.session);
      }
    }
  );
});
