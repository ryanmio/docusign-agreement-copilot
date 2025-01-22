-- Migration: Webhook Events
-- Created: Dec 16, 2024 at 9:52 AM
-- Part of: DocuSign Hackathon 2024
-- Note: Original filename used 2023 date due to AI knowledge cutoff
--
-- Description: DocuSign Connect webhook support
-- Captures and processes real-time DocuSign events
-- See schema.md for complete documentation

-- Create webhook_events table
create table if not exists webhook_events (
  id uuid default uuid_generate_v4() primary key,
  provider text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table webhook_events enable row level security;

-- Create policy to allow insert from webhook endpoints
create policy "Allow webhook inserts" on webhook_events
  for insert
  with check (true);

-- Create policy to allow read access to authenticated users
create policy "Allow read access to authenticated users" on webhook_events
  for select
  using (auth.role() = 'authenticated'); 