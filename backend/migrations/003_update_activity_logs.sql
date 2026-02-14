-- Add metadata columns and actor typing for activity logs
ALTER TABLE activity_logs
    ADD COLUMN IF NOT EXISTS actor_id INTEGER,
    ADD COLUMN IF NOT EXISTS actor_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
    ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Backfill actor fields from legacy employee_id
UPDATE activity_logs
SET actor_id = employee_id,
    actor_type = 'EMPLOYEE'
WHERE actor_id IS NULL AND employee_id IS NOT NULL;

-- Helpful indexes for feed queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor ON activity_logs(actor_type, actor_id);
