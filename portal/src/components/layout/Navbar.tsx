import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import logoImage from '../../assets/images/UTU.png';

const Navbar = () => {
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [areResultsPublished, setAreResultsPublished] = useState(false);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Events', path: '/events' },
        { name: 'Schedule', path: '/schedule' },
        ...(areResultsPublished ? [{ name: 'Score', path: '/scoreboard' }] : []),
        { name: 'Live', path: '/live' },
        { name: 'Manager Logins', path: '/manager' },
    ];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const published = localStorage.getItem('scoreboardPublished') === 'true';
        setAreResultsPublished(published);
    }, []);

    return (
        <motion.nav
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 md:py-4 flex justify-between pointer-events-none"
        >
            <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
                {/* Left: Logo */}
                <div className={`pointer-events-auto transition-all duration-700 flex items-center gap-3 group z-50 relative rounded-full ${isScrolled ? 'px-5 py-2' : 'px-6 py-3'}`}
                    style={{
                        background: 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(40px)',
                        WebkitBackdropFilter: 'blur(40px)',
                        border: '1px solid rgba(255, 107, 53, 0.08)',
                        boxShadow: '0 8px 32px -4px rgba(26, 18, 8, 0.06)'
                    }}
                >
                    <Link to="/" className="flex items-center gap-3">
                        <img src={logoImage} alt="Logo" className="w-9 h-9 md:w-10 md:h-10 object-contain group-hover:rotate-12 transition-transform duration-500" />
                        <span className="font-black tracking-tighter text-base md:text-lg" style={{ color: '#1A1208' }}>
                            UTh<span style={{ color: '#FF6B35' }}> Fest</span>
                        </span>
                    </Link>
                </div>

                {/* Right: Navigation */}
                <div className={`pointer-events-auto transition-all duration-700 flex items-center gap-6 md:gap-8 rounded-full ${isScrolled ? 'px-5 py-2' : 'px-6 py-3'}`}
                    style={{
                        background: 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(40px)',
                        WebkitBackdropFilter: 'blur(40px)',
                        border: '1px solid rgba(255, 107, 53, 0.08)',
                        boxShadow: '0 8px 32px -4px rgba(26, 18, 8, 0.06)'
                    }}
                >
                    <div className="hidden md:flex items-center gap-8 h-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="relative text-[10px] font-black uppercase tracking-[0.2em] group whitespace-nowrap flex items-center h-full transition-colors"
                            >
                                <span style={{
                                    color: location.pathname === link.path ? '#FF6B35' : '#8B7D6B'
                                }}
                                    className="group-hover:!text-[#1A1208] transition-colors"
                                >
                                    {link.name}
                                </span>
                                {location.pathname === link.path && (
                                    <motion.div
                                        layoutId="elite-nav"
                                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                                        style={{ background: '#FF6B35' }}
                                    />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Toggle */}
                    <div className="md:hidden z-50 relative pointer-events-auto">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="focus:outline-none flex items-center justify-center h-10 w-10"
                            style={{ color: '#1A1208' }}
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay — Bright */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 flex flex-col items-center justify-center pointer-events-auto md:hidden"
                        style={{
                            background: 'rgba(254, 252, 248, 0.97)',
                            backdropFilter: 'blur(40px)',
                            WebkitBackdropFilter: 'blur(40px)',
                        }}
                    >
                        <div className="flex flex-col gap-8 text-center">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className="text-2xl font-black uppercase tracking-widest transition-colors"
                                    style={{
                                        color: location.pathname === link.path ? '#FF6B35' : '#8B7D6B'
                                    }}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
