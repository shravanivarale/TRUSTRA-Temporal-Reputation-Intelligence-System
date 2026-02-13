import re
from datetime import datetime
from collections import Counter
import numpy as np

class AuthenticityModel:
    def __init__(self):
        pass

    def detect_bursts(self, reviews, time_window_days=7, burst_threshold=10):
        """
        Detect if a seller received unusually high number of reviews in a short window.
        """
        if not reviews:
            return False, 0.0

        dates = [datetime.fromisoformat(r['timestamp']) for r in reviews]
        dates.sort()
        
        if len(dates) < burst_threshold:
            return False, 0.0

        # Check rolling window
        max_rate = 0
        is_burst = False
        
        for i in range(len(dates)):
            window_end = dates[i]
            # Count reviews in [window_end - time_window, window_end]
            count = 0
            for d in dates:
                if 0 <= (window_end - d).days <= time_window_days:
                    count += 1
            
            rate = count / time_window_days
            if count >= burst_threshold:
                is_burst = True
                max_rate = max(max_rate, rate)
                
        return is_burst, max_rate

    def check_text_similarity(self, reviews):
        """
        Check for duplicate or highly similar review text (basic Jaccard or exact match).
        """
        if not reviews:
            return 0.0
            
        texts = [r['text'].lower() for r in reviews]
        unique_texts = set(texts)
        
        # Ratio of unique texts to total reviews
        uniqueness_ratio = len(unique_texts) / len(texts) if texts else 1.0
        
        # If low uniqueness, high probability of spam
        return 1.0 - uniqueness_ratio

    def predict_authenticity(self, seller_reviews):
        """
        Returns a score 0-1 (1 = authentic, 0 = fake)
        """
        is_burst, burst_rate = self.detect_bursts(seller_reviews)
        spam_score = self.check_text_similarity(seller_reviews)
        
        base_score = 1.0
        
        if is_burst:
            base_score -= 0.4
            
        if spam_score > 0.2:
            base_score -= (spam_score * 0.5)
            
        return max(0.0, base_score)
