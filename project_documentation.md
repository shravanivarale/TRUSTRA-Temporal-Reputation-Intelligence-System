# 📘 TRUSTRA - Project Documentation
**Hackathon:** Web Weaver 2026
**Project Name:** TRUSTRA: Temporal Reputation Intelligence System

---

## 1. 🚀 Executive Summary
**Problem:** Traditional e-commerce rating systems (5-star reviews) are static, easily manipulated by bots, and fail to capture the *temporal* nature of trust. A seller can farm 5-star reviews for a month and then exit scam.

**Solution:** **TRUSTRA** is a dynamic, multi-dimensional reputation engine. It calculates a real-time **Trust Score (0-1000)** by analyzing behavioral patterns, transaction volatility, and network graph relationships. It detects *when* a seller's behavior changes, not just *what* their current rating is.

---

## 2. 🏗️ System Architecture
The system follows a microservices architecture designed for scalability and isolation of compute-heavy tasks.

### **A. Frontend Layer (Port 3000)**
*   **Tech:** Next.js 14, Tailwind CSS, Framer Motion, Recharts.
*   **Role:** Delivers a premium, glassmorphism-styled dashboard for visualizing risk data.
*   **Key Features:**
    *   Real-time Trust Score updates via WebSockets.
    *   Interactive Risk Radar (Multivariate analysis).
    *   Trust Timeline (Temporal vector visualization).

### **B. Backend Gateway (Port 5000)**
*   **Tech:** Node.js, Express, Socket.io.
*   **Role:** Acts as the API Gateway and Orchestrator.
*   **Functions:**
    *    Aggregates data from ML and Graph services.
    *   Manages WebSocket connections for real-time frontend updates.
    *   Routes user requests to appropriate microservices.

### **C. ML Service (Port 8000)**
*   **Tech:** Python, FastAPI, Pandas, Scikit-learn.
*   **Role:** The "Brain" of the system.
*   **Models:**
    *   **Behavioral Engine:** Analyzes delivery times, dispute rates, and refund frequency.
    *   **Authenticity Model:** Detects review patterns (bursts of 5-star reviews).
    *   **Risk Engine:** Calculates Volatility Index and Trust Decay over time.

### **D. Graph Service (Port 8001)**
*   **Tech:** Python, FastAPI, NetworkX.
*   **Role:** The "Detective".
*   **Analysis:**
    *   Builds an in-memory graph of Sellers and Buyers.
    *   **Collusion Detection:** Identifies "Review Rings" using Clustering Coefficients and Connected Components.
    *   **Centrality Analysis:** Finds suspicious hubs (buyers who only review specific fraud sellers).

---

## 3. 🧠 Core Algorithms & Methodology

### **1. The Trust Score (0-1000)**
Unlike a simple average, the Trust Score is weighted:
$$ Score = (W_b \times Behavioral) + (W_a \times Authenticity) - (W_r \times Risk) - (W_g \times GraphPenalty) $$

### **2. Temporal Volatility**
We measure the standard deviation of seller performance over sliding windows.
*   **High Volatility** = Unstable/Risky (Score Penalty).
*   **Low Volatility** = Consistent/Trustworthy (Score Bonus).

### **3. Graph-Based Fraud Detection**
We implement `networkx` algorithms to detect fraud rings:
*   **Degree Centrality:** Buyers with unusually high connection counts to low-trust sellers.
*   **Clique Detection:** Groups of buyers who review the exact same set of sellers (Simulated Collusion).

---

## 4. 🛠️ Technology Stack
| Component | Technology | Reasoning |
| :--- | :--- | :--- |
| **Frontend** | Next.js + Tailwind | SEO optimized, server-side rendering, rapid UI development. |
| **Backend** | Node.js + Express | Event-driven, non-blocking I/O for real-time data piping. |
| **Data Logic** | Python (Pandas) | Native support for vector operations and statistical analysis. |
| **Graph Logic** | NetworkX | Efficient in-memory graph algorithms for structure analysis. |
| **Real-time** | Socket.io | Bi-directional communication for instant score updates. |

---

## 5. 🔮 Future Roadmap
1.  **Blockchain Integration:** Store Reputation Scores on-chain (Polygon/Solana) for immutable history.
2.  **LLM Review Analysis:** Use Llama 3 for sentiment analysis of review text to detect AI-generated fake reviews.
3.  **Federated Learning:** Train models on seller data without raw data leaving the user's device.

---

## 6. 🏁 Conclusion
TRUSTRA creates a safer digital economy by making trust **visible, quantifiable, and temporal**. It moves beyond "Stars" to "Signals".
