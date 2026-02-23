import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function GhumiNavigator() {
    const { scrollYProgress } = useScroll();

    // Tighter spring physics so it quickly catches up to scroll
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 400,
        damping: 60,
        restDelta: 0.001
    });

    const opacity = useTransform(scrollYProgress, [0.85, 0.95], [1, 0]);

    return (
        <motion.div
            className="absolute inset-0 w-full pointer-events-none z-0"
            style={{ opacity }}
        >
            <svg
                className="w-full h-full"
                viewBox="0 0 1000 10000"
                preserveAspectRatio="none"
            >
                <motion.path
                    d="
            M 500, 0
            C 1600, 400   -600, 600   500, 1200
            C 1800, 1500  1000, 2000  300, 2200
            C -400, 2400  -100, 1800  500, 2800
            C 1200, 3800  -800, 3600  400, 4400
            C 1400, 5000  1800, 5800  800, 6000
            C -200, 6200  -400, 5600  500, 6800
            C 1600, 8000  -600, 8000  500, 9000
            C 1200, 9500   200, 9800  500, 10000
          "
                    fill="none"
                    stroke="#FF6B35"
                    strokeWidth="35"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_0_20px_rgba(255,107,53,0.5)]"
                    style={{ pathLength: smoothProgress }}
                />
            </svg>
        </motion.div>
    );
}
