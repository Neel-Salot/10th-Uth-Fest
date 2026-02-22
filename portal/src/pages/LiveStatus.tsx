import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import { events as fallbackEvents } from '../data/events';
import { Activity } from 'lucide-react';
import { fetchEvents, fetchLiveStatus } from '../lib/supabaseApi';
import type { EventRow, LiveStatusRow } from '../lib/supabaseApi';

const LiveStatus = () => {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [liveStatus, setLiveStatus] = useState<LiveStatusRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [eventData, statusData] = await Promise.all([fetchEvents(), fetchLiveStatus()]);
        if (isMounted) {
          setEvents(eventData);
          setLiveStatus(statusData);
        }
      } catch (_error) {
        if (isMounted) {
          setLoadError('Unable to load live data. Showing fallback events.');
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
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const statusByEvent = useMemo(() => {
    return new Map(liveStatus.map((status) => [status.event_id, status]));
  }, [liveStatus]);

  const liveEvents = useMemo(() => {
    return events.filter((event) => statusByEvent.get(event.id)?.status === 'performing');
  }, [events, statusByEvent]);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-32"
      style={{ background: 'linear-gradient(180deg, #FEFCF8 0%, #FDF8F0 50%, #FAF3E8 100%)' }}
    >
      <Navbar />

      <header className="pt-20 md:pt-32 lg:pt-48 pb-12 md:pb-16 lg:pb-20 px-4 md:px-6 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <span className="text-brand font-black text-xs uppercase tracking-[0.4em] md:tracking-[0.6em] mb-4 md:mb-8 block">Live Status</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-black tracking-tighter mb-6 md:mb-8 leading-tight" style={{ color: '#1A1208' }}>
            LIVE EVENT <br />
            <span className="gradient-orange">UPDATES</span>
          </h1>
          <p className="max-w-3xl text-lg" style={{ color: '#8B7D6B' }}>
            Live updates from each event helper will appear here. When an event goes live, the current sequence, participant name, and department will be shown in real-time.
          </p>
          {loadError ? (
            <div className="mt-6 text-xs text-brand uppercase tracking-[0.4em]">{loadError}</div>
          ) : null}
        </div>
      </header>

      <section className="px-6">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {isLoading ? (
            <div className="elite-glass p-10 text-center" style={{ color: '#8B7D6B' }}>Loading live status...</div>
          ) : liveEvents.length === 0 ? (
            <div className="elite-glass p-10 text-center" style={{ color: '#8B7D6B' }}>No live events right now.</div>
          ) : (
            liveEvents.map((event) => {
              const status = statusByEvent.get(event.id);
              return (
                <div key={event.id} className="elite-glass p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: '#B8A890' }}>{event.category}</div>
                      <h3 className="text-2xl font-black tracking-tighter" style={{ color: '#1A1208' }}>{event.name}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-brand" style={{ background: 'rgba(255, 107, 53, 0.06)' }}>
                      <Activity size={18} />
                    </div>
                  </div>
                  {status ? (
                    <div className="space-y-2 text-sm" style={{ color: '#4A3F2F' }}>
                      <div>Sequence: {status.current_sequence_no ?? '-'}</div>
                      <div>Participant: {status.current_participant_name ?? '-'}</div>
                      <div>Institute: {status.current_institute_name ?? '-'}</div>
                      <div>Status: {status.status ?? 'upcoming'}</div>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </section>
    </motion.main>
  );
};

export default LiveStatus;
