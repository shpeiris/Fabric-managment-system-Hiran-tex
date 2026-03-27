-- Add customer information fields to orders table

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS special_instructions TEXT;