-- Migration 025: Add invoice_id and invoice_date to orders table
-- This allows for persistent storage of invoice data once an order is processed.

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS invoice_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS invoice_date TIMESTAMP;

-- Optional: Populate existing processed orders with a default invoice format if needed
-- UPDATE orders SET invoice_id = CONCAT('INV-', EXTRACT(YEAR FROM order_date), '-', LPAD(order_id::text, 4, '0')), invoice_date = verified_at 
-- WHERE order_status IN ('PROCESSING', 'DELIVERED') AND invoice_id IS NULL;
