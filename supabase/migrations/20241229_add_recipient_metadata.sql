-- Migration: Add Recipient Metadata
-- Created: Dec 29, 2024 at 2:29 PM
-- Part of: DocuSign Hackathon 2024
-- Note: Original filename used 2024 January date due to AI knowledge cutoff
--
-- Description: Enhanced recipient data structure
-- Adds metadata support for AI-driven recipient handling
-- See schema.md for complete documentation



-- Add metadata column to recipients table
ALTER TABLE recipients
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create index on metadata for better performance
CREATE INDEX IF NOT EXISTS idx_recipients_metadata ON recipients USING GIN (metadata);

-- Comment on column
COMMENT ON COLUMN recipients.metadata IS 'Additional metadata for the recipient, such as role information'; 