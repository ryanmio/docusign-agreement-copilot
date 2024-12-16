-- Drop existing delete policy if it exists
drop policy if exists "Users can delete own credentials" on api_credentials;

-- Create delete policy
create policy "Users can delete own credentials"
  on api_credentials for delete
  using (auth.uid() = user_id); 