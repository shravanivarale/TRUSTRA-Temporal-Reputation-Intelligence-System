import pandas as pd
import numpy as np
from scipy.stats import zscore

class BehavioralEngine:
    def __init__(self):
        pass

    def compute_metrics(self, transactions_df, reviews_df):
        """
        Compute behavioral metrics for a seller.
        """
        if transactions_df.empty:
            return 0.0

        # Feature 1: On-time Delivery Rate
        # Assume 'delivery_time_days' <= 5 is on-time
        transactions_df['is_ontime'] = transactions_df['delivery_time_days'] <= 5
        ontime_rate = transactions_df['is_ontime'].mean()

        # Feature 2: Return Rate
        # Status 'refunded' counts as return
        return_rate = (transactions_df['status'] == 'refunded').mean()

        # Feature 3: Cancellation Rate
        cancellation_rate = (transactions_df['status'] == 'cancelled').mean()

        # Feature 4: Dispute Frequency
        dispute_rate = (transactions_df['status'] == 'disputed').mean()

        # Feature 5: Average Rating
        if not reviews_df.empty:
            avg_rating = reviews_df['rating'].mean()
            rating_count = len(reviews_df)
        else:
            avg_rating = 0.0
            rating_count = 0

        # Composite Score Calculation (Simplified for now)
        # Weights: OnTime (0.3), Return (-0.2), Cancel (-0.2), Dispute (-0.3)
        # Rating is handled separately
        
        behavioral_score = (
            (ontime_rate * 0.3) - 
            (return_rate * 0.2) - 
            (cancellation_rate * 0.2) - 
            (dispute_rate * 0.3)
        )
        
        # Normalize to 0-1 range roughly (considering negatives)
        # Base score 0.5 + behavioral_score
        final_score = 0.5 + behavioral_score
        return max(0.0, min(1.0, final_score))

    def normalize_features(self, df):
        """
        Apply Z-score normalization to features across all sellers
        """
        # numerical_cols = ['ontime_rate', 'return_rate', 'cancellation_rate', 'dispute_rate']
        # df[numerical_cols] = df[numerical_cols].apply(zscore)
        return df
