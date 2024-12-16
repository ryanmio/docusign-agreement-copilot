-- Create envelope status enum
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

-- Create envelopes table
create table if not exists envelopes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  docusign_envelope_id text unique,
  subject text not null,
  message text,
  status envelope_status default 'created',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  completed_at timestamp with time zone,
  metadata jsonb default '{}'::jsonb
);

-- Create recipients table
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
  routing_order integer default 1
);

-- Enable RLS
alter table envelopes enable row level security;
alter table recipients enable row level security;

-- RLS Policies for envelopes
create policy "Users can view own envelopes"
  on envelopes for select
  using (auth.uid() = user_id);

create policy "Users can create own envelopes"
  on envelopes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own envelopes"
  on envelopes for update
  using (auth.uid() = user_id);

create policy "Users can delete own envelopes"
  on envelopes for delete
  using (auth.uid() = user_id);

-- RLS Policies for recipients
create policy "Users can view recipients of own envelopes"
  on recipients for select
  using (
    auth.uid() = (
      select user_id 
      from envelopes 
      where id = envelope_id
    )
  );

create policy "Users can manage recipients of own envelopes"
  on recipients for all
  using (
    auth.uid() = (
      select user_id 
      from envelopes 
      where id = envelope_id
    )
  );

-- Indexes
create index if not exists idx_envelopes_user_id on envelopes(user_id);
create index if not exists idx_envelopes_docusign_id on envelopes(docusign_envelope_id);
create index if not exists idx_recipients_envelope_id on recipients(envelope_id);
create index if not exists idx_recipients_email on recipients(email); 