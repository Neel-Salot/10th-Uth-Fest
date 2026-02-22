import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Calendar, Sparkles } from 'lucide-react';
import logoImage from '../../assets/images/logo.png';

const Hero = () => {
    const { scrollY } = useScroll();
    const yLogo = useTransform(scrollY, [0, 500], [0, 150]);
    const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #FEFCF8 0%, #FDF8F0 40%, #FAF3E8 100%)' }}
        >
            {/* Warm ambient aurora */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Top-left warm glow */}
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full opacity-40"
                    style={{ background: 'radial-gradient(circle, rgba(255, 107, 53, 0.08) 0%, transparent 70%)' }}
                />
                {/* Top-right gold glow */}
                <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full opacity-30"
                    style={{ background: 'radial-gradient(circle, rgba(255, 179, 71, 0.08) 0%, transparent 70%)' }}
                />
                {/* Bottom center warm glow */}
                <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full opacity-25"
                    style={{ background: 'radial-gradient(circle, rgba(255, 154, 108, 0.06) 0%, transparent 60%)' }}
                />
                {/* Floating particles */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            width: 4 + Math.random() * 6,
                            height: 4 + Math.random() * 6,
                            left: `${15 + i * 14}%`,
                            top: `${20 + (i % 3) * 25}%`,
                            background: `rgba(255, ${80 + i * 15}, ${30 + i * 10}, ${0.15 + i * 0.03})`,
                        }}
                        animate={{
                            y: [0, -30 - i * 5, 0],
                            opacity: [0.2, 0.5, 0.2],
                            scale: [1, 1.3, 1],
                        }}
                        transition={{
                            duration: 5 + i * 0.8,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: i * 0.5,
                        }}
                    />
                ))}
            </div>

            <motion.div
                style={{ opacity: opacityHero }}
                className="container mx-auto px-6 relative z-10"
            >
                <div className="flex flex-col items-center">
                    {/* Central hero typography */}
                    <div className="relative text-center mb-12 md:mb-16">
                        {/* Background wheel watermark */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                            className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[800px] h-auto"
                        >
                            <img
                                src="/IMG_cropped.PNG"
                                alt=""
                                className="w-full h-auto object-contain opacity-10 select-none pointer-events-none"
                            />
                        </motion.div>

                        {/* Badge */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.8 }}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6"
                            style={{
                                background: 'rgba(255, 107, 53, 0.08)',
                                border: '1px solid rgba(255, 107, 53, 0.12)',
                            }}
                        >
                            <Sparkles size={14} style={{ color: '#FF6B35' }} />
                            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#FF6B35' }}>
                                10th Edition • 2026
                            </span>
                        </motion.div>

                        {/* Main Title */}
                        <motion.h1
                            initial={{ y: 60, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 1 }}
                            className="title-extra-bold text-[56px] sm:text-[80px] md:text-[140px] lg:text-[180px] relative z-20 group leading-tight"
                        >
                            UTh<span className="gradient-orange"> Fest</span>
                            <motion.div
                                style={{ y: yLogo }}
                                className="absolute -right-2 top-0 w-16 h-16 sm:w-24 sm:h-24 sm:-right-8 sm:top-1 md:w-32 md:h-32 md:-right-24 md:top-0 lg:w-48 lg:h-48 lg:-right-40 lg:top-2"
                            >
                                <img
                                    src={logoImage}
                                    alt="UTh Fest Primary Logo"
                                    className="w-full h-full object-contain animate-spin-slow"
                                    style={{ filter: 'drop-shadow(0 0 40px rgba(255, 107, 53, 0.25))' }}
                                />
                            </motion.div>
                        </motion.h1>

                        {/* Subtitle line */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 1 }}
                            className="flex items-center justify-center gap-2 md:gap-4 mt-2 md:mt-4"
                        >
                            <div className="h-[1px] md:h-[2px] w-12 md:w-20"
                                style={{ background: 'linear-gradient(to right, transparent, #FF6B35)' }}
                            />
                            <span className="text-sm md:text-3xl font-light tracking-wider whitespace-nowrap"
                                style={{ color: '#8B7D6B' }}
                            >
                                Where YouthRAS meets Navras
                            </span>
                            <div className="h-[1px] md:h-[2px] w-12 md:w-20"
                                style={{ background: 'linear-gradient(to left, transparent, #FF6B35)' }}
                            />
                        </motion.div>
                    </div>

                    {/* Description */}
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="text-base md:text-xl max-w-xl md:max-w-2xl text-center mb-10 md:mb-16 font-medium leading-relaxed px-4"
                        style={{ color: '#8B7D6B' }}
                    >
                        The 10th edition celebrates a decade of emotions, creativity, and youth power. Join us for 28 events across 6 categories where tradition meets innovation.
                    </motion.p>

                    {/* CTA + Info */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="flex flex-col md:flex-row items-center gap-8 md:gap-12"
                    >
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Link to="/events" className="btn-elite group text-sm md:text-base px-8 py-3 md:px-10 md:py-4">
                                Explore Events <ArrowRight className="group-hover:translate-x-2 transition-transform w-4 h-4 md:w-5 md:h-5" />
                            </Link>
                            <Link
                                to="/team-leader"
                                className="group text-sm md:text-base px-7 py-3 md:px-9 md:py-4 font-bold rounded-full flex items-center gap-3 transition-all duration-500"
                                style={{
                                    background: 'rgba(255, 107, 53, 0.06)',
                                    color: '#FF6B35',
                                    border: '1px solid rgba(255, 107, 53, 0.15)',
                                }}
                            >
                                Team Leader Login
                            </Link>
                        </div>

                        <div className="flex gap-8 md:gap-12 text-sm md:text-base">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                                    style={{ color: '#FF6B35' }}
                                >
                                    <Calendar size={12} className="md:w-[14px] md:h-[14px]" /> Schedule
                                </div>
                                <div className="text-lg md:text-xl font-bold" style={{ color: '#1A1208' }}>MAR 18 • 20</div>
                            </div>
                            <div className="w-[1px] h-10 md:h-12" style={{ background: 'rgba(26, 18, 8, 0.1)' }} />
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                                    style={{ color: '#FF6B35' }}
                                >
                                    <MapPin size={12} className="md:w-[14px] md:h-[14px]" /> Venue
                                </div>
                                <div className="text-lg md:text-xl font-bold" style={{ color: '#1A1208' }}>UTU CAMPUS</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Decorative side elements */}
            <div className="absolute bottom-16 left-8 text-[9px] font-black uppercase tracking-[0.2em] z-10 [writing-mode:vertical-rl] [text-orientation:mixed]"
                style={{ color: 'rgba(26, 18, 8, 0.08)' }}
            >
                Uka Tarsadia University
            </div>
            <div className="absolute top-1/2 right-10 -translate-y-1/2 flex flex-col gap-8">
                <div className="w-1 h-1 rounded-full" style={{ background: '#FF6B35' }} />
                <div className="w-1 h-32 rounded-full opacity-20"
                    style={{ background: 'linear-gradient(to bottom, #FF6B35, transparent)' }}
                />
            </div>
        </section>
    );
};

export default Hero;
