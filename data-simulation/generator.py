import faker
import random
import csv
import uuid
from datetime import datetime, timedelta

fake = faker.Faker()

NUM_SELLERS = 1000  # Start small for dev, scale to 10k later
NUM_BUYERS = 5000
NUM_TRANSACTIONS = 20000

sellers = []
buyers = []
transactions = []
reviews = []

print("Generating Sellers...")
for _ in range(NUM_SELLERS):
    sellers.append({
        "id": str(uuid.uuid4()),
        "name": fake.company(),
        "joined_at": fake.date_time_between(start_date="-2y", end_date="now").isoformat(),
        "baseline_trust_score": random.uniform(400, 800)
    })

print("Generating Buyers...")
for _ in range(NUM_BUYERS):
    buyers.append({
        "id": str(uuid.uuid4()),
        "name": fake.name(),
        "joined_at": fake.date_time_between(start_date="-2y", end_date="now").isoformat()
    })

print("Generating Transactions...")
for _ in range(NUM_TRANSACTIONS):
    seller = random.choice(sellers)
    buyer = random.choice(buyers)
    txn_id = str(uuid.uuid4())
    status = random.choices(
        ['completed', 'refunded', 'cancelled', 'disputed'],
        weights=[0.85, 0.05, 0.05, 0.05]
    )[0]
    
    timestamp = fake.date_time_between(start_date=seller["joined_at"], end_date="now")
    
    transactions.append({
        "id": txn_id,
        "seller_id": seller["id"],
        "buyer_id": buyer["id"],
        "amount": round(random.uniform(10, 500), 2),
        "status": status,
        "timestamp": timestamp.isoformat(),
        "delivery_time_days": random.randint(1, 14)
    })

    # 40% chance of leaving a review
    if random.random() < 0.4:
        rating = random.choices([1, 2, 3, 4, 5], weights=[0.05, 0.05, 0.1, 0.3, 0.5])[0]
        reviews.append({
            "id": str(uuid.uuid4()),
            "seller_id": seller["id"],
            "buyer_id": buyer["id"],
            "transaction_id": txn_id,
            "rating": rating,
            "text": fake.sentence(),
            "timestamp": (timestamp + timedelta(days=random.randint(0, 5))).isoformat()
        })

# Inject Fraud (Burst)
print("Injecting Fraud...")
fraud_seller = random.choice(sellers)
fraud_seller["name"] = "FRAUD_SUSPECT_LTD"
burst_start = datetime.now() - timedelta(days=2)
for _ in range(50):
    buyer = random.choice(buyers)
    txn_id = str(uuid.uuid4())
    transactions.append({
        "id": txn_id,
        "seller_id": fraud_seller["id"],
        "buyer_id": buyer["id"],
        "amount": 99.99,
        "status": "completed",
        "timestamp": burst_start.isoformat(),
        "delivery_time_days": 1
    })
    reviews.append({
        "id": str(uuid.uuid4()),
        "seller_id": fraud_seller["id"],
        "buyer_id": buyer["id"],
        "transaction_id": txn_id,
        "rating": 5,
        "text": "Amazing service! Best seller ever!",
        "timestamp": burst_start.isoformat()
    })

# Save to CSV
def save_csv(filename, data, fieldnames):
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

save_csv('data-simulation/sellers.csv', sellers, sellers[0].keys())
save_csv('data-simulation/buyers.csv', buyers, buyers[0].keys())
save_csv('data-simulation/transactions.csv', transactions, transactions[0].keys())
save_csv('data-simulation/reviews.csv', reviews, reviews[0].keys())

print("Data Generation Complete.")
