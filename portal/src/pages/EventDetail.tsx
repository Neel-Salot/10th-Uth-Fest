import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import { events as fallbackEvents } from '../data/events';
import { eventRules } from '../data/eventRules';
import { fetchEvents, fetchScoresByEvent, fetchInstitutes } from '../lib/supabaseApi';
import type { EventRow, ScoreRow, InstituteRow } from '../lib/supabaseApi';
import { ArrowUpRight, Calendar, MapPin, Users, Clock, Trophy, User, Music, Mic2, Theater, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';
import React from 'react';

const categoryIcons: Record<string, React.ElementType> = {
  Music: Music,
  Dance: Users,
  Literary: Mic2,
  Theatre: Theater,
  'Fine Arts': Sparkles,
  Diverse: Trophy,
};

const formatTime = (min: number | null, max: number | null): string => {
  if (min == null && max == null) return 'N/A';
  const fmt = (v: number) => {
    if (v >= 60) { const h = v / 60; return `${h % 1 === 0 ? h : h.toFixed(1)} Hr${h !== 1 ? 's' : ''}`; }
    return `${v} min`;
  };
  if ((min === 0 || min == null) && max != null) return `Up to ${fmt(max)}`;
  if (min != null && max == null) return `${fmt(min)}+`;
  if (min != null && max != null) {
    if (min === max) return fmt(min);
    if (min >= 60 && max >= 60) { const mH = min / 60; const xH = max / 60; return `${mH % 1 === 0 ? mH : mH.toFixed(1)}\u2013${xH % 1 === 0 ? xH : xH.toFixed(1)} Hrs`; }
    return `${min}\u2013${max} min`;
  }
  return 'N/A';
};

const EventDetail = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState<EventRow | null>(null);
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [institutes, setInstitutes] = useState<InstituteRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const fallbackEvent = useMemo(
    () => fallbackEvents.find((item) => item.id === Number(eventId)),
    [eventId]
  );

  useEffect(() => {
    let isMounted = true;
    const loadEvent = async () => {
      setIsLoading(true);
      try {
        const data = await fetchEvents();
        const found = data.find((item) => item.id === String(eventId));

        if (isMounted) {
          if (found) {
            setEvent(found);
            // Fetch scores and institutes for this event
            try {
              const [scoreData, instituteData] = await Promise.all([
                fetchScoresByEvent(found.id),
                fetchInstitutes()
              ]);
              if (isMounted) {
                setScores(scoreData.filter(s => s.is_published));
                setInstitutes(instituteData);
              }
            } catch (error) {
              console.error('Error fetching event details:', error);
            }
          } else if (fallbackEvent) {
            const parts = fallbackEvent.participantsPerTeam.split('-').map(Number);
            const isTeam = fallbackEvent.participantsPerTeam !== '1';
            setEvent({
              id: String(fallbackEvent.id),
              name: fallbackEvent.name,
              category: fallbackEvent.category,
              is_team: isTeam,
              min_team_size: parts[0] || 1,
              max_team_size: parts[parts.length - 1] || 1,
              max_entries_per_institute: Number(fallbackEvent.maxEntries),
              max_accompanists: Number(fallbackEvent.maxAccompanists),
              min_time_minutes: fallbackEvent.minTime === 'N/A' ? null : Number(fallbackEvent.minTime),
              max_time_minutes: fallbackEvent.maxTime === 'N/A' ? null : Number(fallbackEvent.maxTime),
              venue: null,
              event_date: null,
              event_time: null,
              rules_pdf_url: null,
              is_prelim: fallbackEvent.isPrelim ?? null,
            });
          } else {
            setEvent(null);
          }
        }
      } catch (_error) {
        if (isMounted && fallbackEvent) {
          setLoadError('Using local event data.');
          const parts = fallbackEvent.participantsPerTeam.split('-').map(Number);
          const isTeam = fallbackEvent.participantsPerTeam !== '1';
          setEvent({
            id: String(fallbackEvent.id),
            name: fallbackEvent.name,
            category: fallbackEvent.category,
            is_team: isTeam,
            min_team_size: parts[0] || 1,
            max_team_size: parts[parts.length - 1] || 1,
            max_entries_per_institute: Number(fallbackEvent.maxEntries),
            max_accompanists: Number(fallbackEvent.maxAccompanists),
            min_time_minutes: fallbackEvent.minTime === 'N/A' ? null : Number(fallbackEvent.minTime),
            max_time_minutes: fallbackEvent.maxTime === 'N/A' ? null : Number(fallbackEvent.maxTime),
            venue: null,
            event_date: null,
            event_time: null,
            rules_pdf_url: null,
            is_prelim: fallbackEvent.isPrelim ?? null,
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadEvent();
    return () => {
      isMounted = false;
    };
  }, [eventId, fallbackEvent]);

  if (!event && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#FEFCF8', color: '#1A1208' }}>
        <h1 className="text-3xl md:text-5xl font-black mb-6">Event not found</h1>
        <Link to="/events" className="btn-elite">
          Back to Events <ArrowUpRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-32"
      style={{ background: 'linear-gradient(180deg, #FEFCF8 0%, #FDF8F0 50%, #FAF3E8 100%)' }}
    >
      <Navbar />

      <header className="pt-20 md:pt-32 lg:pt-48 pb-10 md:pb-12 lg:pb-16 px-4 md:px-6 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 max-w-4xl">
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-brand">
              {(() => { const CatIcon = categoryIcons[event?.category || ''] || Trophy; return <CatIcon size={16} />; })()}
              {event?.category}
              <span className={`px-2.5 py-1 rounded-lg font-bold tracking-wider ${event?.is_team
                  ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                }`}>
                {event?.is_team ? 'Group' : 'Solo'}
              </span>
              {event?.is_prelim ? <span style={{ color: '#B8A890' }}>Preliminary</span> : null}
            </div>
            <h1 className="title-extra-bold text-4xl md:text-8xl leading-tight" style={{ color: '#1A1208' }}>{event?.name ?? 'Loading...'}</h1>
            <p className="text-base md:text-xl" style={{ color: '#8B7D6B' }}>
              Detailed event rules, specifications, and schedule for {event?.name ?? 'this event'}.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <Link to="/events" className="btn-elite">
                View All Events <ArrowUpRight size={20} />
              </Link>
            </div>
            {loadError ? (
              <div className="text-xs text-brand uppercase tracking-[0.4em]">{loadError}</div>
            ) : null}
          </div>
        </div>
      </header>

      <section className="px-6">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Max Entries / Institute', value: event?.max_entries_per_institute ?? '-', icon: User },
            {
              label: event?.is_team ? 'Team Size' : 'Participants',
              value: event
                ? event.is_team
                  ? event.min_team_size === event.max_team_size
                    ? String(event.min_team_size ?? '-')
                    : `${event.min_team_size ?? '-'}\u2013${event.max_team_size ?? '-'}`
                  : '1 (Solo)'
                : '-',
              icon: Users,
            },
            { label: 'Max Accompanists', value: event?.max_accompanists ?? '-', icon: Users },
            { label: 'Time Limit', value: event ? formatTime(event.min_time_minutes, event.max_time_minutes) : '-', icon: Clock },
          ].map((stat) => (
            <div key={stat.label} className="elite-glass p-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-brand" style={{ background: 'rgba(255, 107, 53, 0.06)' }}>
                <stat.icon size={18} />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: '#B8A890' }}>{stat.label}</div>
                <div className="text-2xl font-black tracking-tighter" style={{ color: '#1A1208' }}>{stat.value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {scores.length > 0 && (
        <section className="px-6 mt-16">
          <div className="container mx-auto">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-brand mb-8 justify-center">
              <Trophy size={18} /> Official Results
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {scores.sort((a, b) => (a.rank || 0) - (b.rank || 0)).map((score) => {
                const institute = institutes.find(i => i.id === score.institute_id);
                const rankLabel = score.rank === 1 ? 'WINNER' : score.rank === 2 ? '1st RUNNER UP' : score.rank === 3 ? '2nd RUNNER UP' : `RANK ${score.rank}`;

                return (
                  <div key={score.id} className={`elite-glass p-8 flex flex-col items-center justify-center text-center ${score.rank === 1 ? 'border-brand/50 bg-brand/5 transform md:-translate-y-4' : ''}`}>
                    <div className={`text-xs font-black uppercase tracking-widest mb-4 ${score.rank === 1 ? 'text-brand' : ''}`} style={score.rank !== 1 ? { color: '#4A3F2F' } : undefined}>{rankLabel}</div>
                    <div className="text-xl md:text-2xl font-black mb-2 leading-tight" style={{ color: '#1A1208' }}>
                      {institute?.name || 'Unknown'}
                    </div>
                    <div className="mt-4 text-2xl font-black text-brand">{score.points} pts</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Event Rules ── */}
      {event && eventRules[event.name] && (
        <section className="px-6 mt-16">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-brand mb-8 justify-center">
              <BookOpen size={18} /> Rules & Regulations
            </div>
            <div className="elite-glass p-8 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                {(() => { const CatIcon = categoryIcons[event.category] || Trophy; return <div className="w-10 h-10 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand"><CatIcon size={18} /></div>; })()}
                <div>
                  <h3 className="text-lg font-black tracking-tight" style={{ color: '#1A1208' }}>{event.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: '#B8A890' }}>{event.category} · {event.is_team ? 'Group Event' : 'Solo Event'}</p>
                </div>
              </div>
              <div className="space-y-4">
                {eventRules[event.name].map((rule, idx) => {
                  const isSubItem = rule.startsWith('Round ') || rule.startsWith('From Round');
                  return (
                    <div key={idx} className={`flex gap-3 ${isSubItem ? 'ml-8' : ''}`}>
                      <div className={`flex-shrink-0 mt-0.5 ${isSubItem ? 'w-5 h-5' : 'w-6 h-6'}`}>
                        {isSubItem ? (
                          <div className="w-5 h-5 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                            <span className="text-[8px] font-black text-purple-600">{rule.match(/Round (\d)/)?.[1] || '•'}</span>
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center">
                            <CheckCircle2 size={12} className="text-brand" />
                          </div>
                        )}
                      </div>
                      <p className={`text-sm leading-relaxed ${isSubItem ? '' : ''}`} style={{ color: isSubItem ? '#8B7D6B' : '#4A3F2F' }}>{rule}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(26, 18, 8, 0.06)' }}>
                <p className="text-[10px] uppercase tracking-widest text-center" style={{ color: '#B8A890' }}>The decision of the judges shall be final and binding on all participants</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="px-6 mt-16">
        <div className="container mx-auto">
          <div className="elite-glass p-8">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-brand mb-6">
              <Calendar size={14} /> Schedule (Placeholder)
            </div>
            <div className="space-y-4 text-sm" style={{ color: '#4A3F2F' }}>
              <div className="flex justify-between">
                <span>Day 1</span>
                <span>March 18 - TBD</span>
              </div>
              <div className="flex justify-between">
                <span>Day 2</span>
                <span>March 19 - TBD</span>
              </div>
              <div className="flex justify-between">
                <span>Day 3</span>
                <span>March 20 - TBD</span>
              </div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest" style={{ color: '#B8A890' }}>
                <MapPin size={12} /> Venue Placeholder
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.main>
  );
};

export default EventDetail;
