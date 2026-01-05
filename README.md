# focus-drift
A privacy-first system for detecting and explaining attention drift using behavioral signals.

# Focus Drift

**Focus Drift** is a privacy-first attention analysis system that detects and explains attention drift during browsing sessions using interaction behavior, not content.

It is designed to help users understand *how* their attention changes over time, rather than judging productivity or tracking activity.

---

## Why Focus Drift?

Most productivity tools focus on:
- Time spent
- Output metrics
- Content monitoring
- Behavioral judgments

These approaches fail to explain **how attention actually drifts during a session**.

Focus Drift takes a different approach:
- It analyzes interaction patterns (tab and window behavior)
- It avoids content inspection entirely
- It prioritizes explainability and privacy by design

The goal is awareness, not surveillance.

---

## What Focus Drift Does

Focus Drift analyzes a browsing session in four stages:

1. **Event Collection**  
   A Chrome extension records browser interaction events during a manually started session.

2. **Feature Extraction**  
   Raw events are converted into deterministic behavioral metrics such as:
   - Tab switching rate
   - Uninterrupted focus block length
   - Rapid switching patterns

3. **Attention Drift Modeling**  
   A small, interpretable model classifies the session into:
   - Focused
   - Interrupted
   - Fragmented

4. **Insight & Visualization**  
   The system explains *why* the session behaved the way it did using clear metrics and visual summaries.

---

## What Focus Drift Does NOT Do

- Track page content
- Log keystrokes or mouse input
- Monitor background activity
- Judge productivity
- Infer user intent

All analysis is session-scoped and behavior-based.

---

## Project Structure

The repository is organized by system responsibility:
'''
focus-drift/
├── extension/ # Browser event collection
├── backend/ # Feature extraction and inference
├── model/ # Training and evaluation
├── dashboard/ # Visualization and insights
├── docs/ # Architecture and design decisions
└── README.md

'''
Each component has a single responsibility and communicates through well-defined interfaces.

---

## Privacy Philosophy

Focus Drift enforces privacy through technical design:
- No content logging
- No user identity
- No persistent background tracking
- No cloud history by default

The system analyzes **behavior**, not **identity**.

---

## Project Status

This project is under active development.  
Initial work focuses on system structure, behavioral metrics, and model design.

---

## Team

Built collaboratively as a behavior-aware systems project.
