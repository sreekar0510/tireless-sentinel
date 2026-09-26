# 🛡️ Tireless Sentinel

> Autonomous UI testing agent with AI-powered self-healing, application memory, business validation, and automated test generation.

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
