import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { events as fallbackEvents } from '../data/events';
import { Activity, Eye, EyeOff, User, Hash, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  fetchEventHelpers,
  fetchEvents,
  upsertLiveStatus,
  fetchParticipantsByEvent,
  fetchInstitutes,
} from '../lib/supabaseApi';
import type { EventHelperRow, EventRow, ParticipantRow, InstituteRow } from '../lib/supabaseApi';

const HELPER_AUTH_KEY = 'uth-helper-auth';
const HELPER_EVENT_KEY = 'uth-helper-event-id';

const EventHelper = () => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [eventHelpers, setEventHelpers] = useState<EventHelperRow[]>([]);
  const [loginError, setLoginError] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [sequenceNo, setSequenceNo] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [instituteName, setInstituteName] = useState('');
  const [status, setStatus] = useState('performing');
  const [updates, setUpdates] = useState<string[]>([]);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [institutes, setInstitutes] = useState<InstituteRow[]>([]);
  const [isLoadingParticipant, setIsLoadingParticipant] = useState(false);
  const [participantFound, setParticipantFound] = useState<boolean | null>(null);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId),
    [events, selectedEventId]
  );

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [eventData, helperData, instituteData] = await Promise.all([
          fetchEvents(),
          fetchEventHelpers(),
          fetchInstitutes(),
        ]);
        if (isMounted) {
          const storedEventId = localStorage.getItem(HELPER_EVENT_KEY);
          const storedHelperAuth = localStorage.getItem(HELPER_AUTH_KEY) === '1';
          setEvents(eventData);
          setEventHelpers(helperData);
          setInstitutes(instituteData);
          setSelectedEventId(storedEventId && eventData.some((e) => e.id === storedEventId) ? storedEventId : (eventData[0]?.id ?? ''));
          if (storedHelperAuth) {
            setIsAuthenticated(true);
          }
        }
      } catch (_error) {
        if (isMounted) {
          setEvents(
            fallbackEvents.map((event) => ({
              id: String(event.id),
              name: event.name,
              category: event.category,
              is_team: null,
              min_team_size: null,
              max_team_size: null,
              max_entries_per_institute: null,
              max_accompanists: null,
              min_time_minutes: null,
              max_time_minutes: null,
              venue: null,
              event_date: null,
              event_time: null,
              rules_pdf_url: null,
              is_prelim: event.isPrelim ?? null,
            }))
          );
        }
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError('');
    if (pin.trim().length < 4) {
      setLoginError('PIN must be at least 4 characters.');
      return;
    }
    const match = eventHelpers.find((helper) => helper.pin === pin.trim());
    if (!match) {
      setLoginError('Invalid PIN.');
      return;
    }
    setSelectedEventId(match.event_id);
    setIsAuthenticated(true);
    localStorage.setItem(HELPER_AUTH_KEY, '1');
    localStorage.setItem(HELPER_EVENT_KEY, match.event_id);
  };

  const handleHelperLogout = () => {
    localStorage.removeItem(HELPER_AUTH_KEY);
    localStorage.removeItem(HELPER_EVENT_KEY);
    setIsAuthenticated(false);
    setPin('');
    setShowPin(false);
    setSequenceNo('');
    setParticipantName('');
    setInstituteName('');
    setParticipantFound(null);
  };

  // Load participants when event changes
  useEffect(() => {
    if (!isAuthenticated || !selectedEventId) return;

    const loadParticipants = async () => {
      try {
        const participantData = await fetchParticipantsByEvent(selectedEventId);
        setParticipants(participantData);
      } catch (error) {
        console.error('Failed to load participants:', error);
        setParticipants([]);
      }
    };

    loadParticipants();
  }, [selectedEventId, isAuthenticated]);

  // Auto-fetch participant details when sequence number changes
  useEffect(() => {
    if (!sequenceNo || !selectedEventId) {
      setParticipantName('');
      setInstituteName('');
      setParticipantFound(null);
      return;
    }

    const seqNum = parseInt(sequenceNo, 10);
    if (isNaN(seqNum)) {
      setParticipantFound(null);
      return;
    }

    setIsLoadingParticipant(true);

    // Find participant with matching sequence number
    const participant = participants.find(
      (p) => p.sequence_no === seqNum && p.role === 'participant'
    );

    if (participant) {
      setParticipantName(participant.full_name);
      const institute = institutes.find((inst) => inst.id === participant.institute_id);
      setInstituteName(institute?.name || 'Unknown Institute');
      setParticipantFound(true);
    } else {
      setParticipantName('');
      setInstituteName('');
      setParticipantFound(false);
    }

    setIsLoadingParticipant(false);
  }, [sequenceNo, participants, institutes, selectedEventId]);

  const handleUpdate = (event: React.FormEvent) => {
    event.preventDefault();
    setUpdateError('');
    if (!participantName || !instituteName || !sequenceNo) {
      setUpdateError('All fields are required.');
      return;
    }
    if (!selectedEvent) {
      setUpdateError('Select a valid event.');
      return;
    }
    upsertLiveStatus({
      event_id: selectedEvent.id,
      current_sequence_no: Number(sequenceNo),
      current_participant_name: participantName,
      current_institute_name: instituteName,
      status,
    })
      .then(() => {
        const message = `${selectedEvent?.name ?? 'Event'} | #${sequenceNo} | ${participantName} | ${instituteName} | ${status}`;
        setUpdates((prev) => [message, ...prev]);
        setParticipantName('');
        setInstituteName('');
        setSequenceNo('');
      })
      .catch((error) => {
        console.error('Live status update error:', error);
        setUpdateError('Failed to update live status. Check console for details.');
      });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6"
        style={{ background: 'linear-gradient(135deg, #FEFCF8 0%, #FDF8F0 50%, #FAF3E8 100%)' }}>
        <div className="elite-glass p-10 w-full max-w-md">
          <h1 className="text-3xl font-black tracking-tighter mb-4" style={{ color: '#1A1208' }}>Event Helper Login</h1>
          <p className="text-sm mb-8" style={{ color: '#8B7D6B' }}>
            Enter the PIN provided by Admin to update live status for your event.
          </p>
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: '#B8A890' }}>Helper PIN</label>
              <div className="relative mt-3">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN"
                  className="w-full rounded-2xl py-4 px-5 pr-14 focus:ring-2 focus:ring-brand/50 outline-none"
                  style={{ background: 'rgba(26, 18, 8, 0.02)', border: '1px solid rgba(26, 18, 8, 0.08)', color: '#1A1208' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 transition-colors hover:text-brand"
                  style={{ color: '#B8A890' }}
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button className="btn-elite w-full justify-center" type="submit">
              Access Live Updater
            </button>
            {loginError ? (
              <div className="text-xs text-red-600 uppercase tracking-widest">{loginError}</div>
            ) : null}
          </form>
        </div>
      </div>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-24"
      style={{ background: 'linear-gradient(180deg, #FEFCF8 0%, #FDF8F0 50%, #FAF3E8 100%)' }}
    >
      <header className="pt-24 pb-10 px-6">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4" style={{ color: '#1A1208' }}>Live Updater</h1>
          <p className="max-w-2xl" style={{ color: '#8B7D6B' }}>
            Update who is performing right now. This pushes to the public live status page.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand/10 border border-brand/20 rounded-xl">
            <div className="w-2 h-2 bg-brand rounded-full animate-pulse"></div>
            <span className="text-sm" style={{ color: '#4A3F2F' }}>
              Assigned to: <span className="font-bold text-brand">{selectedEvent?.name}</span>
            </span>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={handleHelperLogout}
              className="px-4 py-2 rounded-xl text-xs font-bold hover:text-red-600 hover:border-red-500/30 transition-colors"
              style={{ background: 'rgba(26, 18, 8, 0.03)', border: '1px solid rgba(26, 18, 8, 0.08)', color: '#8B7D6B' }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <section className="px-6">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="elite-glass p-8">
            <form className="space-y-5" onSubmit={handleUpdate}>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: '#B8A890' }}>Your Assigned Event</label>
                <div className="mt-3 w-full rounded-2xl py-4 px-5 font-semibold"
                  style={{ background: 'rgba(26, 18, 8, 0.02)', border: '1px solid rgba(26, 18, 8, 0.06)', color: '#1A1208' }}>
                  {selectedEvent?.name || 'Loading...'}
                </div>
                <div className="text-xs mt-2" style={{ color: '#8B7D6B' }}>
                  Category: {selectedEvent?.category || 'N/A'}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: '#B8A890' }}>Sequence Number</label>
                <div className="mt-3 flex items-center gap-3">
                  <Hash size={16} style={{ color: '#B8A890' }} />
                  <input
                    type="text"
                    value={sequenceNo}
                    onChange={(e) => setSequenceNo(e.target.value)}
                    placeholder="e.g. 12"
                    className="w-full rounded-2xl py-4 px-5"
                    style={{ background: 'rgba(26, 18, 8, 0.02)', border: '1px solid rgba(26, 18, 8, 0.08)', color: '#1A1208' }}
                    autoFocus
                  />
                  {isLoadingParticipant && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand border-t-transparent" />
                  )}
                  {participantFound === true && (
                    <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                  )}
                  {participantFound === false && (
                    <AlertCircle size={18} className="text-red-500 shrink-0" />
                  )}
                </div>
                {participantFound === false && (
                  <div className="text-xs text-red-500 mt-2">No participant found with this sequence number</div>
                )}
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: '#B8A890' }}>Participant Name (Auto-filled)</label>
                <div className="mt-3 flex items-center gap-3">
                  <User size={16} style={{ color: '#B8A890' }} />
                  <input
                    type="text"
                    value={participantName}
                    readOnly
                    placeholder="Auto-filled from sequence number"
                    className="w-full rounded-2xl py-4 px-5 cursor-not-allowed"
                    style={{ background: 'rgba(26, 18, 8, 0.02)', border: '1px solid rgba(26, 18, 8, 0.06)', color: '#8B7D6B' }}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: '#B8A890' }}>Institute / Department (Auto-filled)</label>
                <input
                  type="text"
                  value={instituteName}
                  readOnly
                  placeholder="Auto-filled from sequence number"
                  className="mt-3 w-full rounded-2xl py-4 px-5 cursor-not-allowed"
                  style={{ background: 'rgba(26, 18, 8, 0.02)', border: '1px solid rgba(26, 18, 8, 0.06)', color: '#8B7D6B' }}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: '#B8A890' }}>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-3 w-full rounded-2xl py-4 px-5 font-semibold focus:ring-2 focus:ring-brand/50 outline-none transition-all appearance-none cursor-pointer"
                  style={{ background: 'rgba(26, 18, 8, 0.02)', border: '1px solid rgba(26, 18, 8, 0.08)', color: '#1A1208' }}
                >
                  <option value="performing">Performing</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <button type="submit" className="btn-elite w-full justify-center">
                Update Live Status
              </button>
              {updateError ? (
                <div className="text-xs text-red-600 uppercase tracking-widest">{updateError}</div>
              ) : null}
            </form>
          </div>

          <div className="elite-glass p-8">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-brand mb-6">
              <Activity size={14} /> Recent Updates
            </div>
            {updates.length === 0 ? (
              <div className="text-sm" style={{ color: '#B8A890' }}>No updates yet.</div>
            ) : (
              <ul className="space-y-3 text-sm" style={{ color: '#8B7D6B' }}>
                {updates.map((update, index) => {
                  const [eventName, sequence, participant, institute, statusText] = update.split(' | ');
                  return (
                    <li key={`${update}-${index}`} className="pb-3 break-words" style={{ borderBottom: '1px solid rgba(26, 18, 8, 0.06)' }}>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-semibold" style={{ color: '#1A1208' }}>{eventName ?? update}</span>
                        {sequence ? <span style={{ color: '#8B7D6B' }}>{sequence}</span> : null}
                        {participant ? <span style={{ color: '#8B7D6B' }}>{participant}</span> : null}
                        {institute ? <span style={{ color: '#8B7D6B' }}>{institute}</span> : null}
                      </div>
                      {statusText ? (
                        <div className="mt-1 text-[10px] font-black uppercase tracking-[0.3em] text-brand">
                          {statusText}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(26, 18, 8, 0.08)' }}>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: '#B8A890' }}>Your Assigned Event</div>
              <div className="text-sm font-semibold" style={{ color: '#1A1208' }}>{selectedEvent?.name ?? 'Unknown'}</div>
              <div className="text-xs mt-1" style={{ color: '#8B7D6B' }}>{selectedEvent?.category ?? 'N/A'}</div>
            </div>
          </div>
        </div>
      </section>
    </motion.main>
  );
};

export default EventHelper;
