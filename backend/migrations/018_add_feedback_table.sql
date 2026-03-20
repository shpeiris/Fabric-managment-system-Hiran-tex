-- Migration 018: Add Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
  feedback_id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(order_id) ON DELETE SET NULL,
  overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  order_experience INTEGER CHECK (order_experience BETWEEN 1 AND 5),
  fabric_quality INTEGER CHECK (fabric_quality BETWEEN 1 AND 5),
  delivery INTEGER CHECK (delivery BETWEEN 1 AND 5),
  customer_service INTEGER CHECK (customer_service BETWEEN 1 AND 5),
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(customer_id, order_id)
);
