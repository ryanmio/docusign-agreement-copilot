-- Drop existing policies
drop policy if exists "Allow webhook inserts" on webhook_events;
drop policy if exists "Allow read access to authenticated users" on webhook_events;

-- Disable RLS for webhook_events table since it's only accessed by internal endpoints
alter table webhook_events disable row level security; 