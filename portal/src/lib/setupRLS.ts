/**
 * ============================================================================
 * RLS (ROW LEVEL SECURITY) SETUP FOR 10TH UTH FEST PORTAL
 * ============================================================================
 * 
 * CRITICAL: If registration form shows 400 errors or data won't load,
 * RLS policies are blocking Supabase database access.
 * 
 * TWO SOLUTIONS BELOW:
 * 1. QUICK FIX: Disable RLS (1 minute - use for development/testing)
 * 2. PROPER FIX: Enable RLS with comprehensive policies (Production-ready)
 * 
 * EXECUTION STEPS:
 * 1. Open Supabase Dashboard > SQL Editor
 * 2. Copy the SQL from setupRLSDisableFast OR setupProperRLS below
 * 3. Paste and execute
 * 4. Run verifyRLSSetup to confirm it worked
 * 
 * ============================================================================
 */

// ============================================================================
// SOLUTION 1: QUICK FIX - DISABLE RLS (Development/Testing Only)
// ============================================================================
export const setupRLSDisableFast = `
-- ===== DISABLE RLS ON ALL TABLES (Fastest fix for 400 errors) =====
ALTER TABLE public.participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_status DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.managers DISABLE ROW LEVEL SECURITY;

-- Students table (if exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students' AND table_schema = 'public') THEN
    ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Optional: Verify RLS is disabled
SELECT tablename, rowsecurity as has_rls
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('participants', 'institutes', 'schedule', 'events', 'scores', 'scoring_config', 'event_helpers', 'live_status', 'managers')
ORDER BY tablename;
`;

