-- Add order_source if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='order_source') THEN
        ALTER TABLE orders ADD COLUMN order_source VARCHAR(20) DEFAULT 'ONLINE' CHECK (order_source IN ('ONLINE', 'IN_STORE'));
    END IF;
END $$;

-- Add order_type if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='order_type') THEN
        ALTER TABLE orders ADD COLUMN order_type VARCHAR(50) DEFAULT 'STANDARD';
    END IF;
END $$;
