import { supabase } from './supabase';

export type EventRow = {
  id: string;
  name: string;
  category: string;
  is_team: boolean | null;
  min_team_size: number | null;
  max_team_size: number | null;
  max_entries_per_institute: number | null;
  max_accompanists: number | null;
  min_time_minutes: number | null;
  max_time_minutes: number | null;
  venue: string | null;
  event_date: string | null;
  event_time: string | null;
  rules_pdf_url: string | null;
  is_prelim: boolean | null;
};

export type InstituteRow = {
  id: string;
  name: string;
  short_code: string;
};

export type ParticipantRow = {
  id: string;
  full_name: string;
  enrollment_no: string | null;
  phone: string | null;
  email: string | null;
  institute_id: string;
  event_id: string;
  sequence_no: number | null;
  role: string;
  team_id?: string | null;
};

export type LiveStatusRow = {
  id: string;
  event_id: string;
  current_sequence_no: number | null;
  current_participant_name: string | null;
  current_institute_name: string | null;
  status: string | null;
  updated_at: string | null;
};

export type ScheduleRow = {
  id: string;
  event_id: string;
  day: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  is_placeholder: boolean | null;
};

export type ScoringConfigRow = {
  id: string;
  event_id: string;
  rank: number;
  points: number;
};

export type ScoreRow = {
  id: string;
  event_id: string;
  institute_id: string;
  rank: number | null;
  points: number | null;
  is_published: boolean | null;
  participant_id: string | null;
};

export type EventHelperRow = {
  id: string;
  event_id: string;
  pin: string;
};

export type TeamLeaderRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  institute_id: string;
  user_id: string;
  must_set_password: boolean;
  created_at?: string;
};

export type ManagerRow = {
  id: string;
  user_id: string;
  email: string;
  role: string;
  is_active: boolean | null;
  created_at?: string;
};

export const fetchEvents = async () => {
  const { data, error } = await supabase.from('events').select('*').order('id');
  if (error) throw error;
  return data as EventRow[];
};

export const fetchInstitutes = async () => {
  const { data, error } = await supabase.from('institutes').select('*').order('name');
  if (error) throw error;
  return data as InstituteRow[];
};

export const addInstitute = async (name: string, shortCode: string) => {
  const { data, error } = await supabase
    .from('institutes')
    .insert({ name, short_code: shortCode })
    .select('*')
    .single();
  if (error) throw error;
  return data as InstituteRow;
};

export const fetchParticipants = async () => {
  const { data, error } = await supabase.from('participants').select('*');
  if (error) throw error;
  return data as ParticipantRow[];
};

export const addParticipant = async (payload: Omit<ParticipantRow, 'id'>) => {
  const { data, error } = await supabase.from('participants').insert(payload).select('*').single();
  if (error) throw error;
  return data as ParticipantRow;
};

export const updateParticipantSequence = async (id: string, sequenceNo: number) => {
  const { data, error } = await supabase
    .from('participants')
    .update({ sequence_no: sequenceNo })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as ParticipantRow;
};

export const fetchLiveStatus = async () => {
  const { data, error } = await supabase.from('live_status').select('*');
  if (error) throw error;
  return data as LiveStatusRow[];
};

export const upsertLiveStatus = async (payload: Omit<LiveStatusRow, 'id' | 'updated_at'>) => {
  try {
    // First, try to fetch existing record
    const { data: existing } = await supabase
      .from('live_status')
      .select('id')
      .eq('event_id', payload.event_id)
      .single();

    let result;
    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('live_status')
        .update({
          current_sequence_no: payload.current_sequence_no,
          current_participant_name: payload.current_participant_name,
          current_institute_name: payload.current_institute_name,
          status: payload.status,
        })
        .eq('event_id', payload.event_id)
        .select('*')
        .single();
      if (error) throw error;
      result = data;
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('live_status')
        .insert([payload])
        .select('*')
        .single();
      if (error) throw error;
      result = data;
    }
    
    console.log('upsertLiveStatus success:', result);
    return result as LiveStatusRow;
  } catch (error: any) {
    console.error('upsertLiveStatus error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      payload
    });
    throw error;
  }
};

