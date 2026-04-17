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
    reorder_level DECIMAL(10, 2) DEFAULT 50,
    image_url TEXT,
    width VARCHAR(50),
    restock_date DATE,
    is_in_catalog BOOLEAN DEFAULT TRUE,
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
    delivered_by VARCHAR(255),
    delivery_contact_number VARCHAR(20),
    tracking_id VARCHAR(100),
    order_source VARCHAR(20) DEFAULT 'ONLINE' CHECK (order_source IN ('ONLINE', 'IN_STORE')),
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

-- Seed Initial Admin User (Password: 123456)
INSERT INTO employees (full_name, email, password, nic, role, status) VALUES 
('System Admin', 'admin@system.com', '$2a$10$3W0vfQGCn/Y2UVxr3nw6e.RV7l501cMRcqR9GDm5bAVtQH59wdflm', '000000000V', 'ADMIN', 'ACTIVE');

-- End of Schema
