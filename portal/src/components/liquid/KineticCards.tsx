import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LiquidStore } from './Store';

gsap.registerPlugin(ScrollTrigger);

interface CardData {
    title: string;
    img: string;
}

export default function KineticCards({ cards }: { cards: CardData[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Initial deal animation on scroll
        gsap.fromTo(cardRefs.current,
            {
                y: 800,
                rotationZ: 0,
                scale: 0.5,
                opacity: 0
            },
            {
                y: 0,
                scale: 1,
                opacity: 1,
                rotationZ: (i) => [-25, 0, 25][i],
                x: (i) => [-200, 0, 200][i],
                stagger: 0.1,
                ease: "elastic.out(1, 0.75)",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top center+=200",
                    toggleActions: "play reverse play reverse",
                }
            }
        );
    }, []);

    const handleMouseMove = (e: React.MouseEvent, i: number) => {
        if (!cardRefs.current[i]) return;
        const rect = cardRefs.current[i]!.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element.
        const y = e.clientY - rect.top;  // y position within the element.

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const tiltX = (y - centerY) / 10;
        const tiltY = (centerX - x) / 10;

        gsap.to(cardRefs.current[i], {
            rotationX: tiltX,
            rotationY: tiltY,
            duration: 0.5,
            ease: 'power2.out',
            transformPerspective: 1000
        });
    };

    const handleMouseLeave = (i: number) => {
        setHoveredIndex(null);
        if (!cardRefs.current[i]) return;
        gsap.to(cardRefs.current[i], {
            rotationX: 0,
            rotationY: 0,
            rotationZ: [-25, 0, 25][i],
            x: [-200, 0, 200][i],
            scale: 1,
            duration: 0.8,
            ease: "elastic.out(1, 0.75)",
            clearProps: "transformPerspective"
        });
    };

    const handleMouseEnter = (i: number) => {
        setHoveredIndex(i);
        gsap.to(cardRefs.current[i], {
            scale: 1.1,
            rotationZ: 0,
            duration: 0.5,
            ease: "power2.out"
        });
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-[600px] flex items-center justify-center perspective-1000"
        >
            {cards.map((card, i) => (
                <div
                    key={card.title}
                    ref={(el) => { cardRefs.current[i] = el; }}
                    onMouseMove={(e) => handleMouseMove(e, i)}
                    onMouseEnter={() => handleMouseEnter(i)}
                    onMouseLeave={() => handleMouseLeave(i)}
                    className="absolute w-64 md:w-80 h-96 md:h-[30rem] rounded-3xl cursor-pointer shadow-2xl overflow-hidden will-change-transform z-10 hover:z-50"
                    style={{
                        background: '#FEFCF8',
                        border: '1px solid rgba(255,107,53,0.1)',
                        transformOrigin: '50% 100%'
                    }}
                >
                    <img
                        src={card.img}
                        alt={card.title}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[rgba(26,18,8,0.9)] to-transparent flex items-end p-8">
                        <h3 className="text-4xl md:text-5xl font-black text-[#FEFCF8] uppercase tracking-tighter">
                            {card.title}
                        </h3>
                    </div>
                </div>
            ))}
        </div>
    );
}
