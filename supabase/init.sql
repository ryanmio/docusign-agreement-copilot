-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Additional extensions
create extension if not exists "pgcrypto";

-- Basic document status enum
do $$ begin
  create type document_status as enum ('pending', 'processing', 'completed', 'error');
exception
  when duplicate_object then null;
end $$;

-- Additional enums
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

do $$ begin
  create type envelope_status as enum (
    'created',
    'sent',
    'delivered',
    'signed',
    'completed',
    'declined',
    'voided',
    'error'
  );
exception
  when duplicate_object then null;
end $$;

-- Create profiles table (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create documents table
create table if not exists documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  docusign_envelope_id text,
  status document_status default 'pending',
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create analysis_results table
create table if not exists analysis_results (
  id uuid default uuid_generate_v4() primary key,
  document_id uuid references documents on delete cascade not null,
  summary text,
  analysis_data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create user_preferences table
create table if not exists user_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  theme text default 'light',
  notification_enabled boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create api_credentials table for DocuSign
create table if not exists api_credentials (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  provider text not null check (provider = 'docusign'),
  access_token text,
  refresh_token text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- New tables
create table if not exists envelopes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  docusign_envelope_id text,
  subject text not null,
  message text,
  status envelope_status default 'created',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  completed_at timestamp with time zone,
  metadata jsonb default '{}'::jsonb
);

create table if not exists recipients (
  id uuid default uuid_generate_v4() primary key,
  envelope_id uuid references envelopes on delete cascade not null,
  email text not null,
  name text not null,
  status text,
  signing_url text,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  routing_order integer default 1,
  metadata jsonb default '{}'::jsonb
);

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

create table if not exists webhook_events (
  id uuid default uuid_generate_v4() primary key,
  provider text not null,
  event_type text not null,
  payload jsonb default '{}'::jsonb not null,
  processed_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table profiles enable row level security;
alter table documents enable row level security;
alter table analysis_results enable row level security;
alter table user_preferences enable row level security;
alter table api_credentials enable row level security;

-- Enable RLS on new tables
alter table envelopes enable row level security;
alter table recipients enable row level security;
alter table bulk_operations enable row level security;
alter table bulk_recipients enable row level security;
alter table webhook_events enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can manage own documents" on documents;
drop policy if exists "Users can view document analysis" on analysis_results;
drop policy if exists "Users can view own preferences" on user_preferences;
drop policy if exists "Users can update own preferences" on user_preferences;
drop policy if exists "Users can insert own preferences" on user_preferences;
drop policy if exists "Users can view own credentials" on api_credentials;
drop policy if exists "Users can update own credentials" on api_credentials;
drop policy if exists "Users can insert own credentials" on api_credentials;

-- Basic security policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can manage own documents"
  on documents for all
  using (auth.uid() = user_id);

create policy "Users can view document analysis"
  on analysis_results for select
  using (auth.uid() = (select user_id from documents where id = document_id));

-- Security policies for user_preferences
create policy "Users can view own preferences"
  on user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can update own preferences"
  on user_preferences for update
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on user_preferences for insert
  with check (auth.uid() = user_id);

-- Security policies for api_credentials
create policy "Users can view own credentials"
  on api_credentials for select
  using (auth.uid() = user_id);

create policy "Users can update own credentials"
  on api_credentials for update
  using (auth.uid() = user_id);

create policy "Users can insert own credentials"
  on api_credentials for insert
  with check (auth.uid() = user_id);

-- Additional RLS policies
create policy "Users can create own envelopes"
  on envelopes for insert
  with check (auth.uid() = user_id);

create policy "Users can view own envelopes"
  on envelopes for select
  using (auth.uid() = user_id);

create policy "Users can update own envelopes"
  on envelopes for update
  using (auth.uid() = user_id);

create policy "Users can delete own envelopes"
  on envelopes for delete
  using (auth.uid() = user_id);

create policy "Allow webhook access to envelopes"
  on envelopes for all
  using (true)
  with check (true);

create policy "Users can manage recipients of own envelopes"
  on recipients for all
  using (auth.uid() = (select user_id from envelopes where id = envelope_id));

create policy "Allow webhook access to recipients"
  on recipients for all
  using (true)
  with check (true);

create policy "Users can create own bulk operations"
  on bulk_operations for insert
  with check (auth.uid() = user_id);

create policy "Users can view own bulk operations"
  on bulk_operations for select
  using (auth.uid() = user_id);

create policy "Users can update own bulk operations"
  on bulk_operations for update
  using (auth.uid() = user_id);

create policy "Users can manage recipients of own bulk operations"
  on bulk_recipients for all
  using (auth.uid() = (select user_id from bulk_operations where id = bulk_operation_id));

create policy "Users can view recipients of own bulk operations"
  on bulk_recipients for select
  using (auth.uid() = (select user_id from bulk_operations where id = bulk_operation_id));
  