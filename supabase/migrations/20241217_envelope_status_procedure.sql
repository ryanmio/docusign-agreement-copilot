-- Migration: Envelope Status Procedure
-- Created: Dec 17, 2024 at 9:39 AM
-- Part of: DocuSign Hackathon 2024
-- Note: Original filename used 2023 date due to AI knowledge cutoff
--
-- Description: Status update stored procedure
-- Handles envelope status transitions and notifications
-- See schema.md for complete documentation


-- Create function to update envelope status with proper enum casting
create or replace function update_envelope_status(
  p_docusign_envelope_id text,
  p_status text,
  p_completed_at timestamptz
) returns json as $$
declare
  v_result json;
begin
  update envelopes
  set 
    status = p_status::envelope_status,
    updated_at = now(),
    completed_at = p_completed_at
  where docusign_envelope_id = p_docusign_envelope_id
  returning json_build_object(
    'id', id,
    'status', status,
    'updated_at', updated_at,
    'completed_at', completed_at
  ) into v_result;
  
  return v_result;
end;
$$ language plpgsql security definer; 