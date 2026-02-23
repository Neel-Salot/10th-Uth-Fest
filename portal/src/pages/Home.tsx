import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Instagram } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

import Navbar from '../components/layout/Navbar';
import Hero from '../components/home/Hero';
import LiquidCanvas from '../components/liquid/LiquidCanvas';
import CustomCursor from '../components/liquid/CustomCursor';
import Preloader from '../components/liquid/Preloader';
import GhumiNavigator from '../components/liquid/GhumiNavigator';
import LiquidVideoReveal from '../components/liquid/LiquidVideoReveal';
import KineticCards from '../components/liquid/KineticCards';

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
// import video8th from '../assets/Videos/8th Uth Fest 2024  Official Aftermovie  Uka Tarsadia University.mp4';
// import video9th from '../assets/Videos/9th_aftermovie.mp4';
const video8th = '';
const video9th = '';

/* ═══ COLOR PALETTES PER RAS ═══ */
const rasColors = [
    { bg: 'rgba(255, 107, 108, 0.06)', accent: '#FF6B6C', glow: 'rgba(255, 107, 108, 0.15)' },  // Shringara
    { bg: 'rgba(255, 193, 7, 0.06)', accent: '#FFC107', glow: 'rgba(255, 193, 7, 0.15)' },       // Hasya
    { bg: 'rgba(100, 149, 237, 0.06)', accent: '#6495ED', glow: 'rgba(100, 149, 237, 0.15)' },    // Karuna
    { bg: 'rgba(231, 76, 60, 0.06)', accent: '#E74C3C', glow: 'rgba(231, 76, 60, 0.15)' },       // Raudra
    { bg: 'rgba(255, 165, 0, 0.06)', accent: '#FFA500', glow: 'rgba(255, 165, 0, 0.15)' },       // Veera
    { bg: 'rgba(128, 0, 128, 0.06)', accent: '#9B59B6', glow: 'rgba(128, 0, 128, 0.15)' },       // Bhayanaka
    { bg: 'rgba(46, 139, 87, 0.06)', accent: '#2E8B57', glow: 'rgba(46, 139, 87, 0.15)' },       // Bibhatsa
    { bg: 'rgba(0, 191, 255, 0.06)', accent: '#00BFFF', glow: 'rgba(0, 191, 255, 0.15)' },       // Adbhuta
    { bg: 'rgba(144, 238, 144, 0.06)', accent: '#66BB6A', glow: 'rgba(144, 238, 144, 0.15)' },    // Shanta
    { bg: 'rgba(255, 107, 53, 0.06)', accent: '#FF6B35', glow: 'rgba(255, 107, 53, 0.15)' },      // Yuva
];

type RasItem = { image: string; name: string; meaning: string };

/* ═══ HORIZONTAL RAS GALLERY ═══ */
const HorizontalRasSection = ({ rasData }: { rasData: RasItem[] }) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"]
    });

    const xTransform = useTransform(scrollYProgress, [0, 1], ["1%", "-91%"]);
    const x = useSpring(xTransform, { stiffness: 120, damping: 25, mass: 0.2 });

    return (
        <section ref={sectionRef} className="relative h-[800vh] z-20"
            style={{ background: 'transparent' }}
        >
            <div className="sticky top-0 h-screen w-full flex flex-col justify-center md:justify-start overflow-hidden pointer-events-none">
                {/* Section header */}
                <motion.div
                    className="container mx-auto px-6 absolute top-16 md:top-12 left-0 right-0 z-20 pointer-events-none"
                    style={{
                        opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]),
                        y: useTransform(scrollYProgress, [0, 0.1], [0, -20])
                    }}
                >
                    <div className="max-w-4xl pt-10">
                        <span className="font-black text-xs md:text-sm uppercase tracking-[0.6em] block mb-2"
                            style={{ color: '#FF6B35' }}
                        >
                            THE HUMAN EXPERIENCE
                        </span>
                        <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-tight"
                            style={{ color: '#1A1208' }}
                        >
                            <span className="text-[#FF6B35]">9 Rasas</span> <br />
                            <span className="italic text-2xl md:text-5xl block mt-1" style={{ color: '#4A3F2F' }}>
                                Of The Human Emotions.
                            </span>
                        </h2>
                    </div>
                </motion.div>

                {/* Cards carousel */}
                <motion.div
                    style={{ x }}
                    className="flex flex-row flex-nowrap w-fit gap-4 md:gap-8 px-[5vw] items-center md:items-end h-full pt-12 md:pt-48 relative z-10 pointer-events-auto"
                >
                    <div className="w-[5vw] flex-shrink-0" />

                    {rasData.map((ras, i) => (
                        <div
                            key={ras.name}
                            className="relative w-[85vw] md:w-[40vw] h-[50vh] md:h-[65vh] flex-shrink-0 overflow-hidden group pointer-events-auto"
                            style={{
                                borderRadius: '2rem',
                                border: '1px solid rgba(255, 107, 53, 0.08)',
                                boxShadow: '0 20px 60px -12px rgba(26, 18, 8, 0.1)',
                                background: '#FEFCF8',
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
                                    <h3 className="text-4xl md:text-7xl font-black mb-2 uppercase tracking-tighter leading-none"
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
                                    <p className="text-xl md:text-3xl font-black uppercase tracking-tight"
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

/* ═══ SOCIAL CTA SECTION ═══ */
const SocialSection = () => (
    <section className="py-20 md:py-32 px-6 relative z-20 bg-transparent flex flex-wrap justify-center pointer-events-auto">
        <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                <a
                    href="https://www.instagram.com/utu.malibacampus"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-10 md:p-14 group cursor-pointer transition-all hover:-translate-y-2 flex items-center gap-6 rounded-3xl"
                    style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,107,53,0.1)' }}
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
                </a>

                <a
                    href="https://utu.ac.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-10 md:p-14 group cursor-pointer transition-all hover:-translate-y-2 flex items-center gap-6 rounded-3xl"
                    style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,107,53,0.1)' }}
                >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: '#FF6B35' }}
                    >
                        <ArrowUpRight className="text-white" size={32} />
                    </div>
                    <div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] block mb-2" style={{ color: '#8B7D6B' }}>Visit Official</span>
                        <h3 className="text-3xl md:text-4xl font-black tracking-tighter" style={{ color: '#1A1208' }}>Website</h3>
                        <p className="text-sm mt-1" style={{ color: '#8B7D6B' }}>utu.ac.in</p>
                    </div>
                </a>
            </div>
        </div>
    </section>
);


