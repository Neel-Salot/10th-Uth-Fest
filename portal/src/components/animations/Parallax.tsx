import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

/**
 * Lusion-style parallax wrapper.
 * Wraps children in a scroll-linked parallax effect with smooth spring physics.
 */

interface ParallaxProps {
    children: ReactNode;
    className?: string;
    speed?: number;       // negative = slower, positive = faster
    opacity?: boolean;    // fade out as it scrolls
    scale?: boolean;      // scale down as it scrolls
}

const Parallax = ({ children, className = '', speed = 0.5, opacity = false, scale = false }: ParallaxProps) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    });

    const rawY = useTransform(scrollYProgress, [0, 1], [speed * 100, speed * -100]);
    const y = useSpring(rawY, { stiffness: 100, damping: 30 });

    const opacityVal = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
    const scaleVal = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.8]);

    return (
        <motion.div
            ref={ref}
            className={className}
            style={{
                y,
                ...(opacity ? { opacity: opacityVal } : {}),
                ...(scale ? { scale: scaleVal } : {}),
            }}
        >
            {children}
        </motion.div>
    );
};

export default Parallax;
