const STORAGE_KEY = "currentSession";

/* =============================
   Helpers
============================= */

function uuidv4() {
  // Works in modern browsers + MV3
  if (crypto?.randomUUID) return crypto.randomUUID();

  // Fallback UUID generator
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function getSession() {
  const result = await chrome.storage.session.get(STORAGE_KEY);
  return result[STORAGE_KEY] || null;
}

async function setSession(session) {
  await chrome.storage.session.set({ [STORAGE_KEY]: session });
}

async function clearSession() {
  await chrome.storage.session.remove(STORAGE_KEY);
}

/* =============================
   Public API (used by background.js)
============================= */

export async function isSessionActive() {
  const session = await getSession();
  return Boolean(session && session.session_id && session.start_time);
}

export async function startSession() {
  const existing = await getSession();
  if (existing && existing.session_id && existing.start_time && !existing.end_time) {
    return "already_active";
  }

  const session = {
    session_id: uuidv4(),
    start_time: new Date().toISOString(),
    end_time: null,
    events: []
  };

  await setSession(session);
  return "started";
}

export async function logEvent(eventObj) {
  const session = await getSession();
  if (!session || !session.session_id || !session.start_time || session.end_time) return;

  // Enforce schema keys strictly (no extra fields leak in)
  const event = {
    timestamp: eventObj.timestamp,
    event_type: eventObj.event_type,
    tab_id: eventObj.tab_id === undefined ? null : eventObj.tab_id,
    window_id: eventObj.window_id === undefined ? null : eventObj.window_id,
    domain: eventObj.domain === undefined ? null : eventObj.domain
  };

  session.events.push(event);
  await setSession(session);
}

export async function endSession() {
  const session = await getSession();

  if (!session || !session.session_id || !session.start_time || session.end_time) {
    // If worker restarted and no session exists, report clearly
    return { status: "no_active_session" };
  }

  session.end_time = new Date().toISOString();

  // Produce final JSON object with required top-level keys
  const finalSession = {
    session_id: session.session_id,
    start_time: session.start_time,
    end_time: session.end_time,
    events: session.events || []
  };

  // Clear stored session after ending (session-scoped privacy)
  await clearSession();

  return { status: "ended", session: finalSession };
}
