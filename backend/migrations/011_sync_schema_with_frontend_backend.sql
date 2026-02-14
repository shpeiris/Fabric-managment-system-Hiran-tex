-- Synchronize database schema with frontend and backend usage
-- Migration 011: Sync schema with frontend/backend requirements

-- ============================================================================
-- 1. UPDATE FABRICS TABLE - Sync column names and add missing fields
-- ============================================================================

-- Add missing columns if they don't exist
ALTER TABLE fabrics ADD COLUMN IF NOT EXISTS stock_available_quantity INTEGER DEFAULT 0;
ALTER TABLE fabrics ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE fabrics ADD COLUMN IF NOT EXISTS refill_date DATE;

-- Migrate stock_quantity to stock_available_quantity if needed
DO $$
BEGIN
    -- Check if stock_quantity column exists and stock_available_quantity is empty
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fabrics' AND column_name = 'stock_quantity') THEN
        -- Copy data from stock_quantity to stock_available_quantity
        UPDATE fabrics SET stock_available_quantity = stock_quantity 
        WHERE stock_available_quantity IS NULL OR stock_available_quantity = 0;
    END IF;
END $$;

-- Update restock_level default if it's different
ALTER TABLE fabrics ALTER COLUMN restock_level SET DEFAULT 100;

-- ============================================================================
-- 2. UPDATE CART TABLE - Fix foreign key references
-- ============================================================================

-- Check if cart table uses customer_id instead of user_id
DO $$
BEGIN
    -- If customer_id column exists, rename it to user_id for consistency
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart' AND column_name = 'customer_id') THEN
        -- Drop foreign key constraint first
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                  WHERE constraint_name LIKE '%cart%customer%' AND table_name = 'cart') THEN
            ALTER TABLE cart DROP CONSTRAINT cart_customer_id_fkey;
        END IF;
        
        -- Rename column
        ALTER TABLE cart RENAME COLUMN customer_id TO user_id;
        
        -- Add new foreign key constraint to customers table
        ALTER TABLE cart ADD CONSTRAINT cart_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES customers(customer_id) ON DELETE CASCADE;
    END IF;
END $$;

-- Ensure quantity can be decimal for meters
ALTER TABLE cart ALTER COLUMN quantity TYPE DECIMAL(10, 2);

-- Add total_price column if missing
ALTER TABLE cart ADD COLUMN IF NOT EXISTS total_price DECIMAL(12, 2);

-- ============================================================================
-- 3. UPDATE ORDERS TABLE - Add missing customer and delivery fields
-- ============================================================================

-- Add missing columns for customer information and delivery details
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_instructions TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Ensure customer_id column exists and references customers table correctly
DO $$
BEGIN
    -- If user_id exists but customer_id doesn't, add customer_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_id') THEN
        -- Ensure foreign key constraint exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name LIKE '%orders%customer%' AND table_name = 'orders') THEN
            ALTER TABLE orders ADD CONSTRAINT orders_customer_id_fkey 
            FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- 4. UPDATE ORDER_ITEMS TABLE - Standardize column names
-- ============================================================================

-- Add missing columns and standardize naming
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS fabric_name VARCHAR(255);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price_per_meter DECIMAL(10, 2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12, 2);

-- Rename price_at_purchase to match backend usage if needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'price_at_purchase') THEN
        -- Copy data to new column
        UPDATE order_items SET price_per_meter = price_at_purchase WHERE price_per_meter IS NULL;
        
        -- Drop old column if new one has data
        ALTER TABLE order_items DROP COLUMN IF EXISTS price_at_purchase;
    END IF;
END $$;

-- Ensure unit_price column exists (used in backend)
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS total_price DECIMAL(12, 2);

-- ============================================================================
-- 5. CREATE STOCK_ARRIVALS TABLE if missing
-- ============================================================================

CREATE TABLE IF NOT EXISTS stock_arrivals (
    arrival_id SERIAL PRIMARY KEY,
    fabric_id INTEGER NOT NULL REFERENCES fabrics(fabric_id) ON DELETE CASCADE,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
    arrival_date DATE NOT NULL,
    quantity INTEGER NOT NULL,
    supply_unit_price DECIMAL(10, 2),
    total_value DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. UPDATE PAYMENTS TABLE - Ensure all needed fields exist
-- ============================================================================

-- Add missing columns used in frontend/backend
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS bank_slip_url VARCHAR(255);

-- Rename 'amount' to 'payment_amount' if needed for consistency
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'amount') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'payment_amount') THEN
        ALTER TABLE payments RENAME COLUMN amount TO payment_amount;
    END IF;
END $$;

-- ============================================================================
-- 7. CREATE INDEXES for better performance
-- ============================================================================

-- Indexes for fabrics
CREATE INDEX IF NOT EXISTS idx_fabrics_stock_status ON fabrics(stock_available_quantity, restock_level);
CREATE INDEX IF NOT EXISTS idx_fabrics_material_color ON fabrics(material_type, color);
CREATE INDEX IF NOT EXISTS idx_fabrics_restock_date ON fabrics(restock_date);

-- Indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_customer_status ON orders(customer_id, order_status);
CREATE INDEX IF NOT EXISTS idx_orders_date_status ON orders(order_date, order_status);

-- Indexes for cart
CREATE INDEX IF NOT EXISTS idx_cart_user_fabric ON cart(user_id, fabric_id);

-- Indexes for stock arrivals
CREATE INDEX IF NOT EXISTS idx_stock_arrivals_fabric ON stock_arrivals(fabric_id);
CREATE INDEX IF NOT EXISTS idx_stock_arrivals_date ON stock_arrivals(arrival_date);

-- ============================================================================
-- 8. UPDATE DATA CONSISTENCY
-- ============================================================================

-- Update any null restock_levels to default
UPDATE fabrics SET restock_level = 100 WHERE restock_level IS NULL;

-- Update stock_available_quantity from stock_quantity if still null
UPDATE fabrics SET stock_available_quantity = 0 WHERE stock_available_quantity IS NULL;

-- Calculate total_price in cart if missing
UPDATE cart SET total_price = 
    (SELECT price_per_meter FROM fabrics WHERE fabric_id = cart.fabric_id) * quantity 
WHERE total_price IS NULL;

-- Calculate total_amount in order_items if missing  
UPDATE order_items SET total_amount = price_per_meter * quantity 
WHERE total_amount IS NULL AND price_per_meter IS NOT NULL;

-- ============================================================================
-- 9. ADD CONSTRAINTS AND VALIDATIONS
-- ============================================================================

-- Add check constraints for valid data
ALTER TABLE fabrics ADD CONSTRAINT fabrics_price_positive 
    CHECK (price_per_meter > 0) NOT VALID;

ALTER TABLE fabrics ADD CONSTRAINT fabrics_stock_non_negative 
    CHECK (stock_available_quantity >= 0) NOT VALID;

ALTER TABLE cart ADD CONSTRAINT cart_quantity_positive 
    CHECK (quantity > 0) NOT VALID;

ALTER TABLE order_items ADD CONSTRAINT order_items_quantity_positive 
    CHECK (quantity > 0) NOT VALID;

-- ============================================================================
-- 10. REFRESH DATABASE STATISTICS
-- ============================================================================

-- Analyze tables for query optimization
ANALYZE fabrics;
ANALYZE orders;
ANALYZE order_items;
ANALYZE cart;
ANALYZE customers;
ANALYZE employees;
ANALYZE payments;
ANALYZE stock_arrivals;

COMMENT ON MIGRATION IS 'Sync database schema with frontend/backend field usage';