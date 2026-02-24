import SetPassword from './SetPassword';
/* eslint-disable @typescript-eslint/no-unused-vars */
import Matter from 'matter-js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Database,
  Edit2,
  Hash,
  LayoutDashboard,
  Eye,
  EyeOff,
  Lock,
  Menu,
  Plus,
  RefreshCw,
  ShieldCheck,
  Shuffle,
  Trash2,
  Trophy,
  User,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import ExcelJS from 'exceljs';
import logoImage from '../assets/images/UTU.png';
import {
  addInstitute,
  addParticipant,
  addSchedule,
  deleteInstitute,
  deleteParticipant,
  deleteParticipantsByIds,
  deleteSchedule,
  fetchEventHelpers,
  fetchEvents,
  fetchInstitutes,
  fetchParticipants,
  bulkAddParticipants,
  fetchSchedule,
  fetchScoringConfig,
  loginWithPassword,
  signOut,
  upsertEventHelper,
  upsertScoringConfig,
  updateParticipantSequence,
  updateInstitute,
  updateParticipant,
  updateSchedule,
  fetchAllScores,
  updateScore,
  addScore,
  deleteScore,
  fetchTeamLeaders,
  addTeamLeader,
  updateTeamLeader,
  deleteTeamLeader,
  createTeamLeaderViaRpc,
  fetchTeamLeaderByUserId,
  fetchManagers,
  fetchManagersByUserId,
  createManagerViaRpc,
  addManagerRole,
  updateManagerUserViaRpc,
  deleteManager,
} from '../lib/supabaseApi';
import { supabase } from '../lib/supabase';
import type { EventRow, ParticipantRow, ScheduleRow, ScoreRow, TeamLeaderRow, ManagerRow } from '../lib/supabaseApi';

