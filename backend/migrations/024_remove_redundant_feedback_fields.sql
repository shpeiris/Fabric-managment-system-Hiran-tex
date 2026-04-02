-- Migration 024: Remove Redundant Feedback Fields
-- Dropping columns overall_rating, order_experience, and customer_service from feedback table.

ALTER TABLE feedback 
DROP COLUMN IF EXISTS overall_rating,
DROP COLUMN IF EXISTS order_experience,
DROP COLUMN IF EXISTS customer_service;
