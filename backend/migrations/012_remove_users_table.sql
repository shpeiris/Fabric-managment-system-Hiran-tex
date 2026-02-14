-- Migration 012: Remove users table and clean up references
-- Since we now use employees and customers tables directly

-- ============================================================================
-- 1. REMOVE REFERENCES TO USERS TABLE
-- ============================================================================

-- Drop user_sessions table if it exists (references users table)
DROP TABLE IF EXISTS user_sessions CASCADE;

-- Remove foreign key constraints that reference users table
DO $$
BEGIN
    -- Drop activity_logs table if it references users instead of employees
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_logs') THEN
        -- Check if it has user_id column referencing users table
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'user_id') THEN
            -- Drop and recreate activity_logs to reference employees instead
            DROP TABLE activity_logs CASCADE;
            
            CREATE TABLE activity_logs (
                log_id SERIAL PRIMARY KEY,
                employee_id INTEGER REFERENCES employees(employee_id) ON DELETE SET NULL,
                action VARCHAR(255) NOT NULL,
                details TEXT,
                ip_address VARCHAR(45),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        END IF;
    END IF;
END $$;

-- ============================================================================
-- 2. UPDATE CUSTOMERS TABLE TO BE INDEPENDENT 
-- ============================================================================

-- Remove user_id column from customers if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'user_id') THEN
        -- Drop foreign key constraint first
        ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_user_id_fkey;
        -- Remove the user_id column
        ALTER TABLE customers DROP COLUMN user_id;
    END IF;
END $$;

-- ============================================================================
-- 3. UPDATE CART TABLE TO REFERENCE CUSTOMERS DIRECTLY
-- ============================================================================

-- Ensure cart table uses user_id but references customers table
DO $$
BEGIN
    -- If cart references users table, update to reference customers
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
              WHERE constraint_name LIKE '%cart%user%' AND table_name = 'cart') THEN
        -- Drop old constraint
        ALTER TABLE cart DROP CONSTRAINT IF EXISTS cart_user_id_fkey;
        
        -- Add new constraint to reference customers table
        ALTER TABLE cart ADD CONSTRAINT cart_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES customers(customer_id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================================================
-- 4. UPDATE ORDERS TABLE TO REFERENCE CUSTOMERS DIRECTLY
-- ============================================================================

-- Ensure orders table references customers properly
DO $$
BEGIN
    -- Check if orders has user_id column
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'user_id') THEN
        -- Drop old constraint if exists
        ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
        
        -- Rename user_id to customer_id if needed
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_id') THEN
            ALTER TABLE orders RENAME COLUMN user_id TO customer_id;
        END IF;
        
        -- Add proper constraint
        ALTER TABLE orders ADD CONSTRAINT orders_customer_id_fkey 
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================================================
-- 5. UPDATE PAYMENTS TABLE REFERENCES
-- ============================================================================

-- Update payments table to reference employees instead of users for verified_by
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'verified_by') THEN
        -- Drop old constraint if exists
        ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_verified_by_fkey;
        
        -- Add new constraint to reference employees
        ALTER TABLE payments ADD CONSTRAINT payments_verified_by_fkey 
        FOREIGN KEY (verified_by) REFERENCES employees(employee_id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- 6. FINALLY DROP USERS TABLE
-- ============================================================================

-- Drop the users table completely
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- 7. ADD MISSING CONSTRAINTS AND INDEXES
-- ============================================================================

-- Recreate any indexes that might have been dropped
CREATE INDEX IF NOT EXISTS idx_activity_logs_employee ON activity_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_date ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- ============================================================================
-- 8. VERIFY TABLE STRUCTURE
-- ============================================================================

-- Add comment to track this migration
COMMENT ON DATABASE fabric_management_system IS 'Users table removed - using employees and customers tables directly';

-- Analyze tables for performance
ANALYZE employees;
ANALYZE customers;
ANALYZE orders;
ANALYZE cart;
ANALYZE payments;
ANALYZE activity_logs;

-- Migration completed successfully