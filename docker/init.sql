CREATE TABLE IF NOT EXISTS sellers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    joined_at TIMESTAMP NOT NULL,
    baseline_trust_score FLOAT DEFAULT 500.0,
    status VARCHAR(50) DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS buyers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    joined_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY,
    seller_id VARCHAR(50) REFERENCES sellers(id),
    buyer_id VARCHAR(50) REFERENCES buyers(id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'completed', 'refunded', 'cancelled', 'disputed'
    timestamp TIMESTAMP NOT NULL,
    delivery_time_days INT
);

CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(50) PRIMARY KEY,
    seller_id VARCHAR(50) REFERENCES sellers(id),
    buyer_id VARCHAR(50) REFERENCES buyers(id),
    transaction_id VARCHAR(50) REFERENCES transactions(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT,
    timestamp TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS trust_scores (
    id SERIAL PRIMARY KEY,
    seller_id VARCHAR(50) REFERENCES sellers(id),
    score FLOAT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
