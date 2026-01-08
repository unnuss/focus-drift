import json
from datetime import datetime
from statistics import mean, median


# ---------------------------
# Constants
# ---------------------------

BURST_WINDOW_S = 30
BURST_MIN_SWITCHES = 3
RETURN_WINDOW_S = 120


# ---------------------------
# Helpers
# ---------------------------

def parse_ts(ts: str) -> datetime:
    return datetime.fromisoformat(ts.replace("Z", "+00:00"))


def get_switch_events(session: dict):
    """
    Returns sorted list of (timestamp, event) for switch events.
    Switch events = TAB_SWITCH + WINDOW_FOCUS
    """
    events = session.get("events", [])
    switch_events = [
        e for e in events
        if e["event_type"] in ("TAB_SWITCH", "WINDOW_FOCUS")
    ]
    return sorted(
        [(parse_ts(e["timestamp"]), e) for e in switch_events],
        key=lambda x: x[0]
    )


def get_tab_switch_events(session: dict):
    """
    Returns sorted list of (timestamp, event) for TAB_SWITCH only.
    """
    events = session.get("events", [])
    tab_switches = [
        e for e in events if e["event_type"] == "TAB_SWITCH"
    ]
    return sorted(
        [(parse_ts(e["timestamp"]), e) for e in tab_switches],
        key=lambda x: x[0]
    )


# ---------------------------
# Core Feature Extractor
# ---------------------------

def extract_features(session: dict) -> dict:
    focus_blocks = compute_focus_blocks(session)

    features = {
        "session_duration_s": compute_session_duration(session),
        "ttfs_s": compute_ttfs(session),
        "switch_rate_per_min": compute_switch_rate(session),
        "avg_focus_block_s": mean(focus_blocks) if focus_blocks else None,
        "median_focus_block_s": median(focus_blocks) if focus_blocks else None,
        "burst_count": compute_burst_count(session),
        "return_ratio": compute_return_ratio(session),
    }

    return {
        "session_id": session.get("session_id"),
        "features": features,
        "derived": {
            "focus_blocks_s": focus_blocks
        }
    }


# ---------------------------
# Metric Functions
# ---------------------------

def compute_session_duration(session: dict) -> float:
    start = parse_ts(session["start_time"])
    end = parse_ts(session["end_time"])
    return (end - start).total_seconds()


def compute_ttfs(session: dict) -> float:
    start = parse_ts(session["start_time"])
    switch_events = get_switch_events(session)

    if not switch_events:
        return compute_session_duration(session)

    first_switch_time = switch_events[0][0]
    return (first_switch_time - start).total_seconds()


def compute_switch_rate(session: dict) -> float:
    duration_s = compute_session_duration(session)
    if duration_s <= 0:
        return 0.0

    switch_events = get_switch_events(session)
    switch_count_total = len(switch_events)

    return switch_count_total / (duration_s / 60.0)


def compute_focus_blocks(session: dict) -> list:
    start = parse_ts(session["start_time"])
    end = parse_ts(session["end_time"])

    switch_events = get_switch_events(session)

    # Extract timestamps only
    timestamps = [start]
    timestamps += [ts for ts, _ in switch_events]
    timestamps.append(end)

    focus_blocks = []

    for i in range(len(timestamps) - 1):
        delta = (timestamps[i + 1] - timestamps[i]).total_seconds()
        if delta >= 0:
            focus_blocks.append(delta)

    return focus_blocks


def compute_burst_count(session: dict) -> int:
    switch_events = get_switch_events(session)
    times = [ts for ts, _ in switch_events]

    burst_count = 0
    i = 0

    while i < len(times):
        j = i
        while j < len(times) and (times[j] - times[i]).total_seconds() <= BURST_WINDOW_S:
            j += 1

        if (j - i) >= BURST_MIN_SWITCHES:
            burst_count += 1
            i = j  # advance to avoid double-counting
        else:
            i += 1

    return burst_count


def compute_return_ratio(session: dict) -> float:
    tab_switches = get_tab_switch_events(session)

    if len(tab_switches) < 3:
        return 0.0

    times = [ts for ts, _ in tab_switches]
    tabs = [e["tab_id"] for _, e in tab_switches]

    return_count = 0

    for i in range(len(tabs) - 2):
        A = tabs[i]
        B = tabs[i + 1]
        C = tabs[i + 2]

        if A == C and A != B:
            if (times[i + 2] - times[i]).total_seconds() <= RETURN_WINDOW_S:
                return_count += 1

    return return_count / max(1, len(tab_switches))


# ---------------------------
# CLI Test Harness
# ---------------------------

if __name__ == "__main__":
    with open("sample_session.json", "r") as f:
        session = json.load(f)

    output = extract_features(session)
    print(json.dumps(output, indent=2))