// ============================================================================
// SOLUTION 2: PRODUCTION FIX - PROPER RLS WITH POLICIES (Recommended)
// ============================================================================
export const setupProperRLS = `
-- ===== STEP 1: ENABLE RLS ON ALL TABLES =====
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;

-- ===== STEP 2: DROP EXISTING POLICIES (Clean slate) =====
-- PARTICIPANTS
DROP POLICY IF EXISTS "public_select_participants" ON public.participants;
DROP POLICY IF EXISTS "authenticated_insert_participants" ON public.participants;
DROP POLICY IF EXISTS "authenticated_update_participants" ON public.participants;
DROP POLICY IF EXISTS "authenticated_delete_participants" ON public.participants;

-- INSTITUTES
DROP POLICY IF EXISTS "public_select_institutes" ON public.institutes;
DROP POLICY IF EXISTS "authenticated_insert_institutes" ON public.institutes;
DROP POLICY IF EXISTS "authenticated_update_institutes" ON public.institutes;
DROP POLICY IF EXISTS "authenticated_delete_institutes" ON public.institutes;

-- SCHEDULE
DROP POLICY IF EXISTS "public_select_schedule" ON public.schedule;
DROP POLICY IF EXISTS "authenticated_insert_schedule" ON public.schedule;
DROP POLICY IF EXISTS "authenticated_update_schedule" ON public.schedule;
DROP POLICY IF EXISTS "authenticated_delete_schedule" ON public.schedule;

-- EVENTS
DROP POLICY IF EXISTS "public_select_events" ON public.events;
DROP POLICY IF EXISTS "authenticated_update_events" ON public.events;
DROP POLICY IF EXISTS "authenticated_insert_events" ON public.events;
DROP POLICY IF EXISTS "authenticated_delete_events" ON public.events;

-- SCORES
DROP POLICY IF EXISTS "public_select_scores" ON public.scores;
DROP POLICY IF EXISTS "authenticated_insert_scores" ON public.scores;
DROP POLICY IF EXISTS "authenticated_update_scores" ON public.scores;
DROP POLICY IF EXISTS "authenticated_delete_scores" ON public.scores;

-- SCORING_CONFIG
DROP POLICY IF EXISTS "public_select_scoring_config" ON public.scoring_config;
DROP POLICY IF EXISTS "authenticated_insert_scoring_config" ON public.scoring_config;
DROP POLICY IF EXISTS "authenticated_update_scoring_config" ON public.scoring_config;
DROP POLICY IF EXISTS "authenticated_delete_scoring_config" ON public.scoring_config;

-- EVENT_HELPERS
DROP POLICY IF EXISTS "public_select_event_helpers" ON public.event_helpers;
DROP POLICY IF EXISTS "authenticated_insert_event_helpers" ON public.event_helpers;
DROP POLICY IF EXISTS "authenticated_update_event_helpers" ON public.event_helpers;
DROP POLICY IF EXISTS "authenticated_delete_event_helpers" ON public.event_helpers;

-- MANAGERS
DROP POLICY IF EXISTS "admin_select_managers" ON public.managers;
DROP POLICY IF EXISTS "self_select_managers" ON public.managers;
DROP POLICY IF EXISTS "admin_insert_managers" ON public.managers;
DROP POLICY IF EXISTS "admin_update_managers" ON public.managers;
DROP POLICY IF EXISTS "admin_delete_managers" ON public.managers;

-- LIVE_STATUS
DROP POLICY IF EXISTS "public_select_live_status" ON public.live_status;
DROP POLICY IF EXISTS "authenticated_insert_live_status" ON public.live_status;
DROP POLICY IF EXISTS "authenticated_update_live_status" ON public.live_status;
DROP POLICY IF EXISTS "authenticated_delete_live_status" ON public.live_status;
DROP POLICY IF EXISTS "public_insert_live_status" ON public.live_status;
DROP POLICY IF EXISTS "public_update_live_status" ON public.live_status;
DROP POLICY IF EXISTS "public_delete_live_status" ON public.live_status;

-- ===== STEP 3: CREATE COMPREHENSIVE RLS POLICIES =====

-- ===== PARTICIPANTS TABLE =====
-- What it does: Stores student team member information
-- Public can see: Yes (needed for leaderboards)
-- Admins can modify: Yes
CREATE POLICY "public_select_participants" ON public.participants
    FOR SELECT USING (true);

CREATE POLICY "authenticated_insert_participants" ON public.participants
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_update_participants" ON public.participants
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_delete_participants" ON public.participants
    FOR DELETE USING (auth.role() = 'authenticated');

-- ===== INSTITUTES TABLE =====
-- What it does: College/university information
-- Public can see: Yes (for registration form dropdowns)
-- Admins can modify: Yes
CREATE POLICY "public_select_institutes" ON public.institutes
    FOR SELECT USING (true);

CREATE POLICY "authenticated_insert_institutes" ON public.institutes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_update_institutes" ON public.institutes
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_delete_institutes" ON public.institutes
    FOR DELETE USING (auth.role() = 'authenticated');

-- ===== SCHEDULE TABLE =====
-- What it does: Festival timeline and event schedules
-- Public can see: Yes (for schedule page)
-- Admins can modify: Yes
CREATE POLICY "public_select_schedule" ON public.schedule
    FOR SELECT USING (true);

CREATE POLICY "authenticated_insert_schedule" ON public.schedule
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_update_schedule" ON public.schedule
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_delete_schedule" ON public.schedule
    FOR DELETE USING (auth.role() = 'authenticated');

-- ===== EVENTS TABLE =====
-- What it does: Event definitions (dance, music, drama, etc)
-- Public can see: Yes (for event listings)
-- Admins can modify: Yes
CREATE POLICY "public_select_events" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "authenticated_insert_events" ON public.events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_update_events" ON public.events
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_delete_events" ON public.events
    FOR DELETE USING (auth.role() = 'authenticated');

-- ===== SCORES TABLE =====
-- What it does: Team scores for each event
-- Public can see: Yes (for real-time leaderboards)
-- Admins can modify: Yes (judges enter scores)
CREATE POLICY "public_select_scores" ON public.scores
    FOR SELECT USING (true);

CREATE POLICY "authenticated_insert_scores" ON public.scores
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_update_scores" ON public.scores
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_delete_scores" ON public.scores
    FOR DELETE USING (auth.role() = 'authenticated');

-- ===== SCORING_CONFIG TABLE =====
-- What it does: Point system configuration (1st place = X points, etc)
-- Public can see: Yes
-- Admins can modify: Yes
CREATE POLICY "public_select_scoring_config" ON public.scoring_config
    FOR SELECT USING (true);

CREATE POLICY "authenticated_insert_scoring_config" ON public.scoring_config
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_update_scoring_config" ON public.scoring_config
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_delete_scoring_config" ON public.scoring_config
    FOR DELETE USING (auth.role() = 'authenticated');

-- ===== EVENT_HELPERS TABLE =====
-- What it does: Co-ordinators/helpers assigned to manage events
-- Public can see: Yes
-- Admins can modify: Yes
CREATE POLICY "public_select_event_helpers" ON public.event_helpers
    FOR SELECT USING (true);

CREATE POLICY "authenticated_insert_event_helpers" ON public.event_helpers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_update_event_helpers" ON public.event_helpers
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_delete_event_helpers" ON public.event_helpers
    FOR DELETE USING (auth.role() = 'authenticated');

-- ===== LIVE_STATUS TABLE =====
-- What it does: Real-time event status (happening now, completed, upcoming)
-- Public can see: Yes (for live ticker)
-- Admins can modify: Yes
-- Event Helpers can modify: Yes
CREATE POLICY "public_select_live_status" ON public.live_status
    FOR SELECT USING (true);

CREATE POLICY "public_insert_live_status" ON public.live_status
    FOR INSERT WITH CHECK (true);

CREATE POLICY "public_update_live_status" ON public.live_status
    FOR UPDATE USING (true);

CREATE POLICY "public_delete_live_status" ON public.live_status
    FOR DELETE USING (auth.role() IN ('authenticated', 'service_role'));

-- ===== MANAGERS TABLE =====
-- What it does: Stores admin-created managers with role-based access
-- Admins can see/manage: Yes
CREATE POLICY "admin_select_managers" ON public.managers
    FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "self_select_managers" ON public.managers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "admin_insert_managers" ON public.managers
    FOR INSERT WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin_update_managers" ON public.managers
    FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin_delete_managers" ON public.managers
    FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
`;

