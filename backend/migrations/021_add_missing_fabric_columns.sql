-- Add missing columns to fabrics table if they don't exist
ALTER TABLE fabrics ADD COLUMN IF NOT EXISTS width VARCHAR(50);
ALTER TABLE fabrics ADD COLUMN IF NOT EXISTS stock_available_quantity DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE fabrics ADD COLUMN IF NOT EXISTS restock_date DATE;

-- Update stock_available_quantity from stock_quantity for existing records if needed
UPDATE fabrics SET stock_available_quantity = stock_quantity WHERE stock_available_quantity = 0 AND stock_quantity > 0;
