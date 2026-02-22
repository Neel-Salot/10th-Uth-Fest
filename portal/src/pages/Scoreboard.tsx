import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import { Trophy, Star, RefreshCw, Sparkles, Users, Music, Mic2, Theater, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { fetchScores, fetchInstitutes, fetchEvents } from '../lib/supabaseApi';
import type { EventRow } from '../lib/supabaseApi';


interface LeaderboardRowProps {
    rank: number;
    institute: string;
    points: number;
    trend: string;
    delay?: number;
}

const LeaderboardRow = ({ rank, institute, points, delay }: LeaderboardRowProps) => {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className="group relative"
        >
            <div className={`elite-glass p-5 md:p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-8 border transition-all duration-500 overflow-hidden ${rank === 1 ? 'border-yellow-500/30 bg-yellow-500/[0.06]' :
                rank === 2 ? 'border-slate-400/30 bg-slate-400/[0.04]' :
                    rank === 3 ? 'border-orange-500/30 bg-orange-500/[0.06]' :
                        ''
                }`}>
                <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto">
                    <div className={`w-12 h-12 md:w-20 md:h-20 rounded-2xl flex items-center justify-center font-black text-xl md:text-3xl shrink-0 font-outfit ${rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-2xl shadow-yellow-500/40' :
                        rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-2xl shadow-slate-400/40' :
                            rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-2xl shadow-orange-500/40' :
                                ''
                        }`}
                        style={rank > 3 ? { background: 'rgba(26, 18, 8, 0.04)', color: '#B8A890', border: '1px solid rgba(26, 18, 8, 0.06)' } : undefined}
                    >
                        {rank}
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className={`text-xl sm:text-2xl md:text-4xl font-outfit font-black tracking-tighter uppercase leading-none mb-2 ${rank === 1 ? 'text-yellow-600' : rank === 2 ? 'text-slate-500' : rank === 3 ? 'text-orange-500' : ''
                            }`}
                            style={rank > 3 ? { color: '#1A1208' } : undefined}
                        >{institute}</h3>
                        <div className="flex items-center gap-3">
                            <div className={`text-[9px] md:text-xs font-black uppercase tracking-[0.3em] font-manrope ${rank <= 3 ? '' : ''
                                }`}
                                style={{ color: rank <= 3 ? '#4A3F2F' : '#B8A890' }}
                            >
                                {rank === 1 ? 'Championship Leader' : rank === 2 ? 'First Runner Up' : rank === 3 ? 'Second Runner Up' : 'Active Contender'}
                            </div>
                            {rank <= 3 && <div className="h-[1px] w-8 hidden md:block" style={{ background: 'rgba(26, 18, 8, 0.1)' }} />}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-8 md:gap-16 pt-4 md:pt-0" style={{ borderTop: rank > 0 ? undefined : undefined }}>
                    <div className="text-left md:text-right font-manrope">
                        <div className="text-[10px] font-black uppercase tracking-widest mb-1 font-mono" style={{ color: '#B8A890' }}>Rank Status</div>
                        <div className={`text-xs md:text-sm font-black uppercase tracking-widest ${rank <= 3 ? 'text-brand' : ''}`} style={rank > 3 ? { color: '#8B7D6B' } : undefined}>
                            {rank <= 3 ? (rank === 1 ? 'Victory' : 'Podium') : 'Competing'}
                        </div>
                    </div>
                    <div className="text-right min-w-[100px] md:min-w-[160px] font-outfit">
                        <div className="text-[10px] font-black uppercase tracking-widest mb-1 font-mono font-manrope" style={{ color: '#B8A890' }}>Aggregated Points</div>
                        <div className={`text-4xl md:text-7xl font-black tracking-tighter leading-none ${rank === 1 ? 'text-yellow-600' : rank === 2 ? 'text-slate-500' : rank === 3 ? 'text-orange-500' : ''
                            }`}
                            style={rank > 3 ? { color: '#1A1208' } : undefined}
                        >{points}</div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const Podium = ({ topThree }: { topThree: Array<{ rank: number, institute: string, points: number }> }) => {
    if (!topThree || topThree.length === 0) return null;

    const first = topThree.find(i => i.rank === 1);
    const second = topThree.find(i => i.rank === 2);
    const third = topThree.find(i => i.rank === 3);

    return (
        <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-0 mb-20 px-4">
            {/* Second Place */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full md:w-64 order-2 md:order-1"
            >
                <div className="text-center mb-4">
                    <div className="text-slate-500 font-outfit font-black text-xl mb-1 uppercase tracking-tighter">1st Runner Up</div>
                    <div className="font-manrope font-bold text-xs truncate px-4" style={{ color: '#4A3F2F' }}>{second?.institute || 'TBD'}</div>
                </div>
                <div className="h-32 md:h-48 elite-glass rounded-t-3xl border-slate-400/20 bg-slate-400/5 flex flex-col items-center justify-center border-b-0">
                    <div className="w-12 h-12 rounded-full bg-slate-400/20 flex items-center justify-center text-slate-500 font-outfit font-black mb-2 border border-slate-400/30">2</div>
                    <div className="text-3xl font-outfit font-black text-slate-500">{second?.points || 0}</div>
                    <div className="text-[10px] font-manrope font-black uppercase tracking-widest mt-1" style={{ color: '#B8A890' }}>Points</div>
                </div>
            </motion.div>

            {/* First Place */}
            <motion.div
                initial={{ y: 70, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-full md:w-80 z-20 order-1 md:order-2"
            >
                <div className="text-center mb-6">
                    <Trophy className="mx-auto text-yellow-500 mb-2 drop-shadow-glow" size={40} />
                    <div className="text-yellow-500 font-outfit font-black text-3xl mb-1 uppercase tracking-tighter">Champion</div>
                    <div className="font-manrope font-black text-sm uppercase tracking-wide truncate px-4" style={{ color: '#1A1208' }}>{first?.institute || 'TBD'}</div>
                </div>
                <div className="h-48 md:h-72 elite-glass rounded-t-3xl border-yellow-500/40 bg-yellow-500/10 flex flex-col items-center justify-center border-b-0 relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-2xl font-outfit font-black shadow-2xl shadow-yellow-500/50">1</div>
                    <div className="text-6xl font-outfit font-black text-yellow-500 mt-4">{first?.points || 0}</div>
                    <div className="text-xs font-manrope font-black uppercase tracking-[0.3em] mt-2" style={{ color: '#8B7D6B' }}>Aggregated Points</div>
                </div>
            </motion.div>

            {/* Third Place */}
            <motion.div
                initial={{ y: 90, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="w-full md:w-64 order-3"
            >
                <div className="text-center mb-4">
                    <div className="text-orange-500 font-outfit font-black text-xl mb-1 uppercase tracking-tighter">2nd Runner Up</div>
                    <div className="font-manrope font-bold text-xs truncate px-4" style={{ color: '#4A3F2F' }}>{third?.institute || 'TBD'}</div>
                </div>
                <div className="h-24 md:h-32 elite-glass rounded-t-3xl border-orange-500/20 bg-orange-500/5 flex flex-col items-center justify-center border-b-0">
                    <div className="w-10 h-10 rounded-full bg-orange-400/20 flex items-center justify-center text-orange-500 font-outfit font-black mb-1 border border-orange-400/30">3</div>
                    <div className="text-2xl font-outfit font-black text-orange-500">{third?.points || 0}</div>
                    <div className="text-[10px] font-manrope font-black uppercase tracking-widest mt-0.5" style={{ color: '#B8A890' }}>Points</div>
                </div>
            </motion.div>
        </div>
    );
};

const CATEGORY_ORDER = ['Dance', 'Music', 'Theatre', 'Literary', 'Fine Arts', 'Diverse'];
const categoryIcons: Record<string, React.ElementType> = {
    Dance: Users,
    Music: Music,
    Literary: Mic2,
    Theatre: Theater,
    'Fine Arts': Sparkles,
    Diverse: Trophy,
};

const Scoreboard = () => {
    const [leaderboards, setLeaderboards] = useState<Array<{ rank: number; institute: string; points: number; trend: string }>>([]);
    const [categoryLeaderboards, setCategoryLeaderboards] = useState<Record<string, Array<{ rank: number; institute: string; points: number }>>>({});
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [activeEventId, setActiveEventId] = useState<string | null>(null);
    const [eventResults, setEventResults] = useState<Record<string, Array<{ rank: number; institute: string; points: number }>>>({});
    const [allEvents, setAllEvents] = useState<EventRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [loadError, setLoadError] = useState('');

    const categoryEvents = allEvents
        .filter((e) => activeCategory && e.category === activeCategory)
        .sort((a, b) => {
            const aTeam = a.is_team ? 1 : 0;
            const bTeam = b.is_team ? 1 : 0;
            if (aTeam !== bTeam) return aTeam - bTeam;
            return a.name.localeCompare(b.name);
        });

    const loadScores = async () => {
        try {
            const [scoreData, instituteData, eventData] = await Promise.all([
                fetchScores(),
                fetchInstitutes(),
                fetchEvents(),
            ]);

            // Build utility maps
            const instituteMap = new Map(instituteData.map((i) => [i.id, i.name]));
            const eventMap = new Map(eventData.map((e) => [e.id, { name: e.name, category: e.category }]));

            // Only show published results
            const publishedScores = scoreData.filter((s) => s.is_published);

            // 1. Overall Rankings
            const instituteScores: Record<string, { points: number; name: string }> = {};
            publishedScores.forEach((score) => {
                const institute = instituteMap.get(score.institute_id);
                if (institute) {
                    if (!instituteScores[score.institute_id]) {
                        instituteScores[score.institute_id] = { points: 0, name: institute };
                    }
                    instituteScores[score.institute_id].points += score.points ?? 0;
                }
            });

            const leaderboard = Object.entries(instituteScores)
                .map(([_, data]) => ({
                    institute: data.name,
                    points: data.points,
                    trend: '',
                }))
                .sort((a, b) => b.points - a.points)
                .map((entry, index) => ({
                    rank: index + 1,
                    ...entry,
                }));

            // 2. Category Leaderboards (Institute Rankings within each Category)
            const catLeads: Record<string, Record<string, number>> = {};

            publishedScores.forEach((score) => {
                const eventInfo = eventMap.get(score.event_id);
                if (!eventInfo) return;

                const cat = eventInfo.category;
                if (!catLeads[cat]) catLeads[cat] = {};

                catLeads[cat][score.institute_id] = (catLeads[cat][score.institute_id] || 0) + (score.points ?? 0);
            });

            const processedCatLeads: Record<string, any[]> = {};
            Object.keys(catLeads).forEach(cat => {
                const sorted = Object.entries(catLeads[cat])
                    .map(([id, pts]) => ({
                        institute: instituteMap.get(id) || 'Unknown',
                        points: pts
                    }))
                    .sort((a, b) => b.points - a.points)
                    .map((item, idx) => ({
                        rank: idx + 1,
                        ...item
                    }));
                processedCatLeads[cat] = sorted;
            });

            // 3. Per-event results
            const evResults: Record<string, Array<{ rank: number; institute: string; points: number }>> = {};
            publishedScores.forEach((score) => {
                if (!evResults[score.event_id]) evResults[score.event_id] = [];
                evResults[score.event_id].push({
                    rank: score.rank ?? 99,
                    institute: instituteMap.get(score.institute_id) || 'Unknown',
                    points: score.points ?? 0,
                });
            });
            Object.values(evResults).forEach((arr) => arr.sort((a, b) => a.rank - b.rank));

            setAllEvents(eventData);
            setLeaderboards(leaderboard);
            setCategoryLeaderboards(processedCatLeads);
            setEventResults(evResults);
            setLoadError('');
        } catch (_error) {
            console.error('Scoreboard load error:', _error);
            setLoadError('Unable to load scores. Database connection issues.');
        }
    };

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            if (isMounted) await loadScores();
            if (isMounted) setIsLoading(false);
        };
        load();

        // Auto-refresh every 60 seconds
        const interval = setInterval(loadScores, 60000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    const topInstitute = leaderboards[0]?.institute ?? 'N/A';
    const totalInstitutes = leaderboards.length;

    const activeEventResults = activeEventId ? (eventResults[activeEventId] || []) : [];
    const activeEvent = allEvents.find((e) => e.id === activeEventId);

    if (isLoading) {
        return (
            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-h-screen flex flex-col items-center justify-center p-6"
                style={{ background: '#FEFCF8' }}
            >
                <Navbar />
                <div className="flex flex-col items-center gap-6">
                    <RefreshCw size={48} className="animate-spin text-brand/50" />
                    <div className="text-[10px] font-black uppercase tracking-[0.5em]" style={{ color: '#8B7D6B' }}>Syncing Championship Data</div>
                </div>
            </motion.main>
        );
    }

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen pb-40"
            style={{ background: 'linear-gradient(180deg, #FEFCF8 0%, #FDF8F0 50%, #FAF3E8 100%)' }}
        >
            <Navbar />

            <header className="pt-24 md:pt-44 pb-16 md:pb-32 px-4 md:px-6 relative z-10 overflow-hidden">
                <div className="container mx-auto max-w-6xl relative">
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center gap-3 text-brand font-black text-xs uppercase tracking-[0.4em] mb-8">
                            <Star size={18} className="animate-pulse" />
                            <span>The Grand Arena</span>
                        </div>

                        <h1 className="text-6xl sm:text-7xl md:text-9xl font-outfit font-black tracking-tighter mb-12 leading-[0.85] uppercase" style={{ color: '#1A1208' }}>
                            Hall of <br />
                            <span className="gradient-orange">Champions</span>
                        </h1>

                        {loadError && (
                            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 font-bold text-sm font-manrope">
                                {loadError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20 max-w-4xl">
                            {[
                                { label: 'Overall Leader', value: topInstitute, icon: Trophy, color: 'text-yellow-500', desc: 'Leading the race' },
                                { label: 'Participants', value: totalInstitutes, icon: Users, color: 'text-brand', desc: 'Competing institutes' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 + i * 0.1 }}
                                    className="elite-glass p-8 group hover:border-brand/40 transition-all duration-500"
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color} mb-6 group-hover:scale-110 transition-transform`}
                                        style={{ background: 'rgba(255, 107, 53, 0.06)', border: '1px solid rgba(26, 18, 8, 0.06)' }}>
                                        <stat.icon size={28} />
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 font-manrope" style={{ color: '#B8A890' }}>{stat.label}</div>
                                    <div className="text-2xl md:text-3xl font-outfit font-black tracking-tighter mb-1 break-words line-clamp-2" style={{ color: '#1A1208' }}>{stat.value}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest font-manrope" style={{ color: '#B8A890' }}>{stat.desc}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </header>

            <section className="px-4 md:px-6 relative z-10">
                <div className="container mx-auto max-w-6xl">
                    {/* Podium Section */}
                    {leaderboards.length >= 3 && (
                        <div className="mb-32">
                            <div className="flex items-center gap-3 text-brand font-black text-xs uppercase tracking-[0.4em] mb-8 justify-center">
                                <Sparkles size={18} />
                                <span>Tournament Podium</span>
                            </div>
                            <Podium topThree={leaderboards.slice(0, 3)} />
                        </div>
                    )}

                    {/* Overall Standings Section */}
                    <div className="mb-32">
                        <div className="flex flex-col sm:flex-row justify-between items-end gap-6 mb-12 pb-12 font-outfit" style={{ borderBottom: '1px solid rgba(26, 18, 8, 0.06)' }}>
                            <div className="max-w-xl">
                                <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4" style={{ color: '#1A1208' }}>Overall Standings</h2>
                                <p className="font-manrope font-medium" style={{ color: '#8B7D6B' }}>Aggregate scores from all competition categories including Music, Dance, Theatre, and Fine Arts.</p>
                            </div>
                            <button
                                onClick={async () => {
                                    setIsRefreshing(true);
                                    await loadScores();
                                    setIsRefreshing(false);
                                }}
                                disabled={isRefreshing}
                                className="group flex items-center gap-3 px-6 py-4 elite-glass !rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-brand transition-all active:scale-95 font-manrope"
                                style={{ color: '#4A3F2F' }}
                            >
                                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
                                {isRefreshing ? 'Retreiving...' : 'Sync Data'}
                            </button>
                        </div>

                        <div className="space-y-4">
                            {leaderboards.length > 0 ? (
                                leaderboards.map((row, i) => (
                                    <LeaderboardRow key={i} {...row} delay={0.2 + (i * 0.1)} />
                                ))
                            ) : (
                                <div className="text-center py-32 elite-glass">
                                    <Trophy size={48} className="mx-auto mb-6" style={{ color: '#B8A890' }} />
                                    <p className="font-black font-manrope uppercase tracking-widest" style={{ color: '#8B7D6B' }}>Competition yet to commence</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Category → Event → Results */}
                    <div id="category-winners">
                        <div className="mb-16">
                            <div className="flex items-center gap-3 text-brand font-black text-xs uppercase tracking-[0.4em] mb-4 font-manrope">
                                <Sparkles size={18} />
                                <span>Event-wise Results</span>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-outfit font-black tracking-tighter uppercase mb-6" style={{ color: '#1A1208' }}>Event <span className="gradient-orange">Results</span></h2>
                            <p className="mb-12 max-w-2xl font-manrope font-medium px-1" style={{ color: '#8B7D6B' }}>Select a category below, then pick an event to view its published results.</p>

                            {/* Step 1: Category Tabs */}
                            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar font-manrope">
                                {CATEGORY_ORDER.map((cat) => {
                                    const CatIcon = categoryIcons[cat] || Trophy;
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => { setActiveCategory(activeCategory === cat ? null : cat); setActiveEventId(null); }}
                                            className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border flex items-center gap-2 ${activeCategory === cat
                                                ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20'
                                                : 'hover:border-brand/20 text-[#8B7D6B]'
                                                }`}
                                            style={activeCategory !== cat ? { background: 'rgba(255,255,255,0.6)', borderColor: 'rgba(26,18,8,0.06)', color: '#8B7D6B' } : undefined}
                                        >
                                            <CatIcon size={14} />
                                            {cat}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step 2: Event List for selected category */}
                        {activeCategory && !activeEventId && (
                            <div className="space-y-3 mb-8">
                                <div className="text-xs font-black uppercase tracking-widest mb-4 font-manrope" style={{ color: '#B8A890' }}>
                                    {categoryEvents.length} event{categoryEvents.length !== 1 ? 's' : ''} in {activeCategory}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {categoryEvents.map((ev, idx) => {
                                        const hasResults = (eventResults[ev.id] || []).length > 0;
                                        const CatIcon = categoryIcons[ev.category] || Trophy;
                                        return (
                                            <motion.button
                                                key={ev.id}
                                                initial={{ y: 10, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: idx * 0.04 }}
                                                onClick={() => setActiveEventId(ev.id)}
                                                className={`elite-glass p-5 flex items-center gap-4 text-left transition-all border ${hasResults
                                                    ? 'hover:border-brand/30 cursor-pointer'
                                                    : 'opacity-50 cursor-default'
                                                    }`}
                                            >
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-brand flex-shrink-0"
                                                    style={{ background: 'rgba(255, 107, 53, 0.06)', border: '1px solid rgba(26, 18, 8, 0.06)' }}>
                                                    <CatIcon size={18} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-outfit font-bold text-sm truncate" style={{ color: '#1A1208' }}>{ev.name}</div>
                                                    <div className="text-[10px] font-manrope uppercase tracking-widest mt-0.5" style={{ color: '#B8A890' }}>
                                                        {ev.is_team ? `Group · ${ev.min_team_size}-${ev.max_team_size} members` : 'Solo'}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {hasResults ? (
                                                        <>
                                                            <span className="text-[9px] font-bold text-brand bg-brand/10 px-2 py-1 rounded-full">Results</span>
                                                            <ChevronRight size={14} style={{ color: '#B8A890' }} />
                                                        </>
                                                    ) : (
                                                        <span className="text-[9px] font-bold px-2 py-1 rounded-full" style={{ color: '#B8A890', background: 'rgba(26, 18, 8, 0.04)' }}>Pending</span>
                                                    )}
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Event Results */}
                        {activeEventId && activeEvent && (
                            <div>
                                <button
                                    onClick={() => setActiveEventId(null)}
                                    className="flex items-center gap-2 text-xs font-bold hover:text-brand mb-6 transition-colors font-manrope uppercase tracking-widest"
                                    style={{ color: '#8B7D6B' }}
                                >
                                    <ChevronRight size={14} className="rotate-180" />
                                    Back to {activeCategory} events
                                </button>
                                <div className="elite-glass p-6 md:p-8 mb-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        {(() => { const CatIcon = categoryIcons[activeEvent.category] || Trophy; return <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand"><CatIcon size={22} /></div>; })()}
                                        <div>
                                            <h3 className="text-2xl md:text-3xl font-outfit font-black tracking-tighter" style={{ color: '#1A1208' }}>{activeEvent.name}</h3>
                                            <div className="text-[10px] uppercase tracking-widest font-manrope" style={{ color: '#B8A890' }}>
                                                {activeEvent.category} · {activeEvent.is_team ? `Group (${activeEvent.min_team_size}-${activeEvent.max_team_size})` : 'Solo'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {activeEventResults.length > 0 ? (
                                        activeEventResults.map((item, idx) => (
                                            <motion.div
                                                key={`${item.institute}-${idx}`}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: idx * 0.08 }}
                                                className={`elite-glass p-6 md:p-8 flex items-center justify-between border transition-all duration-500 ${item.rank === 1 ? 'border-yellow-500/40 bg-yellow-500/[0.06]' :
                                                    item.rank === 2 ? 'border-slate-400/30 bg-slate-400/[0.04]' :
                                                        item.rank === 3 ? 'border-orange-500/30 bg-orange-500/[0.06]' :
                                                            ''
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4 md:gap-8">
                                                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center font-outfit font-black text-lg md:text-2xl shrink-0 ${item.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-xl shadow-yellow-500/30' :
                                                        item.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-xl shadow-slate-400/30' :
                                                            item.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-xl shadow-orange-500/30' :
                                                                ''
                                                        }`}
                                                        style={item.rank > 3 ? { background: 'rgba(26, 18, 8, 0.04)', color: '#B8A890', border: '1px solid rgba(26, 18, 8, 0.06)' } : undefined}
                                                    >
                                                        {item.rank}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className={`text-lg md:text-2xl font-outfit font-black tracking-tight uppercase truncate ${item.rank === 1 ? 'text-yellow-600' : item.rank === 2 ? 'text-slate-500' : item.rank === 3 ? 'text-orange-500' : ''
                                                            }`}
                                                            style={item.rank > 3 ? { color: '#1A1208' } : undefined}
                                                        >{item.institute}</h4>
                                                        <div className="text-[10px] font-manrope font-bold uppercase tracking-widest mt-1" style={{ color: '#B8A890' }}>
                                                            {item.rank === 1 ? 'Winner' : item.rank === 2 ? '1st Runner Up' : item.rank === 3 ? '2nd Runner Up' : `Rank ${item.rank}`}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-3xl md:text-5xl font-outfit font-black tracking-tighter ${item.rank === 1 ? 'text-yellow-500' : item.rank === 2 ? 'text-slate-500' : item.rank === 3 ? 'text-orange-500' : 'text-brand'
                                                        }`}>{item.points}</div>
                                                    <div className="text-[9px] font-manrope font-black uppercase tracking-widest" style={{ color: '#B8A890' }}>Points</div>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-24 text-center elite-glass border-dashed border-2 font-manrope" style={{ borderColor: 'rgba(26, 18, 8, 0.06)' }}>
                                            <Trophy size={40} className="mx-auto mb-4" style={{ color: '#B8A890' }} />
                                            <p className="font-black uppercase tracking-[0.2em] text-xs" style={{ color: '#B8A890' }}>Results not yet published for this event</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* No category selected */}
                        {!activeCategory && (
                            <div className="text-center py-20 elite-glass border-dashed border-2" style={{ borderColor: 'rgba(26, 18, 8, 0.06)' }}>
                                <Sparkles size={32} className="mx-auto mb-4" style={{ color: '#B8A890' }} />
                                <p className="font-black font-manrope uppercase tracking-[0.2em] text-xs" style={{ color: '#8B7D6B' }}>Select a category above to view event results</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-32 p-12 md:p-16 elite-glass text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <Sparkles size={24} className="mx-auto text-brand mb-6 animate-pulse" />
                        <h3 className="text-xl md:text-2xl font-outfit font-black tracking-tighter uppercase mb-4" style={{ color: '#4A3F2F' }}>Verified Championship Results</h3>
                        <p className="text-sm md:text-base max-w-2xl mx-auto font-manrope font-medium" style={{ color: '#8B7D6B' }}>
                            Results published here are cross-verified by the UTh Fest Scoring Committee and are final.
                            Institute points are calculated based on 1st, 2nd, and 3rd place finishes across 28 events.
                        </p>
                    </div>
                </div>
            </section>
        </motion.main>
    );
};

export default Scoreboard;