// ============================================================================
// CASCADE DELETE SETUP (Run this AFTER setting up RLS)
// ============================================================================
export const setupCascadeDeletes = `
-- ===== CASCADE DELETE: Institute → Participants =====
-- When an institute (college) is deleted, automatically delete all its participants
ALTER TABLE public.participants
    DROP CONSTRAINT IF EXISTS participants_institute_id_fkey;

ALTER TABLE public.participants
    ADD CONSTRAINT participants_institute_id_fkey
    FOREIGN KEY (institute_id)
    REFERENCES public.institutes(id)
    ON DELETE CASCADE;

-- Verify cascade delete constraint exists
SELECT constraint_name, table_name, column_name, foreign_table_name
FROM information_schema.key_column_usage
WHERE table_name = 'participants'
AND constraint_name = 'participants_institute_id_fkey';
`;

// ============================================================================
// VERIFICATION HELPER (Run this to check current RLS state)
// ============================================================================
export const verifyRLSSetup = `
-- ===== CHECK 1: Which tables have RLS enabled? =====
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('participants', 'institutes', 'schedule', 'events', 'scores', 'scoring_config', 'event_helpers', 'live_status', 'managers')
ORDER BY tablename;

-- ===== CHECK 2: How many policies exist on each table? =====
SELECT
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('participants', 'institutes', 'schedule', 'events', 'scores', 'scoring_config', 'event_helpers', 'live_status', 'managers')
GROUP BY tablename
ORDER BY tablename;

-- ===== CHECK 3: List all policies (their names and operations) =====
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    qual as select_condition,
    with_check as insert_update_condition
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('participants', 'institutes', 'schedule', 'events', 'scores', 'scoring_config', 'event_helpers', 'live_status', 'managers')
ORDER BY tablename, policyname;
`;

// ============================================================================
// DROP ADMIN_USERS TABLE (Not needed)
// ============================================================================
export const dropAdminUsersTable = `
-- Remove the unused admin_users table
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- Verify it's deleted
SELECT tablename FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'admin_users';
-- (Should return no results if successful)
`;
