-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Basic document status enum
do $$ begin
  create type document_status as enum ('pending', 'processing', 'completed', 'error');
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

-- Enable RLS
alter table profiles enable row level security;
alter table documents enable row level security;
alter table analysis_results enable row level security;
alter table user_preferences enable row level security;
alter table api_credentials enable row level security;

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
  