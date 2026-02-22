import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import { Clock, MapPin, Activity, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchSchedule, fetchEvents } from '../lib/supabaseApi';


interface ScheduleSlotProps {
    time: string;
    title: string;
    venue: string;
    type: string;
    delay?: number;
    isPlaceholder?: boolean;
}

const ScheduleSlot = ({ time, title, venue, type, delay, isPlaceholder }: ScheduleSlotProps) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.6 }}
        className="flex flex-col md:flex-row gap-6 md:gap-8 group relative"
    >
        {/* Time Column */}
        <div className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-0 min-w-[100px] shrink-0">
            <div className="text-2xl md:text-xl font-black tracking-tighter group-hover:text-brand transition-colors whitespace-nowrap" style={{ color: '#1A1208' }}>
                {time}
            </div>
            {/* Divider: Horizontal on mobile, Vertical on desktop */}
            <div className="hidden md:block w-[1px] h-full min-h-[50px] my-2 group-last:hidden" style={{ background: 'rgba(26, 18, 8, 0.08)' }} />
            <div className="md:hidden h-[1px] w-full ml-4" style={{ background: 'rgba(26, 18, 8, 0.08)' }} />
        </div>

        {/* Content Card */}
        <div className="flex-1 pb-8 md:pb-16">
            <div className="elite-glass p-6 md:p-8 group-hover:translate-x-0 md:group-hover:translate-x-2 transition-transform duration-500 group-hover:border-brand/20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="w-full">
                        <div className="flex items-center gap-3 text-[10px] font-black text-brand uppercase tracking-[0.3em] mb-3">
                            <Activity size={14} /> {type}
                            {isPlaceholder ? <span style={{ color: '#B8A890' }}>Placeholder</span> : null}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black tracking-tighter mb-4 leading-tight" style={{ color: '#1A1208' }}>{title}</h3>
                        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs font-bold uppercase tracking-widest" style={{ color: '#B8A890' }}>
                            <div className="flex items-center gap-2"><MapPin size={14} /> {venue}</div>
                            <div className="flex items-center gap-2"><Clock size={14} /> 2 Hours</div>
                        </div>
                    </div>
                    <button className="w-full md:w-auto px-6 py-3 elite-glass !rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:text-brand group-hover:border-brand/30 transition-all text-center" style={{ color: '#8B7D6B' }}>
                        View Standings
                    </button>
                </div>
            </div>
        </div>
    </motion.div>
);

