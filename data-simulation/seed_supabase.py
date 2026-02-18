"""
TRUSTRA - Supabase Data Seeder (REST API)
Reads CSV files and uploads them to Supabase PostgreSQL via the REST API.
No SDK required — uses the 'requests' library directly.
"""
import csv
import json
import os
import requests

# --- Configuration ---
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://gpdhyiohcagqydhhjzrz.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "sb_publishable_DixO3g1pvbB4aRuaTXh4Mw_5miq-nXW")

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
BATCH_SIZE = 200  # Supabase REST API works well with smaller batches

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"  # UPSERT behavior
}

REST_URL = f"{SUPABASE_URL}/rest/v1"

def read_csv_file(filename: str) -> list:
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        print(f"  WARNING: File not found: {filepath}")
        return []
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)

def upsert_batch(table_name: str, rows: list) -> bool:
    """Upload a batch of rows to Supabase via REST API."""
    url = f"{REST_URL}/{table_name}"
    try:
        resp = requests.post(url, headers=HEADERS, json=rows, timeout=30)
        if resp.status_code in (200, 201):
            return True
        else:
            print(f"    Error {resp.status_code}: {resp.text[:200]}")
            return False
    except Exception as e:
        print(f"    Request error: {e}")
        return False

def seed_table(table_name: str, rows: list):
    if not rows:
        print(f"  No data for '{table_name}', skipping.")
        return 0
    
    total = len(rows)
    uploaded = 0
    
    for i in range(0, total, BATCH_SIZE):
        batch = rows[i : i + BATCH_SIZE]
        if upsert_batch(table_name, batch):
            uploaded += len(batch)
            pct = int((uploaded / total) * 100)
            print(f"  [{pct:3d}%] {table_name}: {uploaded}/{total} rows")
        else:
            print(f"  FAILED at batch starting at row {i}. Trying one-by-one...")
            for row in batch:
                if upsert_batch(table_name, [row]):
                    uploaded += 1
    
    return uploaded

def clean_seller(row: dict) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "joined_at": row["joined_at"],
        "baseline_trust_score": float(row["baseline_trust_score"]),
        "status": "active"
    }

def clean_transaction(row: dict) -> dict:
    dtd = row.get("delivery_time_days", "")
    return {
        "id": row["id"],
        "seller_id": row["seller_id"],
        "buyer_id": row["buyer_id"],
        "amount": float(row["amount"]),
        "status": row["status"],
        "timestamp": row["timestamp"],
        "delivery_time_days": int(dtd) if dtd and dtd.strip() else None
    }

def clean_review(row: dict) -> dict:
    return {
        "id": row["id"],
        "seller_id": row["seller_id"],
        "buyer_id": row["buyer_id"],
        "transaction_id": row.get("transaction_id") or None,
        "rating": int(row["rating"]),
        "text": row.get("text", ""),
        "timestamp": row["timestamp"]
    }

def main():
    print("=" * 55)
    print("  TRUSTRA Supabase Seeder (REST API)")
    print("=" * 55)
    print(f"  Target: {SUPABASE_URL}")
    print()

    # Test connection
    print("Testing connection...")
    try:
        resp = requests.get(f"{REST_URL}/sellers?select=id&limit=1", headers=HEADERS, timeout=10)
        if resp.status_code == 200:
            print("  Connection OK!")
        else:
            print(f"  WARNING: Got status {resp.status_code}: {resp.text[:200]}")
            print("  Make sure you have run init.sql in the Supabase SQL Editor first!")
            return
    except Exception as e:
        print(f"  Connection FAILED: {e}")
        return
    print()

    # 1. Sellers
    print("[1/4] Seeding sellers...")
    sellers_raw = read_csv_file("sellers.csv")
    sellers = [clean_seller(r) for r in sellers_raw]
    s_count = seed_table("sellers", sellers)
    print()

    # 2. Buyers (extract from transactions if no buyers.csv)
    print("[2/4] Seeding buyers...")
    buyers_path = os.path.join(DATA_DIR, "buyers.csv")
    if os.path.exists(buyers_path):
        buyers = read_csv_file("buyers.csv")
        b_count = seed_table("buyers", buyers)
    else:
        print("  No buyers.csv found. Extracting unique buyers from transactions...")
        txns_raw = read_csv_file("transactions.csv")
        seen = set()
        buyers = []
        for tx in txns_raw:
            bid = tx.get("buyer_id")
            if bid and bid not in seen:
                seen.add(bid)
                buyers.append({
                    "id": bid,
                    "name": f"Buyer-{bid[:8]}",
                    "joined_at": tx.get("timestamp", "2024-01-01T00:00:00")
                })
        b_count = seed_table("buyers", buyers)
    print()

    # 3. Transactions
    print("[3/4] Seeding transactions...")
    txns_raw = read_csv_file("transactions.csv")
    txns = [clean_transaction(r) for r in txns_raw]
    t_count = seed_table("transactions", txns)
    print()

    # 4. Reviews
    print("[4/4] Seeding reviews...")
    reviews_raw = read_csv_file("reviews.csv")
    reviews = [clean_review(r) for r in reviews_raw]
    r_count = seed_table("reviews", reviews)
    print()

    print("=" * 55)
    print("  SEEDING COMPLETE!")
    print(f"  Sellers:      {s_count}")
    print(f"  Buyers:       {b_count}")
    print(f"  Transactions: {t_count}")
    print(f"  Reviews:      {r_count}")
    print("=" * 55)

if __name__ == "__main__":
    main()
