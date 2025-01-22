-- Migration: Realtime Updates
-- Created: Dec 28, 2024 at 7:17 PM
-- Part of: DocuSign Hackathon 2024
-- Note: Original filename used 2024 January date due to AI knowledge cutoff
--
-- Description: Enhanced real-time status tracking
-- Improves live updates for envelope and signing status
-- See schema.md for complete documentation



-- Enable realtime for bulk operations tables
alter publication supabase_realtime add table bulk_operations;
alter publication supabase_realtime add table bulk_recipients;

-- Create trigger function to update timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Add triggers for bulk_operations
create trigger update_bulk_operations_updated_at
  before update on bulk_operations
  for each row
  execute function update_updated_at_column();

-- Add triggers for bulk_recipients
create trigger update_bulk_recipients_updated_at
  before update on bulk_recipients
  for each row
  execute function update_updated_at_column(); 