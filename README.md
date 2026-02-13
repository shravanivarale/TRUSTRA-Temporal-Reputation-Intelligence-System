# TRUSTRA™ — Temporal Reputation Intelligence System

> **"Trust, Quantified."**

TRUSTRA is a next-generation reputation intelligence engine designed to compute dynamic Digital Trust Scores for online sellers. By leveraging behavioral modeling, graph-based fraud detection, and ML-driven review authenticity analysis, TRUSTRA provides a transparent and robust trust metric for the digital economy.

## 🚀 Key Features

*   **Dynamic Trust Scoring**: Real-time calculation based on behavioral data and temporal decay.
*   **Graph Intelligence**: Detects collusion rings and fraud clusters using Neo4j.
*   **Review Authenticity**: NLP-powered analysis to flag fake reviews and bursts.
*   **Risk Radar**: Visualizes risk volatility and stability curves.
*   **Explainable AI**: "Why This Score?" panel powered by SHAP values.

## 🛠 Tech Stack

*   **Frontend**: Next.js 14 (App Router), TailwindCSS, Framer Motion, Recharts.
*   **Backend**: Node.js (Express/FastAPI Gateway).
*   **ML Service**: Python (FastAPI), Scikit-learn, XGBoost.
*   **Graph Service**: Python (FastAPI), Neo4j.
*   **Databases**: PostgreSQL, Neo4j, Redis.
*   **Infrastructure**: Docker Compose.

## 📂 Project Structure

*   `/frontend`: Next.js dashboard.
*   `/backend`: API Gateway.
*   `/ml-service`: Trust engine and fraud models.
*   `/graph-service`: Graph analysis service.
*   `/data-simulation`: Synthetic data generation.
*   `/docker`: Docker configuration.

## 🚦 Getting Started (No-Docker Mode)

### Prerequisites
*   **Node.js** (v18+)
*   **Python** (v3.9+)
*   **Pip** (Python package manager)

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/shravanivarale/TRUSTRA-Temporal-Reputation-Intelligence-System.git
    cd TRUSTRA
    ```

2.  **Start the System**:
    *   Simply run the start script. It will install dependencies, generate synthetic data, and launch all services.
    *   **Double-click `start_all.bat`** (Windows)
    *   *Or run via terminal:*
    ```bash
    .\start_all.bat
    ```

3.  **Access Dashboard**:
    *   Open [http://localhost:3000](http://localhost:3000)
    *   The frontend will connect to the local backend services automatically.

3.  **Run Services**:
    *   See individual `README.md` in each service directory for details.

## 📜 License

MIT
