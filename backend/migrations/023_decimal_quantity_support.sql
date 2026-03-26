-- Migration 023: Support decimal quantities (e.g., 5.75m) across order_items and fabrics tables
-- cart.quantity was already changed to DECIMAL(10,2) in migration 011

-- 1. Change order_items.quantity from INTEGER to NUMERIC(10,2)
ALTER TABLE order_items ALTER COLUMN quantity TYPE NUMERIC(10, 2);

-- 2. Change fabrics.stock_quantity from INTEGER to NUMERIC(10,2)
ALTER TABLE fabrics ALTER COLUMN stock_quantity TYPE NUMERIC(10, 2);

-- 3. Ensure fabrics.stock_available_quantity is also NUMERIC(10,2) (was set in 021 but verify)
ALTER TABLE fabrics ALTER COLUMN stock_available_quantity TYPE NUMERIC(10, 2);
