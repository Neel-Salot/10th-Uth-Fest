import { supabase } from './supabase';

/**
 * Institute Team Leaders seed data.
 * Maps institute Sr. No. to institute name(s) and their team leaders.
 * Institutes are grouped as per the official list (15 institutes total).
 */

export const TEAM_LEADER_TEMP_PASSWORD = 'UthFest@2026';

export interface TeamLeaderSeed {
  name: string;
  phone: string;
  email: string;
  instituteIndex: number; // maps to INSTITUTES index
}

export const INSTITUTES = [
  {
    name: 'Asha M. Tarsadia Institute of Computer Science and Technology',
    shortCode: 'AMTICS',
  },
  {
    name: 'Babu Madhav Institute of Information Technology',
    shortCode: 'BMIIT',
  },
  {
    name: 'C. G. Bhakta Institute of Biotechnology; Department of Mathematics; Department of Physics; Tarsadia Institute of Chemical Science',
    shortCode: 'CGBIBT',
  },
  {
    name: 'Chhotubhai Gopalbhai Patel Institute of Technology',
    shortCode: 'CGPIT',
  },
  {
    name: 'Diwaliba Polytechnic',
    shortCode: 'DP',
  },
  {
    name: 'Bhulabhai Vanmalibhai Patel Institute of Commerce and Management',
    shortCode: 'BVPICM',
  },
  {
    name: 'Bhulabhai Vanmalibhai Patel Institute of Computer Science; Shrimad Rajchandra Institute of Management & Computer Application',
    shortCode: 'BVPICS',
  },
  {
    name: 'Maliba Pharmacy College',
    shortCode: 'MPC',
  },
  {
    name: 'Maniba-Bhula Nursing College',
    shortCode: 'MBNC',
  },
  {
    name: 'Raman Bhakta School of Architecture; Jaymin School of Fashion Design & Technology; Godavariba School of Interior Design',
    shortCode: 'RBSA',
  },
  {
    name: 'Kishorbhai Institute of Agriculture Sciences and Research Centre',
    shortCode: 'KIARC',
  },
  {
    name: 'Shrimad Rajchandra College of Physiotherapy',
    shortCode: 'SRCP',
  },
  {
    name: 'SRIMCA - MBA',
    shortCode: 'SRIMCA',
  },
  {
    name: 'Department of Humanities',
    shortCode: 'DOH',
  },
  {
    name: 'Dr. Chunibhai Vallabhbhai Patel College of Pharmacy',
    shortCode: 'DCVPCP',
  },
];

