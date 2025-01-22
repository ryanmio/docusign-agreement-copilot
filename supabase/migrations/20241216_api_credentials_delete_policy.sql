-- Migration: API Credentials Delete Policy
-- Created: Dec 16, 2024 at 10:12 AM
-- Part of: DocuSign Hackathon 2024
-- Note: Original filename used 2023 date due to AI knowledge cutoff
--
-- Description: Adds secure deletion policy for API credentials
-- Ensures users can only delete their own credentials
-- See schema.md for complete documentation
-- Drop existing delete policy if it exists
drop policy if exists "Users can delete own credentials" on api_credentials;

-- Create delete policy
create policy "Users can delete own credentials"
  on api_credentials for delete
  using (auth.uid() = user_id); 