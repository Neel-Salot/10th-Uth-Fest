import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LiquidStore } from './Store';

gsap.registerPlugin(ScrollTrigger);

interface VideoRevealProps {
    titleLine1: string;
    titleLine2: string;
    year: string;
    videoPath: string;
}

export default function LiquidVideoReveal({ titleLine1, titleLine2, year, videoPath }: VideoRevealProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!containerRef.current || !textRef.current) return;

        // If no video ref yet (e.g. no path), we still want to animate text
        const hasVideo = !!videoRef.current;

        const elements: HTMLElement[] = [];
        textRef.current.innerHTML = '';

        const appendLine = (text: string) => {
            const lineDiv = document.createElement('div');
            text.split(' ').forEach(word => {
                const span = document.createElement('span');
                span.innerText = word + '\u00A0';
                span.style.display = 'inline-block';
                lineDiv.appendChild(span);
                elements.push(span);
            });
            textRef.current?.appendChild(lineDiv);
        };

        appendLine(titleLine1);
        appendLine(titleLine2);

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top center+=100",
                end: "bottom center",
                scrub: 1.5
            }
        });

        // Wobbly expansion
        // Instead of raw perlin noise which is expensive on SVG masks inside React, 
        // we use a CSS clip-path with animated polygon or SVG feDisplacementMap.
        // SVG feDisplacement is simpler to code and animates naturally with a SMIL or CSS animation in the svg itself.

        tl.fromTo(elements,
            {
                opacity: 0,
                x: () => (Math.random() - 0.5) * 400,
                y: () => (Math.random() - 0.5) * 400,
                rotationZ: () => (Math.random() - 0.5) * 90
            },
            {
                opacity: 1,
                x: 0, y: 0, rotationZ: 0,
                stagger: 0.05,
                ease: "elastic.out(1, 0.75)",
                duration: 1
            }, 0
        );

        // Liquid snap video reveal
        if (hasVideo && videoRef.current) {
            tl.fromTo(videoRef.current,
                { clipPath: 'circle(0% at 50% 50%)', scale: 0.8 },
                { clipPath: 'circle(100% at 50% 50%)', scale: 1, ease: "power4.inOut", duration: 1.5 },
                0.6
            );
        }

        // Play video ONLY when in view to prevent AbortError ("video-only background media was paused to save power")
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    videoRef.current?.play().catch(() => { });
                } else {
                    videoRef.current?.pause();
                }
            });
        }, { threshold: 0.1 });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            tl.kill();
            observer.disconnect();
        };
    }, []);

    // Immediate playback attempt
    useEffect(() => {
        if (videoRef.current && videoPath) {
            videoRef.current.play().catch(() => {
                // Autoplay blocked - will rely on ScrollTrigger/Observer
            });
        }
    }, [videoPath]);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden"
            onMouseEnter={() => LiquidStore.setHover('play')}
            onMouseLeave={() => LiquidStore.setHover('default')}
        >
            <div className="absolute inset-0 z-0 flex items-center justify-center p-4">
                {videoPath ? (
                    <video
                        ref={videoRef}
                        muted
                        loop
                        playsInline
                        autoPlay
                        preload="auto"
                        style={{ width: '80%', height: '80%', objectFit: 'cover', transition: 'object-position 0.2s' }}
                        className="rounded-[3rem] shadow-2xl scale-125"
                    >
                        <source src={videoPath} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <div className="w-[80%] h-[80%] rounded-[3rem] bg-[#1A1208]/5 animate-pulse flex items-center justify-center">
                        <p className="text-[#8B7D6B] font-bold uppercase tracking-widest opacity-20">Coming Soon</p>
                    </div>
                )}
            </div>

            <div className="relative z-10 text-center pointer-events-none mix-blend-difference">
                <h2
                    ref={textRef}
                    className="text-6xl md:text-[8rem] font-black uppercase tracking-tighter text-[#FEFCF8] leading-none mb-4"
                >
                </h2>
                <p className="text-xl md:text-3xl font-bold uppercase tracking-widest text-[#FF6B00]">
                    {year}
                </p>
            </div>
        </div>
    );
}
