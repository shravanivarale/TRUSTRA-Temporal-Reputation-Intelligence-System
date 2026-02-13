import numpy as np
from datetime import datetime, timedelta

class RiskEngine:
    def __init__(self, decay_lambda=0.05):
        self.decay_lambda = decay_lambda

    def calculate_temporal_trust(self, current_trust, last_updated_str):
        """
        Apply time decay to trust score if inactive.
        Trust_t = Trust_{t-1} * e^(-lambda * delta_t)
        """
        if not last_updated_str:
            return current_trust
            
        last_updated = datetime.fromisoformat(last_updated_str)
        delta_t = (datetime.now() - last_updated).days
        
        if delta_t <= 0:
            return current_trust
            
        decay_factor = np.exp(-self.decay_lambda * delta_t)
        new_trust = current_trust * decay_factor
        
        return new_trust

    def calculate_volatility(self, trust_history):
        """
        Calculate risk volatility (standard deviation of trust scores).
        """
        if len(trust_history) < 2:
            return 0.0
            
        scores = [entry['score'] for entry in trust_history]
        std_dev = np.std(scores)
        
        # Normalize volatility to 0-100 scale based on max expected variation
        volatility_index = min(100, (std_dev / 50.0) * 100)
        
        return volatility_index

    def predict_risk_trend(self, trust_history):
        """
        Simple trend prediction (slope of recent scores).
        """
        if len(trust_history) < 5:
            return "stable"
            
        recent_scores = [entry['score'] for entry in trust_history[-5:]]
        x = np.arange(len(recent_scores))
        slope, _ = np.polyfit(x, recent_scores, 1)
        
        if slope > 5:
            return "improving"
        elif slope < -5:
            return "declining"
        else:
            return "stable"
