from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import os
from datetime import datetime

from models.behavioral_engine import BehavioralEngine
from models.authenticity_model import AuthenticityModel
from models.risk_engine import RiskEngine

app = FastAPI(title="TRUSTRA ML Service (No-Docker)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Engines
behavioral_engine = BehavioralEngine()
authenticity_model = AuthenticityModel()
risk_engine = RiskEngine()

# Global DataFrames
sellers_df = pd.DataFrame()
transactions_df = pd.DataFrame()
reviews_df = pd.DataFrame()
buyers_df = pd.DataFrame()

DATA_PATH = "../data-simulation"

@app.on_event("startup")
async def load_data():
    global sellers_df, transactions_df, reviews_df, buyers_df
    try:
        print("Loading CSV Data...")
        if os.path.exists(os.path.join(DATA_PATH, "sellers.csv")):
            sellers_df = pd.read_csv(os.path.join(DATA_PATH, "sellers.csv"))
            # Ensure ID is string
            sellers_df['id'] = sellers_df['id'].astype(str)
        
        if os.path.exists(os.path.join(DATA_PATH, "transactions.csv")):
            transactions_df = pd.read_csv(os.path.join(DATA_PATH, "transactions.csv"))
            transactions_df['seller_id'] = transactions_df['seller_id'].astype(str)
            
        if os.path.exists(os.path.join(DATA_PATH, "reviews.csv")):
            reviews_df = pd.read_csv(os.path.join(DATA_PATH, "reviews.csv"))
            reviews_df['seller_id'] = reviews_df['seller_id'].astype(str)
            
        print(f"Data Loaded: {len(sellers_df)} sellers, {len(transactions_df)} txns, {len(reviews_df)} reviews.")
    except Exception as e:
        print(f"Error loading CSV data: {e}")

# Data Models
class TrustRequest(BaseModel):
    seller_id: str

@app.get("/")
def read_root():
    return {"message": "TRUSTRA ML Service Running (CSV Mode)"}

@app.post("/compute-trust")
def compute_trust_endpoint(request: TrustRequest):
    seller_id = request.seller_id
    
    # 1. Fetch relevant data from memory
    seller_tx = transactions_df[transactions_df['seller_id'] == seller_id]
    seller_reviews = reviews_df[reviews_df['seller_id'] == seller_id]
    
    seller_info = sellers_df[sellers_df['id'] == seller_id]
    if seller_info.empty:
        # Fallback for unknown seller
        current_trust = 500.0
    else:
        current_trust = float(seller_info.iloc[0]['baseline_trust_score'])

    try:
        # 2. Behavioral Score
        behavioral_score = behavioral_engine.compute_metrics(seller_tx, seller_reviews)
        
        # 3. Authenticity Score
        reviews_list = seller_reviews.to_dict('records')
        authenticity_score = authenticity_model.predict_authenticity(reviews_list)
        
        # 4. Temporal Decay (Mocking last update as now for simplicity)
        decayed_score = risk_engine.calculate_temporal_trust(current_trust, None)
        
        # 5. Final Score
        raw_performance = (behavioral_score * 0.6 + authenticity_score * 0.4) * 1000
        alpha = 0.3
        final_score = (decayed_score * (1 - alpha)) + (raw_performance * alpha)
        final_score = max(0, min(1000, final_score))
        
        # 6. Volatility (Mock history)
        volatility = 20.0 # Placeholder
        
        return {
            "seller_id": seller_id,
            "trust_score": round(final_score, 2),
            "volatility_index": round(volatility, 2),
            "components": {
                "behavioral": round(behavioral_score * 1000, 2),
                "authenticity": round(authenticity_score * 1000, 2),
                "temporal_decay_applied": round(current_trust - decayed_score, 2)
            },
            "risk_level": "High" if final_score < 500 else "Medium" if final_score < 750 else "Low"
        }
        
    except Exception as e:
        print(f"Error computing trust: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sellers")
def get_all_sellers():
    return sellers_df[['id', 'name', 'baseline_trust_score']].head(50).to_dict('records')
