# 🛡️ TRUSTRA: Temporal Reputation Intelligence System
### *Web Weaver 2026 Hackathon Entry*

> **"Trust is not a static 5-star rating. It's a dynamic, living signal."**

---

## 💡 The Problem
In today's e-commerce landscape, **trust is broken**.
-   ⭐⭐⭐⭐⭐ ratings are bought and sold in bulk.
-   "Exit Scams" happen when sellers farm reputation and then vanish.
-   Buyers have no way to see the *history* of a seller's behavior, only the current snapshot.

## 🚀 The Solution: TRUSTRA
TRUSTRA is an advanced **Reputation Intelligence Engine** that replaces the outdated 5-star system with a dynamic **Trust Score (0-1000)**. It uses Machine Learning and Graph Theory to analyze *behavior*, not just feedback.

### Key Innovations
1.  **⏱️ Temporal Engine**: We don't just look at the average; we look at the *volatility*. A seller who fluctuates wildly is flagged as "High Risk" even if their average is high.
2.  **🕸️ Graph Intelligence**: Using **Network Analysis**, we detect "Collusion Rings"—groups of bots that artificially inflate scores.
3.  **⚡ Real-Time Ops**: Updates are pushed instantly via WebSockets. No page refreshes needed.

---

## 🛠️ Tech Stack & Architecture
We built a redundant, microservices-based architecture to demonstrate scalability:

*   **Frontend**: Next.js 14, Tailwind CSS (Glassmorphism UI), Framer Motion.
*   **Orchestrator Backend**: Node.js & Express API Gateway.
*   **Intelligence Layer (ML)**: Python FastAPI with Pandas for statistical modeling.
*   **Graph Layer**: Python NetworkX for relationship mapping and fraud cluster detection.

---

## 📸 Feature Highlights (Demo Guide)
*   **Trust Score Card**: A credit-score-like rating for every seller.
*   **Risk Radar**: Multivariate analysis showing exactly *where* a seller is failing (e.g., Identity vs. Delivery).
*   **Fraud Cluster**: Visualizing the "Hidden Web" of fake connections.

---

## 🏃‍♂️ Quick Start (Evaluators)
1.  **Prerequisites**: Python 3.9+, Node.js 18+.
2.  **Run**:
    ```bash
    start_all.bat
    ```
    *(This script automatically installs dependencies, generates 20,000+ synthetic data points, and launches all 4 services.)*
3.  **View**: Open `http://localhost:3000`.

---

*Built with ❤️ for Web Weaver 2026*