export const TEAM_LEADERS: TeamLeaderSeed[] = [
  // Institute 1: AMTICS
  { name: 'Mr. Jay Patel', phone: '9725017590', email: 'jay.patel@utu.ac.in', instituteIndex: 0 },
  { name: 'Ms. Vibhuti Patel', phone: '9638282686', email: 'vibhuti.patel@utu.ac.in', instituteIndex: 0 },
  // Institute 2: BMIIT
  { name: 'Ms. Jaimini Patel', phone: '8849995239', email: 'jaimini.patel@utu.ac.in', instituteIndex: 1 },
  { name: 'Ms. Ayman Shekh', phone: '7069597793', email: 'ayman.shekh@utu.ac.in', instituteIndex: 1 },
  // Institute 3: CGBIBT + Depts
  { name: 'Dr. Ami Naik', phone: '9662763430', email: 'ami.naik@utu.ac.in', instituteIndex: 2 },
  { name: 'Ms. Shivani Patel', phone: '9099485598', email: 'shivani.mpatel@utu.ac.in', instituteIndex: 2 },
  { name: 'Dr. Hitesh Rajput', phone: '9727561617', email: 'hitesh.rajput@utu.ac.in', instituteIndex: 2 },
  { name: 'Dr. Dipen Desai', phone: '9913591301', email: 'dipen.hdesai@utu.ac.in', instituteIndex: 2 },
  // Institute 4: CGPIT
  { name: 'Ms. Dhwani Patel', phone: '7486947796', email: 'dhwani.patel@utu.ac.in', instituteIndex: 3 },
  { name: 'Ms. Sanjana Parmar', phone: '7572998823', email: 'sanjana.parmar@utu.ac.in', instituteIndex: 3 },
  // Institute 5: Diwaliba Poly
  { name: 'Mr. Rajnish Raj', phone: '7004887175', email: 'raj.rajnish@utu.ac.in', instituteIndex: 4 },
  { name: 'Mr. Nishant Mehta', phone: '9574569680', email: 'nishant.mehta@utu.ac.in', instituteIndex: 4 },
  // Institute 6: BVPICM
  { name: 'Mr. Zaki Shaikh', phone: '9558299313', email: 'zaki.shekh@utu.ac.in', instituteIndex: 5 },
  { name: 'Dr. Pankita Gohil', phone: '9537105581', email: 'pankita.gohil@utu.ac.in', instituteIndex: 5 },
  // Institute 7: BVPICS + SRIMCA
  { name: 'Ms. Tanvi Patel', phone: '9978533362', email: 'tanvi.patel@utu.ac.in', instituteIndex: 6 },
  { name: 'Ms. Swati Chauhan', phone: '9978328307', email: 'swati.chauhan@utu.ac.in', instituteIndex: 6 },
  // Institute 8: MPC
  { name: 'Dr. Mitali Patel', phone: '9998435750', email: 'mitali.patel@utu.ac.in', instituteIndex: 7 },
  { name: 'Dr. Shreya Patel', phone: '9537569568', email: 'shreya.patel@utu.ac.in', instituteIndex: 7 },
  // Institute 9: MBNC
  { name: 'Ms. Mayuri Gamit', phone: '8238310410', email: 'mayuri.gamit@utu.ac.in', instituteIndex: 8 },
  { name: 'Ms. Kinjal Bhavsar', phone: '7698034421', email: 'kinjal.bhavsar@utu.ac.in', instituteIndex: 8 },
  // Institute 10: RBSA + Jaymin + Godavariba
  { name: 'Ar. Aditi Joshi', phone: '9924021063', email: 'aditi.joshi@utu.ac.in', instituteIndex: 9 },
  { name: 'Ar. Dhaval Shah', phone: '9099261641', email: 'dhaval.shah@utu.ac.in', instituteIndex: 9 },
  // Institute 11: KIARC
  { name: 'Dr. Ankit Chaudhary', phone: '8530828687', email: 'ankit.chaudhary@utu.ac.in', instituteIndex: 10 },
  { name: 'Dr. Mallika Sindha', phone: '7698271626', email: 'mallika.sindha@utu.ac.in', instituteIndex: 10 },
  // Institute 12: SRCP
  { name: 'Dr. Sujit Vasava', phone: '9638486850', email: 'sujit.vasava@utu.ac.in', instituteIndex: 11 },
  { name: 'Dr. Riddhi Matolia', phone: '8155944850', email: 'riddhi.matolia@utu.ac.in', instituteIndex: 11 },
  // Institute 13: SRIMCA - MBA
  { name: 'Ms. Krupa Patel', phone: '9725798030', email: 'krupa.patel@utu.ac.in', instituteIndex: 12 },
  // Institute 14: Department of Humanities
  { name: 'Ms. Garima Ajayae', phone: '9601570956', email: 'garima.ajayae@utu.ac.in', instituteIndex: 13 },
  // Institute 15: DCVPCP
  { name: 'Ms. Jhanvi Bhavsar', phone: '9377885883', email: 'jhanvi.bhavsar@utu.ac.in', instituteIndex: 14 },
  { name: 'Ms. Drashti Shukla', phone: '8238530149', email: 'drashti.shukla@utu.ac.in', instituteIndex: 14 },
];

/**
 * Seeds all institutes and team leader accounts.
 * Creates Supabase Auth users with temporary password and
 * stores team_leader records linked to their institute + auth user.
 *
 * Run from browser console or an admin page button.
 */
