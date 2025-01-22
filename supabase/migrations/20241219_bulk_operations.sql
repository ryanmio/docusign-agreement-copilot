-- Migration: Bulk Operations
-- Created: Dec 19, 2024 at 8:45 AM
-- Part of: DocuSign Hackathon 2024
-- Note: Original filename used 2024 January date due to AI knowledge cutoff
--
-- Description: Bulk sending infrastructure
-- Enables mass envelope operations with status tracking
-- See schema.md for complete documentation


-- Create bulk operation status enum
do $$ begin
  create type bulk_operation_status as enum (
    'created',
    'processing',
    'completed',
    'failed'
  );
exception
  when duplicate_object then null;
end $$;

-- Create bulk operations table
create table if not exists bulk_operations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  status bulk_operation_status default 'created',
  total_count integer default 0,
  processed_count integer default 0,
  success_count integer default 0,
  error_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  completed_at timestamp with time zone,
  metadata jsonb default '{}'::jsonb
);

-- Create bulk recipients table
create table if not exists bulk_recipients (
  id uuid default uuid_generate_v4() primary key,
  bulk_operation_id uuid references bulk_operations on delete cascade not null,
  email text not null,
  name text not null,
  status text,
  docusign_envelope_id text,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  completed_at timestamp with time zone
);

-- Enable RLS
alter table bulk_operations enable row level security;
alter table bulk_recipients enable row level security;

-- RLS Policies for bulk_operations
create policy "Users can view own bulk operations"
  on bulk_operations for select
  using (auth.uid() = user_id);

create policy "Users can create own bulk operations"
  on bulk_operations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own bulk operations"
  on bulk_operations for update
  using (auth.uid() = user_id);

-- RLS Policies for bulk_recipients
create policy "Users can view recipients of own bulk operations"
  on bulk_recipients for select
  using (
    auth.uid() = (
      select user_id 
      from bulk_operations 
      where id = bulk_operation_id
    )
  );

create policy "Users can manage recipients of own bulk operations"
  on bulk_recipients for all
  using (
    auth.uid() = (
      select user_id 
      from bulk_operations 
      where id = bulk_operation_id
    )
  );

-- Indexes
create index if not exists idx_bulk_operations_user_id on bulk_operations(user_id);
create index if not exists idx_bulk_recipients_bulk_operation_id on bulk_recipients(bulk_operation_id);
create index if not exists idx_bulk_recipients_email on bulk_recipients(email);
create index if not exists idx_bulk_recipients_docusign_envelope_id on bulk_recipients(docusign_envelope_id); 