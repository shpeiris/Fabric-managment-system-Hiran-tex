-- 026_add_delivery_tracking_to_orders.sql
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivered_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS delivery_contact_number VARCHAR(20);