export default function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        // Lenis Smooth Scroll
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            touchMultiplier: 2.5,
            infinite: false,
        });

        // For GSAP integration with Lenis
        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        return () => lenis.destroy();
    }, []);

    const kineticCardsData = [
        { title: 'Sonic', img: ras2 },
        { title: 'Motion', img: ras5 },
        { title: 'Stage', img: ras8 }
    ];

    const rasData = [
        { image: ras1, name: 'Shringara', meaning: 'Love & Romance' },
        { image: ras2, name: 'Hasya', meaning: 'Joy & Laughter' },
        { image: ras3, name: 'Karuna', meaning: 'Sorrow & Compassion' },
        { image: ras4, name: 'Raudra', meaning: 'Anger & Power' },
        { image: ras5, name: 'Veera', meaning: 'Courage & Heroism' },
        { image: ras6, name: 'Bhayanaka', meaning: 'Fear & Terror' },
        { image: ras7, name: 'Bibhatsa', meaning: 'Disgust & aversion' },
        { image: ras8, name: 'Adbhuta', meaning: 'Wonder & Amazement' },
        { image: ras9, name: 'Shanta', meaning: 'Peace & Tranquility' },
        { image: ras10, name: 'Yuva Rasa', meaning: 'Youth & Innovation' },
    ];

    return (
        <main className="min-h-screen relative w-full overflow-clip bg-transparent">
            {/* 1. GLOBAL INTERACTION ENGINE */}
            <Preloader />
            <LiquidCanvas />
            <CustomCursor />
            <GhumiNavigator />
            <Navbar />

            {/* Hero */}
            <div className="relative z-20 pointer-events-none">
                <div className="pointer-events-auto">
                    <Hero />
                </div>
            </div>

            {/* RAS SHOWCASE SECTION */}
            <HorizontalRasSection rasData={rasData} />

            {/* 4. THE EXPERIENCE SECTION: 3D KINETIC CARD DECK */}
            <section className="w-full py-32 flex flex-col items-center z-20 relative bg-transparent pointer-events-auto">
                <div className="text-center mb-10 w-full px-6">
                    <span className="text-xs font-black uppercase tracking-[0.5em] block mb-4 text-[#FF6B35]">
                        Visual Journey
                    </span>
                    <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase text-[#1A1208]">
                        The <span className="text-[#FF6B35]">Experience</span>
                    </h2>
                </div>
                <KineticCards cards={kineticCardsData} />
            </section>

            {/* 3. AFTER-MOVIE SECTION: LIQUID REVEAL */}
            <section className="relative w-full z-20 bg-transparent py-20 flex flex-col gap-40">
                <LiquidVideoReveal
                    titleLine1="9th UTh Fest"
                    titleLine2="Memories"
                    year="2025 Edition"
                    videoPath={video9th}
                />
                <LiquidVideoReveal
                    titleLine1="8th UTh Fest"
                    titleLine2="Memories"
                    year="2024 Edition"
                    videoPath={video8th}
                />
            </section>

            <SocialSection />

            <section className="relative w-full h-[100vh] flex flex-col items-center justify-center z-30 bg-[#FEFCF8] pointer-events-auto overflow-hidden">
                {/* GRAND FINALE TEXT HOVERING IN THE MIDDLE */}
                <div className="container mx-auto px-6 text-center relative z-50 pointer-events-none flex flex-col items-center justify-center h-full">
                    <motion.div
                        className="interactive-text-gooey flex flex-col items-center justify-center"
                    >
                        <h2 className="text-6xl md:text-[140px] font-black tracking-tighter leading-none mb-12 uppercase text-[#1A1208]"
                            style={{ textShadow: '0 10px 40px rgba(254, 252, 248, 0.8)' }}
                        >
                            The Stage <br />
                            <span className="text-[#FF6B35]">is yours.</span>
                        </h2>

                        <button
                            onClick={() => {
                                navigate('/events');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="group relative inline-flex items-center gap-4 px-12 py-6 text-xl uppercase tracking-tighter shadow-2xl overflow-hidden rounded-full font-black text-white bg-[#1A1208] pointer-events-auto"
                        >
                            <span className="absolute inset-0 bg-[#FF6B35] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></span>
                            <span className="relative z-10 flex items-center gap-4">View All Events <ArrowUpRight size={24} /></span>
                        </button>
                    </motion.div>
                </div>

                {/* Absolute Footer inside Sandbox */}
                <div className="absolute bottom-6 left-0 right-0 z-50 text-center font-black uppercase tracking-[0.2em] text-[10px] text-[#8B7D6B] pointer-events-none">
                    &copy; UTh Fest 2026 • Uka Tarsadia University
                </div>
            </section>
        </main>
    );
}
