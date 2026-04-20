-- Migration to fix data persistence by expanding field lengths and ensuring schema consistency
-- These changes are non-destructive and only expand allowed data sizes.

-- Update customers table
ALTER TABLE customers ALTER COLUMN email TYPE VARCHAR(255);
ALTER TABLE customers ALTER COLUMN password TYPE VARCHAR(255);
ALTER TABLE customers ALTER COLUMN tel TYPE VARCHAR(20);
ALTER TABLE customers ALTER COLUMN address TYPE TEXT;

-- Update employees table (consistency check)
ALTER TABLE employees ALTER COLUMN telephone TYPE VARCHAR(20);

-- Update orders table
-- Ensure lengths are sufficient for tracking and delivery details
ALTER TABLE orders ALTER COLUMN delivery_type TYPE VARCHAR(100);
ALTER TABLE orders ALTER COLUMN delivered_by TYPE VARCHAR(255);
ALTER TABLE orders ALTER COLUMN tracking_id TYPE VARCHAR(255);

-- Check and update ENUMs if necessary
-- Note: PostgreSQL doesn't support 'IF NOT EXISTS' for enum values easily in a script
-- but we can use a DO block to safely add them if missing.

DO $$
BEGIN
    -- Check for 'SHIPPED' status in order_status enum
    IF NOT EXISTS (SELECT 1 FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'order_status' AND pg_enum.enumlabel = 'SHIPPED') THEN
        ALTER TYPE order_status ADD VALUE 'SHIPPED' AFTER 'PROCESSING';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Skipping order_status update as it might already exist or table is in use.';
END
$$;

DO $$
BEGIN
    -- Check for 'READY_FOR_PICKUP' status in order_status enum
    IF NOT EXISTS (SELECT 1 FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'order_status' AND pg_enum.enumlabel = 'READY_FOR_PICKUP') THEN
        ALTER TYPE order_status ADD VALUE 'READY_FOR_PICKUP' AFTER 'PROCESSING';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Skipping order_status update.';
END
$$;

COMMENT ON TABLE orders IS 'Primary table for sales orders. customer_id remains NOT NULL as per business requirement.';
