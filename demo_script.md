# 🎥 TRUSTRA System Demo Script

Use this script to record a compelling video demonstration of the TRUSTRA platform.

## 🎬 Preparation
1.  **Ensure App is Running**: Verify `start_all.bat` is running and the dashboard is visible at [http://localhost:3000](http://localhost:3000).
2.  **Reset View**: Refresh the page to start clean.
3.  **Zoom Level**: Set browser zoom to 100% or 110% for clear text visibility.

---

## 📹 Scene 1: Introduction (The "Good" Seller)
**Goal**: Show a healthy, high-trust account.

1.  **Action**: Click the **Seller Dropdown** at the top right.
2.  **Action**: Scroll and select **"Vora, Kulkarni and Sahota"** (or look for any seller with a score > 750).
3.  **Narrative/Highlight**:
    *   "Here we see the profile of a legitimate, high-trust seller."
    *   **Trust Score Card**: Point to the large Green score (e.g., 780/1000). Note the "Excellent" status and the glowing green effect.
    *   **Risk Radar**: Show the radar chart. Explain that the shape varies based on risk factors whereas this one is balanced.
    *   **Factors**: Highlight "Authenticity" and "Behavioral Metrics" in the 'Why This Score?' panel are positive.

## 📹 Scene 2: The Threat Detection (The "Fraud" Seller)
**Goal**: Show how the system identifies risk and fraud.

1.  **Action**: Open the **Seller Dropdown** again.
2.  **Action**: Search/Scroll for **"FRAUD_SUSPECT_LTD"** (You might need to scroll down; unrelated names are randomized).
    *   *Tip: They usually appear with a significantly lower score in the list.*
3.  **Narrative/Highlight**:
    *   "Now, let's look at a suspicious account detected by our Graph Engine."
    *   **Trust Score Card**: Observe the score drops dramatically (Red neon glow). Status changes to "HIGH RISK".
    *   **Fraud Cluster (Graph)**: Point to the bottom right **Graph Intelligence** panel. It might show "High collusion risk detected".
    *   **Why This Score**: Look for negative factors like "Graph Intelligence" or "Volatility".

## 📹 Scene 3: Platform Features
**Goal**: Show technical depth.

1.  **Action**: Hover over the **Trust Timeline**.
    *   Explain: "Our Temporal Engine tracks reputation over time, preventing sudden reputation farming."
2.  **Action**: Hover over the **Risk Radar** points.
    *   Explain: "We analyze multiple dimensions: Identity, Transaction Velocity, and Network Centrality."
3.  **Action**: Click the **Refresh** button (top right).
    *   Explain: "The system ingests real-time transaction data from the Graph Service."

## 🏁 Closing
*   "TRUSTRA provides a holistic, real-time view of marketplace reputation, moving beyond simple star ratings."
