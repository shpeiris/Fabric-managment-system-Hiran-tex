-- PostgreSQL Database Schema for Fabric Management System
-- Converted from MySQL to PostgreSQL

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart CASCADE;
DROP TABLE IF EXISTS fabrics CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;

-- Drop existing ENUM types
DROP TYPE IF EXISTS employee_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- Create custom ENUM types for PostgreSQL
CREATE TYPE employee_role AS ENUM ('ADMIN', 'INVENTORY', 'SALES');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE order_status AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- 1. Employees Table (Staff)
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nic VARCHAR(50) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    role employee_role NOT NULL,
    status user_status DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session table removed as per request (reverted to in-memory)

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
    stock_quantity INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Cart Table
CREATE TABLE cart (
    cart_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    fabric_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (fabric_id) REFERENCES fabrics(fabric_id) ON DELETE CASCADE
);

-- 6. Orders Table
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    order_status order_status DEFAULT 'PENDING',
    total_amount DECIMAL(12, 2) NOT NULL,
    delivery_address TEXT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

-- 7. Order Items Table
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    fabric_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL, -- Snapshots price to satisfy 3NF
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (fabric_id) REFERENCES fabrics(fabric_id) ON DELETE CASCADE
);

-- 8. Payments Table
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    method VARCHAR(50),
    status payment_status DEFAULT 'PENDING',
    verified_by INTEGER, -- Employee who verified the payment
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES employees(employee_id) ON DELETE SET NULL
);

-- 9. Activity Logs Table
CREATE TABLE activity_logs (
    log_id SERIAL PRIMARY KEY,
    employee_id INTEGER,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL
);

-- Seed Initial Admin User (Password: 123456)
-- Password is hashed using bcrypt
INSERT INTO employees (full_name, email, password, nic, role, status) VALUES 
('System Admin', 'admin@system.com', '$2a$10$Zw2hrXNYXDlGXwGvTkieGeyWFhH0bVJhUaZUm3S6/pOL/jGllLstS', '000000000V', 'ADMIN', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_cart_customer ON cart(customer_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_activity_logs_employee ON activity_logs(employee_id);