type ScoreConfig = {
  first: number;
  second: number;
  third: number;
  participation: number;
};

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs = 5000, fallbackValue: T): Promise<T> => {
  let timeoutId: number | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timeoutId = window.setTimeout(() => resolve(fallbackValue), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
};

type AdminProps = {
  mode?: 'admin' | 'manager';
};

const MANAGER_ROLE_KEY = 'uth-manager-role';
const Admin = ({ mode = 'admin' }: AdminProps) => {
    const [userId, setUserId] = useState<string>('');
    const [isAdminUser, setIsAdminUser] = useState(false);
  const isAdminMode = mode === 'admin';
  const [searchParams, setSearchParams] = useSearchParams({ tab: 'dashboard' });
  const activeTab = searchParams.get('tab') || 'dashboard';
  const setActiveTab = (tab: string) => {
    if (tab === 'leaderboard' && isAdminUser) {
      setPasswordModal({ type: 'access', password: '' });
      return;
    }
    setSearchParams({ tab });
    setMobileMenuOpen(false); // Close menu when tab is selected
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  // Manager password reset state
  const [mustSetPassword, setMustSetPassword] = useState(false);
  const [managerName, setManagerName] = useState<string | null>(null);

  // ...existing state declarations...

  // ...existing state declarations...
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [institutes, setInstitutes] = useState<{ id: string; name: string; shortCode: string }[]>([]);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleRow[]>([]);
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [helperPins, setHelperPins] = useState<Record<string, string>>({});
  const [helperPinError, setHelperPinError] = useState('');
  const [helperPinSuccess, setHelperPinSuccess] = useState('');
  const [teamLeaders, setTeamLeaders] = useState<TeamLeaderRow[]>([]);
  const [newTeamLeader, setNewTeamLeader] = useState({ name: '', email: '', phone: '', instituteId: '', password: 'UthFest@2026' });
  const [tlError, setTlError] = useState('');
  const [tlSuccess, setTlSuccess] = useState('');
  const [isSeedingTLs, setIsSeedingTLs] = useState(false);
  const [isAddingTL, setIsAddingTL] = useState(false);
  const [tlSearch, setTlSearch] = useState('');
  const [managers, setManagers] = useState<ManagerRow[]>([]);
  const [managerRole, setManagerRole] = useState<string | null>(null);
  const [managerRolesForUser, setManagerRolesForUser] = useState<string[]>([]);

  const [managerForm, setManagerForm] = useState({ email: '', password: '', roles: ['scoring'] as string[] });
  const [managerError, setManagerError] = useState('');
  const [managerSuccess, setManagerSuccess] = useState('');
  const [isCreatingManager, setIsCreatingManager] = useState(false);
  const [addingRoleForUserId, setAddingRoleForUserId] = useState<string | null>(null);
  const [roleDraftByUserId, setRoleDraftByUserId] = useState<Record<string, string>>({});
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserForm, setEditUserForm] = useState({ email: '', password: '' });
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    type: 'edit-user' | 'add-role';
    userId: string;
    email: string;
    availableRoles?: string[];
  } | null>(null);
  const [registrationError, setRegistrationError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState('');
  const [scheduleError, setScheduleError] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [scoreConfig, setScoreConfig] = useState<Record<string, ScoreConfig>>({});
  const [newInstitute, setNewInstitute] = useState({ name: '', shortCode: '' });
  const [registration, setRegistration] = useState({
    fullName: '',
    enrollmentNo: '',
    phone: '',
    email: '',
    instituteId: '',
    eventId: '',
    role: '' as ParticipantRow['role'],
  });
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<Omit<ParticipantRow, 'id'>[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [teamMembers, setTeamMembers] = useState<Array<{ fullName: string; enrollmentNo: string; phone: string; email: string }>>([
    { fullName: '', enrollmentNo: '', phone: '', email: '' },
  ]);
  const [participantSearch, setParticipantSearch] = useState('');
  const [participantEventId, setParticipantEventId] = useState('');
  const [participantInstituteId, setParticipantInstituteId] = useState('');
  const [participantRole, setParticipantRole] = useState('');
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<Set<string>>(new Set());
  const [selectedDeleteConfirm, setSelectedDeleteConfirm] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [groupDetailModal, setGroupDetailModal] = useState<{ eventId: string; instituteId: string } | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    day: '' as ScheduleRow['day'],
    eventId: '',
    startTime: '',
    endTime: '',
    venue: '',
    isPlaceholder: false,
  });

  const [scoreForm, setScoreForm] = useState<{
    id?: string;
    eventId: string;
    instituteId: string;
    participantId: string;
    rank: number;
    points: number;
    isPublished: boolean;
  }>({
    eventId: '',
    instituteId: '',
    participantId: '',
    rank: 0,
    points: 0,
    isPublished: true,
  });
  const [scoreFormError, setScoreFormError] = useState('');
  const [scoreFormCategory, setScoreFormCategory] = useState('');
  const [isEditingScore, setIsEditingScore] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [scoreboardPublished, setScoreboardPublished] = useState(false);
  const [passwordModal, setPasswordModal] = useState<{ type: 'access' | 'publish' | null, password: string }>({ type: null, password: '' });
  const [showModalPassword, setShowModalPassword] = useState(false);

  const LEADERBOARD_PASSWORD = 'Yugam&Neel';

  const categories = ['ALL', 'THEATRE', 'MUSIC', 'DANCE', 'FINE ARTS', 'DIVERSE', 'LITERARY'];

  const managerRoles = ['scoring', 'live_ops', 'institute', 'leaderboard', 'schedule', 'events', 'team_leader'];
  const roleTabMap: Record<string, string> = {
    scoring: 'scoring',
    live_ops: 'live',
    institute: 'institutes',
    leaderboard: 'leaderboard',
    schedule: 'schedule',
    events: 'participants',
    team_leader: 'participants',
  };

  const loginTitle = isAdminMode ? 'Admin Access' : 'Manager Access';
  const loginSubtitle = isAdminMode ? 'Authorized Personnel Only' : 'Role-Based Access';
  const loginEmailLabel = isAdminMode ? 'Admin Email' : 'Manager Email';

  const groupedManagers = useMemo(() => {
    const byUser = new Map<string, { userId: string; email: string; roles: ManagerRow[] }>();
    managers.forEach((manager) => {
      const key = manager.user_id || manager.email;
      const existing = byUser.get(key);
      if (existing) {
        existing.roles.push(manager);
      } else {
        byUser.set(key, { userId: manager.user_id, email: manager.email, roles: [manager] });
      }
    });
    return Array.from(byUser.values()).map((entry) => ({
      ...entry,
      roles: entry.roles.sort((a, b) => a.role.localeCompare(b.role)),
    }));
  }, [managers]);

  const handleManagerRoleSelect = (role: string) => {
    setManagerRole(role);
    if (typeof window !== 'undefined') {
      localStorage.setItem(MANAGER_ROLE_KEY, role);
    }
    setSearchParams({ tab: roleTabMap[role] ?? 'dashboard' });
  };

  const CategoryTabs = () => (
    <div className="flex gap-2 flex-wrap mb-4">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setActiveCategory(cat)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeCategory === cat
            ? 'bg-brand/10 text-[#1A1208] border-[#1A1208]/8'
            : 'bg-[#1A1208]/[0.03] text-[#6B5D4D] border-[#1A1208]/8 hover:bg-[#1A1208]/[0.05] hover:text-[#1A1208]'
            }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'institute' | 'participant' | 'schedule' | 'score' | 'team_leader', id: string, name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit states
  const [editModal, setEditModal] = useState<{ type: 'institute' | 'participant' | 'schedule' | 'team_leader', data: any } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const eventById = useMemo(() => new Map(events.map((event) => [event.id, event])), [events]);
  const instituteById = useMemo(() => new Map(institutes.map((inst) => [inst.id, inst])), [institutes]);
  const registrationEvent = useMemo(
    () => eventById.get(registration.eventId),
    [eventById, registration.eventId]
  );
  useEffect(() => {
    if (registrationEvent?.is_team && registration.role === 'participant') {
      const minSize = registrationEvent.min_team_size || 1;
      setTeamMembers((prev) => {
        if (prev.length >= minSize) return prev;
        return Array.from({ length: minSize }, (_, idx) => prev[idx] || {
          fullName: '',
          enrollmentNo: '',
          phone: '',
          email: '',
        });
      });
    }
  }, [registrationEvent, registration.role]);

  const filteredParticipants = useMemo(() => {
    const query = participantSearch.trim().toLowerCase();
    return participants.filter((participant) => {
      if (participantEventId && participant.event_id !== participantEventId) return false;
      if (participantInstituteId && participant.institute_id !== participantInstituteId) return false;
      if (participantRole && participant.role !== participantRole) return false;
      if (!query) return true;
      const nameMatch = participant.full_name.toLowerCase().includes(query);
      const enrollmentMatch = (participant.enrollment_no || '').toLowerCase().includes(query);
      return nameMatch || enrollmentMatch;
    });
  }, [participants, participantSearch, participantEventId, participantInstituteId, participantRole]);

  const groupedFilteredParticipants = useMemo(() => {
    const grouped = new Map<string, Map<string, ParticipantRow[]>>();
    filteredParticipants.forEach((participant) => {
      const eventGroup = grouped.get(participant.event_id) ?? new Map<string, ParticipantRow[]>();
      const instituteGroup = eventGroup.get(participant.institute_id) ?? [];
      instituteGroup.push(participant);
      eventGroup.set(participant.institute_id, instituteGroup);
      grouped.set(participant.event_id, eventGroup);
    });
    return grouped;
  }, [filteredParticipants]);

  const bulkDeleteSummary = useMemo(() => {
    const parts: string[] = [];
    if (participantEventId) parts.push(eventById.get(participantEventId)?.name || 'Selected event');
    if (participantInstituteId) parts.push(instituteById.get(participantInstituteId)?.name || 'Selected institute');
    if (participantRole) parts.push(participantRole);
    if (parts.length === 0) return 'All participants';
    return parts.join(' • ');
  }, [participantEventId, participantInstituteId, participantRole, eventById, instituteById]);

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      await deleteParticipantsByIds(Array.from(selectedParticipantIds));
      const freshParticipants = await fetchParticipants();
      setParticipants(freshParticipants);
      setSelectedParticipantIds(new Set());
      setSelectedDeleteConfirm(false);
    } catch (error) {
      alert('Bulk delete failed.');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const toggleParticipantSelection = (id: string) => {
    setSelectedParticipantIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedParticipantIds(new Set(filteredParticipants.map((participant) => participant.id)));
  };

  const clearSelection = () => {
    setSelectedParticipantIds(new Set());
  };
  const instituteLookup = useMemo(() => {
    const lookup = new Map<string, string>();
    institutes.forEach((inst) => {
      if (inst.name) lookup.set(inst.name.trim().toLowerCase(), inst.id);
      if (inst.shortCode) lookup.set(inst.shortCode.trim().toLowerCase(), inst.id);
    });
    return lookup;
  }, [institutes]);
  const eventLookup = useMemo(() => {
    const lookup = new Map<string, string>();
    events.forEach((event) => {
      if (event.name) lookup.set(event.name.trim().toLowerCase(), event.id);
    });
    return lookup;
  }, [events]);

  const resolveAccessForSession = useCallback(async (): Promise<{ ok: boolean; reason?: string }> => {
    try {
      const sessionResult = await withTimeout(supabase.auth.getSession(), 5000, { data: { session: null } } as any);
      const { data: { session } } = sessionResult;
      if (!session) {
        setIsAdminUser(false);
        setManagerRole(null);
        setManagerRolesForUser([]);
        return { ok: false, reason: 'no-session' };
      }

      const metadataRole = session.user.user_metadata?.role;
      if (isAdminMode) {
        if (metadataRole === 'admin') {
          setIsAdminUser(true);
          setManagerRole(null);
          setManagerRolesForUser([]);
          return { ok: true };
        }
        setIsAdminUser(false);
        setManagerRole(null);
        setManagerRolesForUser([]);
        return { ok: false, reason: 'admin-only' };
      }

      if (metadataRole === 'admin') {
        setIsAdminUser(false);
        setManagerRole(null);
        setManagerRolesForUser([]);
        return { ok: false, reason: 'use-admin-login' };
      }

      // Check for manager roles first
      const managerRows = await withTimeout(fetchManagersByUserId(session.user.id), 4000, [] as ManagerRow[]);
      const uniqueRoles = Array.from(new Set(managerRows.map((m) => m.role))).filter(Boolean);

      // If no manager roles, check if user is a team leader
      if (!uniqueRoles.length) {
        const teamLeaderResult = await withTimeout(fetchTeamLeaderByUserId(session.user.id), 4000, null);
        if (teamLeaderResult) {
          // Team leader has access with a default role
          setIsAdminUser(false);
          setManagerRolesForUser(['team_leader']);
          setManagerRole('team_leader');
          return { ok: true };
        }

        setIsAdminUser(false);
        setManagerRole(null);
        setManagerRolesForUser([]);
        return { ok: false, reason: 'no-manager-role' };
      }

      setIsAdminUser(false);
      setManagerRolesForUser(uniqueRoles);
      const resolvedRole = uniqueRoles.length === 1 ? uniqueRoles[0] : null;
      setManagerRole(resolvedRole);
      if (resolvedRole && typeof window !== 'undefined') {
        localStorage.setItem(MANAGER_ROLE_KEY, resolvedRole);
      }
      return { ok: true };
    } catch (error) {
      setIsAdminUser(false);
      setManagerRole(null);
      setManagerRolesForUser([]);
      return { ok: false, reason: 'error' };
    }
  }, [isAdminMode]);

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const sessionResult = await withTimeout(supabase.auth.getSession(), 5000, { data: { session: null } } as any);
        const { data: { session } } = sessionResult;
        if (session) {
          setIsLoggedIn(true);
          const access = await resolveAccessForSession();
          if (!access.ok && isAdminMode) {
            await signOut();
            setIsLoggedIn(false);
          }
        }
      } catch (error) {
        // Session check error - silently fail
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkExistingSession();
  }, [isAdminMode, resolveAccessForSession]);

  const loadAdminData = useCallback(async (options?: { preserveSelections?: boolean; preserveHelperPins?: boolean }) => {
    const preserveSelections = options?.preserveSelections ?? true;
    const preserveHelperPins = options?.preserveHelperPins ?? true;

    try {
      // Load each data set independently so one failure doesn't break everything
      let eventData: EventRow[] = [];
      let instituteData: any[] = [];
      let participantData: ParticipantRow[] = [];
      let scheduleData: ScheduleRow[] = [];
      let scoringData: any[] = [];
      let scoresData: ScoreRow[] = [];
      let helperData: any[] = [];

      try {
        eventData = await fetchEvents();
      } catch (e) {
        // Failed to load events
      }

      try {
        instituteData = await fetchInstitutes();
      } catch (e) {
        // Failed to load institutes
      }

      try {
        participantData = await fetchParticipants();
      } catch (e) {
        // Failed to load participants
      }

      try {
        scheduleData = await fetchSchedule();
      } catch (e) {
        // Failed to load schedule
      }

      try {
        scoringData = await fetchScoringConfig();
      } catch (e) {
        // Failed to load scoring config
      }

      try {
        helperData = await fetchEventHelpers();
      } catch (e) {
        // Event helpers table may not exist
      }

      try {
        scoresData = await fetchAllScores();
      } catch (e) {
        // Failed to load scores
      }

      let teamLeaderData: TeamLeaderRow[] = [];
      try {
        teamLeaderData = await fetchTeamLeaders();
      } catch (e) {
        // team_leaders table may not exist yet
      }

      setEvents(eventData);
      setInstitutes(instituteData.map((inst) => ({ id: inst.id, name: inst.name, shortCode: inst.short_code })));
      setParticipants(participantData);
      setScheduleEntries(scheduleData);
      setScores(scoresData);
      setTeamLeaders(teamLeaderData);

      if (!preserveSelections) {
        setSelectedEventId('');
        setRegistration((prev) => ({
          ...prev,
          instituteId: '',
          eventId: '',
        }));
        setScheduleForm((prev) => ({
          ...prev,
          eventId: '',
        }));
        setScoreForm({
          eventId: '',
          instituteId: '',
          participantId: '',
          rank: 0,
          points: 0,
          isPublished: true,
        });
        setIsEditingScore(false);
      }

      const scoreMap: Record<string, ScoreConfig> = {};
      scoringData.forEach((row) => {
        scoreMap[row.event_id] = scoreMap[row.event_id] ?? {
          first: 10,
          second: 7,
          third: 5,
          participation: 0,
        };
        if (row.rank === 1) scoreMap[row.event_id].first = row.points;
        if (row.rank === 2) scoreMap[row.event_id].second = row.points;
        if (row.rank === 3) scoreMap[row.event_id].third = row.points;
        if (row.rank === 0) scoreMap[row.event_id].participation = row.points;
      });
      eventData.forEach((event) => {
        if (!scoreMap[event.id]) {
          scoreMap[event.id] = { first: 10, second: 7, third: 5, participation: 0 };
        }
      });
      setScoreConfig(scoreMap);

      // Only update helperPins if not preserving (initial load or after save)
      // This prevents typed but unsaved PINs from being cleared during polling
      if (!preserveHelperPins) {
        const helperMap: Record<string, string> = {};
        helperData.forEach((row) => {
          helperMap[row.event_id] = row.pin;
        });
        setHelperPins(helperMap);
      }
    } catch (error) {
      // Data load error
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    loadAdminData({ preserveSelections: true, preserveHelperPins: false });
    // Poll frequently so admins see near real-time updates without reloads.
    const interval = setInterval(() => {
      loadAdminData({ preserveSelections: true, preserveHelperPins: true });
    }, 5000);

    const handleFocus = () => {
      loadAdminData({ preserveSelections: true, preserveHelperPins: true });
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [isLoggedIn, loadAdminData]);

  useEffect(() => {
    if (!isLoggedIn || !isAdminUser) return;
    fetchManagers()
      .then(setManagers)
      .catch(() => {
        // managers table may not exist yet
      });
  }, [isLoggedIn, isAdminUser]);

  useEffect(() => {
    if (registrationSuccess) {
      const timer = setTimeout(() => setRegistrationSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [registrationSuccess]);

  useEffect(() => {
    if (managerSuccess) {
      const timer = setTimeout(() => setManagerSuccess(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [managerSuccess]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const published = localStorage.getItem('scoreboardPublished') === 'true';
    setScoreboardPublished(published);
  }, [isLoggedIn]);

  const toTitleCase = (value: string) =>
    value
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const handleCreateManager = async (event: React.FormEvent) => {
    event.preventDefault();
    setManagerError('');
    setManagerSuccess('');
    if (!managerForm.email || !managerForm.password || !managerForm.roles.length) {
      setManagerError('Email, password, and at least one role are required.');
      return;
    }

    try {
      setIsCreatingManager(true);
      const normalizedEmail = managerForm.email.trim().toLowerCase();
      const managerPool = managers.length ? managers : await fetchManagers();
      if (!managers.length) {
        setManagers(managerPool);
      }
      const existingByEmail = managerPool.find((mgr) => mgr.email.toLowerCase() === normalizedEmail);

      if (existingByEmail) {
        // Add multiple roles to existing manager
        const existingRoles = managerPool
          .filter((mgr) => mgr.email.toLowerCase() === normalizedEmail)
          .map((mgr) => mgr.role);
        const newRoles = managerForm.roles.filter((role) => !existingRoles.includes(role));

        if (newRoles.length === 0) {
          setManagerError('All selected roles are already assigned to this manager.');
          return;
        }

        const createdRoles = await Promise.all(
          newRoles.map((role) =>
            addManagerRole({
              user_id: existingByEmail.user_id,
              email: existingByEmail.email,
              role,
            })
          )
        );
        setManagers((prev) => [...createdRoles, ...prev]);
        setManagerForm({ email: managerForm.email.trim(), password: '', roles: managerForm.roles });
        setManagerSuccess(`Added ${newRoles.length} role(s) to existing manager.`);
        return;
      }

      // Create new manager with first role
      const firstRole = managerForm.roles[0];
      const created = await createManagerViaRpc({
        email: managerForm.email.trim(),
        password: managerForm.password,
        role: firstRole,
      });

      // Add additional roles if any
      const additionalRoles = managerForm.roles.slice(1);
      const additionalRoleRecords = await Promise.all(
        additionalRoles.map((role) =>
          addManagerRole({
            user_id: created.user_id,
            email: created.email,
            role,
          })
        )
      );

      setManagers((prev) => [created, ...additionalRoleRecords, ...prev]);
      setManagerForm({ email: '', password: '', roles: ['scoring'] });
      setManagerSuccess(`Manager created with ${managerForm.roles.length} role(s).`);
    } catch (error) {
      const message = (error as any)?.message || '';
      if (message.includes('could not find the function')) {
        setManagerError('Setup required: Run the create_manager SQL function in Supabase SQL Editor first. Open console (F12) and run: import("/src/lib/seedManagers.ts").then(m => console.log(m.MANAGERS_TABLE_SQL, m.CREATE_MANAGER_RPC_SQL))');
      } else if (message.includes('duplicate') || message.includes('unique') || message.includes('already exists')) {
        setManagerError('A manager with this email already exists. Add roles instead.');
      } else {
        setManagerError('Failed to create manager. Check console for details.');
      }
      console.error('Create manager error:', error);
    } finally {
      setIsCreatingManager(false);
    }
  };

  const handleDeleteManager = async (managerId: string) => {
    try {
      await deleteManager(managerId);
      setManagers((prev) => prev.filter((mgr) => mgr.id !== managerId));
    } catch (error) {
      console.error('Delete manager error:', error);
    }
  };

  const handleAddRoleToExistingManager = async (params: { userId: string; email: string; role: string }) => {
    if (!params.role) return;
    setManagerError('');
    setManagerSuccess('');
    try {
      setAddingRoleForUserId(params.userId);
      const created = await addManagerRole({
        user_id: params.userId,
        email: params.email,
        role: params.role,
      });
      setManagers((prev) => [created, ...prev]);
      setManagerSuccess(`Added role "${params.role.replace('_', ' ')}" for ${params.email}.`);
      setRoleDraftByUserId((prev) => {
        const next = { ...prev };
        delete next[params.userId];
        return next;
      });
    } catch (error: any) {
      const message = error?.message || '';
      if (message.includes('duplicate') || message.includes('unique')) {
        setManagerError('This role is already assigned to that manager.');
      } else if (message.includes('managers_email_key')) {
        setManagerError('DB schema still blocks multiple roles per email. Run latest managers SQL migration.');
      } else {
        setManagerError('Failed to add role. Check console for details.');
      }
      console.error('Add role error:', error);
    } finally {
      setAddingRoleForUserId(null);
    }
  };

  const cancelEditManagerUser = () => {
    setEditingUserId(null);
    setEditUserForm({ email: '', password: '' });
  };

  const handleSaveManagerUser = async (params: { userId: string; currentEmail: string }) => {
    const nextEmail = editUserForm.email.trim().toLowerCase();
    const nextPassword = editUserForm.password.trim();

    setManagerError('');
    setManagerSuccess('');

    if (!nextEmail) {
      setManagerError('Email is required.');
      return;
    }

    try {
      setUpdatingUserId(params.userId);
      await updateManagerUserViaRpc({
        userId: params.userId,
        email: nextEmail,
        password: nextPassword || undefined,
      });

      setManagers((prev) => prev.map((manager) => (
        manager.user_id === params.userId ? { ...manager, email: nextEmail } : manager
      )));
      setManagerSuccess(`Updated user ${params.currentEmail} successfully.`);
      cancelEditManagerUser();
    } catch (error: any) {
      const message = error?.message || '';
      if (message.includes('could not find the function')) {
        setManagerError('Setup required: run UPDATE_MANAGER_USER_RPC_SQL in Supabase SQL Editor.');
      } else {
        setManagerError(message || 'Failed to update user.');
      }
      console.error('Update manager user error:', error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteManagerUser = async (params: { userId: string; email: string }) => {
    setManagerError('');
    setManagerSuccess('');
    if (!confirm(`Delete manager user ${params.email} and all assigned roles?`)) {
      return;
    }

    try {
      setDeletingUserId(params.userId);
      const roleRows = managers.filter((manager) => manager.user_id === params.userId);
      await Promise.all(roleRows.map((roleRow) => deleteManager(roleRow.id)));
      setManagers((prev) => prev.filter((manager) => manager.user_id !== params.userId));
      setManagerSuccess(`Deleted ${params.email} from Role Assign.`);
    } catch (error: any) {
      setManagerError(error?.message || 'Failed to delete manager user.');
      console.error('Delete manager user error:', error);
    } finally {
      setDeletingUserId(null);
    }
  };

  const getStudentKey = (enrollmentNo: string | null | undefined, instituteId: string, fullName: string) => {
    const identity = (enrollmentNo || fullName).trim().toLowerCase();
    return `${instituteId}::${identity}`;
  };

  const registrationLive = useMemo(() => {
    const errors: string[] = [];
    const constraints: string[] = [];
    const hasAnyInput = Boolean(
      registration.instituteId ||
      registration.eventId ||
      registration.role ||
      registration.fullName.trim() ||
      registration.enrollmentNo.trim() ||
      registration.phone.trim() ||
      registration.email.trim() ||
      teamMembers.some((member) =>
        member.fullName.trim() ||
        member.enrollmentNo.trim() ||
        member.phone.trim() ||
        member.email.trim()
      )
    );

    if (!hasAnyInput) {
      return { show: false, errors, constraints };
    }

    if (!registration.instituteId) errors.push('Institute is required.');
    if (!registration.eventId) errors.push('Event is required.');
    if (!registration.role) errors.push('Role is required.');

    if (registration.role === 'participant') {
      if (registrationEvent?.is_team) {
        teamMembers.forEach((member, idx) => {
          if (member.fullName.trim() && !member.enrollmentNo.trim()) {
            errors.push(`Member ${idx + 1}: Enrollment number is required.`);
          } else if (member.enrollmentNo.trim() && member.enrollmentNo.trim().length !== 15) {
            errors.push(`Member ${idx + 1}: Enrollment number must be 15 digits.`);
          }
        });
      } else {
        if (registration.fullName.trim() && !registration.enrollmentNo.trim()) {
          errors.push('Enrollment number is required.');
        } else if (registration.enrollmentNo.trim() && registration.enrollmentNo.trim().length !== 15) {
          errors.push('Enrollment number must be 15 digits.');
        }
      }
    }

    const eventInfo = registrationEvent;
    if (eventInfo) {
      const minSize = eventInfo.min_team_size || 1;
      const maxSize = eventInfo.max_team_size || 0;
      const maxEntries = eventInfo.max_entries_per_institute || 0;
      const maxAccompanists = eventInfo.max_accompanists || 0;

      if (eventInfo.is_team) {
        constraints.push(`Team size: minimum ${minSize}${maxSize > 0 ? `, maximum ${maxSize}` : ''}.`);
        if (maxEntries > 0) {
          constraints.push(`Max team entries per institute: ${maxEntries}.`);
        }
        if (registration.role === 'participant') {
          if (teamMembers.length < minSize) errors.push(`Team needs at least ${minSize} member(s).`);
          if (maxSize > 0 && teamMembers.length > maxSize) errors.push(`Team exceeds maximum of ${maxSize} member(s).`);
        }
      } else if (maxEntries > 0) {
        constraints.push(`Max participants per institute: ${maxEntries}.`);
      }

      if (maxAccompanists > 0) {
        constraints.push(`Max accompanists per institute: ${maxAccompanists}.`);

        // Check if accompanist is being registered without participants
        if (registration.role === 'accompanist' && !registration.fullName.trim()) {
          // No full name yet, let's skip this check for now
        } else if (registration.role === 'accompanist' && registration.fullName.trim()) {
          const hasParticipantsInEvent = participants.some(
            (p) => p.event_id === registration.eventId &&
              p.institute_id === registration.instituteId &&
              p.role === 'participant'
          );
          if (!hasParticipantsInEvent) {
            errors.push('Accompanist can only be registered if the institute has participants in this event.');
          }
        }
      } else if (registration.role === 'accompanist') {
        errors.push('Accompanists are not allowed for this event.');
      }
    }

    const enforceStudentLimits = (fullName: string, enrollmentNo: string, label: string) => {
      if (!registration.instituteId || !registration.eventId) return;
      const normalizedName = toTitleCase(fullName);
      if (!normalizedName) return;
      const studentKey = getStudentKey(enrollmentNo.trim(), registration.instituteId, normalizedName);
      const studentEvents = new Set(
        participants
          .filter((participant) => getStudentKey(participant.enrollment_no, participant.institute_id, participant.full_name) === studentKey)
          .map((participant) => participant.event_id)
      );
      if (studentEvents.has(registration.eventId)) {
        errors.push(`${label}: already registered for this event.`);
      }
      if (studentEvents.size >= 3) {
        errors.push(`${label}: already registered for 3 events.`);
      }
    };

    if (registrationEvent?.is_team && registration.role === 'participant') {
      teamMembers.forEach((member, index) => {
        if (!member.fullName.trim()) {
          return;
        }
        enforceStudentLimits(member.fullName, member.enrollmentNo, `Member ${index + 1}`);
      });

      // Check for duplicate students within the team being submitted
      const teamStudentKeys = new Set<string>();
      const teamDuplicates = new Set<number>();
      teamMembers.forEach((member, index) => {
        if (!member.fullName.trim()) return;
        const normalizedName = toTitleCase(member.fullName);
        const studentKey = getStudentKey(member.enrollmentNo, registration.instituteId, normalizedName);
        if (teamStudentKeys.has(studentKey)) {
          teamDuplicates.add(index);
        } else {
          teamStudentKeys.add(studentKey);
        }
      });

      if (teamDuplicates.size > 0) {
        const indices = Array.from(teamDuplicates).map(i => `Member ${i + 1}`).join(', ');
        errors.push(`Duplicate student(s) in team: ${indices}. Each student can only appear once.`);
      }
    } else if (registration.role === 'participant') {
      if (!registration.fullName.trim()) {
        errors.push('Full name is required.');
      } else {
        enforceStudentLimits(registration.fullName, registration.enrollmentNo, 'Student');
      }
    } else if (registration.role === 'accompanist' && registration.fullName.trim()) {
      // Validate accompanist: check count limit at institute level
      const eventInfo = eventById.get(registration.eventId);
      if (eventInfo && eventInfo.max_accompanists && eventInfo.max_accompanists > 0) {
        const existingAccompanists = participants.filter(
          (p) => p.event_id === registration.eventId &&
            p.institute_id === registration.instituteId &&
            p.role === 'accompanist'
        ).length;
        if (existingAccompanists >= eventInfo.max_accompanists) {
          errors.push(`Accompanist limit (${eventInfo.max_accompanists}) already reached for this institute in this event.`);
        }
      }
    }

    if (!constraints.some((text) => text.includes('maximum of 3 events'))) {
      constraints.push('A student can participate in a maximum of 3 events.');
    }

    return { show: true, errors, constraints };
  }, [
    registration,
    registrationEvent,
    participants,
    teamMembers,
    toTitleCase,
    getStudentKey,
  ]);

  const normalizeHeader = (value: string) => value.trim().toLowerCase().replace(/[\s_-]+/g, '');

  // Get institutes with registrations for a given event
  const getValidInstitutesByEvent = (eventId: string) => {
    const eventParticipants = participants.filter((p) => p.event_id === eventId && p.role === 'participant');
    const institutesInEvent = new Set(eventParticipants.map((p) => p.institute_id));
    return institutes.filter((inst) => institutesInEvent.has(inst.id));
  };

  // Get group/participant name for display in scoring
  const getParticipantDisplayName = (participantId: string, instituteId: string, eventId: string) => {
    const participant = participants.find((p) => p.id === participantId);
    if (!participant) return '';

    const eventInfo = eventById.get(eventId);
    if (eventInfo?.is_team) {
      // Group registration: show all team members
      const teamId = participant.team_id;
      const teamMembers = participants.filter(
        (p) => p.event_id === eventId &&
          p.institute_id === instituteId &&
          p.team_id === teamId &&
          p.role === 'participant'
      );
      const names = teamMembers.map((m) => m.full_name).join(', ');
      return `${names} (Team)`;
    } else {
      // Solo event: just show the participant name
      return participant.full_name;
    }
  };

  const parseXlsx = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) return [] as string[][];
    const rows: string[][] = [];
    const headerRow = sheet.getRow(1);
    const columnCount = Number(headerRow.cellCount || headerRow.values.length || 0);
    sheet.eachRow({ includeEmpty: false }, (row) => {
      const values: string[] = [];
      for (let col = 1; col <= columnCount; col += 1) {
        const cell = row.getCell(col);
        const textValue = cell.text ?? '';
        values.push(String(textValue).trim());
      }
      rows.push(values);
    });
    return rows;
  };

  const buildImportRows = (rows: string[][]) => {
    const errors: string[] = [];
    if (rows.length === 0) {
      return { preview: [] as Omit<ParticipantRow, 'id'>[], errors: ['No rows found in file.'] };
    }

    const participantCountMap = new Map<string, number>();
    const accompanistCountMap = new Map<string, number>();
    const studentEventMap = new Map<string, Set<string>>();

    participants.forEach((participant) => {
      const eventKey = `${participant.event_id}::${participant.institute_id}`;
      if (participant.role === 'accompanist') {
        accompanistCountMap.set(eventKey, (accompanistCountMap.get(eventKey) || 0) + 1);
      } else {
        participantCountMap.set(eventKey, (participantCountMap.get(eventKey) || 0) + 1);
      }

      const studentKey = getStudentKey(participant.enrollment_no, participant.institute_id, participant.full_name);
      if (!studentEventMap.has(studentKey)) {
        studentEventMap.set(studentKey, new Set());
      }
      studentEventMap.get(studentKey)?.add(participant.event_id);
    });

    const headerAliases: Record<string, string> = {
      fullname: 'fullName',
      name: 'fullName',
      enrollmentno: 'enrollmentNo',
      enrolmentno: 'enrollmentNo',
      phone: 'phone',
      email: 'email',
      instituteid: 'instituteId',
      institutename: 'instituteName',
      institutecode: 'instituteName',
      eventid: 'eventId',
      eventname: 'eventName',
      role: 'role',
    };

    const headerRow = rows[0] ?? [];
    const headerIndex: Record<string, number> = {};
    headerRow.forEach((header, index) => {
      const normalized = headerAliases[normalizeHeader(header)] || normalizeHeader(header);
      headerIndex[normalized] = index;
    });

    const preview: Omit<ParticipantRow, 'id'>[] = [];

    for (let i = 1; i < rows.length; i += 1) {
      const row = rows[i] ?? [];
      const readValue = (key: string) => {
        const index = headerIndex[key];
        if (index === undefined) return '';
        return String(row[index] ?? '').trim();
      };

      const fullName = toTitleCase(readValue('fullName'));
      const enrollmentNo = readValue('enrollmentNo');
      const phone = readValue('phone');
      const email = readValue('email');
      const instituteIdRaw = readValue('instituteId');
      const instituteNameRaw = readValue('instituteName');
      const eventIdRaw = readValue('eventId');
      const eventNameRaw = readValue('eventName');
      const roleRaw = readValue('role');

      const resolvedInstituteId =
        (instituteIdRaw && instituteById.has(instituteIdRaw) ? instituteIdRaw : '') ||
        (instituteNameRaw ? instituteLookup.get(instituteNameRaw.trim().toLowerCase()) || '' : '');
      const resolvedEventId =
        (eventIdRaw && eventById.has(eventIdRaw) ? eventIdRaw : '') ||
        (eventNameRaw ? eventLookup.get(eventNameRaw.trim().toLowerCase()) || '' : '');

      const roleNormalized = (roleRaw || 'participant').trim().toLowerCase();
      const resolvedRole = roleNormalized === 'accompanist' ? 'accompanist' : 'participant';

      const eventInfo = resolvedEventId ? eventById.get(resolvedEventId) : undefined;
      let hasRowError = false;

      if (!fullName) {
        errors.push(`Row ${i + 1}: missing full name.`);
        hasRowError = true;
      }
      if (!resolvedInstituteId) {
        errors.push(`Row ${i + 1}: institute not found (${instituteNameRaw || instituteIdRaw || 'empty'}).`);
        hasRowError = true;
      }
      if (!resolvedEventId) {
        errors.push(`Row ${i + 1}: event not found (${eventNameRaw || eventIdRaw || 'empty'}).`);
        hasRowError = true;
      }
      if (resolvedEventId && !eventInfo) {
        errors.push(`Row ${i + 1}: event not loaded (${eventNameRaw || eventIdRaw || resolvedEventId}).`);
        hasRowError = true;
      }

      if (!hasRowError && resolvedInstituteId && resolvedEventId && eventInfo) {
        const studentKey = getStudentKey(enrollmentNo, resolvedInstituteId, fullName);
        const eventSet = studentEventMap.get(studentKey) ?? new Set<string>();

        if (eventSet.has(resolvedEventId)) {
          errors.push(`Row ${i + 1}: student already registered for this event.`);
          hasRowError = true;
        } else if (eventSet.size >= 3) {
          errors.push(`Row ${i + 1}: student already registered for 3 events.`);
          hasRowError = true;
        }

        const eventKey = `${resolvedEventId}::${resolvedInstituteId}`;
        if (!hasRowError && resolvedRole === 'participant') {
          const currentCount = participantCountMap.get(eventKey) || 0;
          const maxAllowed = eventInfo.is_team
            ? eventInfo.max_team_size || 0
            : eventInfo.max_entries_per_institute || 0;
          if (maxAllowed > 0 && currentCount >= maxAllowed) {
            errors.push(`Row ${i + 1}: participant limit reached for this institute.`);
            hasRowError = true;
          }
        }

        if (!hasRowError && resolvedRole === 'accompanist') {
          const currentCount = accompanistCountMap.get(eventKey) || 0;
          const maxAllowed = eventInfo.max_accompanists || 0;
          if (maxAllowed > 0 && currentCount >= maxAllowed) {
            errors.push(`Row ${i + 1}: accompanist limit reached for this institute.`);
            hasRowError = true;
          }
        }

        if (!hasRowError) {
          if (!studentEventMap.has(studentKey)) {
            studentEventMap.set(studentKey, new Set());
          }
          studentEventMap.get(studentKey)?.add(resolvedEventId);
          if (resolvedRole === 'accompanist') {
            accompanistCountMap.set(eventKey, (accompanistCountMap.get(eventKey) || 0) + 1);
          } else {
            participantCountMap.set(eventKey, (participantCountMap.get(eventKey) || 0) + 1);
          }
        }
      }

      if (!hasRowError && fullName && resolvedInstituteId && resolvedEventId) {
        preview.push({
          full_name: fullName,
          enrollment_no: enrollmentNo || null,
          phone: phone || null,
          email: email || null,
          institute_id: resolvedInstituteId,
          event_id: resolvedEventId,
          sequence_no: null,
          role: resolvedRole,
        });
      }
    }

    if (preview.length === 0 && errors.length === 0) {
      errors.push('No valid rows found.');
    }

    return { preview, errors };
  };

  const handleHelperPinSave = async (eventId: string) => {
    const pin = helperPins[eventId] ?? '';
    setHelperPinError('');
    setHelperPinSuccess('');

    if (!pin.trim()) {
      setHelperPinError('PIN cannot be empty');
      return;
    }

    try {
      await upsertEventHelper(eventId, pin.trim());
      setHelperPinSuccess('PIN saved successfully!');
      // Reload helper data to ensure consistency (don't preserve, force reload)
      await loadAdminData({ preserveSelections: true, preserveHelperPins: false });
      // Clear success message after 3 seconds
      setTimeout(() => setHelperPinSuccess(''), 3000);
    } catch (error: any) {
      console.error('Save helper PIN error:', error);
      setHelperPinError(`Failed to save PIN: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleAddInstitute = async () => {
    if (!newInstitute.name.trim() || !newInstitute.shortCode.trim()) {
      return;
    }
    try {
      const created = await addInstitute(newInstitute.name.trim(), newInstitute.shortCode.trim());
      setInstitutes((prev) => [...prev, { id: created.id, name: created.name, shortCode: created.short_code }]);
      setNewInstitute({ name: '', shortCode: '' });
      // Refresh institutes from database to ensure consistency
      const freshInstitutes = await fetchInstitutes();
      setInstitutes(freshInstitutes.map((inst) => ({ id: inst.id, name: inst.name, shortCode: inst.short_code })));
    } catch (error) {
      // Error adding institute
    }
  };

  const normalizeTeamId = (teamId?: string | null) => (teamId && teamId.trim() ? teamId.trim() : 'LEGACY-TEAM');

  const buildTeamStats = (eventId: string, instituteId: string) => {
    const stats = new Map<string, { participants: number; accompanists: number }>();
    participants
      .filter((participant) => participant.event_id === eventId && participant.institute_id === instituteId)
      .forEach((participant) => {
        const teamId = normalizeTeamId(participant.team_id);
        const entry = stats.get(teamId) ?? { participants: 0, accompanists: 0 };
        if (participant.role === 'participant') {
          entry.participants += 1;
        } else {
          entry.accompanists += 1;
        }
        stats.set(teamId, entry);
      });
    return stats;
  };

  const getNextTeamId = (stats: Map<string, { participants: number; accompanists: number }>) => {
    let index = 1;
    while (stats.has(`Team-${index}`)) {
      index += 1;
    }
    return `Team-${index}`;
  };

  const eventParticipants = useMemo(
    () =>
      participants
        .filter((participant) => participant.event_id === selectedEventId && participant.role === 'participant')
        .sort((a, b) => (a.sequence_no ?? 0) - (b.sequence_no ?? 0)),
    [participants, selectedEventId]
  );

  const handleMoveSequence = async (index: number, direction: number) => {
    const updated = [...eventParticipants];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= updated.length) {
      return;
    }
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    const updatedIds = updated.map((participant, idx) => ({ id: participant.id, sequenceNo: idx + 1 }));
    try {
      await Promise.all(updatedIds.map((item) => updateParticipantSequence(item.id, item.sequenceNo)));
      setParticipants((prev) =>
        prev.map((participant) => {
          const newSeq = updatedIds.find((item) => item.id === participant.id);
          return newSeq ? { ...participant, sequence_no: newSeq.sequenceNo } : participant;
        })
      );
    } catch (error) {
      // Sequence update error
    }
  };

  const handleRandomizeSequence = async () => {
    const shuffled = [...eventParticipants].sort(() => Math.random() - 0.5);
    try {
      await Promise.all(shuffled.map((participant, idx) => updateParticipantSequence(participant.id, idx + 1)));
      setParticipants((prev) =>
        prev.map((participant) => {
          if (participant.event_id !== selectedEventId || participant.role !== 'participant') {
            return participant;
          }
          const index = shuffled.findIndex((item) => item.id === participant.id);
          return { ...participant, sequence_no: index + 1 };
        })
      );
    } catch (error) {
      // Randomize error
    }
  };

  const handleToggleScoreboard = () => {
    setPasswordModal({ type: 'publish', password: '' });
  };

  const handlePasswordSubmit = () => {
    if (passwordModal.password === LEADERBOARD_PASSWORD) {
      if (passwordModal.type === 'access') {
        setSearchParams({ tab: 'leaderboard' });
        setMobileMenuOpen(false);
      } else if (passwordModal.type === 'publish') {
        const newPublished = !scoreboardPublished;
        setScoreboardPublished(newPublished);
        localStorage.setItem('scoreboardPublished', newPublished ? 'true' : 'false');
      }
      setPasswordModal({ type: null, password: '' });
    } else {
      alert('Incorrect password!');
    }
  };

  const handleScheduleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    setScheduleError('');

    if (!scheduleForm.day || !scheduleForm.eventId) {
      setScheduleError('Please select both day and event.');
      return;
    }

    // Validate that end time is not before start time
    if (scheduleForm.startTime && scheduleForm.endTime && scheduleForm.endTime < scheduleForm.startTime) {
      setScheduleError('End time cannot be earlier than start time.');
      return;
    }

    try {
      const created = await addSchedule({
        event_id: scheduleForm.eventId,
        day: scheduleForm.day,
        start_time: scheduleForm.startTime || 'TBD',
        end_time: scheduleForm.endTime || 'TBD',
        venue: scheduleForm.venue || 'TBD',
        is_placeholder: scheduleForm.isPlaceholder,
      });
      setScheduleEntries((prev) => [...prev, created]);
      setScheduleForm({
        day: '',
        eventId: '',
        startTime: '',
        endTime: '',
        venue: '',
        isPlaceholder: false,
      });
    } catch (error: any) {
      console.error('Schedule add error:', error);
      setScheduleError(`Failed to add schedule: ${error?.message || 'Check console properties'}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      if (deleteConfirm.type === 'institute') {
        await deleteInstitute(deleteConfirm.id);
        setInstitutes((prev) => prev.filter((inst) => inst.id !== deleteConfirm.id));
      } else if (deleteConfirm.type === 'participant') {
        await deleteParticipant(deleteConfirm.id);
        setParticipants((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
      } else if (deleteConfirm.type === 'schedule') {
        await deleteSchedule(deleteConfirm.id);
        setScheduleEntries((prev) => prev.filter((s) => s.id !== deleteConfirm.id));
      } else if (deleteConfirm.type === 'score') {
        await deleteScore(deleteConfirm.id);
        setScores((prev) => prev.filter((s) => s.id !== deleteConfirm.id));
      } else if (deleteConfirm.type === 'team_leader') {
        await deleteTeamLeader(deleteConfirm.id);
        setTeamLeaders((prev) => prev.filter((tl) => tl.id !== deleteConfirm.id));
      }
      setDeleteConfirm(null);
    } catch (error: any) {
      console.error('Delete error:', error);
      const errorMsg = error?.message || JSON.stringify(error);
      if (errorMsg.includes('RLS')) {
        alert('RLS Policy Error: You need to disable RLS on your Supabase tables. Check console for details.');
      } else if (errorMsg.includes('policy')) {
        alert('Policy Error: Delete is not allowed. Check console for details.');
      } else {
        alert(`Delete failed: ${errorMsg}`);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    setIsUpdating(true);
    try {
      if (editModal.type === 'institute') {
        const updated = await updateInstitute(editModal.data.id, editModal.data.name, editModal.data.shortCode);
        if (updated) {
          setInstitutes((prev) => prev.map((inst) => (inst.id === updated.id ? { ...inst, name: updated.name, shortCode: updated.short_code } : inst)));
        }
      } else if (editModal.type === 'participant') {
        const updated = await updateParticipant(editModal.data.id, {
          full_name: editModal.data.full_name,
          enrollment_no: editModal.data.enrollment_no,
          phone: editModal.data.phone,
          email: editModal.data.email,
          institute_id: editModal.data.institute_id,
          event_id: editModal.data.event_id,
          role: editModal.data.role,
        });
        if (updated) {
          setParticipants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        }
      } else if (editModal.type === 'schedule') {
        const updated = await updateSchedule(editModal.data.id, {
          day: editModal.data.day,
          event_id: editModal.data.event_id,
          start_time: editModal.data.start_time,
          end_time: editModal.data.end_time,
          venue: editModal.data.venue,
          is_placeholder: editModal.data.is_placeholder,
        });
        if (updated) {
          setScheduleEntries((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        }
      } else if (editModal.type === 'team_leader') {
        const updated = await updateTeamLeader(editModal.data.id, {
          name: editModal.data.name,
          email: editModal.data.email,
          phone: editModal.data.phone,
          institute_id: editModal.data.institute_id,
        });
        if (updated) {
          setTeamLeaders((prev) => prev.map((tl) => (tl.id === updated.id ? updated : tl)));
        }
      }
      setEditModal(null);
    } catch (error) {
      console.error('Update error:', error);
      alert('Update failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setScoreFormError('');

    const formatSaveError = (err: unknown) => {
      if (!err) return 'Failed to save score';
      if (err instanceof Error) return err.message;
      if (typeof err === 'object') {
        const anyErr = err as { message?: string; details?: string; hint?: string; code?: string };
        const parts = [anyErr.message, anyErr.details, anyErr.hint, anyErr.code].filter(Boolean);
        if (parts.length > 0) return parts.join(' | ');
      }
      return 'Failed to save score';
    };

    const selectedEvent = eventById.get(scoreForm.eventId);
    if (!scoreForm.eventId) {
      setScoreFormError('Select an event before saving.');
      return;
    }

    // Validate that selected institute has participants in this event
    const hasInstituteInEvent = participants.some(
      (p) => p.event_id === scoreForm.eventId &&
        p.institute_id === scoreForm.instituteId &&
        p.role === 'participant'
    );
    if (!hasInstituteInEvent) {
      setScoreFormError('Selected institute has no registered participants in this event.');
      return;
    }

    if (selectedEvent?.is_team) {
      if (!scoreForm.instituteId) {
        setScoreFormError('Select a winning institute before saving.');
        return;
      }
    } else {
      if (!scoreForm.participantId) {
        setScoreFormError('Select a winning participant before saving.');
        return;
      }
      if (!scoreForm.instituteId) {
        setScoreFormError('Selected participant has no institute assigned.');
        return;
      }
    }
    if (scoreForm.rank <= 0) {
      setScoreFormError('Select a valid position before saving.');
      return;
    }

    try {
      const payload = {
        event_id: scoreForm.eventId,
        institute_id: scoreForm.instituteId,
        participant_id: scoreForm.participantId || null,
        rank: scoreForm.rank,
        points: scoreForm.points,
        is_published: scoreForm.isPublished,
      };

      if (isEditingScore && scoreForm.id) {
        const updated = await updateScore(scoreForm.id, payload);
        setScores((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      } else {
        const created = await addScore(payload);
        setScores((prev) => [...prev, created]);
      }
      setScoreForm({
        eventId: '',
        instituteId: '',
        participantId: '',
        rank: 0,
        points: 0,
        isPublished: true,
      });
      setIsEditingScore(false);
      setScoreFormError('');
    } catch (error) {
      console.error('Failed to save score', error);
      setScoreFormError(formatSaveError(error));
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'institutes', label: 'Institutes', icon: Database },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'sequence', label: 'Sequence', icon: Shuffle },
    { id: 'scoring', label: 'Scoring', icon: CheckCircle2 },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'live', label: 'Live Ops', icon: Activity },
    { id: 'team-leaders', label: 'Team Leaders', icon: UserCheck },
    { id: 'role-assign', label: 'Role Assign', icon: ShieldCheck, adminOnly: true },
  ];

  const allowedTabIds = useMemo(() => {
    if (isAdminUser) {
      return tabs.map((tab) => tab.id);
    }
    if (managerRole) {
      return [roleTabMap[managerRole] ?? 'dashboard'];
    }
    return [] as string[];
  }, [isAdminUser, managerRole, tabs]);

  const visibleTabs = useMemo(() => {
    const baseTabs = isAdminUser ? tabs : tabs.filter((tab) => !tab.adminOnly);
    return baseTabs.filter((tab) => allowedTabIds.includes(tab.id));
  }, [allowedTabIds, isAdminUser, tabs]);

  useEffect(() => {
    if (!allowedTabIds.length) return;
    if (!allowedTabIds.includes(activeTab)) {
      setSearchParams({ tab: allowedTabIds[0] });
    }
  }, [activeTab, allowedTabIds, setSearchParams]);

  // Show loading while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#FEFCF8] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="text-[#A89880]">Loading session...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FEFCF8] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="hidden" />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="elite-glass p-12 w-full max-w-md border-[#1A1208]/8"
        >
          {!isAdminMode ? (
            <div className="flex justify-end mb-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#A89880] hover:text-[#1A1208] transition-colors"
              >
                <ArrowLeft size={14} />
                Back To Main Site
              </Link>
            </div>
          ) : null}
          <div className="flex flex-col items-center mb-12">
            <div className="w-24 h-24 rounded-full bg-brand/5 border border-brand/20 flex items-center justify-center text-brand mb-6">
              <ShieldCheck size={40} />
            </div>
            <h1 className="text-3xl font-bold mb-2">{loginTitle}</h1>
            <p className="text-[#A89880] text-sm">{loginSubtitle}</p>
          </div>

          <form
            className="space-y-8"
            onSubmit={(e) => {
              e.preventDefault();
              setLoginError('');
              loginWithPassword(loginForm.email, loginForm.password)
                .then(async () => {
                  setIsLoggedIn(true);
                  const access = await resolveAccessForSession();
                  if (!access.ok) {
                    await signOut();
                    setIsLoggedIn(false);
                    if (access.reason === 'admin-only') {
                      setLoginError('Admin access only.');
                    } else if (access.reason === 'use-admin-login') {
                      setLoginError('Please use the Admin Login for this account.');
                    } else if (access.reason === 'no-manager-role') {
                      setLoginError('No manager role assigned. Contact an admin.');
                    } else {
                      setLoginError('Access denied.');
                    }
                  }
                })
                .catch(() => setLoginError('Invalid credentials.'));
            }}
          >
            <div className="space-y-3">
              <label className="text-xs font-medium text-[#8B7D6B] pl-1 mb-1 block">{loginEmailLabel}</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C8B8A0]" size={18} />
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-2xl py-5 pl-14 pr-6 focus:ring-2 focus:ring-brand/50 outline-none transition-all font-medium"
                  placeholder="admin@uthfest.in"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium text-[#8B7D6B] pl-1 mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C8B8A0]" size={18} />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-2xl py-5 pl-14 pr-14 focus:ring-2 focus:ring-brand/50 outline-none transition-all font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[#B8A890] hover:text-[#6B5D4D] transition-colors"
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-elite w-full py-6 rounded-2xl justify-center font-bold text-sm tracking-wide">
              Enter Admin Portal
            </button>
            {loginError ? <div className="text-xs text-red-400 font-medium mt-2">{loginError}</div> : null}
          </form>
        </motion.div>
      </div>
    );
  }

  if (!isAdminMode && managerRolesForUser.length > 1 && !managerRole) {
    return (
      <div className="min-h-screen bg-[#FEFCF8] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="hidden" />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="elite-glass p-10 w-full max-w-lg border-[#1A1208]/8"
        >
          <div className="flex justify-end mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#A89880] hover:text-[#1A1208] transition-colors"
            >
              <ArrowLeft size={14} />
              Back To Main Site
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-2">Choose Your Role</h1>
          <p className="text-[#A89880] text-sm mb-8">
            Your account has multiple roles. Pick one to continue.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {managerRolesForUser.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleManagerRoleSelect(role)}
                className="btn-elite justify-center text-sm uppercase tracking-widest"
              >
                {role.replace('_', ' ')}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              signOut().finally(() => {
                setIsLoggedIn(false);
                setIsAdminUser(false);
                setManagerRole(null);
                setManagerRolesForUser([]);
              });
            }}
            className="mt-8 text-xs font-bold uppercase tracking-wider text-[#A89880] hover:text-[#1A1208] transition-colors"
          >
            Sign out
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFCF8] flex flex-col overflow-hidden">
      {/* Mobile Hamburger Button */}
      <div className="lg:hidden sticky top-0 z-[70] bg-white/80 backdrop-blur-lg p-4 sm:p-6 flex items-center justify-between border-b border-[#1A1208]/4">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="Logo" className="w-8 h-8 object-contain" />
          <div>
            <span className="font-bold text-lg">UTh Fest</span>
            <span className="text-xs text-[#A89880] block">{isAdminMode ? 'Admin Hub' : 'Manager Hub'}</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-[#1A1208]/[0.03] rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] lg:hidden" onClick={() => setMobileMenuOpen(false)} style={{ pointerEvents: 'auto' }} />
      )}

      <div className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 overflow-auto no-scrollbar">
        {/* Sidebar */}
        <aside className={`fixed left-0 top-0 bottom-0 w-72 bg-white/95 backdrop-blur-xl p-6 flex flex-col gap-6 border-r border-[#1A1208]/8 z-[70] transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:static lg:translate-x-0 lg:w-72 lg:min-w-[18rem] lg:max-w-[18rem] lg:bg-transparent lg:backdrop-blur-none lg:p-0 lg:border-none lg:h-[calc(100vh-2rem)] lg:z-auto overflow-y-auto no-scrollbar`}>
          <div className="flex items-center gap-3 flex-shrink-0">
            <img src={logoImage} alt="Logo" className="w-8 sm:w-10 h-8 sm:h-10 object-contain" />
            <div>
              <span className="font-bold text-lg sm:text-xl">UTh Fest</span>
              <span className="text-xs sm:text-sm text-[#A89880] block">{isAdminMode ? 'Admin Hub' : 'Manager Hub'}</span>
            </div>
          </div>

          {!isAdminUser && managerRolesForUser.length > 1 ? (
            <div className="bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-2xl p-4 hover:bg-white/[0.07] transition-colors flex-shrink-0">
              <label className="text-[10px] font-black text-[#A89880] uppercase tracking-[0.3em]">Active Role</label>
              <select
                value={managerRole ?? ''}
                onChange={(e) => handleManagerRoleSelect(e.target.value)}
                className="mt-2 w-full bg-transparent border-0 px-0 py-1 text-sm uppercase tracking-widest text-[#1A1208] font-semibold focus:outline-none"
                style={{ colorScheme: 'light' }}
              >
                {managerRolesForUser.map((role) => (
                  <option key={role} value={role} style={{ color: '#1A1208', backgroundColor: '#FEFCF8' }}>
                    {role.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <nav className="flex-1 space-y-2 flex-shrink-0">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-colors ${activeTab === tab.id
                  ? 'bg-brand/10 text-brand font-bold border border-brand/20'
                  : 'text-[#6B5D4D] hover:bg-[#1A1208]/[0.03] hover:text-[#1A1208]'
                  }`}
              >
                <tab.icon size={20} />
                <span className="font-semibold">{tab.label}</span>
              </button>
            ))}
          </nav>

          {!isAdminMode ? (
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 sm:py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-[#A89880] hover:text-[#1A1208] transition-colors"
            >
              <ArrowLeft size={14} />
              Back To Main Site
            </Link>
          ) : null}

          <button
            onClick={() => {
              signOut().finally(() => {
                setIsLoggedIn(false);
                setIsAdminUser(false);
                setManagerRole(null);
                setManagerRolesForUser([]);
                if (typeof window !== 'undefined') {
                  localStorage.removeItem(MANAGER_ROLE_KEY);
                }
              });
            }}
            className="px-4 py-2 sm:py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-[#A89880] hover:text-[#1A1208] transition-colors"
          >
            Sign out
          </button>
        </aside>

        <main className="flex-1 space-y-4 sm:space-y-8 w-full relative">
          {!isAdminUser && !managerRole && (
            <div className="elite-glass p-6">
              <h2 className="text-xl font-bold mb-2">Access restricted</h2>
              <p className="text-[#8B7D6B] text-sm">Your account does not have a manager role assigned. Contact an admin to assign a role.</p>
            </div>
          )}
          {activeTab === 'dashboard' && (
            <div className="space-y-4 sm:space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="elite-glass p-4 sm:p-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4"
              >
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1A1208]">Admin Dashboard</h1>
                  <p className="text-[#4A3F2F] text-base font-medium">Manage registrations, schedules, scoring, and live updates.</p>
                </div>
                <button
                  onClick={() => {
                    loadAdminData({ preserveSelections: true });
                  }}
                  className="flex items-center gap-2 px-3 py-2 sm:px-4 elite-glass !rounded-xl text-xs font-bold text-[#1A1208] hover:text-brand transition-colors whitespace-nowrap"
                >
                  <RefreshCw size={14} /> Refresh
                </button>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {[
                  { label: 'Institutes', value: institutes.length },
                  { label: 'Participants', value: participants.length },
                  { label: 'Events', value: events.length },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                    className="elite-glass p-4 sm:p-6"
                  >
                    <div className="text-xs font-black text-[#8B7D6B] uppercase tracking-wider mb-2">{stat.label}</div>
                    <div className="text-3xl sm:text-4xl font-black text-[#1A1208]">{stat.value}</div>
                  </motion.div>
                ))}
              </div>

              {/* Live Leaderboard Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="elite-glass p-6 sm:p-8"
              >
                <div className="mb-8">
                  <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight text-[#1A1208]">Live Leaderboard</h2>
                  <p className="text-[#8B7D6B] text-sm font-bold uppercase tracking-widest">Real-time championship standings</p>
                </div>
                <div className="space-y-3">
                  {scores.length === 0 ? (
                    <div className="text-[#A89880] text-sm py-8 text-center">No scores recorded yet. Leaderboard will appear here.</div>
                  ) : (
                    (() => {
                      const instituteScores: Record<string, number> = {};
                      scores.forEach((score) => {
                        if (!instituteScores[score.institute_id]) {
                          instituteScores[score.institute_id] = 0;
                        }
                        instituteScores[score.institute_id] += score.points || 0;
                      });
                      const sorted = Object.entries(instituteScores)
                        .map(([instId, pts]) => ({
                          name: instituteById.get(instId)?.name || 'Unknown',
                          points: pts,
                        }))
                        .sort((a, b) => b.points - a.points)
                        .slice(0, 5);

                      return sorted.map((entry, idx) => {
                        const getMedalColor = (rank: number) => {
                          if (rank === 1) return 'from-yellow-400 to-yellow-600';
                          if (rank === 2) return 'from-slate-300 to-slate-400';
                          if (rank === 3) return 'from-orange-400 to-orange-600';
                          return 'from-white/10 to-white/5';
                        };

                        return (
                          <div
                            key={`${entry.name}-${idx}`}
                            className={`flex justify-between items-center rounded-xl px-4 sm:px-6 py-3 sm:py-4 transition-all ${idx < 3
                              ? `bg-gradient-to-r ${getMedalColor(idx + 1)}/20 border border-${idx === 0 ? 'yellow-500' : idx === 1 ? 'slate-400' : 'orange-500'}/30`
                              : 'bg-[#1A1208]/[0.02] border border-[#1A1208]/4'
                              } hover:scale-105 transform transition-transform`}
                          >
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-black text-sm sm:text-base flex-shrink-0 ${idx === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-[#1A1208]' :
                                idx === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-[#1A1208]' :
                                  idx === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-600 text-[#1A1208]' :
                                    'bg-[#1A1208]/[0.05] text-[#4A3F2F]'
                                }`}>
                                {idx === 0 ? '1st' : idx === 1 ? '2nd' : idx === 2 ? '3rd' : idx + 1}
                              </div>
                              <div className="min-w-0">
                                <div className="font-black text-base sm:text-lg truncate">{entry.name}</div>
                                <div className="text-xs text-[#A89880] uppercase tracking-wider">
                                  {idx === 0 ? 'Champion' : idx === 1 ? 'Runner Up' : idx === 2 ? 'Third Place' : 'Participant'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className={`text-2xl sm:text-3xl font-black tracking-tighter ${idx === 0 ? 'text-yellow-400' :
                                idx === 1 ? 'text-slate-300' :
                                  idx === 2 ? 'text-orange-400' : 'text-[#1A1208]'
                                }`}>{entry.points}</div>
                              <div className="text-xs text-[#A89880] font-bold">Points</div>
                            </div>
                          </div>
                        );
                      });
                    })()
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === 'institutes' && (
            <div className="elite-glass p-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Institutes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <input
                  value={newInstitute.name}
                  onChange={(e) => setNewInstitute({ ...newInstitute, name: e.target.value })}
                  placeholder="Institute name"
                  className="bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-2xl px-4 sm:px-5 py-2 sm:py-3 text-sm"
                />
                <input
                  value={newInstitute.shortCode}
                  onChange={(e) => setNewInstitute({ ...newInstitute, shortCode: e.target.value })}
                  placeholder="Short code"
                  className="bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-2xl px-4 sm:px-5 py-2 sm:py-3 text-sm"
                />
                <button type="button" className="btn-elite justify-center text-sm" onClick={handleAddInstitute}>
                  <Plus size={16} /> <span className="hidden sm:inline">Add Institute</span><span className="sm:hidden">Add</span>
                </button>
              </div>
              <div className="space-y-2 sm:space-y-3 overflow-x-auto no-scrollbar">
                {institutes.map((inst) => (
                  <div key={inst.id} className="flex justify-between items-center bg-[#1A1208]/[0.02] border border-[#1A1208]/4 rounded-2xl px-4 sm:px-5 py-3 sm:py-4">
                    <div className="min-w-0">
                      <div className="font-bold text-base truncate mb-1">{inst.name}</div>
                      <div className="text-xs text-[#8B7D6B]">{inst.shortCode}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#A89880]">Active</span>
                      <button
                        onClick={() => setEditModal({ type: 'institute', data: { ...inst, shortCode: inst.shortCode } as any })}
                        className="p-2 hover:bg-[#1A1208]/[0.05] rounded-lg transition-colors text-[#6B5D4D] hover:text-[#1A1208]"
                        title="Edit institute"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'institute', id: inst.id, name: inst.name })}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 hover:text-red-300"
                        title="Delete institute"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Registration is now handled via Team Leader Portal at /team-leader */}

          {activeTab === 'participants' && (
            <div className="space-y-6">
              <div className="elite-glass p-4 sm:p-8">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-xl sm:text-2xl font-bold">Participants</h2>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setIsSelectionMode(!isSelectionMode)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${isSelectionMode
                          ? 'bg-brand/20 text-brand border border-brand/30 hover:bg-brand/30'
                          : 'bg-[#1A1208]/[0.03] text-[#6B5D4D] border border-[#1A1208]/8 hover:text-[#1A1208] hover:bg-[#1A1208]/[0.05]'
                          }`}
                      >
                        {isSelectionMode ? '✓ Cancel' : 'Select'}
                      </button>
                      {isSelectionMode && (
                        <>
                          <button
                            type="button"
                            onClick={selectAllFiltered}
                            className="px-3 py-2 rounded-xl text-xs font-bold bg-[#1A1208]/[0.03] text-[#6B5D4D] border border-[#1A1208]/8 hover:text-[#1A1208]"
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={clearSelection}
                            className="px-3 py-2 rounded-xl text-xs font-bold bg-[#1A1208]/[0.03] text-[#6B5D4D] border border-[#1A1208]/8 hover:text-[#1A1208]"
                          >
                            Clear
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedDeleteConfirm(true)}
                            disabled={selectedParticipantIds.size === 0}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 disabled:opacity-40"
                          >
                            Delete Selected ({selectedParticipantIds.size})
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="Search name or enrollment"
                      value={participantSearch}
                      onChange={(e) => setParticipantSearch(e.target.value)}
                      className="bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-4 py-2 text-sm text-[#2A1F0F] focus:outline-none focus:border-brand/50"
                    />
                    <select
                      value={participantEventId}
                      onChange={(e) => setParticipantEventId(e.target.value)}
                      className="bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-3 py-2 text-xs text-[#2A1F0F]"
                      style={{ colorScheme: 'light' }}
                    >
                      <option value="" style={{ color: '#1A1208', backgroundColor: '#FEFCF8' }}>All Events</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id} style={{ color: '#1A1208', backgroundColor: '#FEFCF8' }}>
                          {event.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={participantInstituteId}
                      onChange={(e) => setParticipantInstituteId(e.target.value)}
                      className="bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-3 py-2 text-xs text-[#2A1F0F]"
                      style={{ colorScheme: 'light' }}
                    >
                      <option value="" style={{ color: '#1A1208', backgroundColor: '#FEFCF8' }}>All Institutes</option>
                      {institutes.map((inst) => (
                        <option key={inst.id} value={inst.id} style={{ color: '#1A1208', backgroundColor: '#FEFCF8' }}>
                          {inst.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={participantRole}
                      onChange={(e) => setParticipantRole(e.target.value)}
                      className="bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-3 py-2 text-xs text-[#2A1F0F]"
                      style={{ colorScheme: 'light' }}
                    >
                      <option value="" style={{ color: '#1A1208', backgroundColor: '#FEFCF8' }}>All Roles</option>
                      <option value="participant" style={{ color: '#1A1208', backgroundColor: '#FEFCF8' }}>Participant</option>
                      <option value="accompanist" style={{ color: '#1A1208', backgroundColor: '#FEFCF8' }}>Accompanist</option>
                    </select>
                  </div>
                  <div className="text-xs text-[#4A3F2F]">
                    Showing {filteredParticipants.length} of {participants.length} participant(s).
                    {participantEventId || participantInstituteId || participantRole ? ` Filters: ${bulkDeleteSummary}.` : ''}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="elite-glass p-4 sm:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Group Events (Event → Institute)</h3>
                    <span className="text-xs text-[#4A3F2F]">Grouped view</span>
                  </div>
                  <div className="space-y-4">
                    {events.filter((event) => event.is_team).map((event) => {
                      const eventGroups = groupedFilteredParticipants.get(event.id);
                      if (!eventGroups || eventGroups.size === 0) {
                        return null;
                      }
                      return (
                        <div key={event.id} className="bg-[#1A1208]/[0.02] border border-[#1A1208]/4 rounded-2xl p-4">
                          <div className="font-semibold text-base mb-2">{event.name}</div>
                          <div className="space-y-3">
                            {Array.from(eventGroups.entries()).map(([instituteId, members]) => {
                              const participantCount = members.filter((m) => m.role === 'participant').length;
                              const accompanistCount = members.filter((m) => m.role === 'accompanist').length;
                              return (
                                <div key={instituteId} className="border border-[#1A1208]/4 rounded-xl p-3">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setGroupDetailModal({ eventId: event.id, instituteId })}
                                      className="font-semibold text-sm text-left hover:text-brand hover:underline transition-colors text-[#1A1208]"
                                    >
                                      {instituteById.get(instituteId)?.name}
                                    </button>
                                    <div className="text-xs text-[#4A3F2F]">
                                      {participantCount} participant(s) • {accompanistCount} accompanist(s)
                                    </div>
                                  </div>
                                  <div className="mt-2 space-y-1 text-xs text-[#4A3F2F]">
                                    {members
                                      .slice()
                                      .sort((a, b) => a.full_name.localeCompare(b.full_name))
                                      .map((member) => (
                                        <div key={member.id} className="flex items-center justify-between gap-2">
                                          <label className="flex items-center gap-2 flex-1 min-w-0">
                                            {isSelectionMode && (
                                              <input
                                                type="checkbox"
                                                checked={selectedParticipantIds.has(member.id)}
                                                onChange={() => toggleParticipantSelection(member.id)}
                                                className="flex-shrink-0"
                                              />
                                            )}
                                            <span>{member.full_name} • {member.enrollment_no || '-'} • {member.role}</span>
                                          </label>
                                          <button
                                            type="button"
                                            onClick={() => setEditModal({ type: 'participant', data: member })}
                                            className="text-[10px] text-[#4A3F2F] hover:text-[#1A1208] flex-shrink-0"
                                          >
                                            Edit
                                          </button>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    {events.filter((event) => event.is_team).every((event) => {
                      const eventGroups = groupedFilteredParticipants.get(event.id);
                      return !eventGroups || eventGroups.size === 0;
                    }) ? (
                      <div className="text-[#6B5D4D] text-sm">No group participants match the filters.</div>
                    ) : null}
                  </div>
                </div>

                <div className={`elite-glass p-4 sm:p-8 ${participantEventId && eventById.get(participantEventId)?.is_team ? 'hidden' : ''}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Solo Events (Event → Institute)</h3>
                    <span className="text-xs text-[#4A3F2F]">Grouped view</span>
                  </div>
                  <div className="space-y-4">
                    {events.filter((event) => !event.is_team).map((event) => {
                      const soloEventGroups = new Map<string, ParticipantRow[]>();
                      filteredParticipants
                        .filter((p) => p.event_id === event.id && !eventById.get(p.event_id)?.is_team)
                        .forEach((participant) => {
                          const existing = soloEventGroups.get(participant.institute_id) ?? [];
                          existing.push(participant);
                          soloEventGroups.set(participant.institute_id, existing);
                        });
                      if (soloEventGroups.size === 0) return null;
                      return (
                        <div key={event.id} className="bg-[#1A1208]/[0.02] border border-[#1A1208]/4 rounded-2xl p-4">
                          <div className="font-semibold text-base mb-2">{event.name}</div>
                          <div className="space-y-3">
                            {Array.from(soloEventGroups.entries()).map(([instituteId, members]) => (
                              <div key={instituteId} className="border border-[#1A1208]/4 rounded-xl p-3">
                                <div className="font-semibold text-sm mb-2 text-[#1A1208]">{instituteById.get(instituteId)?.name}</div>
                                <div className="space-y-1 text-xs text-[#4A3F2F]">
                                  {members
                                    .slice()
                                    .sort((a, b) => a.full_name.localeCompare(b.full_name))
                                    .map((member) => (
                                      <div key={member.id} className="flex items-center justify-between gap-2">
                                        <label className="flex items-center gap-2 flex-1 min-w-0">
                                          {isSelectionMode && (
                                            <input
                                              type="checkbox"
                                              checked={selectedParticipantIds.has(member.id)}
                                              onChange={() => toggleParticipantSelection(member.id)}
                                              className="flex-shrink-0"
                                            />
                                          )}
                                          <span>{member.full_name} • {member.enrollment_no || '-'} • {member.role}</span>
                                        </label>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => setEditModal({ type: 'participant', data: member })}
                                            className="text-[10px] text-[#4A3F2F] hover:text-[#1A1208]"
                                          >
                                            Edit
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {events.filter((event) => !event.is_team).every((event) => {
                      const soloEventGroups = new Map<string, ParticipantRow[]>();
                      filteredParticipants
                        .filter((p) => p.event_id === event.id && !eventById.get(p.event_id)?.is_team)
                        .forEach((participant) => {
                          const existing = soloEventGroups.get(participant.institute_id) ?? [];
                          existing.push(participant);
                          soloEventGroups.set(participant.institute_id, existing);
                        });
                      return soloEventGroups.size === 0;
                    }) ? (
                      <div className="text-[#6B5D4D] text-sm">No solo participants match the filters.</div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sequence' && (
            <div className="elite-glass p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">Sequence Manager</h2>
                <div className="flex gap-2 sm:gap-3 flex-wrap">
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-2xl px-3 sm:px-5 py-2 text-[#1A1208] text-sm w-full sm:w-72 max-w-xs"
                    style={{
                      colorScheme: 'light',
                    }}
                  >
                    <option value="" style={{ color: '#666' }}>Select event</option>
                    {events
                      .filter(e => activeCategory === 'ALL' || e.category.toUpperCase() === activeCategory)
                      .map((event) => (
                        <option key={event.id} value={event.id} style={{ color: '#1A1208', backgroundColor: '#FEFCF8' }}>
                          {event.name}
                        </option>
                      ))}
                  </select>
                  <button type="button" className="btn-elite text-sm" onClick={handleRandomizeSequence}>
                    <Shuffle size={16} /> <span className="hidden sm:inline">Randomize</span>
                  </button>
                </div>
              </div>
              <CategoryTabs />
              <div className="space-y-2 sm:space-y-3">
                {eventParticipants.length === 0 ? (
                  <div className="text-[#6B5D4D] text-sm">No participants registered for this event yet.</div>
                ) : (
                  eventParticipants.map((participant, index) => (
                    <div key={participant.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1A1208]/[0.02] border border-[#1A1208]/4 rounded-2xl px-3 sm:px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#1A1208]/[0.03] flex items-center justify-center font-black text-sm">
                          {participant.sequence_no ?? index + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-base truncate">{participant.full_name}</div>
                          <div className="text-xs text-[#4A3F2F] mt-0.5">
                            {instituteById.get(participant.institute_id)?.shortCode}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" className="px-2 sm:px-3 py-1 sm:py-2 elite-glass !rounded-xl text-xs" onClick={() => handleMoveSequence(index, -1)}>
                          Up
                        </button>
                        <button type="button" className="px-2 sm:px-3 py-1 sm:py-2 elite-glass !rounded-xl text-xs" onClick={() => handleMoveSequence(index, 1)}>
                          Down
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'scoring' && (
            <div className="elite-glass p-4 sm:p-8">
              <div className="flex flex-col gap-4 mb-4 sm:mb-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl sm:text-2xl font-bold">Scoring Config</h2>
                </div>
                <CategoryTabs />
              </div>
              <div className="space-y-3 sm:space-y-4">
                {events.filter(e => {
                  const matchesCategory = activeCategory === 'ALL' || e.category.toUpperCase() === activeCategory;
                  const matchesEvent = !selectedEventId || e.id === selectedEventId;
                  return matchesCategory && matchesEvent;
                }).map((event) => (
                  <div key={event.id} className="bg-[#1A1208]/[0.02] border border-[#1A1208]/4 rounded-2xl px-3 sm:px-4 py-3 sm:py-4">
                    <div className="font-bold mb-3 text-sm">{event.name}</div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {(['first', 'second', 'third'] as const).map((key) => (
                        <div key={key}>
                          <label className="text-xs text-[#4A3F2F] font-medium capitalize block mb-1">
                            {key === 'first' ? 'Winner' : key === 'second' ? '1st Runner Up' : '2nd Runner Up'}
                          </label>
                          <input
                            type="number"
                            value={scoreConfig[event.id]?.[key] ?? 0}
                            onChange={(e) =>
                              setScoreConfig((prev) => ({
                                ...prev,
                                [event.id]: { ...prev[event.id], [key]: Number(e.target.value) },
                              }))
                            }
                            className="mt-2 w-full bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-xl px-2 sm:px-3 py-2 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="mt-3 sm:mt-4 px-3 sm:px-4 py-2 elite-glass !rounded-xl text-xs font-bold text-[#6B5D4D] hover:text-brand"
                      onClick={() => {
                        const config = scoreConfig[event.id];
                        upsertScoringConfig({ event_id: event.id, rank: 1, points: config.first });
                        upsertScoringConfig({ event_id: event.id, rank: 2, points: config.second });
                        upsertScoringConfig({ event_id: event.id, rank: 3, points: config.third });
                        upsertScoringConfig({ event_id: event.id, rank: 0, points: config.participation });
                      }}
                    >
                      Save Scoring
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
              <div className="elite-glass p-4 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Schedule Manager</h2>
                <form className="space-y-3 sm:space-y-4" onSubmit={handleScheduleAdd}>
                  {scheduleError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-200 text-xs font-bold font-mono">
                      {scheduleError}
                    </div>
                  )}
                  <select
                    value={scheduleForm.day}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value as ScheduleRow['day'] })}
                    className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-2xl px-4 sm:px-5 py-2 sm:py-3 text-[#1A1208] text-sm"
                    style={{
                      colorScheme: 'light',
                    }}
                  >
                    <option value="" style={{ color: '#666' }}>Select day</option>
                    <option value="Day 1" style={{ color: '#1A1208', backgroundColor: '#FEFCF8' }}>Day 1 (March 18)</option>
                    <option value="Day 2" style={{ color: '#1A1208', backgroundColor: '#FEFCF8' }}>Day 2 (March 19)</option>
                    <option value="Day 3" style={{ color: '#1A1208', backgroundColor: '#FEFCF8' }}>Day 3 (March 20)</option>
                  </select>
                  <select
                    value={scheduleForm.eventId}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, eventId: e.target.value })}
                    className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-2xl px-4 sm:px-5 py-2 sm:py-3 text-[#1A1208] text-sm"
                    style={{
                      colorScheme: 'light',
                    }}
                  >
                    <option value="" style={{ color: '#666' }}>Select event</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id} style={{ color: '#1A1208', backgroundColor: '#FEFCF8' }}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <input
                      type="time"
                      value={scheduleForm.startTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                      placeholder="Start time"
                      className="bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-2xl px-4 sm:px-5 py-2 sm:py-3 text-sm"
                      style={{ colorScheme: 'light' }}
                    />
                    <input
                      type="time"
                      value={scheduleForm.endTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                      placeholder="End time"
                      className="bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-2xl px-4 sm:px-5 py-2 sm:py-3 text-sm"
                      style={{ colorScheme: 'light' }}
                    />
                  </div>
                  <input
                    value={scheduleForm.venue}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, venue: e.target.value })}
                    placeholder="Venue"
                    className="w-full bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-2xl px-4 sm:px-5 py-2 sm:py-3 text-sm"
                  />
                  <label className="flex items-center gap-3 text-xs sm:text-sm text-[#4A3F2F]">
                    <input
                      type="checkbox"
                      checked={scheduleForm.isPlaceholder}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, isPlaceholder: e.target.checked })}
                    />
                    Mark as placeholder
                  </label>
                  <button type="submit" className="btn-elite justify-center text-sm">
                    Add Schedule
                  </button>
                </form>
              </div>
              <div className="elite-glass p-4 sm:p-8">
                <div className="flex flex-col gap-4 mb-4 sm:mb-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl sm:text-2xl font-bold">Schedule List</h2>
                  </div>
                  <CategoryTabs />
                </div>
                <div className="space-y-3 max-h-[420px] overflow-y-auto no-scrollbar relative z-0">
                  {scheduleEntries.filter(s => {
                    const evt = eventById.get(s.event_id);
                    const matchesCategory = activeCategory === 'ALL' || evt?.category.toUpperCase() === activeCategory;
                    const matchesEvent = !selectedEventId || s.event_id === selectedEventId;
                    return matchesCategory && matchesEvent;
                  }).length === 0 ? (
                    <div className="text-[#6B5D4D] text-sm">No schedule entries yet.</div>
                  ) : (
                    scheduleEntries
                      .filter(s => {
                        const evt = eventById.get(s.event_id);
                        const matchesCategory = activeCategory === 'ALL' || evt?.category.toUpperCase() === activeCategory;
                        const matchesEvent = !selectedEventId || s.event_id === selectedEventId;
                        return matchesCategory && matchesEvent;
                      })
                      .map((entry) => (
                        <div key={entry.id} className="bg-[#1A1208]/[0.02] border border-[#1A1208]/4 rounded-2xl px-3 sm:px-4 py-3">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-base mb-1">{eventById.get(entry.event_id)?.name}</div>
                              <div className="text-xs text-[#4A3F2F]">
                                {entry.day} • {entry.start_time ?? 'TBD'} - {entry.end_time ?? 'TBD'} • {entry.venue ?? 'TBD'}
                              </div>
                              {entry.is_placeholder ? (
                                <div className="text-xs font-medium text-[#4A3F2F] mt-1">Placeholder</div>
                              ) : null}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditModal({ type: 'schedule', data: entry })}
                                className="p-2 hover:bg-[#1A1208]/[0.05] rounded-lg text-[#6B5D4D] hover:text-[#1A1208] transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({
                                  type: 'schedule',
                                  id: entry.id,
                                  name: `${eventById.get(entry.event_id)?.name} - ${entry.day}`
                                })}
                                className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 hover:text-red-300 flex-shrink-0"
                                title="Delete schedule"
                              >
                                <Trash2 size={12} className="sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'live' && (
            <div className="elite-glass p-4 sm:p-8">
              {helperPinError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 text-sm text-red-400 flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">✗</span>
                  <span>{helperPinError}</span>
                </div>
              )}
              {helperPinSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-4 text-sm text-green-400 flex items-start gap-2">
                  <span className="text-green-400 font-bold shrink-0">✓</span>
                  <span>{helperPinSuccess}</span>
                </div>
              )}
              <div className="flex flex-col gap-4 mb-4 sm:mb-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl sm:text-2xl font-bold">Event Helper PINs</h2>
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-3 py-1.5 text-xs text-[#2A1F0F]"
                    style={{ colorScheme: 'light' }}
                  >
                    <option value="" style={{ color: '#666' }}>All Events</option>
                    {events.map(e => <option key={e.id} value={e.id} style={{ color: '#1A1208', backgroundColor: '#FEFCF8' }}>{e.name}</option>)}
                  </select>
                </div>
                <CategoryTabs />
              </div>
              <div className="space-y-2 sm:space-y-3">
                {events.filter(e => {
                  const matchesCategory = activeCategory === 'ALL' || e.category.toUpperCase() === activeCategory;
                  const matchesEvent = !selectedEventId || e.id === selectedEventId;
                  return matchesCategory && matchesEvent;
                }).map((event) => (
                  <div key={event.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#1A1208]/[0.02] border border-[#1A1208]/4 rounded-2xl px-3 sm:px-4 py-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-base truncate">{event.name}</div>
                      <div className="text-xs text-[#4A3F2F] mt-0.5">{event.category}</div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Hash size={12} className="sm:w-[14px] sm:h-[14px] text-[#6B5D4D]" />
                      <input
                        value={helperPins[event.id] ?? ''}
                        onChange={(e) => setHelperPins((prev) => ({ ...prev, [event.id]: e.target.value }))}
                        placeholder="PIN"
                        className="bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm"
                      />
                      <button
                        type="button"
                        className="px-3 py-2 elite-glass !rounded-xl text-xs font-bold text-[#6B5D4D] hover:text-brand whitespace-nowrap"
                        onClick={() => handleHelperPinSave(event.id)}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'team-leaders' && (
            <div className="space-y-6">
              {/* Add Team Leader Form */}
              <div className="elite-glass p-4 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Team Leaders</h2>

                {tlError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 text-sm text-red-400 flex items-start gap-2">
                    <span className="text-red-400 font-bold shrink-0">✗</span>
                    <span>{tlError}</span>
                  </div>
                )}
                {tlSuccess && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-4 text-sm text-green-400 flex items-start gap-2">
                    <span className="text-green-400 font-bold shrink-0">✓</span>
                    <span>{tlSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  <input
                    value={newTeamLeader.name}
                    onChange={(e) => setNewTeamLeader({ ...newTeamLeader, name: e.target.value })}
                    placeholder="Full name"
                    className="bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-2xl px-4 sm:px-5 py-2 sm:py-3 text-sm"
                  />
                  <input
                    value={newTeamLeader.email}
                    onChange={(e) => setNewTeamLeader({ ...newTeamLeader, email: e.target.value })}
                    placeholder="Email (e.g. name@utu.ac.in)"
                    className="bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-2xl px-4 sm:px-5 py-2 sm:py-3 text-sm"
                  />
                  <input
                    value={newTeamLeader.phone}
                    onChange={(e) => setNewTeamLeader({ ...newTeamLeader, phone: e.target.value })}
                    placeholder="Phone"
                    className="bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-2xl px-4 sm:px-5 py-2 sm:py-3 text-sm"
                  />
                  <select
                    value={newTeamLeader.instituteId}
                    onChange={(e) => setNewTeamLeader({ ...newTeamLeader, instituteId: e.target.value })}
                    className="bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-2xl px-4 sm:px-5 py-2 sm:py-3 text-sm text-[#1A1208]"
                    style={{ colorScheme: 'light' }}
                  >
                    <option value="" style={{ color: '#666' }}>Select Institute</option>
                    {institutes.map((inst) => (
                      <option key={inst.id} value={inst.id} style={{ color: '#1A1208', backgroundColor: '#FEFCF8' }}>{inst.name} ({inst.shortCode})</option>
                    ))}
                  </select>
                  <input
                    value={newTeamLeader.password}
                    onChange={(e) => setNewTeamLeader({ ...newTeamLeader, password: e.target.value })}
                    placeholder="Temp password"
                    className="bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-2xl px-4 sm:px-5 py-2 sm:py-3 text-sm"
                  />
                  <button
                    type="button"
                    disabled={isAddingTL}
                    className="btn-elite justify-center text-sm disabled:opacity-50"
                    onClick={async () => {
                      setTlError('');
                      setTlSuccess('');
                      if (!newTeamLeader.name.trim() || !newTeamLeader.email.trim() || !newTeamLeader.instituteId) {
                        setTlError('Please fill in name, email, and select an institute.');
                        return;
                      }
                      setIsAddingTL(true);
                      try {
                        const created = await createTeamLeaderViaRpc({
                          name: newTeamLeader.name.trim(),
                          email: newTeamLeader.email.trim(),
                          phone: newTeamLeader.phone.trim(),
                          institute_id: newTeamLeader.instituteId,
                          password: newTeamLeader.password || 'UthFest@2026',
                        });
                        const instName = institutes.find(i => i.id === newTeamLeader.instituteId)?.shortCode || '';
                        setNewTeamLeader({ name: '', email: '', phone: '', instituteId: '', password: 'UthFest@2026' });
                        setTlSuccess(`Successfully added "${created.name || 'Team Leader'}" (${created.email || ''}) for ${instName}. Password: ${newTeamLeader.password || 'UthFest@2026'}. No email was sent.`);
                        // Refresh list
                        const fresh = await fetchTeamLeaders();
                        setTeamLeaders(fresh);
                      } catch (err: any) {
                        const msg = err.message || '';
                        if (msg.includes('could not find the function')) {
                          setTlError('Setup required: Run the create_team_leader SQL function in Supabase SQL Editor first. Open console (F12) and run: import("/src/lib/seedTeamLeaders.ts").then(m => console.log(m.CREATE_TEAM_LEADER_RPC_SQL))');
                        } else if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('already exists')) {
                          setTlError(`A team leader with this email already exists.`);
                        } else {
                          setTlError(`Failed to add team leader: ${msg}`);
                        }
                      } finally {
                        setIsAddingTL(false);
                      }
                    }}
                  >
                    <Plus size={16} /> {isAddingTL ? 'Adding...' : 'Add Team Leader'}
                  </button>
                </div>

                {/* Seed All Button */}
                <div className="flex items-center gap-3 mb-2 p-3 bg-[#1A1208]/[0.02] border border-[#1A1208]/4 rounded-xl">
                  <button
                    type="button"
                    disabled={isSeedingTLs}
                    className="btn-elite text-xs px-4 py-2 disabled:opacity-50"
                    onClick={async () => {
                      setIsSeedingTLs(true);
                      setTlError('');
                      setTlSuccess('');
                      try {
                        let created = 0;
                        let skipped = 0;
                        const { TEAM_LEADERS, INSTITUTES } = await import('../lib/seedTeamLeaders');
                        // Ensure institutes exist
                        const instMap: string[] = [];
                        for (const inst of INSTITUTES) {
                          const existing = institutes.find(i => i.shortCode === inst.shortCode);
                          if (existing) {
                            instMap.push(existing.id);
                          } else {
                            try {
                              const { addInstitute } = await import('../lib/supabaseApi');
                              const newInst = await addInstitute(inst.name, inst.shortCode);
                              instMap.push(newInst.id);
                            } catch {
                              instMap.push('');
                            }
                          }
                        }
                        for (const tl of TEAM_LEADERS) {
                          const instId = instMap[tl.instituteIndex];
                          if (!instId) { skipped++; continue; }
                          // Check if already exists
                          const exists = teamLeaders.find(t => t.email === tl.email);
                          if (exists) { skipped++; continue; }
                          try {
                            await createTeamLeaderViaRpc({
                              name: tl.name,
                              email: tl.email,
                              phone: tl.phone,
                              institute_id: instId,
                            });
                            created++;
                          } catch {
                            skipped++;
                          }
                        }
                        const fresh = await fetchTeamLeaders();
                        setTeamLeaders(fresh);
                        const freshInstitutes = (await import('../lib/supabaseApi')).fetchInstitutes;
                        const instData = await freshInstitutes();
                        setInstitutes(instData.map((inst: any) => ({ id: inst.id, name: inst.name, shortCode: inst.short_code })));
                        if (created > 0) {
                          setTlSuccess(`Successfully created ${created} team leader${created > 1 ? 's' : ''}${skipped > 0 ? ` (${skipped} already existed)` : ''}. No emails were sent. Total: ${fresh.length} team leaders.`);
                        } else {
                          setTlSuccess(`All ${skipped} team leaders already exist. Total: ${fresh.length} team leaders.`);
                        }
                      } catch (err: any) {
                        const msg = err.message || '';
                        if (msg.includes('could not find the function')) {
                          setTlError('Setup required: Run the create_team_leader SQL function in Supabase SQL Editor first. Open console (F12) and run: import("/src/lib/seedTeamLeaders.ts").then(m => console.log(m.CREATE_TEAM_LEADER_RPC_SQL))');
                        } else {
                          setTlError(`Seed failed: ${msg}`);
                        }
                      } finally {
                        setIsSeedingTLs(false);
                      }
                    }}
                  >
                    {isSeedingTLs ? 'Seeding...' : 'Seed All 30 Team Leaders'}
                  </button>
                  <span className="text-xs text-[#4A3F2F]">Creates all team leaders from the preset list (skips existing). No emails sent.</span>
                </div>
              </div>

              {/* Team Leaders List */}
              <div className="elite-glass p-4 sm:p-8">
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">All Team Leaders ({teamLeaders.length})</h3>
                    <button
                      type="button"
                      onClick={async () => {
                        setTlError('');
                        try {
                          const fresh = await fetchTeamLeaders();
                          setTeamLeaders(fresh);
                          setTlSuccess(`Loaded ${fresh.length} team leader${fresh.length !== 1 ? 's' : ''}.`);
                        } catch (err: any) {
                          setTlError('Failed to refresh: ' + (err.message || 'Unknown error'));
                        }
                      }}
                      className="px-3 py-1.5 elite-glass !rounded-xl text-xs font-bold text-[#6B5D4D] hover:text-brand whitespace-nowrap flex items-center gap-2"
                    >
                      <RefreshCw size={14} /> Refresh
                    </button>
                  </div>
                  <input
                    value={tlSearch}
                    onChange={(e) => setTlSearch(e.target.value)}
                    placeholder="Search by name, email, or institute..."
                    className="bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-2xl px-4 sm:px-5 py-2 sm:py-3 text-sm w-full"
                  />
                </div>

                {(() => {
                  const query = tlSearch.trim().toLowerCase();
                  const filtered = query
                    ? teamLeaders.filter((tl) => {
                      const inst = institutes.find((i) => i.id === tl.institute_id);
                      return (
                        tl.name.toLowerCase().includes(query) ||
                        tl.email.toLowerCase().includes(query) ||
                        (tl.phone || '').includes(query) ||
                        (inst?.name || '').toLowerCase().includes(query) ||
                        (inst?.shortCode || '').toLowerCase().includes(query)
                      );
                    })
                    : teamLeaders;

                  if (filtered.length === 0) {
                    return (
                      <div className="text-[#6B5D4D] text-sm text-center py-8">
                        {teamLeaders.length === 0
                          ? 'No team leaders found. Create one above or run the seed.'
                          : `No results for "${tlSearch}"`}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2 sm:space-y-3">
                      {filtered.map((tl) => {
                        const inst = institutes.find((i) => i.id === tl.institute_id);
                        return (
                          <div key={tl.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#1A1208]/[0.02] border border-[#1A1208]/4 rounded-2xl px-4 sm:px-5 py-3 sm:py-4">
                            <div className="min-w-0">
                              <div className="font-bold text-base truncate">{tl.name}</div>
                              <div className="text-xs text-[#4A3F2F] mt-0.5">{tl.email} • {tl.phone || 'No phone'}</div>
                              <div className="text-xs text-[#4A3F2F] mt-0.5">
                                {inst ? `${inst.name} (${inst.shortCode})` : tl.institute_id}
                                {tl.must_set_password && (
                                  <span className="ml-2 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-400 text-[10px] font-bold">Pending Password</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditModal({
                                  type: 'team_leader',
                                  data: { id: tl.id, name: tl.name, email: tl.email, phone: tl.phone || '', institute_id: tl.institute_id },
                                })}
                                className="px-3 py-1.5 hover:bg-[#1A1208]/[0.05] rounded-lg transition-colors text-[#6B5D4D] hover:text-[#1A1208] text-xs font-semibold"
                              >
                                Edit
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm(`Reset password for ${tl.name} to UthFest@2026?`)) return;
                                  try {
                                    await updateTeamLeader(tl.id, { must_set_password: true });
                                    try {
                                      const { resetTeamLeaderPassword } = await import('../lib/supabaseApi');
                                      await resetTeamLeaderPassword(tl.user_id, 'UthFest@2026');
                                    } catch {
                                      // service_role may not be available
                                    }
                                    setTeamLeaders((prev) => prev.map((t) => t.id === tl.id ? { ...t, must_set_password: true } : t));
                                    setTlSuccess(`Password for "${tl.name}" has been reset to UthFest@2026. They will be asked to set a new password on next login.`);
                                  } catch (err: any) {
                                    setTlError(err.message || 'Reset failed.');
                                  }
                                }}
                                className="px-3 py-1.5 hover:bg-yellow-500/10 rounded-lg transition-colors text-yellow-500/60 hover:text-yellow-400 text-xs font-semibold"
                                title="Reset password"
                              >
                                Reset PW
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ type: 'team_leader', id: tl.id, name: tl.name })}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 hover:text-red-300"
                                title="Delete team leader"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {activeTab === 'role-assign' && (
            <div className="space-y-6">
              {/* Create Manager Form */}
              <div className="elite-glass p-4 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Role Assign</h2>
                <p className="text-[#4A3F2F] text-sm mb-2">Create managers with limited access to specific admin sections.</p>
                <p className="text-[#6B5D4D] text-xs mb-6">If the email already exists, this adds another role to the same person.</p>

                {managerError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 text-sm text-red-400 flex items-start gap-2">
                    <span className="text-red-400 font-bold shrink-0">✗</span>
                    <span>{managerError}</span>
                  </div>
                )}
                {managerSuccess && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-4 text-sm text-green-400 flex items-start gap-2">
                    <span className="text-green-400 font-bold shrink-0">✓</span>
                    <span>{managerSuccess}</span>
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleCreateManager}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      value={managerForm.email}
                      onChange={(e) => setManagerForm({ ...managerForm, email: e.target.value })}
                      placeholder="Manager email"
                      type="email"
                      className="bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-2xl px-4 sm:px-5 py-2 sm:py-3 text-sm"
                    />
                    <input
                      value={managerForm.password}
                      onChange={(e) => setManagerForm({ ...managerForm, password: e.target.value })}
                      placeholder="Temporary password"
                      type="text"
                      className="bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-2xl px-4 sm:px-5 py-2 sm:py-3 text-sm"
                    />
                  </div>

                  <div className="bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-2xl px-4 sm:px-5 py-3">
                    <label className="text-xs font-medium text-[#4A3F2F] uppercase tracking-wider mb-3 block">
                      Select Roles (Choose one or more)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {managerRoles.map((role) => (
                        <label
                          key={role}
                          className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-[#1A1208]/[0.03] transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={managerForm.roles.includes(role)}
                            onChange={(e) => {
                              const newRoles = e.target.checked
                                ? [...managerForm.roles, role]
                                : managerForm.roles.filter((r) => r !== role);
                              setManagerForm({ ...managerForm, roles: newRoles });
                            }}
                            className="w-4 h-4 rounded border-[#1A1208]/8 bg-[#1A1208]/[0.03] text-brand focus:ring-brand focus:ring-offset-0"
                          />
                          <span className="text-sm capitalize">{role.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-[#4A3F2F]">
                      {managerForm.roles.length} role(s) selected
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingManager || managerForm.roles.length === 0}
                    className="btn-elite justify-center text-sm disabled:opacity-50 w-full sm:w-auto"
                  >
                    <Plus size={16} /> {isCreatingManager ? 'Creating...' : 'Create Manager'}
                  </button>
                </form>
              </div>

              {/* Managers Table */}
              <div className="elite-glass p-4 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold">Managers</h3>
                    <div className="text-xs text-[#4A3F2F] mt-1">
                      {groupedManagers.length} user{groupedManagers.length !== 1 ? 's' : ''} with {managers.length} role{managers.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      setManagerError('');
                      try {
                        const fresh = await fetchManagers();
                        setManagers(fresh);
                        setManagerSuccess(`Loaded ${fresh.length} manager${fresh.length !== 1 ? 's' : ''}.`);
                      } catch (err: any) {
                        setManagerError('Failed to refresh: ' + (err.message || 'Unknown error'));
                      }
                    }}
                    className="px-3 py-1.5 elite-glass !rounded-xl text-xs font-bold text-[#6B5D4D] hover:text-brand whitespace-nowrap flex items-center gap-2"
                  >
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>

                {groupedManagers.length === 0 ? (
                  <div className="text-[#6B5D4D] text-sm text-center py-12">No managers created yet.</div>
                ) : (
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#1A1208]/8">
                          <th className="text-left px-4 py-3 font-bold text-[#6B5D4D]">Email</th>
                          <th className="text-left px-4 py-3 font-bold text-[#6B5D4D]">Roles</th>
                          <th className="text-left px-4 py-3 font-bold text-[#6B5D4D]">Status</th>
                          <th className="text-right px-4 py-3 font-bold text-[#6B5D4D]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedManagers.map((managerUser) => {
                          const assignedRoles = managerUser.roles.map((roleRow) => roleRow.role);
                          const availableRoles = managerRoles.filter((role) => !assignedRoles.includes(role));

                          return (
                            <tr key={managerUser.userId} className="border-b border-[#1A1208]/4 hover:bg-[#1A1208]/[0.02] transition-colors">
                              <td className="px-4 py-4">
                                <div className="font-mono text-[#2A1F0F] break-all">{managerUser.email}</div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex flex-wrap gap-2">
                                  {managerUser.roles.map((roleRow) => (
                                    <div
                                      key={roleRow.id}
                                      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#1A1208]/[0.03] border border-[#1A1208]/8 text-xs whitespace-nowrap group"
                                    >
                                      <span className="text-[#2A1F0F] uppercase tracking-wide font-semibold">{roleRow.role.replace('_', ' ')}</span>
                                      <button
                                        onClick={() => {
                                          if (confirm(`Remove role "${roleRow.role.replace('_', ' ')}" from ${managerUser.email}?`)) {
                                            handleDeleteManager(roleRow.id);
                                          }
                                        }}
                                        className="text-red-400/0 group-hover:text-red-400 transition-colors"
                                        title="Remove this role"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className={`text-xs font-semibold ${managerUser.roles.some((r) => r.is_active === false)
                                  ? 'text-yellow-400'
                                  : 'text-green-400'
                                  }`}>
                                  {managerUser.roles.some((r) => r.is_active === false) ? 'Partial' : 'Active'}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {availableRoles.length > 0 && (
                                    <button
                                      onClick={() => setModalState({
                                        type: 'add-role',
                                        userId: managerUser.userId,
                                        email: managerUser.email,
                                        availableRoles,
                                      })}
                                      className="px-3 py-1.5 text-xs font-bold text-brand/80 hover:text-brand transition-colors"
                                      title="Add another role"
                                    >
                                      <Plus size={14} />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setModalState({
                                      type: 'edit-user',
                                      userId: managerUser.userId,
                                      email: managerUser.email,
                                    })}
                                    className="px-3 py-1.5 text-xs font-bold text-[#6B5D4D] hover:text-[#1A1208] transition-colors"
                                    title="Edit email or password"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Delete manager ${managerUser.email}? This will remove all their roles.`)) {
                                        handleDeleteManagerUser({ userId: managerUser.userId, email: managerUser.email });
                                      }
                                    }}
                                    className="px-3 py-1.5 text-xs font-bold text-red-400/60 hover:text-red-400 transition-colors"
                                    title="Delete entire manager account"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Edit User Modal */}
              {/* Edit User Modal */}
              {modalState?.type === 'edit-user' && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/95 backdrop-blur-2xl border border-[#1A1208]/8 rounded-[32px] p-8 sm:p-10 max-w-md w-full relative"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl sm:text-2xl font-black tracking-tighter uppercase">Edit Manager</h3>
                      <button
                        onClick={() => {
                          setModalState(null);
                          cancelEditManagerUser();
                        }}
                        className="p-1 hover:bg-[#1A1208]/[0.05] rounded-lg transition-colors text-[#6B5D4D] hover:text-[#1A1208]"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="space-y-6 mb-10">
                      <div>
                        <label className="text-[10px] font-black text-[#8B7D6B] uppercase tracking-[0.2em] mb-2 block">Email</label>
                        <input
                          value={editUserForm.email}
                          onChange={(e) => setEditUserForm((prev) => ({ ...prev, email: e.target.value }))}
                          type="email"
                          placeholder="new@email.com"
                          className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-2xl px-5 py-4 text-sm font-medium focus:border-brand/50 focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-[#8B7D6B] uppercase tracking-[0.2em] mb-2 block">New Password (optional)</label>
                        <input
                          value={editUserForm.password}
                          onChange={(e) => setEditUserForm((prev) => ({ ...prev, password: e.target.value }))}
                          type="text"
                          placeholder="Leave blank to keep current"
                          className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-2xl px-5 py-4 text-sm font-medium focus:border-brand/50 focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        disabled={updatingUserId === modalState?.userId}
                        onClick={() => {
                          handleSaveManagerUser({
                            userId: modalState?.userId || '',
                            currentEmail: modalState?.email || '',
                          });
                          setModalState(null);
                        }}
                        className="flex-1 bg-brand hover:bg-brand/90 text-white rounded-2xl py-4 font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand/20 disabled:opacity-50"
                      >
                        {updatingUserId === modalState?.userId ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => {
                          setModalState(null);
                          cancelEditManagerUser();
                        }}
                        className="flex-1 bg-[#1A1208]/[0.05] hover:bg-[#1A1208]/[0.08] text-[#6B5D4D] rounded-2xl py-4 font-black uppercase tracking-widest text-xs transition-all hover:text-[#1A1208]"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Add Role Modal */}
              {modalState?.type === 'add-role' && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/95 backdrop-blur-2xl border border-[#1A1208]/8 rounded-[32px] p-8 sm:p-10 max-w-md w-full relative"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tighter uppercase">Add Role</h3>
                        <p className="text-[10px] font-bold text-[#A89880] mt-1 uppercase tracking-[0.1em]">{modalState.email}</p>
                      </div>
                      <button
                        onClick={() => setModalState(null)}
                        className="p-1 hover:bg-[#1A1208]/[0.05] rounded-lg transition-colors text-[#6B5D4D] hover:text-[#1A1208]"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="mb-10">
                      <label className="text-[10px] font-black text-[#8B7D6B] uppercase tracking-[0.2em] mb-2 block">Available Roles</label>
                      <select
                        value={roleDraftByUserId[modalState.userId] || modalState.availableRoles?.[0] || ''}
                        onChange={(e) => setRoleDraftByUserId((prev) => ({ ...prev, [modalState.userId]: e.target.value }))}
                        className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-2xl px-5 py-4 text-sm font-medium focus:border-brand/50 focus:ring-2 focus:ring-brand/20 outline-none transition-all text-[#1A1208]"
                        style={{ colorScheme: 'light' }}
                      >
                        {(modalState.availableRoles || []).map((role) => (
                          <option key={role} value={role} style={{ color: '#1A1208', backgroundColor: '#FEFCF8' }}>
                            {role.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        disabled={addingRoleForUserId === modalState.userId}
                        onClick={() => {
                          handleAddRoleToExistingManager({
                            userId: modalState.userId,
                            email: modalState.email,
                            role: roleDraftByUserId[modalState.userId] || modalState.availableRoles?.[0] || '',
                          });
                          setModalState(null);
                        }}
                        className="flex-1 bg-brand hover:bg-brand/90 text-white rounded-2xl py-4 font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand/20 disabled:opacity-50"
                      >
                        {addingRoleForUserId === modalState.userId ? 'Adding...' : 'Add Role'}
                      </button>
                      <button
                        onClick={() => setModalState(null)}
                        className="flex-1 bg-[#1A1208]/[0.05] hover:bg-[#1A1208]/[0.08] text-[#6B5D4D] rounded-2xl py-4 font-black uppercase tracking-widest text-xs transition-all hover:text-[#1A1208]"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          )}



          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
              {/* Scoreboard Settings */}
              <div className="elite-glass p-4 sm:p-6 mb-6">
                <div>
                  <h3 className="text-lg font-bold mb-2">Scoreboard Settings</h3>
                  <p className="text-[#4A3F2F] text-sm mb-4">Control the visibility of the Scoreboard across the portal.</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-[#1A1208]/[0.02] border border-[#1A1208]/4 rounded-2xl px-3 sm:px-4 py-3 sm:py-4">
                  <div>
                    <div className="font-bold text-sm">Scoreboard Publication Status</div>
                    <div className="text-xs text-[#4A3F2F] mt-1">
                      {scoreboardPublished ? '✓ Published - Visible to all users' : '✗ Unpublished - Hidden from navbar'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleScoreboard}
                    className={`px-3 sm:px-4 py-2 elite-glass !rounded-xl text-xs font-bold whitespace-nowrap transition-all ${scoreboardPublished
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-[#1A1208]/[0.03] text-[#4A3F2F] border-[#1A1208]/8 hover:text-[#1A1208]'
                      }`}
                  >
                    {scoreboardPublished ? 'Published' : 'Unpublished'}
                  </button>
                </div>
              </div>

              {/* New Score Form */}
              <div className="elite-glass p-4 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Leaderboard Manager</h2>

                <form onSubmit={handleScoreSubmit} className="bg-[#1A1208]/[0.02] border border-[#1A1208]/4 rounded-2xl p-4 mb-6">
                  <h3 className="text-lg font-bold mb-4">{isEditingScore ? 'Edit Score' : 'Add Score'}</h3>
                  {scoreFormError ? (
                    <div className="mb-4 text-xs text-red-400 font-medium">{scoreFormError}</div>
                  ) : null}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Step 1: Category */}
                    <div>
                      <label className="block text-xs font-medium text-[#4A3F2F] mb-1">Event Type</label>
                      <select
                        value={scoreFormCategory}
                        onChange={(e) => { setScoreFormCategory(e.target.value); setScoreForm({ ...scoreForm, eventId: '', instituteId: '', participantId: '', points: 0, rank: 0 }); }}
                        className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-3 py-2 text-[#1A1208] text-sm"
                        required
                        style={{ colorScheme: 'light' }}
                      >
                        <option value="" className="text-gray-500">Select Category</option>
                        {['Dance', 'Music', 'Theatre', 'Literary', 'Fine Arts', 'Diverse'].map((cat) => (
                          <option key={cat} value={cat} className="text-[#1A1208] bg-[#1a1a1a]">{cat}</option>
                        ))}
                      </select>
                    </div>
                    {/* Step 2: Event (filtered by category) */}
                    <div>
                      <label className="block text-xs font-medium text-[#4A3F2F] mb-1">Event</label>
                      <select
                        value={scoreForm.eventId}
                        onChange={(e) => setScoreForm({ ...scoreForm, eventId: e.target.value, instituteId: '', participantId: '', points: 0, rank: 0 })}
                        className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-3 py-2 text-[#1A1208] text-sm"
                        required
                        disabled={!scoreFormCategory}
                        style={{ colorScheme: 'light' }}
                      >
                        <option value="" className="text-gray-500">{scoreFormCategory ? 'Select Event' : 'Pick a category first'}</option>
                        {events
                          .filter((e) => e.category === scoreFormCategory)
                          .sort((a, b) => { const at = a.is_team ? 1 : 0; const bt = b.is_team ? 1 : 0; if (at !== bt) return at - bt; return a.name.localeCompare(b.name); })
                          .map((e) => (
                            <option key={e.id} value={e.id} className="text-[#1A1208] bg-[#1a1a1a]">{e.name} ({e.is_team ? 'Group' : 'Solo'})</option>
                          ))}
                      </select>
                    </div>

                    {scoreForm.eventId && (
                      <>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-[#4A3F2F] mb-1">
                            {eventById.get(scoreForm.eventId)?.is_team ? 'Winning Team (Institute)' : 'Winning Participant'}
                          </label>
                          {eventById.get(scoreForm.eventId)?.is_team ? (
                            <select
                              value={scoreForm.instituteId}
                              onChange={(e) => setScoreForm({ ...scoreForm, instituteId: e.target.value, participantId: '' })}
                              className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-3 py-2 text-[#1A1208] text-sm"
                              required
                              style={{ colorScheme: 'light' }}
                            >
                              <option value="" className="text-gray-500">Select Institute</option>
                              {getValidInstitutesByEvent(scoreForm.eventId).map((i) => (
                                <option key={i.id} value={i.id} className="text-[#1A1208] bg-[#1a1a1a]">{i.name}</option>
                              ))}
                            </select>
                          ) : (
                            <select
                              value={scoreForm.participantId}
                              onChange={(e) => {
                                const pid = e.target.value;
                                const p = participants.find(p => p.id === pid);
                                setScoreForm({ ...scoreForm, participantId: pid, instituteId: p?.institute_id || '' });
                              }}
                              className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-3 py-2 text-[#1A1208] text-sm"
                              required
                              style={{ colorScheme: 'light' }}
                            >
                              <option value="" className="text-gray-500">Select Participant</option>
                              {participants
                                .filter(p => p.event_id === scoreForm.eventId && p.role === 'participant')
                                .map((p) => (
                                  <option key={p.id} value={p.id} className="text-[#1A1208] bg-[#1a1a1a]">
                                    {p.full_name} ({instituteById.get(p.institute_id)?.shortCode}) - {getParticipantDisplayName(p.id, p.institute_id, scoreForm.eventId)}
                                  </option>
                                ))}
                            </select>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#4A3F2F] mb-1">Position</label>
                          <select
                            value={scoreForm.rank}
                            onChange={(e) => {
                              const r = parseInt(e.target.value);
                              const config = scoreConfig[scoreForm.eventId] || { first: 10, second: 7, third: 5, participation: 0 };
                              let pts = 0;
                              if (r === 1) pts = config.first;
                              if (r === 2) pts = config.second;
                              if (r === 3) pts = config.third;
                              setScoreForm({ ...scoreForm, rank: r, points: pts });
                            }}
                            className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-3 py-2 text-[#1A1208] text-sm"
                            required
                            style={{ colorScheme: 'light' }}
                          >
                            <option value="0" className="text-gray-500">Select Position</option>
                            <option value="1" className="bg-[#FEFCF8] text-[#1A1208]">Winner</option>
                            <option value="2" className="bg-[#FEFCF8] text-[#1A1208]">1st Runner Up</option>
                            <option value="3" className="bg-[#FEFCF8] text-[#1A1208]">2nd Runner Up</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#4A3F2F] mb-1">Points (Auto)</label>
                          <input
                            type="number"
                            value={scoreForm.points}
                            readOnly
                            className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-3 py-2 text-sm text-[#4A3F2F] cursor-not-allowed"
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    {isEditingScore && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingScore(false);
                          setScoreFormCategory('');
                          setScoreForm({ eventId: '', instituteId: '', participantId: '', rank: 0, points: 0, isPublished: true });
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-[#6B5D4D] hover:text-[#1A1208]"
                      >
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="btn-elite px-6 py-2 rounded-xl text-xs font-bold">
                      {isEditingScore ? 'Update Score' : 'Add Score'}
                    </button>
                  </div>
                </form>

                <div className="space-y-2">
                  {/* Event Filter for Scores */}
                  <div className="flex flex-col gap-4 mb-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold">Scores List</h3>
                    </div>
                    <CategoryTabs />
                  </div>

                  {scores.filter(s => {
                    const evt = eventById.get(s.event_id);
                    const matchesCategory = activeCategory === 'ALL' || evt?.category.toUpperCase() === activeCategory;
                    const matchesEvent = !selectedEventId || s.event_id === selectedEventId;
                    return matchesCategory && matchesEvent;
                  }).map((score) => (
                    <div key={score.id} className="flex justify-between items-center bg-[#1A1208]/[0.02] border border-[#1A1208]/4 rounded-2xl px-4 py-3">
                      <div>
                        <div className="font-bold text-sm">
                          {eventById.get(score.event_id)?.name} -{' '}
                          {score.participant_id
                            ? participants.find(p => p.id === score.participant_id)?.full_name
                            : instituteById.get(score.institute_id)?.name}
                        </div>
                        <div className="text-xs text-[#4A3F2F]">
                          {score.rank === 1 ? 'Winner' : score.rank === 2 ? '1st Runner Up' : score.rank === 3 ? '2nd Runner Up' : `Rank ${score.rank}`} • {score.points} pts
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const evt = eventById.get(score.event_id);
                            setScoreFormCategory(evt?.category || '');
                            setScoreForm({
                              id: score.id,
                              eventId: score.event_id,
                              instituteId: score.institute_id,
                              participantId: score.participant_id || '',
                              rank: score.rank || 0,
                              points: score.points || 0,
                              isPublished: score.is_published ?? true,
                            });
                            setIsEditingScore(true);
                          }}
                          className="p-2 hover:bg-[#1A1208]/[0.05] rounded-lg text-[#6B5D4D] hover:text-[#1A1208] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'score', id: score.id, name: 'Score Entry' })}
                          className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {scores.length === 0 && (
                    <div className="text-center text-[#4A3F2F] py-8 text-sm">No scores recorded yet.</div>
                  )}
                </div>

                {/* Final Standings */}
                <div className="mt-8 pt-8 border-t border-[#1A1208]/8">
                  <h3 className="text-xl font-bold mb-4">Final Standings (Overall)</h3>
                  <div className="space-y-2">
                    {Object.entries(scores.reduce((acc, score) => {
                      acc[score.institute_id] = (acc[score.institute_id] || 0) + (score.points || 0);
                      return acc;
                    }, {} as Record<string, number>))
                      .map(([instId, points]) => ({ id: instId, points }))
                      .sort((a, b) => b.points - a.points)
                      .map((standing, index) => (
                        <div key={standing.id} className="flex justify-between items-center bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-brand/20 text-brand flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="font-bold">{instituteById.get(standing.id)?.name}</span>
                          </div>
                          <span className="font-bold text-brand">{standing.points} pts</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/95 backdrop-blur-2xl border border-[#1A1208]/8 rounded-[32px] p-8 sm:p-10 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl sm:text-2xl font-black tracking-tighter uppercase text-red-500">
                  Delete {deleteConfirm.type}
                </h3>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="p-1 hover:bg-[#1A1208]/[0.05] rounded-lg transition-colors text-[#6B5D4D] hover:text-[#1A1208]"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-10">
                <p className="text-sm font-medium text-[#4A3F2F] leading-relaxed">
                  Are you sure you want to delete <span className="font-black text-[#1A1208]">{deleteConfirm.name}</span>?
                  <br />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#8B7D6B] mt-2 block">
                    This action cannot be undone.
                  </span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={async () => {
                    if (!deleteConfirm) return;
                    setIsDeleting(true);
                    await handleDelete();
                  }}
                  disabled={isDeleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-2xl py-4 font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-[#1A1208]/[0.05] hover:bg-[#1A1208]/[0.08] text-[#6B5D4D] rounded-2xl py-4 font-black uppercase tracking-widest text-xs transition-all hover:text-[#1A1208]"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {selectedDeleteConfirm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/95 backdrop-blur-2xl border border-[#1A1208]/8 rounded-[32px] p-8 sm:p-10 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl sm:text-2xl font-black tracking-tighter uppercase text-red-500">
                  Bulk Delete
                </h3>
                <button
                  onClick={() => setSelectedDeleteConfirm(false)}
                  className="p-1 hover:bg-[#1A1208]/[0.05] rounded-lg transition-colors text-[#6B5D4D] hover:text-[#1A1208]"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-10">
                <p className="text-sm font-medium text-[#4A3F2F] leading-relaxed">
                  Are you sure you want to delete <span className="font-black text-[#1A1208]">{selectedParticipantIds.size}</span> selected participant(s)?
                  <br />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#8B7D6B] mt-2 block">
                    This action cannot be undone.
                  </span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-2xl py-4 font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  {isBulkDeleting ? 'Deleting...' : 'Confirm Bulk Delete'}
                </button>
                <button
                  onClick={() => setSelectedDeleteConfirm(false)}
                  className="flex-1 bg-[#1A1208]/[0.05] hover:bg-[#1A1208]/[0.08] text-[#6B5D4D] rounded-2xl py-4 font-black uppercase tracking-widest text-xs transition-all hover:text-[#1A1208]"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Modals */}
        {editModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto no-scrollbar">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/95 backdrop-blur-2xl border border-[#1A1208]/8 rounded-[32px] p-6 sm:p-10 max-w-2xl w-full relative my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl sm:text-2xl font-black tracking-tighter uppercase">
                  Edit {editModal.type.replace('_', ' ')}
                </h3>
                <button
                  onClick={() => setEditModal(null)}
                  className="p-1 hover:bg-[#1A1208]/[0.05] rounded-lg transition-colors text-[#6B5D4D] hover:text-[#1A1208]"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="space-y-4">
                {editModal.type === 'institute' && editModal.data && (
                  <>
                    <div>
                      <label className="block text-xs text-[#4A3F2F] mb-1">Name</label>
                      <input
                        value={editModal.data.name || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, name: e.target.value } })}
                        className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#4A3F2F] mb-1">Short Code</label>
                      <input
                        value={editModal.data.shortCode || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, shortCode: e.target.value } })}
                        className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                  </>
                )}

                {editModal.type === 'participant' && editModal.data && (
                  <>
                    <input
                      value={editModal.data.full_name || ''}
                      onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, full_name: e.target.value } })}
                      placeholder="Full Name"
                      className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-3 py-2 text-sm"
                    />
                    <input
                      value={editModal.data.enrollment_no || ''}
                      onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, enrollment_no: e.target.value } })}
                      placeholder="Enrollment No"
                      className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-3 py-2 text-sm"
                    />
                    <select
                      value={editModal.data.event_id || ''}
                      onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, event_id: e.target.value } })}
                      className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-3 py-2 text-sm text-[#1A1208]"
                      style={{ colorScheme: 'light' }}
                    >
                      {events.map((e) => (
                        <option key={e.id} value={e.id} className="bg-[#FEFCF8] text-[#1A1208]">{e.name}</option>
                      ))}
                    </select>
                    <select
                      value={editModal.data.institute_id || ''}
                      onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, institute_id: e.target.value } })}
                      className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-3 py-2 text-sm text-[#1A1208]"
                      style={{ colorScheme: 'light' }}
                    >
                      {institutes.map((i) => (
                        <option key={i.id} value={i.id} className="bg-[#FEFCF8] text-[#1A1208]">{i.name}</option>
                      ))}
                    </select>
                  </>
                )}

                {editModal.type === 'schedule' && editModal.data && (
                  <>
                    <select
                      value={editModal.data.day || ''}
                      onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, day: e.target.value } })}
                      className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-3 py-2 text-sm text-[#1A1208]"
                      style={{ colorScheme: 'light' }}
                    >
                      <option value="Day 1" className="bg-[#FEFCF8] text-[#1A1208]">Day 1</option>
                      <option value="Day 2" className="bg-[#FEFCF8] text-[#1A1208]">Day 2</option>
                      <option value="Day 3" className="bg-[#FEFCF8] text-[#1A1208]">Day 3</option>
                    </select>
                    <input
                      value={editModal.data.start_time || ''}
                      onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, start_time: e.target.value } })}
                      placeholder="Start Time"
                      className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-3 py-2 text-sm"
                    />
                    <input
                      value={editModal.data.venue || ''}
                      onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, venue: e.target.value } })}
                      placeholder="Venue"
                      className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-3 py-2 text-sm"
                    />
                  </>
                )}

                {editModal.type === 'team_leader' && editModal.data && (
                  <>
                    <div>
                      <label className="block text-xs text-[#4A3F2F] mb-1">Name</label>
                      <input
                        value={editModal.data.name || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, name: e.target.value } })}
                        className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#4A3F2F] mb-1">Email</label>
                      <input
                        value={editModal.data.email || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, email: e.target.value } })}
                        className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#4A3F2F] mb-1">Phone</label>
                      <input
                        value={editModal.data.phone || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, phone: e.target.value } })}
                        className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#4A3F2F] mb-1">Institute</label>
                      <select
                        value={editModal.data.institute_id || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, institute_id: e.target.value } })}
                        className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl px-3 py-2 text-sm text-[#1A1208]"
                        style={{ colorScheme: 'light' }}
                      >
                        {institutes.map((i) => (
                          <option key={i.id} value={i.id} className="bg-[#FEFCF8] text-[#1A1208]">{i.name} ({i.shortCode})</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-brand hover:bg-brand/90 text-white rounded-2xl py-4 font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand/20"
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditModal(null)}
                    className="flex-1 bg-[#1A1208]/[0.05] hover:bg-[#1A1208]/[0.08] text-[#6B5D4D] rounded-2xl py-4 font-black uppercase tracking-widest text-xs transition-all hover:text-[#1A1208]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Group Detail Modal */}
        {groupDetailModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto no-scrollbar">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/95 backdrop-blur-2xl border border-[#1A1208]/8 rounded-[32px] p-8 sm:p-10 max-w-2xl w-full relative my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tighter uppercase whitespace-normal break-words">
                    {eventById.get(groupDetailModal.eventId)?.name}
                  </h3>
                  <p className="text-[10px] font-black text-[#8B7D6B] uppercase tracking-[0.2em] mt-1">
                    {instituteById.get(groupDetailModal.instituteId)?.name}
                  </p>
                </div>
                <button
                  onClick={() => setGroupDetailModal(null)}
                  className="p-1 hover:bg-[#1A1208]/[0.05] rounded-lg transition-colors text-[#6B5D4D] hover:text-[#1A1208]"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                {participants
                  .filter(
                    (p) => p.event_id === groupDetailModal.eventId && p.institute_id === groupDetailModal.instituteId
                  )
                  .sort((a, b) => a.full_name.localeCompare(b.full_name))
                  .map((member) => (
                    <div key={member.id} className="group bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-[24px] p-5 transition-all hover:bg-[#1A1208]/[0.05]">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="font-black text-base text-[#1A1208]">{member.full_name}</div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-brand">
                              {member.role}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B7D6B]">
                              {member.enrollment_no || 'No Enrollment'}
                            </span>
                          </div>
                          {(member.email || member.phone) && (
                            <div className="mt-3 pt-3 border-t border-[#1A1208]/4 flex flex-wrap gap-x-4 gap-y-1">
                              {member.email && (
                                <span className="text-xs font-medium text-[#6B5D4D]">{member.email}</span>
                              )}
                              {member.phone && (
                                <span className="text-xs font-medium text-[#6B5D4D]">{member.phone}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditModal({ type: 'participant', data: member });
                            setGroupDetailModal(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-white border border-[#1A1208]/8 shadow-sm text-[10px] font-black uppercase tracking-wider text-[#6B5D4D] hover:text-brand transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setGroupDetailModal(null)}
                  className="w-full bg-[#1A1208]/[0.05] hover:bg-[#1A1208]/[0.08] text-[#6B5D4D] rounded-2xl py-4 font-black uppercase tracking-widest text-xs transition-all hover:text-[#1A1208]"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Password Modal */}
        {passwordModal.type && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto no-scrollbar">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/95 backdrop-blur-2xl border border-[#1A1208]/8 rounded-[32px] p-8 sm:p-10 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl sm:text-2xl font-black tracking-tighter uppercase">
                  {passwordModal.type === 'access' ? 'Leaderboard Access' : 'Publish Access'}
                </h3>
                <button
                  onClick={() => setPasswordModal({ type: null, password: '' })}
                  className="p-1 hover:bg-[#1A1208]/[0.05] rounded-lg transition-colors text-[#6B5D4D] hover:text-[#1A1208]"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePasswordSubmit();
                }}
                className="space-y-6"
              >
                <div>
                  <label className="text-[10px] font-black text-[#8B7D6B] uppercase tracking-[0.2em] mb-2 block">
                    Security Password
                  </label>
                  <div className="relative">
                    <input
                      type={showModalPassword ? 'text' : 'password'}
                      value={passwordModal.password}
                      onChange={(e) => setPasswordModal({ ...passwordModal, password: e.target.value })}
                      placeholder="Enter administrative password"
                      className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-2xl px-5 py-4 pr-12 text-sm focus:border-brand/50 focus:ring-2 focus:ring-brand/20 outline-none font-medium transition-all"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowModalPassword(!showModalPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B5D4D]/50 hover:text-brand transition-colors"
                    >
                      {showModalPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="mt-2 text-[10px] font-medium text-[#A89880] uppercase tracking-wider">
                    Administrative access required to proceed
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-brand hover:bg-brand/90 text-white rounded-2xl py-4 font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand/20"
                  >
                    Confirm Access
                  </button>
                  <button
                    type="button"
                    onClick={() => setPasswordModal({ type: null, password: '' })}
                    className="flex-1 bg-[#1A1208]/[0.05] hover:bg-[#1A1208]/[0.08] text-[#6B5D4D] rounded-2xl py-4 font-black uppercase tracking-widest text-xs transition-all hover:text-[#1A1208]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div >
    </div >
  );
};

export default Admin;
