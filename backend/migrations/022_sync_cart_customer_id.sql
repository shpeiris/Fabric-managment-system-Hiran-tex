-- Rename user_id back to customer_id in cart table for consistency with orders and backend services
ALTER TABLE cart RENAME COLUMN user_id TO customer_id;

-- Re-add foreign key constraint if it was named cart_user_id_fkey
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
              WHERE constraint_name = 'cart_user_id_fkey' AND table_name = 'cart') THEN
        ALTER TABLE cart DROP CONSTRAINT cart_user_id_fkey;
        ALTER TABLE cart ADD CONSTRAINT cart_customer_id_fkey 
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE;
    END IF;
END $$;