export const fetchSchedule = async () => {
  try {
    const { data, error } = await supabase.from('schedule').select('*');
    if (error) {
      if (error.code === 'PGRST205') {
        console.warn('schedule table not found, returning empty array');
        return [];
      }
      throw error;
    }
    return data as ScheduleRow[];
  } catch (error) {
    console.warn('Could not fetch schedule:', error);
    return [];
  }
};

export const addSchedule = async (payload: Omit<ScheduleRow, 'id'>) => {
  const { data, error } = await supabase.from('schedule').insert(payload).select('*').single();
  if (error) throw error;
  return data as ScheduleRow;
};

export const fetchScoringConfig = async () => {
  try {
    const { data, error } = await supabase.from('scoring_config').select('*');
    if (error) {
      if (error.code === 'PGRST205') {
        console.warn('scoring_config table not found, returning empty array');
        return [];
      }
      throw error;
    }
    return data as ScoringConfigRow[];
  } catch (error) {
    console.warn('Could not fetch scoring_config:', error);
    return [];
  }
};

export const upsertScoringConfig = async (payload: Omit<ScoringConfigRow, 'id'>) => {
  const { data, error } = await supabase
    .from('scoring_config')
    .upsert(payload, { onConflict: 'event_id,rank' })
    .select('*')
    .single();
  if (error) throw error;
  return data as ScoringConfigRow;
};

export const fetchScores = async () => {
  const { data, error } = await supabase.from('scores').select('*').eq('is_published', true);
  if (error) throw error;
  return data as ScoreRow[];
};

export const addScore = async (payload: Omit<ScoreRow, 'id'>) => {
  const { data, error } = await supabase.from('scores').insert(payload).select('*').single();
  if (error) throw error;
  return data as ScoreRow;
};

export const fetchEventHelpers = async () => {
  try {
    const { data, error } = await supabase.from('event_helpers').select('*');
    if (error) {
      // Table might not exist yet
      console.warn('event_helpers table error:', error);
      return [];
    }
    return data as EventHelperRow[];
  } catch (e) {
    console.warn('Could not fetch event_helpers:', e);
    return [];
  }
};

export const upsertEventHelper = async (eventId: string, pin: string) => {
  const { data, error } = await supabase
    .from('event_helpers')
    .upsert({ event_id: eventId, pin }, { onConflict: 'event_id' })
    .select('*')
    .single();
  if (error) throw error;
  return data as EventHelperRow;
};

export const loginWithPassword = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const fetchManagerByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from('managers')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as ManagerRow | null;
};

export const fetchManagersByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from('managers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as ManagerRow[];
};

