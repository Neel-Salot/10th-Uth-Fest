import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Lenis from 'lenis';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/home/Hero';
import { ArrowUpRight, Users, Music, Theater, X, Sparkles, Star, Instagram, Youtube } from 'lucide-react';
import logoImage from '../assets/images/UTU.png';
import masterpiece from '../assets/images/masterpiece.jpg';
import horizontalBanner from '../assets/images/Horizontal.jpg.jpeg';
import logo10ras from '../assets/images/10th YouthFest Logo 1.png';
import ras1 from '../assets/images/Ras/1.jpg.jpeg';
import ras2 from '../assets/images/Ras/2.jpg.jpeg';
import ras3 from '../assets/images/Ras/3.jpg.jpeg';
import ras4 from '../assets/images/Ras/4.jpg.jpeg';
import ras5 from '../assets/images/Ras/5.jpg.jpeg';
import ras6 from '../assets/images/Ras/6.jpg.jpeg';
import ras7 from '../assets/images/Ras/7.jpg.jpeg';
import ras8 from '../assets/images/Ras/8.jpg.jpeg';
import ras9 from '../assets/images/Ras/9.jpg.jpeg';
import ras10 from '../assets/images/Ras/10.jpg.jpeg';

const GrainOverlay = () => <div className="grain-overlay" />;

/* ═══ COLOR PALETTES PER RAS ═══ */
const rasColors = [
    { bg: 'rgba(255, 107, 108, 0.06)', accent: '#FF6B6C', glow: 'rgba(255, 107, 108, 0.15)' },  // Shringara - Rose
    { bg: 'rgba(255, 193, 7, 0.06)', accent: '#FFC107', glow: 'rgba(255, 193, 7, 0.15)' },       // Hasya - Gold
    { bg: 'rgba(100, 149, 237, 0.06)', accent: '#6495ED', glow: 'rgba(100, 149, 237, 0.15)' },    // Karuna - Blue
    { bg: 'rgba(231, 76, 60, 0.06)', accent: '#E74C3C', glow: 'rgba(231, 76, 60, 0.15)' },       // Raudra - Red
    { bg: 'rgba(255, 165, 0, 0.06)', accent: '#FFA500', glow: 'rgba(255, 165, 0, 0.15)' },       // Veera - Orange
    { bg: 'rgba(128, 0, 128, 0.06)', accent: '#9B59B6', glow: 'rgba(128, 0, 128, 0.15)' },       // Bhayanaka - Purple
    { bg: 'rgba(46, 139, 87, 0.06)', accent: '#2E8B57', glow: 'rgba(46, 139, 87, 0.15)' },       // Bibhatsa - Green
    { bg: 'rgba(0, 191, 255, 0.06)', accent: '#00BFFF', glow: 'rgba(0, 191, 255, 0.15)' },       // Adbhuta - Cyan
    { bg: 'rgba(144, 238, 144, 0.06)', accent: '#66BB6A', glow: 'rgba(144, 238, 144, 0.15)' },    // Shanta - Mint
    { bg: 'rgba(255, 107, 53, 0.06)', accent: '#FF6B35', glow: 'rgba(255, 107, 53, 0.15)' },      // Yuva - Brand
];

