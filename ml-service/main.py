from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import os
import requests
from datetime import datetime

from models.behavioral_engine import BehavioralEngine
from models.authenticity_model import AuthenticityModel
from models.risk_engine import RiskEngine

app = FastAPI(title="TRUSTRA ML Service (Supabase)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Supabase Config ---
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://gpdhyiohcagqydhhjzrz.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "sb_publishable_DixO3g1pvbB4aRuaTXh4Mw_5miq-nXW")
REST_URL = f"{SUPABASE_URL}/rest/v1"
SB_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
}

def sb_query(table: str, params: dict = None) -> list:
    """Query Supabase REST API and return JSON rows."""
    try:
        resp = requests.get(f"{REST_URL}/{table}", headers=SB_HEADERS, params=params or {}, timeout=10)
        if resp.status_code == 200:
            return resp.json()
        else:
            print(f"Supabase query error ({table}): {resp.status_code} {resp.text[:200]}")
            return []
    except Exception as e:
        print(f"Supabase connection error ({table}): {e}")
        return []

# Initialize Engines
behavioral_engine = BehavioralEngine()
authenticity_model = AuthenticityModel()
risk_engine = RiskEngine()

# Fallback: also keep CSV loading for offline mode
sellers_df = pd.DataFrame()
transactions_df = pd.DataFrame()
reviews_df = pd.DataFrame()

DATA_PATH = "../data-simulation"
USE_SUPABASE = True  # Flag to toggle

@app.on_event("startup")
async def load_data():
    global sellers_df, transactions_df, reviews_df, USE_SUPABASE
    
    # Test Supabase connection
    print("Testing Supabase connection...")
    test = sb_query("sellers", {"select": "id", "limit": "1"})
    if test:
        print("Supabase connection OK! Using database mode.")
        USE_SUPABASE = True
    else:
        print("Supabase unavailable. Falling back to CSV mode.")
        USE_SUPABASE = False
        # Load CSVs as fallback
        try:
            if os.path.exists(os.path.join(DATA_PATH, "sellers.csv")):
                sellers_df = pd.read_csv(os.path.join(DATA_PATH, "sellers.csv"))
                sellers_df['id'] = sellers_df['id'].astype(str)
            if os.path.exists(os.path.join(DATA_PATH, "transactions.csv")):
                transactions_df = pd.read_csv(os.path.join(DATA_PATH, "transactions.csv"))
                transactions_df['seller_id'] = transactions_df['seller_id'].astype(str)
            if os.path.exists(os.path.join(DATA_PATH, "reviews.csv")):
                reviews_df = pd.read_csv(os.path.join(DATA_PATH, "reviews.csv"))
                reviews_df['seller_id'] = reviews_df['seller_id'].astype(str)
            print(f"CSV Data Loaded: {len(sellers_df)} sellers")
        except Exception as e:
            print(f"Error loading CSV data: {e}")

# Data Models
class TrustRequest(BaseModel):
    seller_id: str

@app.get("/")
def read_root():
    mode = "Supabase" if USE_SUPABASE else "CSV"
    return {"message": f"TRUSTRA ML Service Running ({mode} Mode)"}

@app.post("/compute-trust")
def compute_trust_endpoint(request: TrustRequest):
    seller_id = request.seller_id
    
    if USE_SUPABASE:
        # Query Supabase for this seller's data
        seller_info = sb_query("sellers", {"select": "*", "id": f"eq.{seller_id}"})
        seller_txns = sb_query("transactions", {"select": "*", "seller_id": f"eq.{seller_id}"})
        seller_revs = sb_query("reviews", {"select": "*", "seller_id": f"eq.{seller_id}"})
        
        seller_tx = pd.DataFrame(seller_txns) if seller_txns else pd.DataFrame()
        seller_reviews = pd.DataFrame(seller_revs) if seller_revs else pd.DataFrame()
        
        if seller_info:
            current_trust = float(seller_info[0].get('baseline_trust_score', 500.0))
        else:
            current_trust = 500.0
    else:
        # CSV fallback
        seller_tx = transactions_df[transactions_df['seller_id'] == seller_id]
        seller_reviews = reviews_df[reviews_df['seller_id'] == seller_id]
        seller_info_df = sellers_df[sellers_df['id'] == seller_id]
        current_trust = float(seller_info_df.iloc[0]['baseline_trust_score']) if not seller_info_df.empty else 500.0

    try:
        # 2. Behavioral Score
        behavioral_score = behavioral_engine.compute_metrics(seller_tx, seller_reviews)
        
        # 3. Authenticity Score
        reviews_list = seller_reviews.to_dict('records') if not seller_reviews.empty else []
        authenticity_score = authenticity_model.predict_authenticity(reviews_list)
        
        # 4. Temporal Decay
        decayed_score = risk_engine.calculate_temporal_trust(current_trust, None)
        
        # 5. Final Score
        raw_performance = (behavioral_score * 0.6 + authenticity_score * 0.4) * 1000
        alpha = 0.3
        final_score = (decayed_score * (1 - alpha)) + (raw_performance * alpha)
        final_score = max(0, min(1000, final_score))
        
        # 6. Volatility
        volatility = 20.0
        
        return {
            "seller_id": seller_id,
            "trust_score": round(final_score, 2),
            "volatility_index": round(volatility, 2),
            "components": {
                "behavioral": round(behavioral_score * 1000, 2),
                "authenticity": round(authenticity_score * 1000, 2),
                "temporal_decay_applied": round(current_trust - decayed_score, 2)
            },
            "risk_level": "High" if final_score < 500 else "Medium" if final_score < 750 else "Low",
            "data_source": "supabase" if USE_SUPABASE else "csv"
        }
        
    except Exception as e:
        print(f"Error computing trust: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sellers")
def get_all_sellers():
    if USE_SUPABASE:
        rows = sb_query("sellers", {"select": "id,name,baseline_trust_score", "limit": "50"})
        return rows
    else:
        return sellers_df[['id', 'name', 'baseline_trust_score']].head(50).to_dict('records')
