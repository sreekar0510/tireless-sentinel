# 🛡️ Tireless Sentinel

**Autonomous UI Testing Agent with AI Self-Healing, Application Memory & Business Validation**

[![Node.js](https://img.shields.io/badge/Node.js-24-green)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-Automation-blue)](https://playwright.dev/)
[![Gemini](https://img.shields.io/badge/Gemini-AI%20Recovery-purple)](https://ai.google.dev/)

Tireless Sentinel is an autonomous browser testing system built with Playwright and Gemini.

Instead of relying entirely on brittle CSS selectors, it understands the **business action** behind a failed UI interaction, searches the current page for a suitable replacement, verifies the recovery in the browser, and remembers the successful selector for future runs.

---

## 🚀 Key Features

- 🎭 **Playwright Browser Automation**
- 🤖 **AI-Powered UI Self-Healing**
- 🧠 **Persistent Application Memory**
- 🧮 **Business Rule / Invariant Validation**
- 🐛 **Functional Regression Detection**
- 📝 **Natural Language Test Generation**
- ⚡ **Zero-AI Recovery After Learning**
- 📊 **Structured Test Reports**
- 🖥️ **Interactive Testing Dashboard**

---

## 🖥️ Demo / Screenshots

### 📊 Dashboard

<img width="1470" height="791" alt="dashboard1" src="https://github.com/user-attachments/assets/7573ffcb-6574-4912-ad08-814010e929d7" />

### 🤖 AI Self-Healing

<img width="1470" height="956" alt="Screenshot 2026-09-27 at 3 45 12 AM" src="https://github.com/user-attachments/assets/4f6081d9-5933-4533-975c-d2a2467dd0e1" />

### 🧠 Memory-Based Recovery

<img width="1470" height="956" alt="Screenshot 2026-09-27 at 3 45 58 AM" src="https://github.com/user-attachments/assets/293a6f7c-9c0a-469b-9eff-62ccd24250a7" />

### 🐛 Business Bug Detection

<img width="1470" height="956" alt="Screenshot 2026-09-27 at 3 46 38 AM" src="https://github.com/user-attachments/assets/36421106-170a-4bb3-9624-1988537a6ba3" />






## 🧠 How It Works

```text
Natural Language Test Request
            │
            ▼
     Test Generator
            │
            ▼
    Generated Test Plan
            │
            ▼
    Playwright Executor
            │
            ▼
      Browser Action
            │
      ┌─────┴─────┐
      │           │
   Success     Failure
                  │
                  ▼
          Application Memory
                  │
            ┌─────┴─────┐
            │           │
          Found       Not Found
            │           │
            │           ▼
            │      Gemini AI
            │           │
            │           ▼
            │    Candidate Selector
            │           │
            └─────┬─────┘
                  ▼
          Browser Verification
                  │
                  ▼
          Memory Update
                  │
                  ▼
          Structured Report
                  │
                  ▼
             Dashboard
