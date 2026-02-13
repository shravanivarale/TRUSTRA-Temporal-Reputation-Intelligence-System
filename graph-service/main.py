from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from graph_engine import GraphEngine

app = FastAPI(title="TRUSTRA Graph Service (No-Docker)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Graph Engine and load CSV data
graph_engine = GraphEngine()

@app.get("/")
def read_root():
    return {"message": "TRUSTRA Graph Service Running (In-Memory NetworkX)"}

@app.get("/graph/{seller_id}")
def get_graph(seller_id: str):
    centrality = graph_engine.get_centrality_score(seller_id)
    collusion_score = graph_engine.detect_collusion(seller_id)
    
    return {
        "seller_id": seller_id,
        "centrality": centrality,
        "clustering_coefficient": collusion_score,
        "fraud_risk": "High" if collusion_score > 0.5 else "Low"
    }

@app.get("/detect-collusion")
def detect_collusion_endpoint():
    rings = graph_engine.find_fraud_rings()
    return {"suspicious_communities": rings}