const Schedule = () => {
    const [scheduleEntries, setScheduleEntries] = useState<Array<{ time: string; title: string; venue: string; type: string; isPlaceholder?: boolean }>>([]);
    const [currentDay, setCurrentDay] = useState('Day 01');
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const days = [
        { name: 'Day 01', date: 'MAR 18' },
        { name: 'Day 02', date: 'MAR 19' },
        { name: 'Day 03', date: 'MAR 20' },
    ];

    const loadScheduleForDay = async (dayName: string) => {
        try {
            const [scheduleData, eventData] = await Promise.all([fetchSchedule(), fetchEvents()]);

            // Create a map of event names for lookup
            const eventMap = new Map(eventData.map((e) => [e.id, e.name]));

            // Convert day display name to SQL format
            const dayMatch = dayName.match(/\d+/);
            const dayNumber = dayMatch ? parseInt(dayMatch[0], 10) : 1;
            const sqlDayName = `Day ${dayNumber}`;

            const filtered = scheduleData
                .filter((entry) => entry.day === sqlDayName)
                .map((entry) => ({
                    time: entry.start_time ?? 'TBD',
                    title: eventMap.get(entry.event_id) ?? 'Unknown Event',
                    venue: entry.venue ?? 'TBD',
                    type: 'Event',
                    isPlaceholder: entry.is_placeholder ?? false,
                }));

            // If no entries for the day, show placeholder
            if (filtered.length === 0) {
                setScheduleEntries([
                    { time: 'TBD', title: 'Schedule Placeholder (Admin will update)', venue: 'TBD', type: 'Placeholder', isPlaceholder: true },
                ]);
            } else {
                setScheduleEntries(filtered);
            }
            setLoadError('');
        } catch (_error) {
            setLoadError('Unable to load schedule');
            setScheduleEntries([
                { time: 'TBD', title: 'Schedule Placeholder (Admin will update)', venue: 'TBD', type: 'Placeholder', isPlaceholder: true },
            ]);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            if (isMounted) await loadScheduleForDay(currentDay);
            if (isMounted) setIsLoading(false);
        };

        load();

        // Auto-refresh every 60 seconds
        const interval = setInterval(() => {
            if (isMounted) loadScheduleForDay(currentDay);
        }, 60000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [currentDay]);

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen pb-40"
            style={{ background: 'linear-gradient(180deg, #FEFCF8 0%, #FDF8F0 50%, #FAF3E8 100%)' }}
        >
            <Navbar />

            <header className="pt-20 md:pt-32 lg:pt-48 pb-12 md:pb-16 lg:pb-20 px-4 md:px-6 relative z-10">
                <div className="container mx-auto max-w-6xl">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                    >
                        <span className="text-brand font-black text-xs uppercase tracking-[0.4em] md:tracking-[0.6em] mb-4 md:mb-8 block">Tactical Timeline</span>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-black tracking-tighter mb-8 md:mb-16 leading-tight" style={{ color: '#1A1208' }}>
                            FESTIVAL <br />
                            <span className="gradient-orange">SCHEDULE</span>
                        </h1>

                        {loadError && (
                            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 font-bold text-sm">
                                {loadError}
                            </div>
                        )}

                        <div className="flex gap-2 md:gap-4 pb-6 md:pb-8 overflow-x-auto" style={{ borderBottom: '1px solid rgba(26, 18, 8, 0.06)' }}>
                            {days.map((day) => (
                                <button
                                    key={day.name}
                                    onClick={() => setCurrentDay(day.name)}
                                    className={`flex flex-col items-start gap-1 p-4 md:p-6 lg:p-10 rounded-[30px] border transition-all min-w-max md:min-w-[200px] group text-sm md:text-base ${currentDay === day.name ? 'bg-brand text-white border-brand' : 'hover:border-brand/20 text-[#8B7D6B]'
                                        }`}
                                    style={currentDay !== day.name ? { background: 'rgba(255,255,255,0.6)', borderColor: 'rgba(26,18,8,0.06)', color: '#8B7D6B' } : undefined}
                                >
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-50">{day.name}</span>
                                    <span className="text-2xl md:text-3xl font-black tracking-tighter leading-none">{day.date}</span>
                                </button>
                            ))}
                            <button
                                onClick={async () => {
                                    setIsRefreshing(true);
                                    await loadScheduleForDay(currentDay);
                                    setIsRefreshing(false);
                                }}
                                disabled={isRefreshing}
                                className="flex items-center justify-center gap-2 p-6 md:p-10 rounded-[30px] border transition-all disabled:opacity-50 min-w-[200px] hover:border-brand/20"
                                style={{ background: 'rgba(255,255,255,0.6)', borderColor: 'rgba(26,18,8,0.06)', color: '#8B7D6B' }}
                            >
                                <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Refresh</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            </header>

            <section className="px-6 relative z-10">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex flex-col">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4" style={{ color: '#8B7D6B' }}>
                                <RefreshCw size={32} className="animate-spin text-brand" />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Initializing Timeline...</span>
                            </div>
                        ) : scheduleEntries.length === 0 ? (
                            <div className="text-center py-20" style={{ color: '#B8A890' }}>
                                <span className="text-sm font-black uppercase tracking-widest">No signals detected for this period.</span>
                            </div>
                        ) : (
                            scheduleEntries.map((slot, i) => (
                                <ScheduleSlot key={i} {...slot} delay={0.2 + (i * 0.1)} />
                            ))
                        )}
                    </div>
                </div>
            </section>
        </motion.main>
    );
};

export default Schedule;
