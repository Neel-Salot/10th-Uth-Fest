-- RPC Function to delete team leader and associated auth user
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION delete_team_leader(
  p_team_leader_id UUID,
  p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete from team_leaders table
  DELETE FROM team_leaders WHERE id = p_team_leader_id;
  
  -- Delete from auth.users table
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

-- Grant execute permission to authenticated users (adjust as needed for your RLS)
GRANT EXECUTE ON FUNCTION delete_team_leader(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_team_leader(UUID, UUID) TO anon;