export const fetchManagers = async () => {
  const { data, error } = await supabase
    .from('managers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as ManagerRow[];
};

export const deleteManager = async (id: string) => {
  const { error } = await supabase.from('managers').delete().eq('id', id);
  if (error) throw error;
};

export const addManagerRole = async (payload: { user_id: string; email: string; role: string }) => {
  const { data, error } = await supabase
    .from('managers')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data as ManagerRow;
};

/**
 * Create a manager via the create_manager RPC function.
 * This creates the auth user + managers record directly in the DB.
 */
export const createManagerViaRpc = async (params: {
  email: string;
  password: string;
  role: string;
}): Promise<ManagerRow> => {
  const { data, error } = await supabase.rpc('create_manager', {
    p_email: params.email,
    p_password: params.password,
    p_role: params.role,
  });
  if (error) throw error;
  return data as ManagerRow;
};

export const updateManagerUserViaRpc = async (params: {
  userId: string;
  email: string;
  password?: string;
}) => {
  const { data, error } = await supabase.rpc('update_manager_user', {
    p_user_id: params.userId,
    p_email: params.email,
    p_password: params.password && params.password.trim() ? params.password : null,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const fetchParticipantsByEvent = async (eventId: string) => {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('event_id', eventId)
    .order('sequence_no', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data as ParticipantRow[];
};

export const fetchScoresByEvent = async (eventId: string) => {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('event_id', eventId)
    .eq('is_published', true);
  if (error) throw error;
  return data as ScoreRow[];
};

export const bulkAddParticipants = async (participants: Omit<ParticipantRow, 'id'>[]) => {
  const { data, error } = await supabase.from('participants').insert(participants).select('*');
  if (error) throw error;
  return data as ParticipantRow[];
};

export const fetchScheduleByDay = async (day: string) => {
  const { data, error } = await supabase
    .from('schedule')
    .select('*')
    .eq('day', day)
    .order('start_time', { ascending: true, nullsFirst: true });
  if (error) throw error;
  return data as ScheduleRow[];
};
// DELETE Operations
export const deleteParticipant = async (id: string) => {
  console.log('Deleting participant:', id);
  // Removed .select() to avoid 406 Not Acceptable error
  const { error } = await supabase.from('participants').delete().eq('id', id);
  if (error) {
    console.error('Delete participant error:', error);
    throw error;
  }
  console.log('Participant deleted successfully');
};

export const deleteParticipantsByFilter = async (filters: {
  eventId?: string;
  instituteId?: string;
  role?: string;
}) => {
  let query = supabase.from('participants').delete();
  if (filters.eventId) {
    query = query.eq('event_id', filters.eventId);
  }
  if (filters.instituteId) {
    query = query.eq('institute_id', filters.instituteId);
  }
  if (filters.role) {
    query = query.eq('role', filters.role);
  }
  const { error } = await query;
  if (error) {
    console.error('Bulk delete participants error:', error);
    throw error;
  }
};

export const deleteParticipantsByIds = async (ids: string[]) => {
  if (ids.length === 0) return;
  const { error } = await supabase.from('participants').delete().in('id', ids);
  if (error) {
    console.error('Delete participants by ids error:', error);
    throw error;
  }
};

export const deleteInstitute = async (id: string) => {
  console.log('Deleting institute:', id);
  const { error: participantError } = await supabase.from('participants').delete().eq('institute_id', id);
  if (participantError) {
    console.error('Delete institute participants error:', participantError);
    throw participantError;
  }

  const { error: scoreError } = await supabase.from('scores').delete().eq('institute_id', id);
  if (scoreError) {
    console.error('Delete institute scores error:', scoreError);
    throw scoreError;
  }

  const { data, error } = await supabase.from('institutes').delete().eq('id', id).select('id');
  if (error) {
    console.error('Delete institute error:', error);
    throw error;
  }
  if (!data || data.length === 0) {
    throw new Error('RLS_POLICY_BLOCKED: institute delete returned 0 rows.');
  }
  console.log('Institute deleted successfully', data);
};

export const deleteSchedule = async (id: string) => {
  console.log('Deleting schedule:', id);
  // Removed .select() to avoid 406 Not Acceptable error
  const { error } = await supabase.from('schedule').delete().eq('id', id);
  if (error) {
    console.error('Delete schedule error:', error);
    throw error;
  }
  console.log('Schedule deleted successfully');
};

export const deleteScore = async (id: string) => {
  const { error } = await supabase.from('scores').delete().eq('id', id);
  if (error) throw error;
};

// UPDATE Operations
export const updateParticipant = async (id: string, payload: Partial<ParticipantRow>) => {
  const { data, error } = await supabase.from('participants').update(payload).eq('id', id).select('*').single();
  if (error) throw error;
  return data as ParticipantRow;
};

export const updateInstitute = async (id: string, name: string, shortCode: string) => {
  const { data, error } = await supabase
    .from('institutes')
    .update({ name, short_code: shortCode })
    .eq('id', id)
    .select('*');
  if (error) throw error;
  return data[0] as InstituteRow;
};

export const updateSchedule = async (id: string, payload: Partial<ScheduleRow>) => {
  const { data, error } = await supabase.from('schedule').update(payload).eq('id', id).select('*').single();
  if (error) throw error;
  return data as ScheduleRow;
};

// Leaderboard Operations
export const fetchAllScores = async () => {
  const { data, error } = await supabase.from('scores').select('*');
  if (error) throw error;
  return data as ScoreRow[];
};

export const updateScore = async (id: string, payload: Partial<ScoreRow>) => {
  const { data, error } = await supabase.from('scores').update(payload).eq('id', id).select('*');
  if (error) throw error;
  return data[0] as ScoreRow;
};

// Team Leader Operations
export const fetchTeamLeaderByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from('team_leaders')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as TeamLeaderRow | null;
};

export const updateTeamLeaderPassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
};

export const markPasswordSet = async (teamLeaderId: string) => {
  const { error } = await supabase
    .from('team_leaders')
    .update({ must_set_password: false })
    .eq('id', teamLeaderId);
  if (error) throw error;
};

export const fetchParticipantsByInstitute = async (instituteId: string) => {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('institute_id', instituteId);
  if (error) throw error;
  return data as ParticipantRow[];
};

// Team Leader CRUD (Admin operations)
export const fetchTeamLeaders = async () => {
  const { data, error } = await supabase
    .from('team_leaders')
    .select('*')
    .order('name');
  if (error) throw error;
  return data as TeamLeaderRow[];
};

export const addTeamLeader = async (payload: Omit<TeamLeaderRow, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('team_leaders')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data as TeamLeaderRow;
};

export const updateTeamLeader = async (id: string, payload: Partial<Omit<TeamLeaderRow, 'id' | 'created_at'>>) => {
  const { data, error } = await supabase
    .from('team_leaders')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as TeamLeaderRow;
};

export const deleteTeamLeader = async (id: string) => {
  // First, get the user_id to delete auth user too
  const { data: teamLeader } = await supabase
    .from('team_leaders')
    .select('user_id')
    .eq('id', id)
    .single();
  
  const userId = teamLeader?.user_id;
  
  // Try using RPC function first (requires running the SQL script)
  const { error: rpcError } = await supabase.rpc('delete_team_leader', {
    p_team_leader_id: id,
    p_user_id: userId
  });
  
  // If RPC doesn't exist or fails, just delete the team_leader record
  if (rpcError) {
    console.warn('RPC delete failed, falling back to direct delete:', rpcError.message);
    const { error } = await supabase
      .from('team_leaders')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

export const resetTeamLeaderPassword = async (userId: string, newPassword: string) => {
  // Admin resets TL password via admin auth api
  // Note: This needs service_role key. With anon key, we mark must_set_password = true
  const { error } = await supabase.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) throw error;
};

/**
 * Create a team leader via the create_team_leader RPC function.
 * This creates the auth user + team_leader record directly in the DB,
 * bypassing the signup API rate limits.
 * 
 * Requires: The create_team_leader function to be created in Supabase SQL Editor first.
 */
export const createTeamLeaderViaRpc = async (params: {
  name: string;
  email: string;
  phone: string;
  institute_id: string;
  password?: string;
}): Promise<TeamLeaderRow> => {
  const { data, error } = await supabase.rpc('create_team_leader', {
    p_name: params.name,
    p_email: params.email,
    p_phone: params.phone || '',
    p_institute_id: params.institute_id,
    p_password: params.password || 'UthFest@2026',
  });
  if (error) throw error;
  return data as TeamLeaderRow;
};

// ---- Student Operations ----

export type StudentRow = {
  id: string;
  full_name: string;
  enrollment_no: string | null;
  phone: string | null;
  email: string | null;
  institute_id: string;
  created_at?: string;
};

export const fetchStudentsByInstitute = async (instituteId: string) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('institute_id', instituteId)
    .order('full_name');
  if (error) throw error;
  return data as StudentRow[];
};

export const addStudentRecord = async (payload: Omit<StudentRow, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('students')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data as StudentRow;
};

export const bulkAddStudents = async (students: Omit<StudentRow, 'id' | 'created_at'>[]) => {
  const { data, error } = await supabase.from('students').insert(students).select('*');
  if (error) throw error;
  return data as StudentRow[];
};

export const updateStudentRecord = async (id: string, payload: Partial<Omit<StudentRow, 'id' | 'created_at'>>) => {
  const { data, error } = await supabase
    .from('students')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as StudentRow;
};

export const deleteStudentRecord = async (id: string) => {
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw error;
};