-- Rename min_stock column to restock_level in fabrics table
ALTER TABLE fabrics RENAME COLUMN min_stock TO restock_level;