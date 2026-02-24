/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  BarChart3,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Download,
  Eye,
  EyeOff,
  GripVertical,
  Lock,
  LogOut,
  Menu,
  Mic2,
  Minus,
  Music,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Theater,
  Trash2,
  Trophy,
  Upload,
  User,
  Users,
  X,
} from 'lucide-react';
import ExcelJS from 'exceljs';
import logoImage from '../assets/images/UTU.png';
import {
  addParticipant,
  addStudentRecord,
  bulkAddParticipants,
  bulkAddStudents,
  deleteParticipant,
  deleteStudentRecord,
  fetchEvents,
  fetchParticipantsByInstitute,
  fetchStudentsByInstitute,
  fetchTeamLeaderByUserId,
  loginWithPassword,
  signOut,
  updateStudentRecord,
} from '../lib/supabaseApi';
import { supabase } from '../lib/supabase';
import type { EventRow, ParticipantRow, StudentRow, TeamLeaderRow } from '../lib/supabaseApi';
import SetPassword from './SetPassword';

const CATEGORIES = ['All', 'Dance', 'Music', 'Theatre', 'Literary', 'Fine Arts', 'Diverse'] as const;
const MAX_EVENTS_PER_STUDENT = 3;
const CATEGORY_ORDER = ['Dance', 'Music', 'Theatre', 'Literary', 'Fine Arts', 'Diverse'];

type OfficialEventLimit = {
  minTeamSize: number;
  maxTeamSize: number;
  maxEntries: number;
  maxAccompanists: number | null;
};

