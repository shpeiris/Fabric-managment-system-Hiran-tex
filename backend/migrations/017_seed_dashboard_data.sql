-- Migration 017: Seed realistic dashboard data for testing (Simplified)
-- This ensures the customer dashboard has visible stats

-- 1. Add some items to the cart for Test Customer (user_id = 1)
INSERT INTO cart (user_id, fabric_id, quantity, total_price) VALUES
(1, 1, 5.5, 2475.00),
(1, 6, 10.0, 3200.00),
(1, 9, 2.5, 875.00)
ON CONFLICT DO NOTHING;

-- 2. Add a delivered order for Test Customer to show "Total Spent"
INSERT INTO orders (customer_id, order_status, total_amount, delivery_address, customer_name, phone_number, order_date) VALUES
(1, 'DELIVERED', 15750.00, '123, Main Street, Colombo', 'Test Customer', '0712345678', CURRENT_TIMESTAMP - INTERVAL '10 days');

-- 3. Add order items for the delivered order
INSERT INTO order_items (order_id, fabric_id, quantity, unit_price, total_price) VALUES
((SELECT order_id FROM orders WHERE customer_id = 1 AND order_status = 'DELIVERED' ORDER BY order_id DESC LIMIT 1), 2, 10.0, 1250.00, 12500.00),
((SELECT order_id FROM orders WHERE customer_id = 1 AND order_status = 'DELIVERED' ORDER BY order_id DESC LIMIT 1), 5, 5.0, 650.00, 3250.00);

-- 4. Add a payment for the delivered order
INSERT INTO payments (order_id, amount, payment_method, payment_status, payment_date) VALUES
((SELECT order_id FROM orders WHERE customer_id = 1 AND order_status = 'DELIVERED' ORDER BY order_id DESC LIMIT 1), 15750.00, 'Credit Card', 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '10 days');
