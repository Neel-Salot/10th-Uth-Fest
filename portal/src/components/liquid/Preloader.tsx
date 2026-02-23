import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/images/logo.png';

export default function Preloader() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading for local videos & assets
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2500); // Wait 2.5 seconds
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    key="preloader"
                    exit={{ opacity: 0, scale: 2 }}
                    transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#FEFCF8]"
                >
                    <motion.img
                        src={logo}
                        alt="Loading..."
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{
                            scale: [0.8, 1.1, 0.8],
                            rotate: 360,
                            opacity: 1
                        }}
                        transition={{
                            duration: 6, // Much slower spin
                            ease: "linear", // Linear ease for smooth continuous spinning
                            repeat: Infinity,
                            repeatType: "loop"
                        }}
                        className="w-32 h-32 object-contain"
                        style={{ filter: "drop-shadow(0 0 20px rgba(255, 107, 53, 0.4))" }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
