-- Migration 019: Add missing order_experience column to feedback table
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS order_experience INTEGER CHECK (order_experience BETWEEN 1 AND 5);
