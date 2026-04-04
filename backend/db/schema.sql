-- PostgreSQL Schema for Fabric Management System

-- Drop tables if they exist (clean setup)
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS confirmation_logs CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS stock_arrivals CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart CASCADE;
DROP TABLE IF EXISTS fabrics CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS password_resets CASCADE;

-- 1. Employees Table (Staff)
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nic VARCHAR(50) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'INVENTORY', 'SALES')),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customers Table (Clients)
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    tel VARCHAR(20),
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Suppliers Table
CREATE TABLE suppliers (
    supplier_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    contact_number VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Fabrics Table
CREATE TABLE fabrics (
    fabric_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    material_type VARCHAR(100),
    color VARCHAR(50),
    design VARCHAR(100),
    price_per_meter DECIMAL(10, 2) NOT NULL,
    stock_quantity DECIMAL(10, 2) DEFAULT 0,
    stock_available_quantity DECIMAL(10, 2) DEFAULT 0,
    restock_level DECIMAL(10, 2) DEFAULT 50,

    image_url TEXT,
    width VARCHAR(50),
    restock_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Cart Table
CREATE TABLE cart (
    cart_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    fabric_id INTEGER NOT NULL REFERENCES fabrics(fabric_id) ON DELETE CASCADE,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1.0,
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_price DECIMAL(12, 2)
);

-- 6. Orders Table (Enhanced for Sales Order Management)
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    order_status VARCHAR(20) DEFAULT 'PENDING' CHECK (order_status IN ('PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED')),
    total_amount DECIMAL(12, 2) NOT NULL,
    delivery_address TEXT,
    delivery_type VARCHAR(50) DEFAULT 'STANDARD',
    customer_name VARCHAR(255),
    phone_number VARCHAR(20),
    special_instructions TEXT,
    verified_at TIMESTAMP NULL,
    verified_by INTEGER REFERENCES employees(employee_id) ON DELETE SET NULL,
    verification_notes TEXT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Order Items Table
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    fabric_id INTEGER NOT NULL REFERENCES fabrics(fabric_id) ON DELETE CASCADE,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL
);

-- 8. Stock Arrivals Table
CREATE TABLE stock_arrivals (
    arrival_id SERIAL PRIMARY KEY,
    fabric_id INTEGER NOT NULL REFERENCES fabrics(fabric_id) ON DELETE CASCADE,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
    arrival_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quantity DECIMAL(10, 2) NOT NULL,
    supply_unit_price DECIMAL(10, 2) NOT NULL,
    total_value DECIMAL(12, 2) NOT NULL,
    received_by INTEGER REFERENCES employees(employee_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Payments Table (Enhanced for Payment Management)
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'COMPLETED', 'FAILED')),
    bank_slip_url TEXT,
    verified_by INTEGER REFERENCES employees(employee_id) ON DELETE SET NULL,
    confirmed_by INTEGER REFERENCES employees(employee_id) ON DELETE SET NULL,
    confirmation_date TIMESTAMP NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Feedback Table (for order-specific customer reviews)
CREATE TABLE feedback (
    feedback_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(order_id) ON DELETE SET NULL,
    overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    fabric_quality INTEGER CHECK (fabric_quality BETWEEN 1 AND 5),
    delivery INTEGER CHECK (delivery BETWEEN 1 AND 5),
    customer_service INTEGER CHECK (customer_service BETWEEN 1 AND 5),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, order_id)
);

-- 10. Confirmation Logs Table (for customer notifications)
CREATE TABLE confirmation_logs (
    confirmation_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    confirmation_type VARCHAR(50) NOT NULL CHECK (confirmation_type IN ('order_confirmation', 'payment_confirmation', 'delivery_update')),
    sent_by INTEGER NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'SENT' CHECK (status IN ('SENT', 'FAILED', 'DELIVERED')),
    message_content TEXT
);

