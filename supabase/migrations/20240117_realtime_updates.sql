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