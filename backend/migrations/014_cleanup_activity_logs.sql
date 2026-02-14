-- Remove unused columns from activity_logs table
ALTER TABLE activity_logs 
    DROP COLUMN IF EXISTS description,
    DROP COLUMN IF EXISTS target_id,
    DROP COLUMN IF EXISTS details,
    DROP COLUMN IF EXISTS ip_address,
    DROP COLUMN IF EXISTS user_agent,
    DROP COLUMN IF EXISTS metadata,
    DROP COLUMN IF EXISTS actor_id;

-- Remove related index that's no longer needed
DROP INDEX IF EXISTS idx_activity_logs_actor;