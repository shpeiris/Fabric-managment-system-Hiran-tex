-- Migration: Add tables for order verification and confirmation tracking
-- Date: 2026-01-27
-- Description: Creates tables to support sales person order management functionality

-- Create activity_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS activity_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action_type VARCHAR(50) NOT NULL,
    description TEXT,
    target_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    INDEX idx_user_id (user_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at)
);

-- Create confirmation_logs table for tracking customer confirmations
CREATE TABLE IF NOT EXISTS confirmation_logs (
    confirmation_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    confirmation_type ENUM('order_confirmation', 'payment_confirmation', 'delivery_update') NOT NULL,
    sent_by INT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    status ENUM('SENT', 'FAILED', 'DELIVERED') DEFAULT 'SENT',
    message_content TEXT,
    INDEX idx_order_id (order_id),
    INDEX idx_confirmation_type (confirmation_type),
    INDEX idx_sent_at (sent_at),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (sent_by) REFERENCES employees(employee_id) ON DELETE SET NULL
);

-- Add verification tracking columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS verified_by INT NULL,
ADD COLUMN IF NOT EXISTS verification_notes TEXT NULL,
ADD INDEX idx_verified_at (verified_at),
ADD INDEX idx_verified_by (verified_by);

-- Add foreign key for verified_by if employees table exists
-- ALTER TABLE orders 
-- ADD CONSTRAINT fk_orders_verified_by 
-- FOREIGN KEY (verified_by) REFERENCES employees(employee_id) ON DELETE SET NULL;

-- Create order_status_history table for tracking status changes
CREATE TABLE IF NOT EXISTS order_status_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    INDEX idx_order_id (order_id),
    INDEX idx_changed_at (changed_at),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- Insert sample data for testing (optional)
-- You can remove this section in production

-- Sample activity log entries
INSERT INTO activity_logs (user_id, action_type, description, target_id) VALUES
(1, 'ORDER_VERIFICATION', 'Order #1 approved by salesperson', 1),
(1, 'CONFIRMATION_SENT', 'order_confirmation sent for Order #1 by salesperson', 1),
(1, 'PAYMENT_CONFIRMATION', 'Payment confirmed for Order #1', 1);

-- Sample confirmation log entries
INSERT INTO confirmation_logs (order_id, confirmation_type, sent_by, recipient_email, recipient_phone, message_content) VALUES
(1, 'order_confirmation', 1, 'customer@example.com', '+1234567890', 'Your order has been confirmed and is being processed.'),
(1, 'payment_confirmation', 1, 'customer@example.com', '+1234567890', 'We have received your payment successfully.'),
(1, 'delivery_update', 1, 'customer@example.com', '+1234567890', 'Your order status has been updated to Processing.');