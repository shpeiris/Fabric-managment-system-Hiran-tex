-- Add customer information fields to orders table
USE fabric_management_system;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS special_instructions TEXT;