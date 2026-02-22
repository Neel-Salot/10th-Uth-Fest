import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { Search, Music, Users, Mic2, Theater, Sparkles, Trophy, ArrowUpRight, Clock, User } from 'lucide-react';
import { events as fallbackEvents } from '../data/events';
import { fetchEvents } from '../lib/supabaseApi';
import type { EventRow } from '../lib/supabaseApi';

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
        if (min >= 60 && max >= 60) { const mH = min / 60; const xH = max / 60; return `${mH % 1 === 0 ? mH : mH.toFixed(1)}–${xH % 1 === 0 ? xH : xH.toFixed(1)} Hrs`; }
        return `${min}–${max} min`;
    }
    return 'N/A';
};

const formatTeamSize = (ev: EventRow): string => {
    if (!ev.is_team) return 'Solo';
    if (ev.min_team_size === ev.max_team_size) return `${ev.min_team_size} members`;
    return `${ev.min_team_size ?? '?'}–${ev.max_team_size ?? '?'} members`;
};

interface EventCardProps {
    event: EventRow;
    icon: React.ElementType;
    delay?: number;
    onClick?: () => void;
}

const EventCard = ({ event, icon: Icon, delay, onClick }: EventCardProps) => (
    <motion.button
        type="button"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.6 }}
        className="elite-glass p-8 group hover:border-brand/30 transition-all cursor-pointer overflow-visible relative text-left rounded-[40px]"
        onClick={onClick}
    >

        <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-3xl flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-all duration-500 shadow-xl"
                    style={{ background: 'rgba(255, 107, 53, 0.06)', border: '1px solid rgba(255, 107, 53, 0.1)' }}>
                    <Icon size={28} />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${event.is_team
                    ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                    : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    }`}>
                    {event.is_team ? 'Group' : 'Solo'}
                </span>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all"
                style={{ border: '1px solid rgba(26, 18, 8, 0.08)', color: '#8B7D6B' }}>
                <ArrowUpRight size={18} />
            </div>
        </div>

        <div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: '#B8A890' }}>{event.category}</div>
            <h3 className="text-2xl font-black tracking-tighter mb-4 leading-tight group-hover:text-brand transition-colors" style={{ color: '#1A1208' }}>{event.name}</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-medium uppercase tracking-widest" style={{ color: '#B8A890' }}>
                <span className="flex items-center gap-1"><Clock size={10} /> {formatTime(event.min_time_minutes, event.max_time_minutes)}</span>
                <span className="flex items-center gap-1"><Users size={10} /> {formatTeamSize(event)}</span>
                <span className="flex items-center gap-1"><User size={10} /> {event.max_entries_per_institute ?? '∞'} {Number(event.max_entries_per_institute) === 1 ? 'entry' : 'entries'}/inst.</span>
            </div>
        </div>
    </motion.button>
);

const Events = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [eventRows, setEventRows] = useState<EventRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    const scrollCategories = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -120 : 120;
            scrollContainerRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth',
            });
            setTimeout(checkScroll, 300);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const loadEvents = async () => {
            try {
                const data = await fetchEvents();
                if (isMounted) {
                    setEventRows(data);
                }
            } catch (_error) {
                if (isMounted) {
                    setLoadError('Unable to load events from Supabase. Showing local fallback.');
                    setEventRows(
                        fallbackEvents.map((event) => {
                            const parts = event.participantsPerTeam.split('-').map(Number);
                            return {
                                id: String(event.id),
                                name: event.name,
                                category: event.category,
                                is_team: event.participantsPerTeam !== '1',
                                min_team_size: parts[0] || 1,
                                max_team_size: parts[parts.length - 1] || 1,
                                max_entries_per_institute: Number(event.maxEntries),
                                max_accompanists: Number(event.maxAccompanists),
                                min_time_minutes: event.minTime === 'N/A' ? null : Number(event.minTime),
                                max_time_minutes: event.maxTime === 'N/A' ? null : Number(event.maxTime),
                                venue: null,
                                event_date: null,
                                event_time: null,
                                rules_pdf_url: null,
                                is_prelim: event.isPrelim ?? null,
                            };
                        })
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };
        loadEvents();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        checkScroll();
        const container = scrollContainerRef.current;
        container?.addEventListener('scroll', checkScroll);
        return () => container?.removeEventListener('scroll', checkScroll);
    }, []);

    const categoryIcons: Record<string, React.ElementType> = {
        All: Trophy,
        Music: Music,
        Dance: Users,
        Literary: Mic2,
        Theatre: Theater,
        'Fine Arts': Sparkles,
        Diverse: Trophy,
    };

    const categories = ['All', ...Array.from(new Set(eventRows.map((event) => event.category)))].map((name) => ({
        name,
        icon: categoryIcons[name] || Trophy,
    }));

    // Apply category filter from URL query parameter
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        if (categoryParam && eventRows.length > 0) {
            const categoryMap: Record<string, string> = {
                music: 'Music',
                dance: 'Dance',
                drama: 'Theatre',
                literary: 'Literary',
                visual: 'Fine Arts',
            };
            const mappedCategory = categoryMap[categoryParam.toLowerCase()];
            if (mappedCategory && categories.some((cat) => cat.name === mappedCategory)) {
                setActiveCategory(mappedCategory);
            }
        }
        // Scroll to top when navigating with category parameter
        if (categoryParam) {
            window.scrollTo({ top: 0, behavior: 'auto' });
        }
    }, [searchParams, eventRows, categories]);

    const filteredEvents = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return eventRows
            .filter((event) => {
                const matchesCategory = activeCategory === 'All' || event.category === activeCategory;
                const matchesQuery =
                    !normalizedQuery ||
                    event.name.toLowerCase().includes(normalizedQuery) ||
                    event.category.toLowerCase().includes(normalizedQuery);
                return matchesCategory && matchesQuery;
            })
            .sort((a, b) => {
                const catOrder = ['Dance', 'Music', 'Theatre', 'Literary', 'Fine Arts', 'Diverse'];
                const aCat = catOrder.indexOf(a.category);
                const bCat = catOrder.indexOf(b.category);
                if (aCat !== bCat) return (aCat === -1 ? 99 : aCat) - (bCat === -1 ? 99 : bCat);
                const aTeam = a.is_team ? 1 : 0;
                const bTeam = b.is_team ? 1 : 0;
                if (aTeam !== bTeam) return aTeam - bTeam;
                return a.name.localeCompare(b.name);
            });
    }, [activeCategory, query, eventRows]);

    // Group filtered events by category
    const groupedEvents = useMemo(() => {
        const catOrder = ['Dance', 'Music', 'Theatre', 'Literary', 'Fine Arts', 'Diverse'];
        const groups: { category: string; events: EventRow[] }[] = [];
        const map = new Map<string, EventRow[]>();
        filteredEvents.forEach((ev) => {
            if (!map.has(ev.category)) map.set(ev.category, []);
            map.get(ev.category)!.push(ev);
        });
        // Ordered by catOrder
        catOrder.forEach((cat) => {
            if (map.has(cat)) groups.push({ category: cat, events: map.get(cat)! });
        });
        // Any remaining unknown categories
        map.forEach((evts, cat) => {
            if (!catOrder.includes(cat)) groups.push({ category: cat, events: evts });
        });
        return groups;
    }, [filteredEvents]);

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen pb-40 relative"
            style={{ background: 'linear-gradient(180deg, #FEFCF8 0%, #FDF8F0 50%, #FAF3E8 100%)' }}
        >
            <Navbar />

            <header className="pt-20 md:pt-32 lg:pt-48 pb-12 md:pb-16 lg:pb-24 px-4 md:px-6 relative z-10">
                <div className="container mx-auto mb-8">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="max-w-4xl"
                    >
                        <span className="text-brand font-black text-xs uppercase tracking-[0.4em] md:tracking-[0.6em] mb-4 md:mb-8 block">Event Catalog</span>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-black tracking-tighter mb-8 md:mb-12 leading-tight">
                            <span style={{ color: '#1A1208' }}>CENTRAL</span> <br />
                            <span className="gradient-orange">SPHERES.</span>
                        </h1>
                    </motion.div>
                </div>

                <div className="w-full">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex flex-col md:flex-row gap-6 md:gap-8 items-end px-6 md:px-12 lg:px-20"
                    >
                        <div className="relative w-full md:flex-1 md:max-w-2xl">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2" size={18} style={{ color: '#B8A890' }} />
                            <input
                                type="text"
                                placeholder="Search specific contest..."
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                className="w-full rounded-2xl py-5 pl-14 pr-6 focus:ring-2 focus:ring-brand/50 outline-none transition-all font-medium"
                                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(26,18,8,0.08)', color: '#1A1208' }}
                            />
                        </div>
                        <div className="flex gap-4 items-center w-full md:flex-1">
                            {canScrollLeft && (
                                <motion.button
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.3 }}
                                    type="button"
                                    onClick={() => scrollCategories('left')}
                                    className="md:hidden w-10 h-10 rounded-lg bg-brand text-white flex items-center justify-center flex-shrink-0 hover:bg-brand/80 transition-colors"
                                    aria-label="Scroll left"
                                >
                                    <span className="text-lg font-bold">‹</span>
                                </motion.button>
                            )}
                            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 flex-1 no-scrollbar" ref={scrollContainerRef}>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.name}
                                        type="button"
                                        onClick={() => setActiveCategory(cat.name)}
                                        className={`px-8 py-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${activeCategory === cat.name
                                            ? 'bg-brand text-white border-brand'
                                            : 'hover:border-brand/20 text-[#8B7D6B]'
                                            }`}
                                        style={activeCategory !== cat.name ? { background: 'rgba(255,255,255,0.6)', borderColor: 'rgba(26,18,8,0.06)', color: '#8B7D6B' } : undefined}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                            {canScrollRight && (
                                <motion.button
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.3 }}
                                    type="button"
                                    onClick={() => scrollCategories('right')}
                                    className="md:hidden w-10 h-10 rounded-lg bg-brand text-white flex items-center justify-center flex-shrink-0 hover:bg-brand/80 transition-colors"
                                    aria-label="Scroll right"
                                >
                                    <span className="text-lg font-bold">›</span>
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </header>

            <section className="px-6">
                <div className="container mx-auto">
                    {isLoading ? (
                        <div className="elite-glass p-10 text-center" style={{ color: '#8B7D6B' }}>Loading events...</div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="elite-glass p-10 text-center" style={{ color: '#8B7D6B' }}>
                            No events match your search. Try a different keyword or category.
                        </div>
                    ) : (
                        <div className="space-y-16">
                            {groupedEvents.map((group, gi) => {
                                const CatIcon = categoryIcons[group.category] || Trophy;
                                // Calculate the running index offset for seqNo
                                let seqOffset = 0;
                                for (let k = 0; k < gi; k++) seqOffset += groupedEvents[k].events.length;
                                return (
                                    <div key={group.category}>
                                        {/* Category Section Header */}
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            whileInView={{ y: 0, opacity: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5 }}
                                            className="flex items-center gap-4 mb-8"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                                                <CatIcon size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase" style={{ color: '#1A1208' }}>{group.category}</h2>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: '#B8A890' }}>{group.events.length} event{group.events.length !== 1 ? 's' : ''}</p>
                                            </div>
                                            <div className="flex-1 h-px ml-4" style={{ background: 'linear-gradient(to right, rgba(255,107,53,0.15), transparent)' }} />
                                        </motion.div>
                                        {/* Events Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                                            {group.events.map((event, i) => (
                                                <EventCard
                                                    key={event.id}
                                                    event={event}
                                                    icon={categoryIcons[event.category] || Trophy}
                                                    delay={Math.min(i * 0.02, 0.3)}
                                                    onClick={() => navigate(`/events/${event.id}`)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            <section className="px-6 mt-24">
                <div className="container mx-auto">
                    {loadError ? (
                        <div className="mb-6 text-xs text-brand uppercase tracking-[0.4em]">{loadError}</div>
                    ) : null}
                </div>
            </section>
        </motion.main>
    );
};

export default Events;
