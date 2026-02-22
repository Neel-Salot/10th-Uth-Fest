import { motion, useInView, type Variants } from 'framer-motion';
import { useRef } from 'react';

/**
 * Lusion-style character-by-character text reveal.
 * Each character slides up from behind a mask as it enters the viewport.
 */

interface SplitTextProps {
    children: string;
    className?: string;
    as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
    delay?: number;
    staggerChildren?: number;
    once?: boolean;
}

const charVariants: Variants = {
    hidden: { y: '100%', opacity: 0 },
    visible: {
        y: '0%',
        opacity: 1,
    },
};

const SplitText = ({
    children,
    className = '',
    as: Tag = 'div',
    delay = 0,
    staggerChildren = 0.03,
    once = true,
}: SplitTextProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, margin: '-80px' });

    // Split into words, preserving spaces
    const words = children.split(' ');

    return (
        <Tag ref={ref} className={`${className}`} aria-label={children}>
            {words.map((word, wi) => (
                <span key={wi} className="inline-block whitespace-nowrap">
                    {word.split('').map((char, ci) => {
                        const totalIndex = words.slice(0, wi).join(' ').length + ci;
                        return (
                            <span key={ci} className="inline-block overflow-hidden">
                                <motion.span
                                    className="inline-block"
                                    variants={charVariants}
                                    initial="hidden"
                                    animate={isInView ? 'visible' : 'hidden'}
                                    transition={{
                                        duration: 0.6,
                                        ease: [0.215, 0.61, 0.355, 1],
                                        delay: delay + totalIndex * staggerChildren,
                                    }}
                                >
                                    {char}
                                </motion.span>
                            </span>
                        );
                    })}
                    {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
                </span>
            ))}
        </Tag>
    );
};

export default SplitText;
