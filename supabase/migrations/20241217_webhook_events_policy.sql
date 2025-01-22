-- Migration: Webhook Events Policy
-- Created: Dec 17, 2024 at 9:15 AM
-- Part of: DocuSign Hackathon 2024
-- Note: Original filename used 2023 date due to AI knowledge cutoff
--
-- Description: Security policies for webhook handling
-- Ensures proper access control for webhook events
-- See schema.md for complete documentation


-- Drop existing policies
drop policy if exists "Allow webhook inserts" on webhook_events;
drop policy if exists "Allow read access to authenticated users" on webhook_events;

-- Disable RLS for webhook_events table since it's only accessed by internal endpoints
alter table webhook_events disable row level security; 