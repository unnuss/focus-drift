Focus Drift — Final Data Schema
Purpose of This Schema

This schema defines exactly what data is collected, how it is structured, and what guarantees are enforced.

It exists to ensure:

Privacy by design

Clean separation of responsibilities

Deterministic feature extraction

Safe model training

This schema does not change per feature.

1️⃣ Session-Level Schema

Each browsing session is treated as an isolated unit.
```
{
  "session_id": "string (UUID)",
  "start_time": "ISO-8601 UTC timestamp",
  "end_time": "ISO-8601 UTC timestamp",
  "events": [ EventObject ]
}
```
Field Definitions: Field	Description
session_id: Random UUID generated at session start
start_time: Timestamp when user manually starts session
end_time:	Timestamp when user manually ends session
events:	Ordered list of browser interaction events

Session Guarantees

Sessions are manually started and ended

No background tracking

No cross-session identifiers

No automatic resumption

2️⃣ Event-Level Schema

Each event represents one browser interaction.
```
{
  "timestamp": "ISO-8601 UTC timestamp",
  "event_type": "TAB_SWITCH | WINDOW_FOCUS | TAB_CREATED | TAB_REMOVED",
  "tab_id": "string",
  "window_id": "string",
  "domain": "string | null"
}
```
3️⃣ Event Field Rules (STRICT)
timestamp

UTC only

Millisecond precision preferred

Must be monotonic within a session

event_type

Allowed values only:

TAB_SWITCH — user changes active tab

WINDOW_FOCUS — user changes active window

TAB_CREATED — new tab opened

TAB_REMOVED — tab closed

No custom or inferred events allowed.

tab_id

Randomized identifier

Unique within a session

Reset every session

Not persistent across sessions

Purpose: enable relative behavior analysis, not tracking.

window_id

Same rules as tab_id

Used only to detect focus shifts between windows

domain

Coarse-grained domain only
Examples:

youtube.com

docs.google.com

stackoverflow.com

Never store:

Full URLs

Query parameters

Page titles

null if domain is not applicable to the event

4️⃣ Ordering & Integrity Rules

Events must be chronologically ordered

No event reordering in backend

No inferred or synthesized events

Missing events are allowed; fabricated events are not

5️⃣ Explicit Privacy Guarantees (NON-NEGOTIABLE)

This schema explicitly forbids collecting:

Page content

Page titles

URLs

Keystrokes

Mouse movement

User identifiers

Persistent device identifiers

Background activity outside sessions

If data is not listed in this schema, it must not be collected.

6️⃣ Downstream Usage (IMPORTANT)
What this schema is used for:

Deterministic feature extraction

Attention drift modeling

Session visualization

What this schema is NOT used for:

Content understanding

User profiling

Surveillance

Productivity judgment

7️⃣ Change Policy

Any change to this schema requires:

Team discussion

Documentation update

Explicit agreement from all contributors

No silent changes.
