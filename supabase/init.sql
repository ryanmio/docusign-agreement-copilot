-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Basic document status enum
create type document_status as enum ('pending', 'processing', 'completed', 'error');

-- Create profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create documents table
create table documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  docusign_envelope_id text,
  status document_status default 'pending',
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create analysis_results table
create table analysis_results (
  id uuid default uuid_generate_v4() primary key,
  document_id uuid references documents on delete cascade not null,
  summary text,
  analysis_data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table profiles enable row level security;
alter table documents enable row level security;
alter table analysis_results enable row level security;

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