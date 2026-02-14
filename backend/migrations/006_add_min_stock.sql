-- Add min_stock column to fabrics table
ALTER TABLE fabrics ADD COLUMN min_stock INTEGER DEFAULT 0;

-- Initialize min_stock with reorder_level values
UPDATE fabrics SET min_stock = reorder_level;
