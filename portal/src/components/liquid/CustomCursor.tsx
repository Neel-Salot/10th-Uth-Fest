import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LiquidStore } from './Store';

export default function CustomCursor() {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [hoverType, setHoverType] = useState<'default' | 'play' | 'physics'>('default');

    useEffect(() => {
        const handleMouse = (e: MouseEvent) => {
            setPos({ x: e.clientX, y: e.clientY });
            LiquidStore.setMouse(e.clientX, e.clientY);
        };

        const handleTouch = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                // Just trigger single ripple effect for mobile
                LiquidStore.setMouse(e.touches[0].clientX, e.touches[0].clientY);
            }
        };

        window.addEventListener('mousemove', handleMouse);
        window.addEventListener('touchmove', handleTouch);

        // Poll for hover type from store since it's updated manually on mouseenter/leave
        const iId = setInterval(() => {
            if (hoverType !== LiquidStore.hoverTarget) {
                setHoverType(LiquidStore.hoverTarget);
            }
        }, 50);

        return () => {
            window.removeEventListener('mousemove', handleMouse);
            window.removeEventListener('touchmove', handleTouch);
            clearInterval(iId);
        };
    }, [hoverType]);

    const variants = {
        default: {
            width: 16,
            height: 16,
            x: pos.x - 8,
            y: pos.y - 8,
            backgroundColor: '#FF6B35',
            borderRadius: '50%',
            mixBlendMode: 'difference' as any
        },
        play: {
            width: 80,
            height: 80,
            x: pos.x - 40,
            y: pos.y - 40,
            backgroundColor: 'transparent',
            borderColor: '#FF6B35',
            borderWidth: 2,
            borderStyle: 'solid',
            borderRadius: '50%',
            mixBlendMode: 'normal' as any
        },
        physics: {
            width: 40,
            height: 40,
            x: pos.x - 20,
            y: pos.y - 20,
            backgroundColor: '#FEFCF8',
            mixBlendMode: 'difference' as any,
            rotate: 0,
            borderRadius: '20%'
        }
    };

    return (
        <>
            {/* Mobile devices hide cursor */}
            <style>{`
        @media (min-width: 768px) {
          body { cursor: none; }
        }
      `}</style>
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[100] hidden md:flex items-center justify-center"
                animate={hoverType}
                variants={variants}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            >
                {hoverType === 'play' && (
                    <div className="absolute inset-0 flex items-center justify-center animate-[spin_4s_linear_infinite]">
                        <svg viewBox="0 0 100 100" className="w-[120%] h-[120%] absolute">
                            <path id="curve" fill="transparent" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
                            <text fontSize="8" fill="#FF6B35" letterSpacing="1.5" fontWeight="bold">
                                <textPath href="#curve">9TH/8TH FEST • PLAY AFTERMOVIE • </textPath>
                            </text>
                        </svg>
                        <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-[#FF6B35] border-b-8 border-b-transparent transform translate-x-1" />
                    </div>
                )}
                {hoverType === 'physics' && (
                    <div className="flex items-center justify-center">
                        {/* Gravity icon - downward arrows */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M19 12l-7 7-7-7" />
                        </svg>
                    </div>
                )}
            </motion.div>
        </>
    );
}