export async function seedTeamLeaders() {
  const results: string[] = [];

  // Step 1: Upsert institutes
  const instituteIdMap: string[] = [];
  for (const inst of INSTITUTES) {
    const { data: existing } = await supabase
      .from('institutes')
      .select('id')
      .eq('short_code', inst.shortCode)
      .maybeSingle();

    if (existing) {
      instituteIdMap.push(existing.id);
      results.push(`Institute exists: ${inst.shortCode} (${existing.id})`);
    } else {
      const { data, error } = await supabase
        .from('institutes')
        .insert({ name: inst.name, short_code: inst.shortCode })
        .select('id')
        .single();
      if (error) {
        results.push(`ERROR creating institute ${inst.shortCode}: ${error.message}`);
        instituteIdMap.push('');
        continue;
      }
      instituteIdMap.push(data.id);
      results.push(`Created institute: ${inst.shortCode} (${data.id})`);
    }
  }

  // Step 2: Generate and execute SQL to create auth users + team_leader records
  // This bypasses the auth signup API rate limits entirely
  results.push('');
  results.push('--- Creating team leaders via SQL (bypasses rate limits) ---');

  // Build the SQL using actual institute IDs
  const sqlParts: string[] = [];
  sqlParts.push(`-- Auto-generated team leader seed`);
  sqlParts.push(`-- Password: ${TEAM_LEADER_TEMP_PASSWORD}`);
  sqlParts.push(``);

  for (const tl of TEAM_LEADERS) {
    const instituteId = instituteIdMap[tl.instituteIndex];
    if (!instituteId) {
      results.push(`SKIP ${tl.email}: institute not created`);
      continue;
    }

    // Check if team_leader record already exists
    const { data: existingTl } = await supabase
      .from('team_leaders')
      .select('id')
      .eq('email', tl.email)
      .maybeSingle();

    if (existingTl) {
      results.push(`Team leader exists: ${tl.email}`);
      continue;
    }

    // Check if auth user already exists (by email via team_leaders or auth lookup)
    // We'll use DO blocks to handle conflicts gracefully
    const escapedName = tl.name.replace(/'/g, "''");
    const escapedEmail = tl.email.replace(/'/g, "''");
    const escapedPhone = tl.phone.replace(/'/g, "''");

    sqlParts.push('DO ' + DD);
    sqlParts.push(`DECLARE`);
    sqlParts.push(`  new_uid UUID;`);
    sqlParts.push(`  existing_uid UUID;`);
    sqlParts.push(`BEGIN`);
    sqlParts.push(`  -- Check if auth user exists`);
    sqlParts.push(`  SELECT id INTO existing_uid FROM auth.users WHERE email = '${escapedEmail}';`);
    sqlParts.push(`  IF existing_uid IS NULL THEN`);
    sqlParts.push(`    new_uid := gen_random_uuid();`);
    sqlParts.push(`    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, aud, role, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)`);
    sqlParts.push(`    VALUES (`);
    sqlParts.push(`      new_uid,`);
    sqlParts.push(`      '00000000-0000-0000-0000-000000000000',`);
    sqlParts.push(`      '${escapedEmail}',`);
    sqlParts.push(`      crypt('${TEAM_LEADER_TEMP_PASSWORD}', gen_salt('bf')),`);
    sqlParts.push(`      NOW(),`);
    sqlParts.push(`      'authenticated',`);
    sqlParts.push(`      'authenticated',`);
    sqlParts.push(`      jsonb_build_object('role', 'team_leader', 'name', '${escapedName}'),`);
    sqlParts.push(`      NOW(),`);
    sqlParts.push(`      NOW(),`);
    sqlParts.push(`      '', '', '', ''`);
    sqlParts.push(`    );`);
    sqlParts.push(`    -- Create identity for the user`);
    sqlParts.push(`    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)`);
    sqlParts.push(`    VALUES (`);
    sqlParts.push(`      gen_random_uuid(),`);
    sqlParts.push(`      new_uid,`);
    sqlParts.push(`      new_uid::text,`);
    sqlParts.push(`      jsonb_build_object('sub', new_uid::text, 'email', '${escapedEmail}'),`);
    sqlParts.push(`      'email',`);
    sqlParts.push(`      NOW(),`);
    sqlParts.push(`      NOW(),`);
    sqlParts.push(`      NOW()`);
    sqlParts.push(`    );`);
    sqlParts.push(`  ELSE`);
    sqlParts.push(`    new_uid := existing_uid;`);
    sqlParts.push(`  END IF;`);
    sqlParts.push(`  -- Insert team_leader record (skip if exists)`);
    sqlParts.push(`  INSERT INTO public.team_leaders (name, email, phone, institute_id, user_id, must_set_password)`);
    sqlParts.push(`  VALUES ('${escapedName}', '${escapedEmail}', '${escapedPhone}', '${instituteId}', new_uid, true)`);
    sqlParts.push(`  ON CONFLICT (email) DO NOTHING;`);
    sqlParts.push('END ' + DD + ';');
    sqlParts.push(``);
  }

  const fullSql = sqlParts.join('\n');

  // Try to execute via rpc or direct SQL
  const { error: sqlError } = await supabase.rpc('exec_sql', { sql: fullSql }).single();

  if (sqlError) {
    // rpc not available — output the SQL for manual execution
    results.push('');
    results.push('⚠️  Could not auto-execute SQL (exec_sql function not found).');
    results.push('📋 Copy the SQL below and run it in the Supabase SQL Editor:');
    results.push('');
    results.push('=== COPY FROM HERE ===');
    results.push(fullSql);
    results.push('=== END COPY ===');

    // Also copy to clipboard if available
    try {
      await navigator.clipboard.writeText(fullSql);
      results.push('');
      results.push('✅ SQL has been copied to your clipboard! Paste it in Supabase SQL Editor.');
    } catch {
      results.push('');
      results.push('(Could not auto-copy to clipboard. Please copy manually.)');
    }
  } else {
    results.push('✅ All team leaders created via SQL successfully!');
    // Refresh to verify
    const { data: count } = await supabase.from('team_leaders').select('id', { count: 'exact' });
    results.push(`Total team leaders in database: ${count?.length ?? '?'}`);
  }

  return results;
}

/**
 * SQL to create the team_leaders table in Supabase.
 * Run this in the Supabase SQL Editor before seeding.
 */
export const TEAM_LEADERS_TABLE_SQL = `
-- Team Leaders table
CREATE TABLE IF NOT EXISTS team_leaders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  must_set_password BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Allow public read  
ALTER TABLE team_leaders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on team_leaders" ON team_leaders
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert on team_leaders" ON team_leaders
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update on team_leaders" ON team_leaders
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Allow team leaders to update their own must_set_password flag
CREATE POLICY "Allow users to update own team_leader" ON team_leaders
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow authenticated delete on team_leaders
CREATE POLICY "Allow authenticated delete on team_leaders" ON team_leaders
  FOR DELETE TO authenticated USING (true);
`;

/**
 * SQL to create the create_team_leader RPC function.
 * This function creates an auth user + team_leader record in one call,
 * bypassing the signup API rate limits entirely.
 * 
 * Run this ONCE in the Supabase SQL Editor.
 */
const DD = '$$'; // PostgreSQL dollar-quoting delimiter

export const CREATE_TEAM_LEADER_RPC_SQL = `
-- Function: create_team_leader
-- Creates an auth user and team_leader record directly in the DB.
-- No signup API call needed, no rate limits, no confirmation emails.
CREATE OR REPLACE FUNCTION public.create_team_leader(
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_institute_id UUID,
  p_password TEXT DEFAULT 'UthFest@2026'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS ${DD}
DECLARE
  new_uid UUID;
  existing_uid UUID;
  tl_record RECORD;
BEGIN
  -- Check if auth user already exists
  SELECT id INTO existing_uid FROM auth.users WHERE email = p_email;

  IF existing_uid IS NULL THEN
    new_uid := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      aud, role, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      new_uid,
      '00000000-0000-0000-0000-000000000000',
      p_email,
      crypt(p_password, gen_salt('bf')),
      NOW(),
      'authenticated', 'authenticated',
      jsonb_build_object('role', 'team_leader', 'name', p_name),
      NOW(), NOW(), '', '', '', ''
    );
    -- Create identity
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(), new_uid, new_uid::text,
      jsonb_build_object('sub', new_uid::text, 'email', p_email),
      'email', NOW(), NOW(), NOW()
    );
  ELSE
    new_uid := existing_uid;
  END IF;

  -- Insert team_leader record
  INSERT INTO public.team_leaders (name, email, phone, institute_id, user_id, must_set_password)
  VALUES (p_name, p_email, p_phone, p_institute_id, new_uid, true)
  ON CONFLICT (email) DO NOTHING;

  -- Return the created record
  SELECT * INTO tl_record FROM public.team_leaders WHERE email = p_email;
  RETURN row_to_json(tl_record);
END;
${DD};
`;

/**
 * SQL to create the students table in Supabase.
 * Run this in the Supabase SQL Editor before using the Students feature.
 */
export const STUDENTS_TABLE_SQL = `
-- Students roster table (separate from participants/event assignments)
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  enrollment_no TEXT,
  phone TEXT,
  email TEXT,
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Unique enrollment per institute (only when enrollment_no is provided)
CREATE UNIQUE INDEX IF NOT EXISTS students_enrollment_institute_idx
  ON students(enrollment_no, institute_id)
  WHERE enrollment_no IS NOT NULL;

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- RLS policies: allow authenticated users full CRUD (drop if exists to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated read on students" ON students;
CREATE POLICY "Allow authenticated read on students" ON students
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert on students" ON students;
CREATE POLICY "Allow authenticated insert on students" ON students
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update on students" ON students;
CREATE POLICY "Allow authenticated update on students" ON students
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete on students" ON students;
CREATE POLICY "Allow authenticated delete on students" ON students
  FOR DELETE TO authenticated USING (true);
`;
