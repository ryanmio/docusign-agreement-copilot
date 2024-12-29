-- Add metadata column to recipients table
ALTER TABLE recipients
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create index on metadata for better performance
CREATE INDEX IF NOT EXISTS idx_recipients_metadata ON recipients USING GIN (metadata);

-- Comment on column
COMMENT ON COLUMN recipients.metadata IS 'Additional metadata for the recipient, such as role information'; 