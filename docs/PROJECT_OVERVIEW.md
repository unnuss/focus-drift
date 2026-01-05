# Focus Drift — Internal Project Definition

This document defines the final scope, architecture, and responsibilities of the Focus Drift project.
All contributors are expected to read and agree to this before writing code.

1. What We Are Building (Non-Negotiable) 
Focus Drift is a privacy-first attention analysis system that detects and explains attention 
drift during a browsing session by analyzing interaction behavior, not content. 
We are not building: 
● A productivity app 
● A blocker 
● A time tracker 
● An AI assistant 
● A surveillance tool 
We are building: 
A behavioral signal processing system that models how attention degrades 
over time and explains why. 
Everything in the project must support this goal. 
2. The Core Problem We Are Solving 
Most tools answer: 
● “How long did you work?” 
● “How productive were you?” 
They fail to answer: 
How did my attention drift during this session, and what pattern caused it? 
People often feel distracted but cannot explain: 
● When attention started slipping 
● Whether it was gradual or sudden 
● Whether it was interruptions or fragmentation 
Focus Drift exists to make this invisible behavior visible. 
3. Fundamental Design Principles (LOCK THESE IN) 
Every design decision must respect these principles: 
1. Behavior, not content 
We analyze how the browser is used, never what is viewed. 
2. Explainability over complexity 
Every metric and decision must be explainable to a human. 
3. Privacy by design 
Privacy is enforced technically, not promised verbally. 
4. Deterministic first, learned second 
Metrics are deterministic; learning happens on top of them. 
5. No judgment 
The system describes behavior; it does not moralize it. 
If a feature violates even one of these, it does not belong. 
4. High-Level System Overview 
The system is composed of four layers, each with a single responsibility: 
Browser Interaction Events 
↓ 
Deterministic Feature Extraction 
↓ 
Trained Attention Drift Model 
↓ 
Human-Readable Insight + Visualization 
No layer skips another. 
No layer does someone else’s job. 
5. Detailed Component Breakdown 
5.1 Chrome Extension — Event Collection Layer 
Purpose: 
Collect raw browser interaction events during a manually started session. 
What it tracks: 
● Tab switches 
● Window focus changes 
● Tab creation and removal 
● Timestamps 
● Coarse domain identifier (not full URLs) 
What it explicitly does NOT track: 
● Page content 
● Keystrokes 
● Mouse movements 
● Background activity 
● User identity 
Key constraints: 
● User must manually start and end a session 
● No tracking outside active sessions 
● Data is session-scoped 
The extension is dumb by design. 
It only collects events and sends them forward. 
5.2 Feature Extraction — Behavioral Signal Layer 
Purpose: 
Convert raw interaction events into meaningful behavioral metrics. 
This layer is fully deterministic. 
Core metrics (final set): 
● Session duration 
● Time-to-First-Switch (TTFS) 
● Average uninterrupted focus block length 
● Tab switch rate 
● Switch burst count (rapid switching clusters) 
● Return switching ratio (A → B → A patterns) 
These metrics are: 
● Auditable 
● Explainable 
● Independent of AI 
This layer represents our engineering depth. 
5.3 Attention Drift Model — Learning Layer 
Purpose: 
Map behavioral metrics → attention state using a trained, interpretable model. 
Model type (locked decision): 
● Logistic Regression or 
● Decision Tree 
Why a model is used: 
● Attention drift is multi-dimensional 
● Hard thresholds are arbitrary 
● Signals interact non-linearly 
● A model learns relative importance 
What the model predicts: 
● Session state: 
○ Focused 
○ Interrupted 
○ Fragmented 
What the model does NOT do: 
● See raw events 
● Analyze content 
● Replace metrics 
● Make moral judgments 
The model improves consistency, not magic intelligence. 
5.4 Insight & Visualization — Interpretation Layer 
Purpose: 
Explain why the session behaved the way it did. 
Outputs: 
● Session classification 
● Key contributing metrics 
● Attention timeline visualization 
● Short explanatory summary 
Optional AI usage: 
● An LLM may be used ONLY to convert: 
metrics + model output → natural language explanation 
AI is NOT allowed to: 
● Decide session state 
● Analyze behavior 
● Infer intent 
● Override the model 
AI is a translator, not a decision-maker. 
6. GitHub Repository Structure (FINAL) 
This structure reflects system boundaries, not convenience. 
focus-drift/ 
├── extension/                  
│   ├── background.js 
│   ├── popup.html 
│   ├── popup.js 
│   └── manifest.json 
│ 
├── backend/                    
│   ├── api.py                  
│   ├── data_schema.py          
# Browser event collection 
# Core processing logic 
# API endpoints 
# Event & metric schemas 
│   ├── feature_extraction.py   # Deterministic metrics 
│   ├── inference.py            
# Model inference logic 
│   └── attention_model.py      # Model loading 
│ 
├── model/                      
│   ├── train.py 
│   ├── evaluate.py 
│   └── model.pkl 
│ 
├── dashboard/                  
│   └── app.py 
│ 
├── docs/                       
│   ├── problem.md 
│   ├── architecture.md 
│   ├── metrics.md 
│   ├── model_choice.md 
│   ├── privacy.md 
│   └── limitations.md 
│ 
└── README.md 
# Training & evaluation 
# Visualization 
# Project reasoning 
No file should exist without a clear reason. 
7. Team Alignment & Responsibility Split 
Each person owns one layer, but understands all layers. 
● Extension Owner 
Event correctness, session lifecycle, schema integrity 
● Backend / Metrics Owner 
Feature extraction, signal validity, data correctness 
● Model / Insight Owner 
Model training, evaluation, explanation, dashboard 
Ownership ≠ isolation. 
Decisions affecting the system are discussed together. 
8. What Makes This a “Serious Project” 
This project is serious because: 
● It has a clearly defined problem 
● It has principled constraints 
● It avoids unnecessary hype 
● It makes defensible technical choices 
● It can be explained end-to-end 
We prioritize: 
clarity > flash 
honesty > buzzwords 
reasoning > APIs 
9. Internal Agreement Statement (IMPORTANT) 
Every team member must agree to this sentence: 
“We are building a behavior-aware system that explains attention drift using 
deterministic metrics and a small trained model, while preserving privacy and 
explainability.” 
If someone disagrees with this, we resolve it now, not later.