-- 12. Activity Logs Table (Enhanced for Sales Order Management)
CREATE TABLE activity_logs (
    log_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL,
    actor_type VARCHAR(50),
    action VARCHAR(255) NOT NULL,
    employee_id INTEGER REFERENCES employees(employee_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Password Resets Table
CREATE TABLE password_resets (
    reset_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_orders_verified_at ON orders(verified_at);
CREATE INDEX idx_orders_verified_by ON orders(verified_by);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_confirmation_logs_order_id ON confirmation_logs(order_id);
CREATE INDEX idx_confirmation_logs_type ON confirmation_logs(confirmation_type);
CREATE INDEX idx_activity_logs_action_type ON activity_logs(action_type);

-- Seed Sample Suppliers
INSERT INTO suppliers (name, contact_person, contact_number, email, address) VALUES
('Classic Textiles', 'Sarah Jenkins', '0112345678', 'sarah@classictextiles.com', 'No. 45, Main St, Colombo 03'),
('Global Fabrics Ltd', 'Michael Chen', '0117654321', 'info@globalfabrics.lk', 'Free Trade Zone, Katunayake');

-- Seed Sample Fabrics
INSERT INTO fabrics (name, material_type, color, design, price_per_meter, stock_quantity, restock_level, image_url, restock_date) VALUES

('Premium Egyptian Cotton', 'Cotton', 'White', 'Plain', 450.00, 500, 100, 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400', NULL),
('Royal Blue Silk', 'Silk', 'Blue', 'Satin', 1250.00, 150, 40, 'https://images.unsplash.com/photo-1597484662317-c87d32cf25b8?w=400', NULL),
('Venetian Linen Beige', 'Linen', 'Beige', 'Textured', 850.00, 0, 50, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', '2026-02-15'),
('Heavyweight Denim', 'Denim', 'Dark Indigo', 'Twill', 650.00, 25, 50, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400', '2026-02-10'),
('Merino Wool Charcoal', 'Wool', 'Charcoal', 'Herringbone', 1850.00, 80, 20, 'https://images.unsplash.com/photo-1544441893-675973e31985?w=400', NULL),
('Floral Viscose', 'Synthetic', 'Pink', 'Floral', 320.00, 400, 100, 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400', NULL),
('Crushed Velvet Red', 'Synthetic', 'Crimson', 'Crushed', 980.00, 10, 30, 'https://images.unsplash.com/photo-1571513722275-4b41940f54b8?w=400', '2026-02-05'),
('Chiffon Pastel', 'Silk', 'Lavender', 'Sheer', 420.00, 200, 50, 'https://images.unsplash.com/photo-1583091930067-2dd95c372131?w=400', NULL),
('Soft Plaid Flannel', 'Cotton', 'Red/Black', 'Plaid', 350.00, 150, 40, 'https://images.unsplash.com/photo-1525904097878-94fb15835963?w=400', NULL),
('Stretch Gabardine', 'Synthetic', 'Black', 'Solid', 550.00, 300, 60, 'https://images.unsplash.com/photo-1524510109189-4ba14001ba1d?w=400', NULL),
('Vintage Suede Brown', 'Leather', 'Brown', 'Matte', 2100.00, 5, 10, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400', '2026-03-01'),
('Organza Shimmer', 'Silk', 'Gold', 'Sheer Shimmer', 1500.00, 0, 15, 'https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?w=400', '2026-02-28');

-- Seed Initial Admin User (Password: 123456)
INSERT INTO employees (full_name, email, password, nic, role, status) VALUES 
('System Admin', 'admin@system.com', '$2a$10$3W0vfQGCn/Y2UVxr3nw6e.RV7l501cMRcqR9GDm5bAVtQH59wdflm', '000000000V', 'ADMIN', 'ACTIVE'),
('Sales Manager', 'sales@system.com', '$2a$10$3W0vfQGCn/Y2UVxr3nw6e.RV7l501cMRcqR9GDm5bAVtQH59wdflm', '111111111V', 'SALES', 'ACTIVE');

-- Seed Sample Customer (Password: 123456)
INSERT INTO customers (full_name, email, password, tel, address) VALUES
('Test Customer', 'customer@test.com', '$2a$10$3W0vfQGCn/Y2UVxr3nw6e.RV7l501cMRcqR9GDm5bAVtQH59wdflm', '0712345678', '123, Main Street, Colombo'),
('Jane Smith', 'jane@example.com', '$2a$10$3W0vfQGCn/Y2UVxr3nw6e.RV7l501cMRcqR9GDm5bAVtQH59wdflm', '0771234567', '456, Galle Road, Colombo 03');

-- Seed Sample Orders for testing
INSERT INTO orders (customer_id, order_status, total_amount, delivery_address, customer_name, phone_number) VALUES
(1, 'PENDING', 1250.00, '123, Main Street, Colombo', 'Test Customer', '0712345678'),
(2, 'PROCESSING', 850.00, '456, Galle Road, Colombo 03', 'Jane Smith', '0771234567'),
(1, 'PENDING', 650.00, '123, Main Street, Colombo', 'Test Customer', '0712345678');

-- Seed Sample Order Items
INSERT INTO order_items (order_id, fabric_id, quantity, unit_price, total_price) VALUES
(1, 2, 1.0, 1250.00, 1250.00),
(2, 3, 1.0, 850.00, 850.00),
(3, 4, 1.0, 650.00, 650.00);

-- Seed Sample Payments
INSERT INTO payments (order_id, amount, payment_method, payment_status) VALUES
(1, 1250.00, 'Bank Transfer', 'PENDING'),
(2, 850.00, 'Credit Card', 'COMPLETED'),
(3, 650.00, 'Cash', 'PENDING');