/* ═══ HORIZONTAL RAS GALLERY ═══ */
const HorizontalRasSection = ({ rasData }: { rasData: any[] }) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"]
    });

    const xTransform = useTransform(scrollYProgress, [0, 1], ["1%", "-91%"]);
    const x = useSpring(xTransform, { stiffness: 120, damping: 25, mass: 0.2 });

    return (
        <section ref={sectionRef} className="relative h-[1000vh]"
            style={{ background: 'linear-gradient(180deg, #FAF3E8 0%, #FEFCF8 50%, #FDF8F0 100%)' }}
        >
            <div className="sticky top-0 h-screen w-full flex flex-col justify-center md:justify-start overflow-hidden" style={{ background: '#FAF3E8' }}>
                {/* Section header */}
                <motion.div
                    className="container mx-auto px-6 absolute top-16 md:top-12 left-0 right-0 z-20 pointer-events-none"
                    style={{
                        opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]),
                        y: useTransform(scrollYProgress, [0, 0.1], [0, -20])
                    }}
                >
                    <div className="max-w-4xl">
                        <span className="font-black text-xs md:text-sm uppercase tracking-[0.6em] block mb-2"
                            style={{ color: '#FF6B35' }}
                        >
                            THE HUMAN EXPERIENCE
                        </span>
                        <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-tight"
                            style={{ color: '#1A1208' }}
                        >
                            9 Rasas <br />
                            <span className="italic text-2xl md:text-5xl block mt-1" style={{ color: '#4A3F2F' }}>
                                Of The Human Emotions.
                            </span>
                        </h2>
                    </div>
                </motion.div>

                {/* Cards carousel */}
                <motion.div
                    style={{ x }}
                    className="flex flex-row flex-nowrap w-fit gap-4 md:gap-8 px-[5vw] items-center md:items-end h-full pt-12 md:pt-56 relative z-10"
                >
                    <div className="w-[5vw] flex-shrink-0" />

                    {rasData.map((ras, i) => (
                        <div
                            key={ras.name}
                            className="relative w-[90vw] md:w-[45vw] h-[55vh] md:h-[70vh] flex-shrink-0 overflow-hidden group"
                            style={{
                                borderRadius: '2rem',
                                border: '1px solid rgba(255, 107, 53, 0.08)',
                                boxShadow: '0 20px 60px -12px rgba(26, 18, 8, 0.1)',
                                background: '#FAF3E8',
                            }}
                        >
                            <img
                                src={ras.image}
                                className="absolute inset-0 w-full h-full object-cover object-[center_30%] transition-transform duration-1000 group-hover:scale-110"
                                alt={ras.name}
                                loading="lazy"
                            />
                            {/* Bright bottom gradient overlay */}
                            <div className="absolute inset-x-0 bottom-0 h-[60%]"
                                style={{ background: 'linear-gradient(to top, rgba(254,252,248,0.95), rgba(254,252,248,0.6) 50%, transparent)' }}
                            />

                            <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 flex flex-col justify-end h-full">
                                {/* Number badge */}
                                <div className="absolute top-6 left-6 md:top-10 md:left-10 w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center font-black text-2xl md:text-4xl z-20"
                                    style={{
                                        background: rasColors[i]?.accent || '#FF6B35',
                                        color: '#FFFFFF',
                                        boxShadow: `0 0 24px ${rasColors[i]?.glow || 'rgba(255,107,53,0.3)'}`,
                                        border: '2px solid rgba(255,255,255,0.4)',
                                    }}
                                >
                                    {i + 1}
                                </div>

                                <div className="z-10">
                                    <h3 className="text-5xl md:text-8xl font-black mb-2 uppercase tracking-tighter leading-none"
                                        style={{ color: '#1A1208' }}
                                    >
                                        {ras.name}
                                    </h3>
                                    <div className="h-[3px] w-12 md:w-20 mb-4"
                                        style={{
                                            background: rasColors[i]?.accent || '#FF6B35',
                                            boxShadow: `0 0 10px ${rasColors[i]?.glow || 'rgba(255,107,53,0.5)'}`,
                                        }}
                                    />
                                    <p className="text-2xl md:text-4xl font-black uppercase tracking-tight"
                                        style={{ color: rasColors[i]?.accent || '#FF6B35' }}
                                    >
                                        {ras.meaning}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="w-[5vw] flex-shrink-0" />
                </motion.div>
            </div>
        </section>
    );
};

/* ═══ IMAGE SHOWCASE SECTION ═══ */
const ImageShowcase = () => (
    <section className="py-16 md:py-32 px-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #FEFCF8 0%, #FDF8F0 100%)' }}
    >
        <div className="container mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12 md:mb-20"
            >
                <span className="text-xs font-black uppercase tracking-[0.6em] block mb-4"
                    style={{ color: '#FF6B35' }}
                >
                    VISUAL JOURNEY
                </span>
                <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase"
                    style={{ color: '#1A1208' }}
                >
                    The <span className="gradient-orange">Experience</span>
                </h2>
            </motion.div>

            {/* Masonry-style image grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                {/* Large featured image */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0 }}
                    className="col-span-2 row-span-2 img-container aspect-[4/3] md:aspect-auto md:h-full"
                >
                    <img src={masterpiece} alt="10RAS Cultural Festival" className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute bottom-0 inset-x-0 p-6"
                        style={{ background: 'linear-gradient(to top, rgba(26,18,8,0.6), transparent)' }}
                    >
                        <span className="text-white font-black text-lg md:text-2xl tracking-tight">A Decade of Brilliance</span>
                    </div>
                </motion.div>

                {/* Ras thumbnails */}
                {[ras1, ras2, ras3, ras4].map((img, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                        className="img-container aspect-square"
                    >
                        <img src={img} alt={`Ras ${i + 1}`} className="w-full h-full object-cover object-[center_30%]" loading="lazy" />
                    </motion.div>
                ))}
            </div>

            {/* Second row */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-5 mt-3 md:mt-5">
                {[ras5, ras6, ras7, ras8, ras9, ras10].map((img, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06 }}
                        className="img-container aspect-[3/4]"
                    >
                        <img src={img} alt={`Ras ${i + 5}`} className="w-full h-full object-cover object-[center_30%]" loading="lazy" />
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);

/* ═══ BANNER IMAGE SECTION ═══ */
const BannerSection = () => (
    <section className="py-0 relative overflow-hidden">
        <motion.div
            initial={{ opacity: 0, scale: 1.02 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative w-full h-[40vh] md:h-[60vh] overflow-hidden"
        >
            <img
                src={horizontalBanner}
                alt="10RAS UTh Fest Banner"
                className="w-full h-full object-cover"
                loading="lazy"
            />
            <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to right, rgba(254,252,248,0.8) 0%, transparent 30%, transparent 70%, rgba(254,252,248,0.8) 100%)' }}
            />
            <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(254,252,248,0.6), transparent 50%)' }}
            />
        </motion.div>
    </section>
);

/* ═══ LIVE ENERGY COUNTERS ═══ */
const LiveEnergySection = () => {
    const counters = [
        { value: '10th', label: 'Edition', icon: Star },
        { value: '28+', label: 'Events', icon: Sparkles },
        { value: '6', label: 'Categories', icon: Music },
        { value: '1000+', label: 'Performers', icon: Users },
    ];

    return (
        <section className="py-20 md:py-32 px-6 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #FF6B35, #FF8B5C, #FFB347)' }}
        >
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-20"
                style={{ background: 'rgba(255,255,255,0.2)' }}
            />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-15"
                style={{ background: 'rgba(255,255,255,0.15)' }}
            />

            <div className="container mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12 md:mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
                        style={{ background: 'rgba(255,255,255,0.15)' }}
                    >
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="text-white text-xs font-bold uppercase tracking-[0.2em]">Live Festival Energy</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">
                        The Numbers Speak
                    </h2>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
                    {counters.map((item, i) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center p-8 rounded-3xl transition-transform hover:-translate-y-1"
                            style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}
                        >
                            <item.icon className="mx-auto mb-4 text-white/80" size={28} />
                            <div className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2">
                                {item.value}
                            </div>
                            <div className="text-white/70 text-sm font-bold uppercase tracking-[0.2em]">
                                {item.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

/* ═══ SOCIAL CTA SECTION ═══ */
const SocialSection = () => (
    <section className="py-20 md:py-32 px-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #FEFCF8 0%, #FDF8F0 100%)' }}
    >
        <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                <motion.a
                    href="https://www.instagram.com/utu.malibacampus"
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="elite-glass p-10 md:p-14 group cursor-pointer transition-all hover:-translate-y-1 flex items-center gap-6"
                >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #E1306C, #F77737, #FCAF45)' }}
                    >
                        <Instagram className="text-white" size={32} />
                    </div>
                    <div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] block mb-2" style={{ color: '#8B7D6B' }}>Follow us on</span>
                        <h3 className="text-3xl md:text-4xl font-black tracking-tighter" style={{ color: '#1A1208' }}>Instagram</h3>
                        <p className="text-sm mt-1" style={{ color: '#8B7D6B' }}>@utu.malibacampus</p>
                    </div>
                    <ArrowUpRight className="ml-auto opacity-30 group-hover:opacity-100 transition-opacity" size={24} style={{ color: '#1A1208' }} />
                </motion.a>

                <motion.a
                    href="https://youtube.com/@utumalibacampus"
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="elite-glass p-10 md:p-14 group cursor-pointer transition-all hover:-translate-y-1 flex items-center gap-6"
                >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: '#FF0000' }}
                    >
                        <Youtube className="text-white" size={32} />
                    </div>
                    <div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] block mb-2" style={{ color: '#8B7D6B' }}>Watch on</span>
                        <h3 className="text-3xl md:text-4xl font-black tracking-tighter" style={{ color: '#1A1208' }}>YouTube</h3>
                        <p className="text-sm mt-1" style={{ color: '#8B7D6B' }}>@utumalibacampus</p>
                    </div>
                    <ArrowUpRight className="ml-auto opacity-30 group-hover:opacity-100 transition-opacity" size={24} style={{ color: '#1A1208' }} />
                </motion.a>
            </div>
        </div>
    </section>
);

/* ═══ MAIN HOME COMPONENT ═══ */
const Home = () => {
    const navigate = useNavigate();
    const [selectedVideo, setSelectedVideo] = React.useState<string | null>(null);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            touchMultiplier: 2.5,
            infinite: false,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    const rasData = [
        { image: ras1, name: 'Shringara', meaning: 'Love & Romance', desc: 'The foundation of all art, celebrating the beauty of connection and the elegance of romance.' },
        { image: ras2, name: 'Hasya', meaning: 'Joy & Laughter', desc: 'A reminder that art is a celebration. The rhythm of joy and the music of laughter.' },
        { image: ras3, name: 'Karuna', meaning: 'Sorrow & Compassion', desc: 'The depth of the human soul, finding beauty in empathy and strength in shared stories.' },
        { image: ras4, name: 'Raudra', meaning: 'Anger & Power', desc: 'The fierce energy of transition. The power to break old forms and create new ones.' },
        { image: ras5, name: 'Veera', meaning: 'Courage & Heroism', desc: 'The spirit of the explorer. The bravery to step onto the stage and own your truth.' },
        { image: ras6, name: 'Bhayanaka', meaning: 'Fear & Terror', desc: 'Understanding the shadows. Turning the unknown into a source of suspense and drama.' },
        { image: ras7, name: 'Bibhatsa', meaning: 'Disgust & aversion', desc: 'The harsh reality. Using art as a mirror to reflect social truths and hidden stories.' },
        { image: ras8, name: 'Adbhuta', meaning: 'Wonder & Amazement', desc: 'The "Aha" moment. The magic that happens when tradition meets unexpected innovation.' },
        { image: ras9, name: 'Shanta', meaning: 'Peace & Tranquility', desc: 'The final destination. The silence between the notes where true reflection begins.' },
        { image: ras10, name: 'Yuva Rasa', meaning: 'Youth & Innovation', desc: 'The catalyst. The tenth layer that makes the ancient modern and the future real.' },
    ];

    const videos = [
        { id: '8k9IWePA0IM', title: '9th UTh Fest', year: '9th' },
        { id: 'd9ZlLF5a_mI', title: '8th UTh Fest', year: '8th' },
    ];

    return (
        <main className="min-h-screen relative" style={{ background: '#FEFCF8' }}>
            <GrainOverlay />
            <Navbar />
            <Hero />

            {/* ═══ PHILOSOPHY SECTION ═══ */}
            <section className="py-24 md:py-48 px-6 relative overflow-hidden z-10"
                style={{ background: 'linear-gradient(180deg, #FEFCF8 0%, #FDF8F0 100%)' }}
            >
                <div className="container mx-auto">
                    <div className="max-w-6xl mb-16 md:mb-32">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-[10px] font-black uppercase tracking-[0.8em] mb-10"
                            style={{ color: '#FF6B35' }}
                        >
                            THE PHILOSOPHY
                        </motion.div>
                        <motion.h2
                            initial={{ y: 40, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-5xl md:text-9xl font-black tracking-tighter leading-[0.85] mb-16 uppercase"
                            style={{ color: '#1A1208' }}
                        >
                            History <br />
                            <span className="gradient-orange">Redefined.</span>
                        </motion.h2>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-2xl md:text-5xl font-black leading-[1.1] tracking-tight"
                            style={{ color: '#B8A890' }}
                        >
                            Indian culture is rooted in <span style={{ color: '#1A1208' }}>Navras</span>. The tenth, <span style={{ color: '#FF6B35' }}>YUVA</span>, is the fire that turns heritage into history.
                        </motion.p>
                    </div>

                    {/* Philosophy cards with image accents */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        {[
                            { icon: Music, label: 'Sonic', desc: 'Harmony meeting high-energy production.', img: ras2 },
                            { icon: Users, label: 'Motion', desc: 'Kinetic energy reflecting Veera and Raudra.', img: ras5 },
                            { icon: Theater, label: 'Stage', desc: 'Where ancient layers meet modern lights.', img: ras8 },
                        ].map((item, i) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 1 }}
                                className="elite-glass p-0 group cursor-pointer transition-all overflow-hidden"
                                style={{ borderColor: 'rgba(255, 107, 53, 0.08)' }}
                            >
                                {/* Card image */}
                                <div className="relative h-48 md:h-56 overflow-hidden">
                                    <img src={item.img} alt={item.label}
                                        className="w-full h-full object-cover object-[center_30%] transition-transform duration-700 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0"
                                        style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.9) 0%, transparent 60%)' }}
                                    />
                                </div>
                                {/* Card content */}
                                <div className="p-8 md:p-10">
                                    <item.icon className="mb-6 group-hover:scale-110 transition-transform duration-700" size={40} style={{ color: '#FF6B35' }} />
                                    <h3 className="text-2xl md:text-3xl font-black mb-4 tracking-tighter uppercase" style={{ color: '#1A1208' }}>
                                        {item.label}
                                    </h3>
                                    <p className="leading-relaxed font-bold text-lg" style={{ color: '#8B7D6B' }}>
                                        {item.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ BANNER ═══ */}
            <BannerSection />

            {/* ═══ HORIZONTAL RAS GALLERY ═══ */}
            <HorizontalRasSection rasData={rasData} />

            {/* ═══ IMAGE SHOWCASE ═══ */}
            <ImageShowcase />

            {/* ═══ LIVE ENERGY ═══ */}
            <LiveEnergySection />

            {/* ═══ AFTERMOVIES ═══ */}
            <section className="py-24 md:py-48 px-6 relative z-10"
                style={{ background: '#FDF8F0', borderTop: '1px solid rgba(255, 107, 53, 0.06)', borderBottom: '1px solid rgba(255, 107, 53, 0.06)' }}
            >
                <div className="container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16 md:mb-32 text-center md:text-left"
                    >
                        <span className="font-black text-xs uppercase tracking-[0.6em] mb-4 block" style={{ color: '#FF6B35' }}>
                            THE LEGACY
                        </span>
                        <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase" style={{ color: '#1A1208' }}>
                            Aftermovies
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {videos.map((video, idx) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <button
                                    onClick={() => setSelectedVideo(video.id)}
                                    className="elite-glass p-10 md:p-16 h-full flex flex-col w-full text-left group transition-all overflow-hidden relative hover:-translate-y-1"
                                >
                                    {/* Thumbnail preview */}
                                    <div className="w-full h-48 md:h-56 rounded-2xl overflow-hidden mb-8 -mt-2">
                                        <img
                                            src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                                            alt={`${video.year} UTh Fest`}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                    </div>
                                    <h3 className="text-4xl font-black mb-6 tracking-tighter" style={{ color: '#1A1208' }}>
                                        {video.year} UTh Fest
                                    </h3>
                                    <p className="text-xl font-bold leading-tight" style={{ color: '#B8A890' }}>
                                        Relive the cinematic brilliance of our previous editions.
                                    </p>
                                    <span className="font-black uppercase tracking-[0.4em] text-sm mt-10 inline-flex items-center gap-4 group-hover:gap-6 transition-all"
                                        style={{ color: '#FF6B35' }}
                                    >
                                        PLAY MOVIE <ArrowUpRight size={20} />
                                    </span>
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ SOCIAL ═══ */}
            <SocialSection />

            {/* ═══ GRAND FINALE CTA ═══ */}
            <section className="py-48 md:py-80 relative flex items-center justify-center z-10"
                style={{ background: 'linear-gradient(180deg, #FDF8F0 0%, #FEFCF8 100%)' }}
            >
                {/* Decorative warm glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-30 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(255, 107, 53, 0.08) 0%, transparent 60%)' }}
                />
                <div className="container mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2 }}
                    >
                        {/* 10RAS Logo */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex justify-center mb-12"
                        >
                            <img src={logo10ras} alt="10RAS Logo" className="w-24 h-24 md:w-32 md:h-32 object-contain" loading="lazy"
                                style={{ filter: 'drop-shadow(0 8px 24px rgba(255, 107, 53, 0.2))' }}
                            />
                        </motion.div>

                        <h2 className="text-6xl md:text-[140px] font-black tracking-tighter leading-none mb-20 uppercase"
                            style={{ color: '#1A1208' }}
                        >
                            The Stage <br />
                            <span className="gradient-orange">is yours.</span>
                        </h2>
                        <button
                            onClick={() => {
                                navigate('/events');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="btn-elite text-xl uppercase tracking-tighter shadow-2xl inline-flex items-center gap-4 px-12 py-6"
                        >
                            View All Events <ArrowUpRight size={24} />
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* ═══ PREMIUM FOOTER ═══ */}
            <footer className="py-24 relative z-20"
                style={{ borderTop: '1px solid rgba(255, 107, 53, 0.06)', background: '#FDF8F0' }}
            >
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-16">
                        <div>
                            <div className="flex items-center gap-5 mb-10">
                                <img src={logoImage} className="w-14 h-14 md:w-16 md:h-16" alt="Logo" />
                                <span className="text-3xl md:text-4xl font-black tracking-tighter" style={{ color: '#1A1208' }}>
                                    UTh Fest
                                </span>
                            </div>
                            <p className="max-w-sm font-bold leading-relaxed text-lg mb-10 italic"
                                style={{ color: '#8B7D6B' }}
                            >
                                A decade of artistic brilliance. The 10th UTh Fest marks our biggest celebration yet.
                            </p>
                            <div className="text-[10px] font-black uppercase tracking-[0.8em]" style={{ color: '#B8A890' }}>
                                UKA TARSADIA UNIVERSITY
                            </div>
                        </div>
                        <div className="flex gap-20 md:gap-24">
                            <div className="flex flex-col gap-6 md:gap-8">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: '#FF6B35' }}>
                                    Navigation
                                </span>
                                <Link to="/events" className="hover:text-[#1A1208] transition-colors font-black uppercase text-xs tracking-widest"
                                    style={{ color: '#8B7D6B' }}>Events</Link>
                                <Link to="/schedule" className="hover:text-[#1A1208] transition-colors font-black uppercase text-xs tracking-widest"
                                    style={{ color: '#8B7D6B' }}>Schedule</Link>
                                <Link to="/live" className="hover:text-[#1A1208] transition-colors font-black uppercase text-xs tracking-widest"
                                    style={{ color: '#8B7D6B' }}>Live</Link>
                            </div>
                            <div className="flex flex-col gap-6 md:gap-8">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: '#FF6B35' }}>
                                    Community
                                </span>
                                <a href="https://www.instagram.com/utu.malibacampus" target="_blank" rel="noopener noreferrer"
                                    className="hover:text-[#1A1208] transition-colors font-black uppercase text-xs tracking-widest"
                                    style={{ color: '#8B7D6B' }}>Instagram</a>
                                <a href="https://youtube.com/@utumalibacampus" target="_blank" rel="noopener noreferrer"
                                    className="hover:text-[#1A1208] transition-colors font-black uppercase text-xs tracking-widest"
                                    style={{ color: '#8B7D6B' }}>YouTube</a>
                            </div>
                        </div>
                    </div>
                    <div className="mt-16 pt-8 text-center font-black uppercase tracking-[0.2em] text-[10px]"
                        style={{ color: '#B8A890', borderTop: '1px solid rgba(255, 107, 53, 0.06)' }}
                    >
                        <div>&copy; UTh Fest 2026 • Uka Tarsadia University</div>
                    </div>
                </div>
            </footer>

            {/* ═══ VIDEO MODAL ═══ */}
            {selectedVideo && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    style={{ background: 'rgba(26, 18, 8, 0.85)', backdropFilter: 'blur(30px)' }}
                    onClick={() => setSelectedVideo(null)}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl"
                        style={{ borderRadius: '2rem', border: '1px solid rgba(255, 107, 53, 0.1)' }}
                    >
                        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9', borderRadius: '2rem', background: '#1A1208' }}>
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                                title="UTh Fest Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                            ></iframe>
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="absolute top-6 right-6 rounded-full p-3 transition-all z-10"
                                style={{ background: 'rgba(26, 18, 8, 0.5)', color: '#FFFFFF' }}
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </main>
    );
};

export default Home;
