-- Migration: Add courier details to orders table
-- Date: 2026-03-20
-- Description: Adds courier_name and courier_rider_number to track delivery information

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS courier_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS courier_rider_number VARCHAR(20);

-- Update existing orders to have a default if they were already marked as delivered (optional)
-- UPDATE orders SET courier_name = 'PickMe Courier' WHERE order_status = 'DELIVERED' AND courier_name IS NULL;
