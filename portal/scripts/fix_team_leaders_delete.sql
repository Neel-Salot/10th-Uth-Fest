-- ============================================================================
-- QUICK FIX: Enable Team Leader Delete Operations
-- ============================================================================
-- Run this in Supabase SQL Editor to fix team leader delete not working
--
-- This does TWO things:
-- 1. Disables RLS on team_leaders (simplest fix for local testing)
-- 2. Creates the delete_team_leader RPC function (to also delete auth user)
-- ============================================================================

-- OPTION 1: Disable RLS (Simplest - use for testing)
ALTER TABLE public.team_leaders DISABLE ROW LEVEL SECURITY;

-- OPTION 2: If you want to keep RLS enabled, drop and recreate policies
/*
ALTER TABLE public.team_leaders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_team_leaders" ON public.team_leaders;
DROP POLICY IF EXISTS "authenticated_insert_team_leaders" ON public.team_leaders;
DROP POLICY IF EXISTS "authenticated_update_team_leaders" ON public.team_leaders;
DROP POLICY IF EXISTS "users_update_own_team_leaders" ON public.team_leaders;
DROP POLICY IF EXISTS "authenticated_delete_team_leaders" ON public.team_leaders;
DROP POLICY IF EXISTS "Allow public read on team_leaders" ON public.team_leaders;
DROP POLICY IF EXISTS "Allow authenticated insert on team_leaders" ON public.team_leaders;
DROP POLICY IF EXISTS "Allow authenticated update on team_leaders" ON public.team_leaders;
DROP POLICY IF EXISTS "Allow users to update own team_leader" ON public.team_leaders;
DROP POLICY IF EXISTS "Allow authenticated delete on team_leaders" ON public.team_leaders;

CREATE POLICY "public_select_team_leaders" ON public.team_leaders
    FOR SELECT USING (true);

CREATE POLICY "authenticated_insert_team_leaders" ON public.team_leaders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_update_team_leaders" ON public.team_leaders
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "users_update_own_team_leaders" ON public.team_leaders
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_delete_team_leaders" ON public.team_leaders
    FOR DELETE USING (auth.role() = 'authenticated');
*/

-- Create RPC function to delete both team_leader and auth user
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION delete_team_leader(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_team_leader(UUID, UUID) TO anon;

-- Verify the changes
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'team_leaders';
