-- Drop order_status_history table as order status tracking in orders table is sufficient
DROP TABLE IF EXISTS order_status_history CASCADE;