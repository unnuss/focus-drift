# Focus Drift — Feature Extraction & Metrics Specification

This document defines the **deterministic behavioral metrics** used by Focus Drift.
These metrics convert raw browser interaction events into interpretable signals
for attention drift analysis.

Once finalized, this specification acts as a **contract** between the extension,
backend, and model layers.

---

## 0. Inputs and Assumptions

### Input
A `SessionObject` containing:
- `start_time`
- `end_time`
- `events[]` (ordered list of browser events)

### Allowed Event Types
- `TAB_SWITCH`
- `WINDOW_FOCUS`
- `TAB_CREATED`
- `TAB_REMOVED`

### Preprocessing Rules (Mandatory)
1. Events must be sorted by `timestamp`.
2. Events with missing timestamps or invalid event types are dropped.
3. If multiple events share the same timestamp, preserve received order.
4. Convert timestamps to seconds since epoch for all calculations.

### Definitions
- `T_start` = session start time
- `T_end` = session end time
- `session_duration_s = T_end - T_start`
- `E` = ordered list of events

---

## 1. Deterministic Metrics (Final Set)

### 1. Session Duration
**Name:** `session_duration_s`  
**Definition:** Total session length in seconds.

```
session_duration_s = T_end - T_start
```


---

### 2. Switch Count
**Name:** `switch_count_total`  

Counts all attention shifts:

- `TAB_SWITCH`
- `WINDOW_FOCUS`

Also store:
- `tab_switch_count`
- `window_focus_count`

---

### 3. Switch Rate
**Name:** `switch_rate_per_min`

```
switch_rate_per_min = switch_count_total / (session_duration_s / 60)
```


If session duration < 60 seconds, compute normally but flag session as short.

---

### 4. Time-to-First-Switch (TTFS)
**Name:** `ttfs_s`

Time from session start to the first switch event.

```
ttfs_s = first_switch_timestamp - T_start
```
If no switch occurs:
```
ttfs_s = session_duration_s
```


---

### 5. Focus Blocks (Uninterrupted Attention)

A **focus block** is time between consecutive switch events.

#### Steps
1. Extract all switch timestamps into list `S`.
2. Add session boundaries:
   - prepend `T_start`
   - append `T_end`
3. Compute block durations:

```
block_i = S[i+1] - S[i]
```


#### Stored Metrics
- `focus_blocks_s` (list)
- `avg_focus_block_s`
- `median_focus_block_s`
- `max_focus_block_s`
- `min_focus_block_s`

---

### 6. Burst Switching
**Name:** `burst_count`

Rapid switching in short time windows.

#### Parameters
- `BURST_WINDOW_S = 30`
- `BURST_MIN_SWITCHES = 3`

#### Rule
A burst occurs if **3 or more switch events** happen within any rolling
30-second window.

Implementation:
- Use two pointers over switch timestamps.
- Count a burst once per window and advance pointer to avoid double-counting.

---

### 7. Return Switching (A → B → A)
**Name:** `return_ratio`

Measures interruption-like behavior.

#### Parameters
- `RETURN_WINDOW_S = 120` seconds

#### Definition
A return occurs when:
- Tab switches from A to B
- Then returns to A
- Within 120 seconds

#### Computation
Let `active_tabs` be the ordered tab_id sequence from `TAB_SWITCH` events.

Count occurrences of:
```
A → B → A where A != B and (t[i+2] - t[i]) ≤ 120
```

```
return_ratio = return_count / max(1, tab_switch_count)
```


---

### 8. Domain Time (Optional)
**Name:** `domain_time_s`

Approximate time spent per domain using focus blocks.

- Each focus block duration is assigned to the domain active at block start.
- If domain unavailable, assign to `"unknown"`.

No URLs or page titles are stored.

---

## 2. Model Feature Vector (v0.1)

The following metrics are used as model inputs:

- `session_duration_s`
- `ttfs_s`
- `switch_rate_per_min`
- `avg_focus_block_s`
- `median_focus_block_s`
- `burst_count`
- `return_ratio`

---

## 3. Edge Case Handling

- Sessions < 60 seconds: compute metrics, mark as short.
- No switches: one focus block = entire session.
- Missing domain values are allowed.
- `WINDOW_FOCUS` counts as a switch event.

---

## 4. Rationale

These metrics are:
- Deterministic
- Explainable
- Privacy-preserving
- Resistant to arbitrary thresholds

They model **how attention shifts**, not what content is viewed.

---

## 5. Change Policy

Any modification to this file requires:
1. Team discussion
2. Documentation update
3. Explicit agreement by all contributors

No silent changes.
