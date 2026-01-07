// session_manager.js

let sessionActive = false;
let sessionId = null;
let startTime = null;
let events = [];

function nowISO() {
  return new Date().toISOString();
}

function generateUUID() {
  return crypto.randomUUID();
}

export function startSession() {
  sessionActive = true;
  sessionId = generateUUID();
  startTime = nowISO();
  events = [];
}

export function endSession() {
  sessionActive = false;

  return {
    session_id: sessionId,
    start_time: startTime,
    end_time: nowISO(),
    events: events
  };
}

export function logEvent(event) {
  if (!sessionActive) return;
  events.push(event);
}

export function isSessionActive() {
  return sessionActive;
}