const normalizeEventName = (name: string) =>
  name
    .toLowerCase()
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/[()]/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const OFFICIAL_EVENT_LIMITS: Record<string, OfficialEventLimit> = {
  'classical dance': { minTeamSize: 1, maxTeamSize: 1, maxEntries: 2, maxAccompanists: 5 },
  'utu best dancer': { minTeamSize: 1, maxTeamSize: 1, maxEntries: 2, maxAccompanists: 5 },
  'folk tribal dance': { minTeamSize: 8, maxTeamSize: 10, maxEntries: 1, maxAccompanists: 3 },
  'free style contemporary bollywood dance': { minTeamSize: 8, maxTeamSize: 10, maxEntries: 1, maxAccompanists: 5 },
  'light indian vocal': { minTeamSize: 1, maxTeamSize: 1, maxEntries: 2, maxAccompanists: 3 },
  'western vocal': { minTeamSize: 1, maxTeamSize: 1, maxEntries: 2, maxAccompanists: 3 },
  'bollywood filmy vocal': { minTeamSize: 1, maxTeamSize: 1, maxEntries: 2, maxAccompanists: 3 },
  'indian song': { minTeamSize: 3, maxTeamSize: 4, maxEntries: 1, maxAccompanists: 1 },
  'mono acting': { minTeamSize: 1, maxTeamSize: 1, maxEntries: 2, maxAccompanists: 0 },
  mimicry: { minTeamSize: 1, maxTeamSize: 1, maxEntries: 2, maxAccompanists: 0 },
  mime: { minTeamSize: 6, maxTeamSize: 6, maxEntries: 1, maxAccompanists: 0 },
  skit: { minTeamSize: 3, maxTeamSize: 6, maxEntries: 1, maxAccompanists: 4 },
  'one act play drama': { minTeamSize: 3, maxTeamSize: 9, maxEntries: 1, maxAccompanists: 8 },
  'short film making': { minTeamSize: 3, maxTeamSize: 6, maxEntries: 1, maxAccompanists: 0 },
  elocution: { minTeamSize: 1, maxTeamSize: 1, maxEntries: 2, maxAccompanists: 0 },
  'poem recitation': { minTeamSize: 1, maxTeamSize: 1, maxEntries: 2, maxAccompanists: 0 },
  quiz: { minTeamSize: 3, maxTeamSize: 3, maxEntries: 1, maxAccompanists: 0 },
  debate: { minTeamSize: 2, maxTeamSize: 2, maxEntries: 1, maxAccompanists: 0 },
  'poster making': { minTeamSize: 1, maxTeamSize: 1, maxEntries: 2, maxAccompanists: 0 },
  'on the spot painting': { minTeamSize: 1, maxTeamSize: 1, maxEntries: 2, maxAccompanists: 0 },
  cartooning: { minTeamSize: 1, maxTeamSize: 1, maxEntries: 2, maxAccompanists: 0 },
  collage: { minTeamSize: 1, maxTeamSize: 1, maxEntries: 2, maxAccompanists: 0 },
  'clay modelling': { minTeamSize: 1, maxTeamSize: 1, maxEntries: 2, maxAccompanists: 0 },
  rangoli: { minTeamSize: 1, maxTeamSize: 1, maxEntries: 2, maxAccompanists: 0 },
  mehndi: { minTeamSize: 1, maxTeamSize: 1, maxEntries: 2, maxAccompanists: 1 },
  'fashion show': { minTeamSize: 12, maxTeamSize: 16, maxEntries: 1, maxAccompanists: null },
  'uth icon': { minTeamSize: 1, maxTeamSize: 1, maxEntries: 2, maxAccompanists: 8 },
  'show reels': { minTeamSize: 2, maxTeamSize: 3, maxEntries: 2, maxAccompanists: 0 },
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

const TeamLeaderDashboard = () => {
  // ── Auth ──
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [teamLeader, setTeamLeader] = useState<TeamLeaderRow | null>(null);
  const [mustSetPassword, setMustSetPassword] = useState(false);

  // ── Data ──
  const [events, setEvents] = useState<EventRow[]>([]);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);

  // ── UI ──
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'assign'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');

  // ── Students tab ──
  const [studentForm, setStudentForm] = useState({ fullName: '', enrollmentNo: '', phone: '', email: '' });
  const [studentSearch, setStudentSearch] = useState('');
  const [studentFilter, setStudentFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [studentError, setStudentError] = useState('');
  const [studentSuccess, setStudentSuccess] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editStudentModal, setEditStudentModal] = useState<StudentRow | null>(null);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [deleteStudentConfirm, setDeleteStudentConfirm] = useState<StudentRow | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const studentNameRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Excel Import Review ──
  const [importReview, setImportReview] = useState<{
    rowNum: number; fullName: string; enrollmentNo: string; phone: string; email: string; error: string;
  }[] | null>(null);

  // ── Assign tab ──
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [assignSearch, setAssignSearch] = useState('');
  const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null);
  const [dragOverEventId, setDragOverEventId] = useState<string | null>(null);
  const [assignError, setAssignError] = useState('');
  const [quickAssignEventId, setQuickAssignEventId] = useState<string | null>(null);
  const [quickAssignQuery, setQuickAssignQuery] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');
  const [teamAssignMode, setTeamAssignMode] = useState<{ eventId: string; teamId: string } | null>(null);
  const [selectedStudentsForTeam, setSelectedStudentsForTeam] = useState<string[]>([]);
  const [dashboardEventDetailId, setDashboardEventDetailId] = useState<string | null>(null);

  // ── Derived ──
  const instituteId = teamLeader?.institute_id || '';
  const eventById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  const instituteParticipants = useMemo(
    () => participants.filter((p) => p.institute_id === instituteId),
    [participants, instituteId]
  );

  const getEventLimits = useCallback((event: EventRow) => {
    const normalized = normalizeEventName(event.name);
    const matchedKey = Object.keys(OFFICIAL_EVENT_LIMITS).find((key) => normalized.includes(key));
    const official = matchedKey ? OFFICIAL_EVENT_LIMITS[matchedKey] : null;
    return {
      minTeamSize: official?.minTeamSize ?? (event.min_team_size || 1),
      maxTeamSize: official?.maxTeamSize ?? (event.max_team_size || (event.is_team ? 999 : 1)),
      maxEntries: official?.maxEntries ?? (event.max_entries_per_institute || 0),
      maxAccompanists: official?.maxAccompanists ?? event.max_accompanists,
    };
  }, []);

  // Map student enrollment/name to their assigned event IDs
  const studentEventMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    instituteParticipants.forEach((p) => {
      const key = p.enrollment_no?.trim().toLowerCase() || p.full_name.trim().toLowerCase();
      if (!map.has(key)) map.set(key, new Set());
      map.get(key)!.add(p.event_id);
    });
    return map;
  }, [instituteParticipants]);

  const getStudentEventCount = useCallback((s: StudentRow) => {
    const key = s.enrollment_no?.trim().toLowerCase() || s.full_name.trim().toLowerCase();
    return studentEventMap.get(key)?.size || 0;
  }, [studentEventMap]);

  const getStudentEvents = useCallback((s: StudentRow) => {
    const key = s.enrollment_no?.trim().toLowerCase() || s.full_name.trim().toLowerCase();
    return studentEventMap.get(key) || new Set<string>();
  }, [studentEventMap]);

  const isStudentAssignedToEvent = useCallback((s: StudentRow, eventId: string) => {
    return getStudentEvents(s).has(eventId);
  }, [getStudentEvents]);

  const canAssignToEvent = useCallback((s: StudentRow, eventId: string) => {
    if (isStudentAssignedToEvent(s, eventId)) return { ok: false, reason: 'Already assigned to this event' };
    if (getStudentEventCount(s) >= MAX_EVENTS_PER_STUDENT) return { ok: false, reason: `Already in ${MAX_EVENTS_PER_STUDENT} events` };
    const ev = eventById.get(eventId);
    if (!ev) return { ok: false, reason: 'Event not found' };
    const limits = getEventLimits(ev);
    const eventParticipants = instituteParticipants.filter((p) => p.event_id === eventId && p.role === 'participant');
    if (ev.is_team) {
      const teams = new Set(eventParticipants.map((p) => p.team_id || 'solo'));
      const maxEntries = limits.maxEntries;
      if (maxEntries > 0) {
        const maxTeamSize = limits.maxTeamSize;
        const allTeamsFull = [...teams].every((tid) => {
          const teamSize = eventParticipants.filter((p) => (p.team_id || 'solo') === tid).length;
          return teamSize >= maxTeamSize;
        });
        if (allTeamsFull && teams.size >= maxEntries) return { ok: false, reason: `Max ${maxEntries} team(s) reached` };
      }
    } else {
      const maxEntries = limits.maxEntries;
      if (maxEntries > 0 && eventParticipants.length >= maxEntries) return { ok: false, reason: `Max ${maxEntries} entries reached` };
    }
    return { ok: true, reason: '' };
  }, [isStudentAssignedToEvent, getStudentEventCount, eventById, instituteParticipants, getEventLimits]);

  // Filtered students for Students tab
  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return students.filter((s) => {
      if (studentFilter === 'assigned' && getStudentEventCount(s) === 0) return false;
      if (studentFilter === 'unassigned' && getStudentEventCount(s) > 0) return false;
      if (!q) return true;
      return (
        s.full_name.toLowerCase().includes(q) ||
        (s.enrollment_no || '').toLowerCase().includes(q) ||
        (s.phone || '').includes(q)
      );
    });
  }, [students, studentSearch, studentFilter, getStudentEventCount]);

  // Filtered events for Assign/Dashboard tabs
  const categoryIcons: Record<string, React.ElementType> = {
    Music: Music,
    Dance: Users,
    Literary: Mic2,
    Theatre: Theater,
    'Fine Arts': Sparkles,
    Diverse: Trophy,
  };

  const filteredEvents = useMemo(() => {
    const list = categoryFilter === 'All' ? events : events.filter((e) => e.category === categoryFilter);
    return list.slice().sort((a, b) => {
      const aCat = CATEGORY_ORDER.indexOf(a.category);
      const bCat = CATEGORY_ORDER.indexOf(b.category);
      if (aCat !== bCat) return (aCat === -1 ? 99 : aCat) - (bCat === -1 ? 99 : bCat);
      const aTeam = a.is_team ? 1 : 0;
      const bTeam = b.is_team ? 1 : 0;
      if (aTeam !== bTeam) return aTeam - bTeam;
      return a.name.localeCompare(b.name);
    });
  }, [events, categoryFilter, CATEGORY_ORDER]);

  // Available students for assignment to a specific event
  const availableStudentsForEvent = useCallback(
    (eventId: string) => {
      const q = assignSearch.trim().toLowerCase();
      return students.filter((s) => {
        if (isStudentAssignedToEvent(s, eventId)) return false;
        if (getStudentEventCount(s) >= MAX_EVENTS_PER_STUDENT) return false;
        if (!q) return true;
        return (
          s.full_name.toLowerCase().includes(q) ||
          (s.enrollment_no || '').toLowerCase().includes(q)
        );
      });
    },
    [students, assignSearch, isStudentAssignedToEvent, getStudentEventCount]
  );

  // Stats
  const stats = useMemo(() => {
    const totalAssignments = instituteParticipants.filter((p) => p.role === 'participant').length;
    const eventsRegistered = new Set(instituteParticipants.map((p) => p.event_id)).size;
    const uniqueStudents = students.length;
    const assignedStudents = students.filter((s) => getStudentEventCount(s) > 0).length;
    return { totalAssignments, eventsRegistered, uniqueStudents, assignedStudents };
  }, [instituteParticipants, students, getStudentEventCount]);

  const eventBreakdown = useMemo(() => {
    const breakdown: { event: EventRow; count: number; teamCount: number }[] = [];
    const eventGroups = new Map<string, ParticipantRow[]>();
    instituteParticipants.forEach((p) => {
      if (p.role !== 'participant') return;
      const group = eventGroups.get(p.event_id) ?? [];
      group.push(p);
      eventGroups.set(p.event_id, group);
    });
    eventGroups.forEach((parts, eventId) => {
      const ev = eventById.get(eventId);
      if (!ev) return;
      const teams = new Set(parts.map((p) => p.team_id || 'solo'));
      breakdown.push({ event: ev, count: parts.length, teamCount: teams.size });
    });
    breakdown.sort((a, b) => {
      const aCat = CATEGORY_ORDER.indexOf(a.event.category);
      const bCat = CATEGORY_ORDER.indexOf(b.event.category);
      if (aCat !== bCat) return (aCat === -1 ? 99 : aCat) - (bCat === -1 ? 99 : bCat);
      const aTeam = a.event.is_team ? 1 : 0;
      const bTeam = b.event.is_team ? 1 : 0;
      if (aTeam !== bTeam) return aTeam - bTeam;
      return a.event.name.localeCompare(b.event.name);
    });
    return breakdown;
  }, [instituteParticipants, eventById, CATEGORY_ORDER]);

  const openAssignEvent = useCallback((eventId: string) => {
    setActiveTab('assign');
    setExpandedEventId(eventId);
    setQuickAssignEventId(eventId);
    setQuickAssignQuery('');
  }, []);

  // ── Auth Logic ──
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionResult = await withTimeout(supabase.auth.getSession(), 5000, { data: { session: null } } as any);
        const { data: { session } } = sessionResult;
        if (session) {
          const tl = await withTimeout(fetchTeamLeaderByUserId(session.user.id), 4000, null);
          if (tl) {
            setTeamLeader(tl);
            setMustSetPassword(tl.must_set_password);
            setIsLoggedIn(true);
          }
        }
      } catch { /* */ } finally {
        setIsCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const authData = await loginWithPassword(loginForm.email, loginForm.password);
      const userId = authData.user?.id;
      if (!userId) { setLoginError('Login failed.'); return; }
      const tl = await fetchTeamLeaderByUserId(userId);
      if (!tl) { setLoginError('You are not registered as an institute team leader.'); await signOut(); return; }
      setTeamLeader(tl);
      setMustSetPassword(tl.must_set_password);
      setIsLoggedIn(true);
    } catch { setLoginError('Invalid credentials.'); }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      setIsLoggedIn(false);
      setTeamLeader(null);
      setMustSetPassword(false);
    }
  };

  // ── Data Loading ──
  const loadData = useCallback(async () => {
    if (!instituteId) return;
    try {
      const [eventData, participantData, studentData] = await Promise.all([
        fetchEvents(),
        fetchParticipantsByInstitute(instituteId),
        fetchStudentsByInstitute(instituteId).catch(() => [] as StudentRow[]),
      ]);
      setEvents(eventData);
      setParticipants(participantData);
      setStudents(studentData);
    } catch { /* */ }
  }, [instituteId]);

  useEffect(() => {
    if (!isLoggedIn || mustSetPassword) return;
    loadData();
    const interval = setInterval(loadData, 10000);
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);
    return () => { clearInterval(interval); window.removeEventListener('focus', handleFocus); };
  }, [isLoggedIn, mustSetPassword, loadData]);

  // ── Utility ──
  const toTitleCase = (v: string) =>
    v.replace(/\s+/g, ' ').trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /** Extract text from ExcelJS cell value - handles hyperlink objects, RichText, etc. */
  const extractCellText = (cellValue: any): string => {
    if (cellValue === null || cellValue === undefined) return '';
    if (typeof cellValue === 'string') return cellValue.trim();
    if (typeof cellValue === 'number') return String(cellValue);
    if (typeof cellValue === 'boolean') return String(cellValue);
    // ExcelJS hyperlink object: { text: string, hyperlink: string }
    if (typeof cellValue === 'object' && 'text' in cellValue) return String(cellValue.text || '').trim();
    // ExcelJS rich text: { richText: [{text: string}] }
    if (typeof cellValue === 'object' && 'richText' in cellValue && Array.isArray(cellValue.richText)) {
      return cellValue.richText.map((r: any) => r.text || '').join('').trim();
    }
    // Fallback - avoid [object Object]
    return '';
  };

  // Auto-clear messages
  useEffect(() => {
    if (studentSuccess) { const t = setTimeout(() => setStudentSuccess(''), 4000); return () => clearTimeout(t); }
  }, [studentSuccess]);
  useEffect(() => {
    if (assignSuccess) { const t = setTimeout(() => setAssignSuccess(''), 4000); return () => clearTimeout(t); }
  }, [assignSuccess]);

  // ── Student CRUD ──
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');
    setStudentSuccess('');
    const name = toTitleCase(studentForm.fullName);
    if (!name) { setStudentError('Full name is required.'); return; }
    if (studentForm.enrollmentNo.trim() && !/^\d{15}$/.test(studentForm.enrollmentNo.trim())) {
      setStudentError('Enrollment number must be exactly 15 digits (numbers only).');
      return;
    }
    if (!studentForm.email.trim()) {
      setStudentError('Email address is required.');
      return;
    }
    if (!isValidEmail(studentForm.email.trim())) {
      setStudentError('Please enter a valid email address.');
      return;
    }
    setIsAddingStudent(true);
    try {
      const created = await addStudentRecord({
        full_name: name,
        enrollment_no: studentForm.enrollmentNo.trim() || null,
        phone: studentForm.phone.trim() || null,
        email: studentForm.email.trim() || null,
        institute_id: instituteId,
      });
      setStudents((prev) => [...prev, created].sort((a, b) => a.full_name.localeCompare(b.full_name)));
      setStudentSuccess(`Added "${name}" to roster.`);
      setStudentForm({ fullName: '', enrollmentNo: '', phone: '', email: '' });
      studentNameRef.current?.focus();
    } catch (err: any) {
      if (err?.message?.includes('duplicate') || err?.code === '23505') {
        setStudentError('A student with this enrollment number already exists.');
      } else {
        setStudentError(err?.message || 'Failed to add student.');
      }
    } finally {
      setIsAddingStudent(false);
    }
  };

  const handleEditStudent = async () => {
    if (!editStudentModal) return;
    setIsEditingStudent(true);
    try {
      const updated = await updateStudentRecord(editStudentModal.id, {
        full_name: editStudentModal.full_name,
        enrollment_no: editStudentModal.enrollment_no,
        phone: editStudentModal.phone,
        email: editStudentModal.email,
      });
      setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEditStudentModal(null);
    } catch (err: any) {
      alert(`Update failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsEditingStudent(false);
    }
  };

  const matchStudentToParticipant = (s: StudentRow, p: ParticipantRow) => {
    if (s.enrollment_no && p.enrollment_no) return s.enrollment_no.trim().toLowerCase() === p.enrollment_no.trim().toLowerCase();
    return s.full_name.trim().toLowerCase() === p.full_name.trim().toLowerCase();
  };

  const handleDeleteStudent = async () => {
    if (!deleteStudentConfirm) return;
    setIsDeletingStudent(true);
    try {
      const studentEvts = getStudentEvents(deleteStudentConfirm);
      if (studentEvts.size > 0) {
        const toDelete = instituteParticipants.filter(
          (p) => studentEvts.has(p.event_id) && matchStudentToParticipant(deleteStudentConfirm, p)
        );
        for (const p of toDelete) await deleteParticipant(p.id);
      }
      await deleteStudentRecord(deleteStudentConfirm.id);
      setStudents((prev) => prev.filter((s) => s.id !== deleteStudentConfirm.id));
      setParticipants((prev) => prev.filter((p) => !matchStudentToParticipant(deleteStudentConfirm, p)));
      setDeleteStudentConfirm(null);
    } catch (err: any) {
      alert(`Delete failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsDeletingStudent(false);
    }
  };

  // ── Excel Import ──
  const handleExcelImport = async (file: File) => {
    setStudentError('');
    setStudentSuccess('');
    try {
      const buffer = await file.arrayBuffer();
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buffer);
      const ws = wb.worksheets[0];
      if (!ws) { setStudentError('No worksheets found in file.'); return; }

      const parsedRows: { rowNum: number; fullName: string; enrollmentNo: string; phone: string; email: string; error: string }[] = [];
      const seen = new Set<string>();

      ws.eachRow((row, rowNum) => {
        if (rowNum === 1) return;
        const rawName = extractCellText(row.getCell(1).value);
        const fullName = toTitleCase(rawName);

        // Handle enrollment: could be number in Excel (scientific notation fix)
        let enrollmentNo = '';
        const enrollCell = row.getCell(2).value;
        if (enrollCell !== null && enrollCell !== undefined && enrollCell !== '') {
          if (typeof enrollCell === 'number') {
            enrollmentNo = enrollCell.toFixed(0);
          } else {
            enrollmentNo = extractCellText(enrollCell);
          }
        }

        const phone = extractCellText(row.getCell(3).value);
        const email = extractCellText(row.getCell(4).value);
        if (!rawName && !enrollmentNo) return;

        const key = enrollmentNo?.toLowerCase() || fullName.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);

        // Skip if already in roster
        const existing = students.find(
          (s) => (enrollmentNo && s.enrollment_no === enrollmentNo) || (!enrollmentNo && s.full_name.toLowerCase() === fullName.toLowerCase())
        );
        if (existing) return;

        // Validate
        let error = '';
        if (!fullName) error = 'Name is required';
        else if (enrollmentNo && !/^\d{15}$/.test(enrollmentNo)) error = `Invalid enrollment "${enrollmentNo}" - must be exactly 15 digits`;
        else if (!email) error = 'Email is required';
        else if (!isValidEmail(email)) error = `Invalid email "${email}"`;

        parsedRows.push({ rowNum, fullName, enrollmentNo, phone, email, error });
      });

      if (parsedRows.length === 0) {
        setStudentError('No new students found. All may already exist in roster.');
        return;
      }

      const errorRows = parsedRows.filter((r) => r.error);
      if (errorRows.length > 0) {
        setImportReview(parsedRows);
      } else {
        await importValidRows(parsedRows);
      }
    } catch (err: any) {
      setStudentError(`Import failed: ${err?.message || 'Unknown error'}`);
    }
  };

  const importValidRows = async (rows: { fullName: string; enrollmentNo: string; phone: string; email: string; error: string }[]) => {
    const validRows = rows.filter((r) => !r.error);
    if (validRows.length === 0) {
      setStudentError('No valid rows to import.');
      return;
    }
    try {
      const payload = validRows.map((r) => ({
        full_name: toTitleCase(r.fullName),
        enrollment_no: r.enrollmentNo || null,
        phone: r.phone || null,
        email: r.email || null,
        institute_id: instituteId,
      }));
      const created = await bulkAddStudents(payload);
      setStudents((prev) => [...prev, ...created].sort((a, b) => a.full_name.localeCompare(b.full_name)));
      setStudentSuccess(`Imported ${created.length} student(s) from Excel.`);
      setImportReview(null);
    } catch (err: any) {
      setStudentError(`Import failed: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleImportReviewFix = (rowNum: number, field: string, value: string) => {
    if (!importReview) return;
    setImportReview(
      importReview.map((r) => {
        if (r.rowNum !== rowNum) return r;
        const updated = { ...r, [field]: value };
        const name = field === 'fullName' ? value.trim() : r.fullName.trim();
        const enr = field === 'enrollmentNo' ? value : r.enrollmentNo;
        const em = field === 'email' ? value : r.email;
        let error = '';
        if (!name) error = 'Name is required';
        else if (enr && !/^\d{15}$/.test(enr)) error = 'Invalid enrollment - must be 15 digits';
        else if (!em) error = 'Email is required';
        else if (!isValidEmail(em)) error = 'Invalid email';
        updated.error = error;
        return updated;
      })
    );
  };

  const downloadTemplate = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Students');
    ws.addRow(['Full Name *', 'Enrollment No (15 digits)', 'Phone', 'Email *']);
    ws.getColumn(1).width = 25;
    ws.getColumn(2).width = 20;
    ws.getColumn(2).numFmt = '@';
    ws.getColumn(3).width = 15;
    ws.getColumn(4).width = 30;
    // Email column data validation - must contain @ and .
    for (let r = 2; r <= 200; r++) {
      ws.getCell(`D${r}`).dataValidation = {
        type: 'custom',
        formulae: ['AND(ISNUMBER(FIND("@",D' + r + ')),ISNUMBER(FIND(".",D' + r + ',FIND("@",D' + r + ')+1)))'],
        showErrorMessage: true,
        errorTitle: 'Invalid Email',
        error: 'Please enter a valid email address (e.g. student@example.com)',
        errorStyle: 'stop',
      };
    }
    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_roster_template.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Assignment Logic ──
  const assignStudentToEvent = async (student: StudentRow, eventId: string) => {
    setAssignError('');
    const check = canAssignToEvent(student, eventId);
    if (!check.ok) { setAssignError(`${student.full_name}: ${check.reason}`); return; }

    const ev = eventById.get(eventId);
    if (!ev) return;
    const limits = getEventLimits(ev);

    const eventParticipants = instituteParticipants.filter((p) => p.event_id === eventId && p.role === 'participant');
    let teamId = 'Team-1';
    if (ev.is_team) {
      const teamSizes = new Map<string, number>();
      eventParticipants.forEach((p) => {
        const t = p.team_id || 'Team-1';
        teamSizes.set(t, (teamSizes.get(t) || 0) + 1);
      });
      const maxSize = limits.maxTeamSize;
      let assigned = false;
      for (const [tid, size] of teamSizes) {
        if (size < maxSize) { teamId = tid; assigned = true; break; }
      }
      if (!assigned) {
        let idx = 1;
        while (teamSizes.has(`Team-${idx}`)) idx++;
        teamId = `Team-${idx}`;
      }
    } else {
      let idx = 1;
      const usedTeams = new Set(eventParticipants.map((p) => p.team_id));
      while (usedTeams.has(`Team-${idx}`)) idx++;
      teamId = `Team-${idx}`;
    }

    const nextSeq = eventParticipants.length + 1;

    try {
      const created = await addParticipant({
        full_name: student.full_name,
        enrollment_no: student.enrollment_no,
        phone: student.phone,
        email: student.email,
        institute_id: instituteId,
        event_id: eventId,
        role: 'participant',
        sequence_no: nextSeq,
        team_id: teamId,
      });
      setParticipants((prev) => [...prev, created]);
      setAssignSuccess(`Assigned "${student.full_name}" to ${ev.name}`);
    } catch (err: any) {
      setAssignError(`Failed: ${err?.message || 'Unknown error'}`);
    }
  };

  const unassignStudentFromEvent = async (participantId: string) => {
    setAssignError('');
    try {
      await deleteParticipant(participantId);
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
      setAssignSuccess('Student removed from event.');
    } catch (err: any) {
      setAssignError(`Failed: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleBulkAssign = async (eventId: string, studentIds: string[]) => {
    setAssignError('');
    setAssignSuccess('');
    const ev = eventById.get(eventId);
    if (!ev) return;
    const limits = getEventLimits(ev);

    const toAssign = studentIds.map((id) => students.find((s) => s.id === id)).filter(Boolean) as StudentRow[];
    const errors: string[] = [];
    for (const s of toAssign) {
      const check = canAssignToEvent(s, eventId);
      if (!check.ok) errors.push(`${s.full_name}: ${check.reason}`);
    }
    if (errors.length > 0) { setAssignError(errors.join('. ')); return; }

    const eventParticipants = instituteParticipants.filter((p) => p.event_id === eventId && p.role === 'participant');
    const teamSizes = new Map<string, number>();
    eventParticipants.forEach((p) => {
      const t = p.team_id || 'Team-1';
      teamSizes.set(t, (teamSizes.get(t) || 0) + 1);
    });

    if (toAssign.length === 0) {
      setAssignError('Select at least one student to assign.');
      return;
    }

    let teamId: string;
    if (teamAssignMode?.teamId) {
      teamId = teamAssignMode.teamId;
    } else {
      let idx = 1;
      while (teamSizes.has(`Team-${idx}`)) idx++;
      teamId = `Team-${idx}`;
    }

    if (ev.is_team) {
      const maxEntries = limits.maxEntries;
      const targetTeamAlreadyExists = teamSizes.has(teamId);
      if (!targetTeamAlreadyExists && maxEntries > 0 && teamSizes.size >= maxEntries) {
        setAssignError(`Cannot create ${teamId}. Max ${maxEntries} team(s) allowed for ${ev.name}. Add members to an existing team.`);
        return;
      }

      const existingCount = teamSizes.get(teamId) || 0;
      const maxTeamSize = limits.maxTeamSize;
      if (existingCount + toAssign.length > maxTeamSize) {
        const remaining = Math.max(0, maxTeamSize - existingCount);
        setAssignError(`${teamId} can only take ${remaining} more student(s). Team size limit is ${maxTeamSize}.`);
        return;
      }
    }

    const payload = toAssign.map((s, i) => ({
      full_name: s.full_name,
      enrollment_no: s.enrollment_no,
      phone: s.phone,
      email: s.email,
      institute_id: instituteId,
      event_id: eventId,
      role: 'participant' as const,
      sequence_no: eventParticipants.length + i + 1,
      team_id: teamId,
    }));

    try {
      const created = await bulkAddParticipants(payload);
      setParticipants((prev) => [...prev, ...created]);
      setAssignSuccess(`Assigned ${created.length} student(s) to ${ev.name} as ${teamId}`);
      setSelectedStudentsForTeam([]);
      setTeamAssignMode(null);
    } catch (err: any) {
      setAssignError(`Failed: ${err?.message || 'Unknown error'}`);
    }
  };

  // ── Drag and Drop ──
  const handleDragStart = (e: React.DragEvent, studentId: string) => {
    setDraggedStudentId(studentId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', studentId);
  };

  const handleDragOver = (e: React.DragEvent, eventId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverEventId(eventId);
  };

  const handleDragLeave = () => { setDragOverEventId(null); };

  const handleDrop = (e: React.DragEvent, eventId: string) => {
    e.preventDefault();
    setDragOverEventId(null);
    const studentId = e.dataTransfer.getData('text/plain') || draggedStudentId;
    if (!studentId) return;
    const student = students.find((s) => s.id === studentId);
    if (student) assignStudentToEvent(student, eventId);
    setDraggedStudentId(null);
  };

  const handleDragEnd = () => { setDraggedStudentId(null); setDragOverEventId(null); };

  // ── Category Filter Pills component ──
  const CategoryPills = ({ current, onChange }: { current: string; onChange: (c: string) => void }) => (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${current === cat
            ? 'bg-brand text-white'
            : 'bg-[#1A1208]/[0.03] text-[#8B7D6B] hover:bg-[#1A1208]/[0.05] hover:text-[#4A3F2F]'
            }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );

  // ── Event type badge ──
  const TypeBadge = ({ event }: { event: EventRow }) => {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${event.is_team
        ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
        : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
        }`}>
        {event.is_team ? 'Group' : 'Solo'}
      </span>
    );
  };

  // ═══ RENDER GUARDS ═══

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#FEFCF8] flex items-center justify-center">
        <div className="text-[#A89880]">Loading session...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FEFCF8] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="hidden" />
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="elite-glass p-8 sm:p-12 w-full max-w-md border-[#1A1208]/8">
          <div className="flex flex-col items-center mb-10">
            <div className="w-24 h-24 rounded-full bg-brand/5 border border-brand/20 flex items-center justify-center text-brand mb-6 shadow-brand"><Users size={40} /></div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Team Leader Portal</h1>
            <p className="text-[#A89880] text-sm text-center">Institute Team Leaders Only</p>
          </div>
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#8B7D6B] pl-1 block">Email</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C8B8A0]" size={18} />
                <input type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="w-full bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-2xl py-5 pl-14 pr-6 focus:ring-2 focus:ring-brand/50 outline-none transition-all font-medium" placeholder="your.name@utu.ac.in" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#8B7D6B] pl-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C8B8A0]" size={18} />
                <input type={showLoginPassword ? 'text' : 'password'} value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-2xl py-5 pl-14 pr-14 focus:ring-2 focus:ring-brand/50 outline-none transition-all font-medium" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#B8A890] hover:text-[#6B5D4D] transition-colors">
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-elite w-full py-6 rounded-2xl justify-center font-bold text-sm tracking-wide">Sign In</button>
            {loginError && <div className="text-xs text-red-400 font-medium mt-2">{loginError}</div>}
          </form>
        </motion.div>
      </div>
    );
  }

  if (mustSetPassword && teamLeader) {
    return <SetPassword userId={teamLeader.id} userName={teamLeader.name} onPasswordSet={() => setMustSetPassword(false)} />;
  }

  // ═══ MAIN UI ═══

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'students' as const, label: 'Students', icon: ClipboardList },
    { id: 'assign' as const, label: 'Assign Events', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#FEFCF8] flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-[70] bg-white/80 backdrop-blur-lg p-4 sm:p-6 flex items-center justify-between border-b border-[#1A1208]/4">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="Logo" className="w-8 h-8 object-contain" />
          <div>
            <span className="font-bold text-lg">UTh Fest</span>
            <span className="text-xs text-[#A89880] block">Team Leader</span>
          </div>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-xl bg-[#1A1208]/[0.03]">
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-white/95 backdrop-blur-xl pt-20 px-6">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-[#1A1208]/[0.05] text-[#1A1208]' : 'text-[#A89880] hover:text-[#1A1208]'}`}>
                <tab.icon size={18} /> {tab.label}
              </button>
            ))}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:text-red-300"><LogOut size={18} /> Sign Out</button>
          </div>
        </div>
      )}

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 h-screen p-6 border-r border-[#1A1208]/4 bg-[#1A1208]/[0.03]0 sticky top-0 overflow-y-auto">
          <div className="flex items-center gap-3 mb-2">
            <img src={logoImage} alt="Logo" className="w-10 h-10 object-contain" />
            <div>
              <span className="font-bold text-lg tracking-tight">UTh Fest</span>
              <span className="text-[10px] text-brand block font-bold tracking-widest uppercase">Team Leader</span>
            </div>
          </div>
          <div className="mt-4 mb-6 elite-glass p-3 rounded-xl">
            <div className="text-sm font-bold text-[#1A1208] truncate">{teamLeader?.name}</div>
            <div className="text-[10px] text-[#A89880] truncate mt-0.5">{teamLeader?.email}</div>
          </div>
          <nav className="flex-1 space-y-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-brand/10 text-[#1A1208] border border-[#1A1208]/8' : 'text-[#A89880] hover:text-[#1A1208] hover:bg-[#1A1208]/[0.02]'}`}>
                <tab.icon size={18} /> {tab.label}
              </button>
            ))}
          </nav>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#B8A890] hover:text-red-400 transition-colors mt-auto"><LogOut size={18} /> Sign Out</button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto relative">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'students' ? 'Students' : 'Assign Events'}
                </h1>
                <p className="text-[#A89880] text-sm mt-1">
                  {activeTab === 'dashboard' ? 'Overview of your institute\'s registrations' :
                    activeTab === 'students' ? 'Manage your institute\'s student roster' :
                      'Assign students to events - drag & drop or click'}
                </p>
              </div>
              <button onClick={loadData} className="p-3 rounded-xl bg-[#1A1208]/[0.03] hover:bg-[#1A1208]/[0.05] transition-colors" title="Refresh"><RefreshCw size={18} className="text-[#A89880]" /></button>
            </div>

            {/* ═══════════ DASHBOARD ═══════════ */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="elite-glass p-5">
                    <div className="text-[10px] font-black text-[#C8B8A0] uppercase tracking-[0.3em] mb-2">Students</div>
                    <div className="text-3xl font-black text-brand">{stats.uniqueStudents}</div>
                    <div className="text-xs text-[#B8A890] mt-1">{stats.assignedStudents} assigned</div>
                  </div>
                  <div className="elite-glass p-5">
                    <div className="text-[10px] font-black text-[#C8B8A0] uppercase tracking-[0.3em] mb-2">Events</div>
                    <div className="text-3xl font-black text-brand">{stats.eventsRegistered}</div>
                    <div className="text-xs text-[#B8A890] mt-1">of {events.length} total</div>
                  </div>
                  <div className="elite-glass p-5">
                    <div className="text-[10px] font-black text-[#C8B8A0] uppercase tracking-[0.3em] mb-2">Assignments</div>
                    <div className="text-3xl font-black text-brand">{stats.totalAssignments}</div>
                  </div>
                  <div className="elite-glass p-5">
                    <div className="text-[10px] font-black text-[#C8B8A0] uppercase tracking-[0.3em] mb-2">Unassigned</div>
                    <div className="text-3xl font-black text-red-400">{stats.uniqueStudents - stats.assignedStudents}</div>
                  </div>
                </div>

                <CategoryPills current={categoryFilter} onChange={setCategoryFilter} />

                {/* Event-wise Breakdown */}
                <div className="elite-glass p-6">
                  <h3 className="text-lg font-bold mb-4">Event-wise Breakdown</h3>
                  {(() => {
                    const filtered = eventBreakdown.filter((i) => categoryFilter === 'All' || i.event.category === categoryFilter);
                    if (filtered.length === 0)
                      return <div className="text-[#B8A890] text-sm">No registrations yet{categoryFilter !== 'All' ? ` in ${categoryFilter}` : ''}. Add students first, then assign them to events.</div>;
                    // Group by category
                    const bdGroups: { category: string; items: typeof filtered }[] = [];
                    const bdMap = new Map<string, typeof filtered>();
                    filtered.forEach((item) => {
                      if (!bdMap.has(item.event.category)) bdMap.set(item.event.category, []);
                      bdMap.get(item.event.category)!.push(item);
                    });
                    CATEGORY_ORDER.forEach((cat) => { if (bdMap.has(cat)) bdGroups.push({ category: cat, items: bdMap.get(cat)! }); });
                    bdMap.forEach((items, cat) => { if (!CATEGORY_ORDER.includes(cat)) bdGroups.push({ category: cat, items }); });
                    return (
                      <div className="space-y-6">
                        {bdGroups.map((group) => {
                          const CatIcon = categoryIcons[group.category] || Trophy;
                          return (
                            <div key={group.category}>
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand flex-shrink-0">
                                  <CatIcon size={16} />
                                </div>
                                <span className="text-sm font-black uppercase tracking-widest text-[#6B5D4D]">{group.category}</span>
                                <span className="text-[10px] text-[#B8A890]">{group.items.length}</span>
                                <div className="flex-1 h-px bg-[#1A1208]/[0.03]" />
                              </div>
                              <div className="space-y-3">
                                {group.items.map((item) => {
                                  const limits = getEventLimits(item.event);
                                  const maxEntries = limits.maxEntries;
                                  const filledCount = item.event.is_team ? item.teamCount : item.count;
                                  const eventParticipants = instituteParticipants.filter(
                                    (p) => p.event_id === item.event.id && p.role === 'participant'
                                  );
                                  const teamGroups = new Map<string, ParticipantRow[]>();
                                  eventParticipants.forEach((p) => {
                                    const tid = p.team_id || 'Team-1';
                                    if (!teamGroups.has(tid)) teamGroups.set(tid, []);
                                    teamGroups.get(tid)!.push(p);
                                  });
                                  const minTeamSize = limits.minTeamSize;
                                  const incompleteTeams = item.event.is_team
                                    ? [...teamGroups.entries()].filter(([, members]) => members.length < minTeamSize)
                                    : [];
                                  return (
                                    <button
                                      key={item.event.id}
                                      onClick={() => setDashboardEventDetailId(item.event.id)}
                                      className="w-full text-left bg-[#1A1208]/[0.02] border border-[#1A1208]/4 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 group/bd hover:border-brand/20 transition-all"
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-[#1A1208]/[0.02] border border-[#1A1208]/4 flex items-center justify-center text-brand group-hover/bd:bg-brand group-hover/bd:text-white transition-all duration-500 flex-shrink-0">
                                          {React.createElement(categoryIcons[item.event.category] || Trophy, { size: 20 })}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="font-semibold text-sm flex items-center gap-2 min-w-0">
                                            <span className="truncate">{item.event.name}</span>
                                            <TypeBadge event={item.event} />
                                          </div>
                                          <div className="text-[10px] text-[#A89880] uppercase tracking-widest">{item.event.category}</div>
                                        </div>
                                      </div>
                                      <div className="text-xs text-[#8B7D6B] flex items-center gap-2">
                                        <span className={filledCount > 0 ? 'text-brand' : ''}>{filledCount}/{maxEntries || '∞'} {item.event.is_team ? 'team(s)' : 'slot(s)'} filled</span>
                                        {(limits.maxAccompanists || 0) > 0 && <span>• {limits.maxAccompanists} accompanist(s)</span>}
                                      </div>
                                      {item.event.is_team && teamGroups.size > 0 && (
                                        <div className="w-full sm:col-span-2 mt-1 space-y-2">
                                          {incompleteTeams.length > 0 ? (
                                            <button
                                              onClick={(e) => { e.stopPropagation(); openAssignEvent(item.event.id); }}
                                              className="w-full text-left px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-semibold hover:bg-red-500/15 transition-colors"
                                            >
                                              Incomplete team detected ({incompleteTeams.length}). Click to open Assign Events and add students.
                                            </button>
                                          ) : (
                                            <div className="px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs">
                                              <div className="text-emerald-300 font-semibold mb-1">Team members</div>
                                              <div className="flex flex-wrap gap-1.5">
                                                {[...teamGroups.entries()].map(([teamId, members]) => (
                                                  <span key={teamId} className="px-2 py-1 rounded-md bg-[#1A1208]/[0.03] text-[#4A3F2F]">
                                                    {teamId}: {members.map((m) => m.full_name).join(', ')}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Events Not Yet Fully Registered */}
                <div className="elite-glass p-6">
                  <h3 className="text-lg font-bold mb-4">Events With Open Slots</h3>
                  {(() => {
                    // Show events that still have capacity (not fully filled)
                    const notFull = filteredEvents.filter((ev) => {
                      const limits = getEventLimits(ev);
                      const evParticipants = instituteParticipants.filter((p) => p.event_id === ev.id && p.role === 'participant');
                      const maxEntries = limits.maxEntries;
                      if (maxEntries === 0) return evParticipants.length === 0; // unlimited but no one registered
                      if (ev.is_team) {
                        const teams = new Set(evParticipants.map((p) => p.team_id || 'solo'));
                        const allTeamsFull = [...teams].every((tid) => {
                          const teamSize = evParticipants.filter((p) => (p.team_id || 'solo') === tid).length;
                          return teamSize >= limits.maxTeamSize;
                        });
                        return !(allTeamsFull && teams.size >= maxEntries);
                      } else {
                        return evParticipants.length < maxEntries;
                      }
                    });
                    if (notFull.length === 0)
                      return <div className="text-emerald-400 text-sm font-medium">All{categoryFilter !== 'All' ? ` ${categoryFilter}` : ''} events are fully registered!</div>;
                    // Group by category
                    const nfGroups: { category: string; events: typeof notFull }[] = [];
                    const nfMap = new Map<string, typeof notFull>();
                    notFull.forEach((ev) => {
                      if (!nfMap.has(ev.category)) nfMap.set(ev.category, []);
                      nfMap.get(ev.category)!.push(ev);
                    });
                    CATEGORY_ORDER.forEach((cat) => { if (nfMap.has(cat)) nfGroups.push({ category: cat, events: nfMap.get(cat)! }); });
                    nfMap.forEach((evts, cat) => { if (!CATEGORY_ORDER.includes(cat)) nfGroups.push({ category: cat, events: evts }); });
                    return (
                      <div className="space-y-6">
                        {nfGroups.map((group) => {
                          const CatIcon = categoryIcons[group.category] || Trophy;
                          return (
                            <div key={group.category}>
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand flex-shrink-0">
                                  <CatIcon size={16} />
                                </div>
                                <span className="text-sm font-black uppercase tracking-widest text-[#6B5D4D]">{group.category}</span>
                                <span className="text-[10px] text-[#B8A890]">{group.events.length}</span>
                                <div className="flex-1 h-px bg-[#1A1208]/[0.03]" />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {group.events.map((e) => {
                                  const limits = getEventLimits(e);
                                  const evParticipants = instituteParticipants.filter((p) => p.event_id === e.id && p.role === 'participant');
                                  const maxEntries = limits.maxEntries;
                                  const filledCount = e.is_team
                                    ? new Set(evParticipants.map((p) => p.team_id || 'solo')).size
                                    : evParticipants.length;
                                  return (
                                    <div key={e.id} className="bg-[#1A1208]/[0.02] border border-[#1A1208]/4 rounded-xl p-3 text-sm group/unreg hover:border-brand/20 transition-all">
                                      <div className="flex items-center gap-3 mb-1">
                                        <div className="w-9 h-9 rounded-xl bg-[#1A1208]/[0.02] border border-[#1A1208]/4 flex items-center justify-center text-brand group-hover/unreg:bg-brand group-hover/unreg:text-white transition-all duration-500 flex-shrink-0">
                                          {React.createElement(categoryIcons[e.category] || Trophy, { size: 18 })}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="font-medium text-[#4A3F2F] flex items-center gap-2 min-w-0">
                                            <span className="truncate">{e.name}</span>
                                            <TypeBadge event={e} />
                                          </div>
                                          <div className="text-[10px] text-[#B8A890] uppercase tracking-widest">{e.category}</div>
                                        </div>
                                      </div>
                                      <div className="text-xs text-[#A89880] mt-1 flex items-center gap-2">
                                        <span className={filledCount > 0 ? 'text-brand' : ''}>{filledCount}/{maxEntries || '∞'} {e.is_team ? 'team(s)' : 'slot(s)'} filled</span>
                                        {(limits.maxAccompanists || 0) > 0 && <span>• {limits.maxAccompanists} accompanist(s)</span>}
                                      </div>
                                    </div>
                                  );
                                })}
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

            {/* ═══════════ STUDENTS ═══════════ */}
            {activeTab === 'students' && (
              <div className="space-y-6">
                {/* Add Student Form */}
                <div className="elite-glass p-6">
                  <h2 className="text-lg font-bold mb-4">Add Student to Roster</h2>
                  <form className="space-y-3" onSubmit={handleAddStudent}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input ref={studentNameRef} value={studentForm.fullName} onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })} onBlur={(e) => setStudentForm({ ...studentForm, fullName: toTitleCase(e.target.value) })} placeholder="Full Name *" required className="bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/50 outline-none" />
                      <input value={studentForm.enrollmentNo} onChange={(e) => setStudentForm({ ...studentForm, enrollmentNo: e.target.value })} placeholder="Enrollment No (15 digits)" className="bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/50 outline-none" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input value={studentForm.phone} onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })} placeholder="Phone" className="bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/50 outline-none" />
                      <input type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} placeholder="Email *" required className="bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/50 outline-none" />
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                      <button type="submit" disabled={isAddingStudent} className="btn-elite justify-center text-sm disabled:opacity-50">
                        {isAddingStudent ? 'Adding...' : <><Plus size={14} className="mr-1" /> Add Student</>}
                      </button>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2.5 bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl text-xs font-bold text-[#6B5D4D] hover:text-brand hover:border-brand/30 transition-all flex items-center gap-2">
                          <Upload size={14} /> Import Excel
                        </button>
                        <button type="button" onClick={downloadTemplate} className="px-4 py-2.5 bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl text-xs font-bold text-[#6B5D4D] hover:text-[#1A1208] transition-all flex items-center gap-2">
                          <Download size={14} /> Template
                        </button>
                      </div>
                      <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleExcelImport(e.target.files[0]); e.target.value = ''; }} />
                    </div>
                    {studentError && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{studentError}</div>}
                    {studentSuccess && <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">{studentSuccess}</div>}
                  </form>
                </div>

                {/* Student Roster */}
                <div className="elite-glass p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <h2 className="text-lg font-bold">Student Roster ({filteredStudents.length})</h2>
                    <div className="flex gap-2 text-xs">
                      {(['all', 'assigned', 'unassigned'] as const).map((f) => (
                        <button key={f} onClick={() => setStudentFilter(f)} className={`px-3 py-1.5 rounded-full font-bold capitalize transition-all ${studentFilter === f ? 'bg-brand text-white' : 'bg-[#1A1208]/[0.03] text-[#8B7D6B] hover:text-[#1A1208]'}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative mb-4">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B8A890]" />
                    <input type="text" placeholder="Search students..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl pl-10 pr-4 py-2 text-sm text-[#2A1F0F] focus:outline-none focus:border-brand/50" />
                  </div>

                  {filteredStudents.length === 0 ? (
                    <div className="text-[#B8A890] text-sm text-center py-8">
                      {students.length === 0 ? 'No students yet. Add students above or import from Excel.' : 'No students match your filter.'}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                      {filteredStudents.map((s) => {
                        const evCount = getStudentEventCount(s);
                        const assignedEvts = getStudentEvents(s);
                        return (
                          <div key={s.id} className="bg-[#1A1208]/[0.02] border border-[#1A1208]/4 rounded-xl px-4 py-3 flex items-center justify-between gap-3 group hover:border-[#1A1208]/8 transition-colors">
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-sm text-[#1A1208] flex items-center gap-2">
                                {s.full_name}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${evCount === 0 ? 'bg-[#1A1208]/[0.03] text-[#B8A890]' : evCount >= MAX_EVENTS_PER_STUDENT ? 'bg-red-500/10 text-red-300' : 'bg-brand/10 text-brand'}`}>
                                  {evCount}/{MAX_EVENTS_PER_STUDENT} events
                                </span>
                              </div>
                              <div className="text-[10px] text-[#A89880] mt-0.5">
                                {s.enrollment_no || '-'} {s.phone ? `• ${s.phone}` : ''} {s.email ? `• ${s.email}` : ''}
                              </div>
                              {evCount > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {[...assignedEvts].map((eid) => {
                                    const ev = eventById.get(eid);
                                    return ev ? <span key={eid} className="text-[9px] px-1.5 py-0.5 rounded bg-[#1A1208]/[0.03] text-[#A89880]">{ev.name}</span> : null;
                                  })}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setEditStudentModal({ ...s })} className="text-[10px] text-[#8B7D6B] hover:text-[#1A1208] px-2 py-1 rounded-lg hover:bg-[#1A1208]/[0.03]">Edit</button>
                              <button onClick={() => setDeleteStudentConfirm(s)} className="text-[10px] text-red-400/60 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-500/10"><Trash2 size={12} /></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Rules */}
                <div className="elite-glass p-6">
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-brand mb-3">Rules</div>
                  <ul className="space-y-2 text-[#8B7D6B] text-xs list-disc list-inside">
                    <li>A student can participate in a maximum of {MAX_EVENTS_PER_STUDENT} events.</li>
                    <li>Each institute has entry limits per event.</li>
                    <li>Only bonafide, full-time students of UTU are eligible.</li>
                    <li>Participants must carry their original University ID Card.</li>
                    <li>On-the-spot registrations are not permitted.</li>
                    <li>Accompanists are allowed as per event rules but do not need to be registered.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ═══════════ ASSIGN EVENTS ═══════════ */}
            {activeTab === 'assign' && (
              <div className="space-y-6">
                {students.length === 0 ? (
                  <div className="elite-glass p-10 text-center">
                    <Users size={40} className="mx-auto mb-4 text-[#C8B8A0]" />
                    <h3 className="text-lg font-bold mb-2">No Students in Roster</h3>
                    <p className="text-[#A89880] text-sm mb-4">Add students in the Students tab first, then come here to assign them to events.</p>
                    <button onClick={() => setActiveTab('students')} className="btn-elite justify-center text-sm">Go to Students</button>
                  </div>
                ) : (
                  <>
                    {assignError && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{assignError}</div>}
                    {assignSuccess && <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">{assignSuccess}</div>}

                    <CategoryPills current={categoryFilter} onChange={setCategoryFilter} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                      {/* Left: Student Pool */}
                      <div className="lg:col-span-1 order-2 lg:order-1">
                        <div className="elite-glass p-3 sm:p-4 lg:sticky lg:top-4 max-h-[50vh] lg:max-h-[70vh]">
                          <h3 className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 flex items-center gap-2">
                            <GripVertical size={12} className="text-[#B8A890] hidden sm:block" />
                            <span>Student Pool</span>
                            <span className="text-[9px] sm:text-[10px] text-[#B8A890] font-normal ml-auto hidden sm:inline">drag</span>
                          </h3>
                          <div className="relative mb-2 sm:mb-3">
                            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B8A890]" />
                            <input type="text" placeholder="Search..." value={assignSearch} onChange={(e) => setAssignSearch(e.target.value)} className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-lg pl-8 pr-3 py-1.5 sm:py-2 text-xs text-[#2A1F0F] focus:outline-none focus:border-brand/50" />
                          </div>
                          <div className="space-y-1 sm:space-y-1.5 overflow-y-auto pr-1 max-h-[35vh] sm:max-h-[50vh]">
                            {students
                              .filter((s) => {
                                const q = assignSearch.trim().toLowerCase();
                                if (!q) return true;
                                return s.full_name.toLowerCase().includes(q) || (s.enrollment_no || '').toLowerCase().includes(q);
                              })
                              .map((s) => {
                                const evCount = getStudentEventCount(s);
                                const isFull = evCount >= MAX_EVENTS_PER_STUDENT;
                                const isBeingDragged = draggedStudentId === s.id;
                                return (
                                  <div
                                    key={s.id}
                                    draggable={!isFull}
                                    onDragStart={(e) => handleDragStart(e, s.id)}
                                    onDragEnd={handleDragEnd}
                                    className={`px-3 py-2 rounded-lg border text-xs transition-all ${isFull
                                      ? 'bg-[#1A1208]/[0.01] border-[#1A1208]/4 text-[#B8A890] cursor-not-allowed'
                                      : isBeingDragged
                                        ? 'bg-brand/10 border-brand/30 text-brand scale-95'
                                        : 'bg-[#1A1208]/[0.02] border-[#1A1208]/4 text-[#2A1F0F] cursor-grab hover:border-[#1A1208]/10 active:cursor-grabbing'
                                      }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium truncate">{s.full_name}</span>
                                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ml-2 flex-shrink-0 ${isFull ? 'bg-red-500/10 text-red-300' : evCount > 0 ? 'bg-brand/10 text-brand' : 'bg-[#1A1208]/[0.03] text-[#B8A890]'
                                        }`}>
                                        {evCount}/{MAX_EVENTS_PER_STUDENT}
                                      </span>
                                    </div>
                                    {s.enrollment_no && <div className="text-[9px] text-[#B8A890] mt-0.5">{s.enrollment_no}</div>}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </div>

                      {/* Right: Events (grouped by category) */}
                      <div className="lg:col-span-2 space-y-4 lg:space-y-6 order-1 lg:order-2">
                        {(() => {
                          const groups: { category: string; events: typeof filteredEvents }[] = [];
                          const map = new Map<string, typeof filteredEvents>();
                          filteredEvents.forEach((ev) => {
                            if (!map.has(ev.category)) map.set(ev.category, []);
                            map.get(ev.category)!.push(ev);
                          });
                          CATEGORY_ORDER.forEach((cat) => { if (map.has(cat)) groups.push({ category: cat, events: map.get(cat)! }); });
                          map.forEach((evts, cat) => { if (!CATEGORY_ORDER.includes(cat)) groups.push({ category: cat, events: evts }); });
                          return groups.map((group) => {
                            const CatIcon = categoryIcons[group.category] || Trophy;
                            return (
                              <div key={group.category}>
                                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand flex-shrink-0">
                                    <CatIcon size={14} />
                                  </div>
                                  <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#6B5D4D]">{group.category}</span>
                                  <span className="text-[9px] sm:text-[10px] text-[#B8A890]">{group.events.length}</span>
                                  <div className="flex-1 h-px bg-[#1A1208]/[0.03]" />
                                </div>
                                <div className="space-y-2 sm:space-y-3">
                                  {group.events.map((ev) => {
                                    const isExpanded = expandedEventId === ev.id;
                                    const eventParticipants = instituteParticipants.filter((p) => p.event_id === ev.id && p.role === 'participant');
                                    const isDragTarget = dragOverEventId === ev.id;
                                    const limits = getEventLimits(ev);
                                    const maxEntries = limits.maxEntries;

                                    const teamGroups = new Map<string, ParticipantRow[]>();
                                    eventParticipants.forEach((p) => {
                                      const tid = p.team_id || 'Team-1';
                                      if (!teamGroups.has(tid)) teamGroups.set(tid, []);
                                      teamGroups.get(tid)!.push(p);
                                    });
                                    const incompleteTeamCount = ev.is_team
                                      ? [...teamGroups.values()].filter((members) => members.length < limits.minTeamSize).length
                                      : 0;
                                    const headerFilledCount = ev.is_team ? teamGroups.size : eventParticipants.length;

                                    return (
                                      <div
                                        key={ev.id}
                                        onDragOver={(e) => handleDragOver(e, ev.id)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, ev.id)}
                                        className={`elite-glass overflow-hidden transition-all ${isDragTarget ? 'ring-2 ring-brand/50 border-brand/30' : ''}`}
                                      >
                                        {/* Event Header */}
                                        <button
                                          onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
                                          className="w-full flex items-center gap-2 sm:gap-3 p-3 sm:p-4 hover:bg-[#1A1208]/[0.02] transition-colors text-left group/ev"
                                        >
                                          {isExpanded ? <ChevronDown size={14} className="text-[#A89880] flex-shrink-0" /> : <ChevronRight size={14} className="text-[#A89880] flex-shrink-0" />}
                                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1A1208]/[0.02] border border-[#1A1208]/4 flex items-center justify-center text-brand group-hover/ev:bg-brand group-hover/ev:text-white transition-all duration-500 flex-shrink-0">
                                            {React.createElement(categoryIcons[ev.category] || Trophy, { size: 18 })}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-xs sm:text-sm flex items-center gap-2 flex-wrap">
                                              {ev.name} <TypeBadge event={ev} />
                                              {incompleteTeamCount > 0 && (
                                                <span className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/25 text-red-300 text-[10px] font-bold">
                                                  {incompleteTeamCount} incomplete team(s)
                                                </span>
                                              )}
                                            </div>
                                            <div className="text-[9px] sm:text-[10px] text-[#B8A890] uppercase tracking-widest mt-0.5">{ev.category}</div>
                                          </div>
                                          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-[#8B7D6B] flex-shrink-0 flex-col sm:flex-row">
                                            <span className={headerFilledCount > 0 ? 'text-brand' : ''}>{headerFilledCount}</span>
                                            <span className="text-[#C8B8A0] hidden sm:inline">{maxEntries || '∞'}</span>
                                          </div>
                                        </button>

                                        {/* Expanded */}
                                        {isExpanded && (
                                          <div className="border-t border-[#1A1208]/4 p-3 sm:p-4 space-y-3 sm:space-y-4 text-xs sm:text-sm">
                                            {/* Constraints */}
                                            <div className="flex flex-wrap gap-1 sm:gap-2 text-[9px] sm:text-[10px]">
                                              <span className="px-2 py-1 bg-[#1A1208]/[0.03] rounded-md text-[#A89880]">{ev.is_team ? `Group · ${limits.minTeamSize}-${limits.maxTeamSize}` : 'Solo'}</span>
                                              <span className="px-2 py-1 bg-[#1A1208]/[0.03] rounded-md text-[#A89880]">{maxEntries || '∞'} max</span>
                                              {(limits.maxAccompanists || 0) > 0 && <span className="px-2 py-1 bg-[#1A1208]/[0.03] rounded-md text-[#A89880]">{limits.maxAccompanists} accompanists</span>}
                                            </div>

                                            {/* Assigned */}
                                            {eventParticipants.length > 0 && (
                                              <div>
                                                <div className="text-[10px] sm:text-xs font-bold text-[#8B7D6B] mb-2">Assigned ({eventParticipants.length})</div>
                                                {ev.is_team ? (
                                                  <div className="space-y-2 sm:space-y-3">
                                                    {[...teamGroups.entries()].map(([teamId, members]) => (
                                                      <div key={teamId} className={`rounded-xl p-2 sm:p-3 text-[10px] ${members.length < limits.minTeamSize ? 'bg-red-500/5 border-2 border-red-500/30' : 'bg-[#1A1208]/[0.02] border border-[#1A1208]/4'}`}>
                                                        <div className="font-bold text-[#A89880] uppercase tracking-widest mb-1 sm:mb-2">{teamId} ({members.length}/{limits.maxTeamSize || '∞'})</div>
                                                        {members.length < limits.minTeamSize && (
                                                          <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                                                            <AlertTriangle size={12} className="text-red-400 flex-shrink-0" />
                                                            <span className="text-[10px] font-bold text-red-300">Below minimum! Need at least {limits.minTeamSize} members - team may be disqualified</span>
                                                          </div>
                                                        )}
                                                        <div className="space-y-1">
                                                          {members.map((p) => (
                                                            <div key={p.id} className="flex items-center justify-between text-xs py-1">
                                                              <span className="text-[#2A1F0F]">{p.full_name} <span className="text-[#B8A890]">{p.enrollment_no || ''}</span></span>
                                                              <button onClick={() => unassignStudentFromEvent(p.id)} className="text-red-400/50 hover:text-red-300 p-1"><Minus size={12} /></button>
                                                            </div>
                                                          ))}
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                ) : (
                                                  <div className="space-y-1">
                                                    {eventParticipants.map((p) => (
                                                      <div key={p.id} className="flex items-center justify-between bg-[#1A1208]/[0.02] border border-[#1A1208]/4 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs">
                                                        <span className="text-[#2A1F0F] truncate">{p.full_name}</span>
                                                        <button onClick={() => unassignStudentFromEvent(p.id)} className="text-red-400/50 hover:text-red-300 p-0.5 flex-shrink-0"><Minus size={12} /></button>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            )}

                                            {/* Add student */}
                                            {ev.is_team && teamAssignMode?.eventId === ev.id ? (
                                              <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-3 sm:p-4">
                                                <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
                                                  <div className="text-[10px] sm:text-xs font-bold text-purple-300"><span className="hidden sm:inline">Forming {teamAssignMode.teamId} •</span> Select {limits.minTeamSize}-{limits.maxTeamSize}</div>
                                                  <button onClick={() => { setTeamAssignMode(null); setSelectedStudentsForTeam([]); }} className="text-[9px] sm:text-[10px] text-[#A89880] hover:text-[#1A1208] flex-shrink-0">×</button>
                                                </div>
                                                <div className="space-y-1 max-h-40 sm:max-h-48 overflow-y-auto mb-2 sm:mb-3">
                                                  {availableStudentsForEvent(ev.id).map((s) => {
                                                    const selected = selectedStudentsForTeam.includes(s.id);
                                                    return (
                                                      <button
                                                        key={s.id}
                                                        onClick={() => setSelectedStudentsForTeam((prev) => selected ? prev.filter((id) => id !== s.id) : [...prev, s.id])}
                                                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-all ${selected ? 'bg-purple-500/20 border border-purple-500/30 text-purple-200' : 'bg-[#1A1208]/[0.02] border border-[#1A1208]/4 text-[#4A3F2F] hover:border-[#1A1208]/10'}`}
                                                      >
                                                        <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${selected ? 'bg-purple-500 border-purple-500' : 'border-[#1A1208]/8'}`}>
                                                          {selected && <Check size={10} className="text-[#1A1208]" />}
                                                        </div>
                                                        <span className="truncate">{s.full_name}</span>
                                                        <span className="text-[8px] sm:text-[9px] text-[#B8A890] ml-auto flex-shrink-0">{getStudentEventCount(s)}/{MAX_EVENTS_PER_STUDENT}</span>
                                                      </button>
                                                    );
                                                  })}
                                                </div>
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                                                  <button
                                                    onClick={() => handleBulkAssign(ev.id, selectedStudentsForTeam)}
                                                    disabled={selectedStudentsForTeam.length < limits.minTeamSize || selectedStudentsForTeam.length > limits.maxTeamSize}
                                                    className="btn-elite text-[10px] sm:text-xs !py-1.5 sm:!py-2 !px-3 sm:!px-4 disabled:opacity-40 w-full sm:w-auto"
                                                  >
                                                    Assign ({selectedStudentsForTeam.length})
                                                  </button>
                                                  <span className="text-[9px] sm:text-[10px] text-[#B8A890] hidden sm:inline">{selectedStudentsForTeam.length}</span>
                                                </div>
                                              </div>
                                            ) : (
                                              <div>
                                                {ev.is_team ? (
                                                  <div className="flex flex-wrap gap-2">
                                                    <button
                                                      onClick={() => {
                                                        const maxEntries = limits.maxEntries;
                                                        if (maxEntries > 0 && teamGroups.size >= maxEntries) {
                                                          setAssignError(`Max ${maxEntries} team(s) reached for ${ev.name}. Add members to existing team.`);
                                                          return;
                                                        }
                                                        let idx = 1;
                                                        const usedTeams = new Set(eventParticipants.map((p) => p.team_id));
                                                        while (usedTeams.has(`Team-${idx}`)) idx++;
                                                        setTeamAssignMode({ eventId: ev.id, teamId: `Team-${idx}` });
                                                        setSelectedStudentsForTeam([]);
                                                      }}
                                                      className="text-xs text-brand hover:text-brand/80 font-bold flex items-center gap-1 transition-colors"
                                                    >
                                                      <Plus size={14} /> Form New Team
                                                    </button>
                                                    <button
                                                      onClick={() => { setQuickAssignEventId(quickAssignEventId === ev.id ? null : ev.id); setQuickAssignQuery(''); }}
                                                      className="text-xs text-[#8B7D6B] hover:text-brand font-bold flex items-center gap-1 transition-colors"
                                                    >
                                                      <Plus size={14} /> Quick Add to Existing Team
                                                    </button>
                                                  </div>
                                                ) : (
                                                  <button
                                                    onClick={() => { setQuickAssignEventId(quickAssignEventId === ev.id ? null : ev.id); setQuickAssignQuery(''); }}
                                                    className="text-xs text-brand hover:text-brand/80 font-bold flex items-center gap-1 transition-colors"
                                                  >
                                                    <Plus size={14} /> Assign Student
                                                  </button>
                                                )}
                                                {quickAssignEventId === ev.id && (
                                                  <div className="mt-3 bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-xl p-3">
                                                    <div className="relative mb-2">
                                                      <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#B8A890]" />
                                                      <input
                                                        type="text"
                                                        autoFocus
                                                        placeholder="Search student by name or enrollment..."
                                                        value={quickAssignQuery}
                                                        onChange={(e) => setQuickAssignQuery(e.target.value)}
                                                        className="w-full bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-lg pl-8 pr-3 py-2 text-xs text-[#2A1F0F] focus:outline-none focus:border-brand/50"
                                                      />
                                                    </div>
                                                    <div className="space-y-1 max-h-40 overflow-y-auto">
                                                      {availableStudentsForEvent(ev.id)
                                                        .filter((s) => {
                                                          if (!quickAssignQuery.trim()) return true;
                                                          const q = quickAssignQuery.trim().toLowerCase();
                                                          return s.full_name.toLowerCase().includes(q) || (s.enrollment_no || '').toLowerCase().includes(q);
                                                        })
                                                        .slice(0, 15)
                                                        .map((s) => (
                                                          <button
                                                            key={s.id}
                                                            onClick={() => { assignStudentToEvent(s, ev.id); setQuickAssignQuery(''); }}
                                                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left hover:bg-brand/10 hover:text-brand transition-all"
                                                          >
                                                            <span className="font-medium truncate">{s.full_name}</span>
                                                            <span className="text-[9px] text-[#B8A890] ml-2 flex-shrink-0">{s.enrollment_no || ''} · {getStudentEventCount(s)}/{MAX_EVENTS_PER_STUDENT}</span>
                                                          </button>
                                                        ))}
                                                      {availableStudentsForEvent(ev.id).filter((s) => {
                                                        if (!quickAssignQuery.trim()) return true;
                                                        const q = quickAssignQuery.trim().toLowerCase();
                                                        return s.full_name.toLowerCase().includes(q) || (s.enrollment_no || '').toLowerCase().includes(q);
                                                      }).length === 0 && (
                                                          <div className="text-[10px] text-[#B8A890] py-2 text-center">No available students found</div>
                                                        )}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Dashboard Event Details Modal */}
      {dashboardEventDetailId && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="elite-glass p-6 sm:p-8 w-full max-w-3xl max-h-[85vh] overflow-y-auto">
            {(() => {
              const event = eventById.get(dashboardEventDetailId);
              if (!event) return null;
              const limits = getEventLimits(event);
              const eventParticipants = instituteParticipants.filter((p) => p.event_id === event.id && p.role === 'participant');
              const teamGroups = new Map<string, ParticipantRow[]>();
              eventParticipants.forEach((p) => {
                const teamId = p.team_id || 'Team-1';
                if (!teamGroups.has(teamId)) teamGroups.set(teamId, []);
                teamGroups.get(teamId)!.push(p);
              });

              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{event.name}</h3>
                      <div className="text-xs text-[#A89880] mt-1">{event.category} • {event.is_team ? `Group ${limits.minTeamSize}-${limits.maxTeamSize}` : 'Solo'}</div>
                    </div>
                    <button onClick={() => setDashboardEventDetailId(null)} className="text-[#A89880] hover:text-[#1A1208]"><X size={20} /></button>
                  </div>

                  {eventParticipants.length === 0 ? (
                    <div className="text-[#A89880] text-sm">No participants assigned yet.</div>
                  ) : event.is_team ? (
                    <div className="space-y-3">
                      {[...teamGroups.entries()].map(([teamId, members]) => {
                        const isIncomplete = members.length < limits.minTeamSize;
                        return (
                          <div key={teamId} className={`rounded-xl p-3 border ${isIncomplete ? 'bg-red-500/5 border-red-500/30' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-bold text-sm">{teamId} ({members.length}/{limits.maxTeamSize})</div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isIncomplete ? 'bg-red-500/15 text-red-300' : 'bg-emerald-500/15 text-emerald-300'}`}>
                                {isIncomplete ? `INCOMPLETE • need ${limits.minTeamSize - members.length} more` : 'COMPLETE'}
                              </span>
                            </div>
                            <div className="space-y-1">
                              {members.map((m) => (
                                <div key={m.id} className="text-xs text-[#2A1F0F]">{m.full_name} <span className="text-[#B8A890]">{m.enrollment_no || ''}</span></div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {eventParticipants.map((p) => (
                        <div key={p.id} className="bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-lg px-3 py-2 text-sm text-[#1A1208]">
                          {p.full_name} <span className="text-[#B8A890]">{p.enrollment_no || ''}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Import Review Modal */}
      {importReview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="elite-glass p-6 sm:p-8 w-full max-w-3xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Import Review</h3>
              <button onClick={() => setImportReview(null)} className="text-[#A89880] hover:text-[#1A1208]"><X size={20} /></button>
            </div>
            {(() => {
              const validCount = importReview.filter((r) => !r.error).length;
              const errorCount = importReview.filter((r) => r.error).length;
              return (
                <>
                  <div className="flex gap-4 mb-4 text-sm">
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold">{validCount} valid</span>
                    {errorCount > 0 && <span className="px-3 py-1 rounded-lg bg-red-500/10 text-red-400 font-bold">{errorCount} with errors</span>}
                  </div>

                  {errorCount > 0 && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                      <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                      <span className="text-xs font-bold text-red-300">Fix the errors below and click "Import All", or import only the valid rows.</span>
                    </div>
                  )}

                  <div className="space-y-2 mb-6 max-h-[50vh] overflow-y-auto pr-1">
                    {importReview.filter((r) => r.error).map((row) => (
                      <div key={row.rowNum} className="bg-red-500/5 border border-red-500/15 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold text-[#B8A890] bg-[#1A1208]/[0.03] px-1.5 py-0.5 rounded">Row {row.rowNum}</span>
                          <span className="text-[10px] text-red-400 font-bold">{row.error}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <input value={row.fullName} onChange={(e) => handleImportReviewFix(row.rowNum, 'fullName', e.target.value)} onBlur={(e) => handleImportReviewFix(row.rowNum, 'fullName', toTitleCase(e.target.value))} placeholder="Name *" className="bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-brand/50" />
                          <input value={row.enrollmentNo} onChange={(e) => handleImportReviewFix(row.rowNum, 'enrollmentNo', e.target.value)} placeholder="Enrollment (15 digits)" className="bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-brand/50" />
                          <input value={row.phone} onChange={(e) => handleImportReviewFix(row.rowNum, 'phone', e.target.value)} placeholder="Phone" className="bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-brand/50" />
                          <input value={row.email} onChange={(e) => handleImportReviewFix(row.rowNum, 'email', e.target.value)} placeholder="Email" className="bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-brand/50" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {validCount > 0 && (
                    <div className="mb-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <div className="text-xs text-emerald-300/70">{validCount} row(s) are valid and ready to import.</div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {errorCount === 0 ? (
                      <button
                        onClick={async () => { try { await importValidRows(importReview); } catch (err: any) { setStudentError(err?.message || 'Import failed.'); } }}
                        className="btn-elite justify-center text-sm"
                      >
                        Import All {importReview.length} Row(s)
                      </button>
                    ) : (
                      <>
                        {validCount > 0 && (
                          <button
                            onClick={async () => { try { await importValidRows(importReview); } catch (err: any) { setStudentError(err?.message || 'Import failed.'); } }}
                            className="btn-elite justify-center text-sm"
                          >
                            Import {validCount} Valid Row(s)
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            const stillHasErrors = importReview.some((r) => r.error);
                            if (stillHasErrors) { setStudentError('Fix all errors first, or click "Import Valid" to skip error rows.'); return; }
                            try { await importValidRows(importReview); } catch (err: any) { setStudentError(err?.message || 'Import failed.'); }
                          }}
                          className="px-4 py-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs font-bold text-purple-300 hover:bg-purple-500/20 transition-all"
                        >
                          Import All (Fix Errors First)
                        </button>
                      </>
                    )}
                    <button onClick={() => setImportReview(null)} className="px-4 py-2 bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl text-sm text-[#6B5D4D] hover:text-[#1A1208]">Cancel</button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editStudentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="elite-glass p-6 sm:p-8 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Edit Student</h3>
            <div className="space-y-3">
              <input value={editStudentModal.full_name} onChange={(e) => setEditStudentModal({ ...editStudentModal, full_name: e.target.value })} onBlur={(e) => setEditStudentModal({ ...editStudentModal, full_name: toTitleCase(e.target.value) })} placeholder="Full name" className="w-full bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-xl px-4 py-2 text-sm" />
              <input value={editStudentModal.enrollment_no || ''} onChange={(e) => setEditStudentModal({ ...editStudentModal, enrollment_no: e.target.value || null })} placeholder="Enrollment No" className="w-full bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-xl px-4 py-2 text-sm" />
              <input value={editStudentModal.phone || ''} onChange={(e) => setEditStudentModal({ ...editStudentModal, phone: e.target.value || null })} placeholder="Phone" className="w-full bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-xl px-4 py-2 text-sm" />
              <input value={editStudentModal.email || ''} onChange={(e) => setEditStudentModal({ ...editStudentModal, email: e.target.value || null })} placeholder="Email" className="w-full bg-[#1A1208]/[0.02] border border-[#1A1208]/8 rounded-xl px-4 py-2 text-sm" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleEditStudent} disabled={isEditingStudent} className="btn-elite justify-center text-sm flex-1 disabled:opacity-50">{isEditingStudent ? 'Saving...' : 'Save'}</button>
              <button onClick={() => setEditStudentModal(null)} className="px-4 py-2 bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl text-sm text-[#6B5D4D] hover:text-[#1A1208]">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Student Confirmation */}
      {deleteStudentConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="elite-glass p-6 sm:p-8 w-full max-w-sm text-center">
            <Trash2 size={32} className="text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Delete Student?</h3>
            <p className="text-[#8B7D6B] text-sm mb-2">
              Remove <span className="text-[#1A1208] font-semibold">{deleteStudentConfirm.full_name}</span> from the roster?
            </p>
            {getStudentEventCount(deleteStudentConfirm) > 0 && (
              <p className="text-red-300/70 text-xs mb-4">
                This student is assigned to {getStudentEventCount(deleteStudentConfirm)} event(s). They will be unassigned from all events.
              </p>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={handleDeleteStudent} disabled={isDeletingStudent} className="flex-1 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-sm font-bold text-red-300 hover:bg-red-500/30 disabled:opacity-50">
                {isDeletingStudent ? 'Deleting...' : 'Delete'}
              </button>
              <button onClick={() => setDeleteStudentConfirm(null)} className="flex-1 py-3 bg-[#1A1208]/[0.03] border border-[#1A1208]/8 rounded-xl text-sm text-[#6B5D4D] hover:text-[#1A1208]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamLeaderDashboard;

