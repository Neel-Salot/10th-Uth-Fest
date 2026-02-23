import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { Play, Pause } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface ScrollytellingProps {
    videos: Array<{
        id: string;
        title: string;
        year: string;
        videoPath: string;
        videoThumbnail: string;
    }>;
}

const ScrollytellingAfterMovie: React.FC<ScrollytellingProps> = ({ videos }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<HTMLVideoElement[]>([]);
    const [isPlaying, setIsPlaying] = useState<boolean[]>(videos.map(() => false));

    // Toggle video play/pause
    const togglePlayPause = (index: number) => {
        const video = videoRefs.current[index];
        if (!video) return;

        try {
            if (video.paused) {
                video.play().then(() => {
                    setIsPlaying((prev) => {
                        const updated = [...prev];
                        updated[index] = true;
                        return updated;
                    });
                }).catch((error) => {
                    console.error('Video play error:', error);
                });
            } else {
                video.pause();
                setIsPlaying((prev) => {
                    const updated = [...prev];
                    updated[index] = false;
                    return updated;
                });
            }
        } catch (error) {
            console.error('Toggle error:', error);
        }
    };

    return (
        <section
            ref={containerRef}
            className="relative py-20 md:py-40 px-4 md:px-6"
            style={{
                background: '#FEFCF8',
            }}
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="max-w-6xl mx-auto mb-20 md:mb-32 text-center"
            >
                <h2
                    className="text-5xl md:text-7xl font-black mb-6"
                    style={{ color: '#1A1208' }}
                >
                    After Movie
                </h2>
                <p
                    className="text-lg md:text-xl"
                    style={{ color: '#FF6B35' }}
                >
                    Relive the incredible moments
                </p>
            </motion.div>

            {/* Videos Grid */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
                {videos.map((video, index) => (
                    <motion.div
                        key={video.id}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: index * 0.2 }}
                        viewport={{ once: true, margin: '-100px' }}
                    >
                        {/* Video Container */}
                        <div
                            className="relative group cursor-pointer overflow-hidden rounded-2xl"
                            style={{
                                aspectRatio: '16 / 9',
                                background: '#1A1208',
                            }}
                        >
                            <video
                                ref={(el) => {
                                    if (el) videoRefs.current[index] = el;
                                }}
                                className="w-full h-full object-cover"
                                playsInline
                            >
                                <source src={video.videoPath} type="video/mp4" />
                            </video>

                            {/* Dark overlay on hover */}
                            <motion.div
                                className="absolute inset-0"
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    background: 'rgba(0, 0, 0, 0.5)',
                                }}
                            />

                            {/* Play Button */}
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center"
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileHover={{ opacity: 1, scale: 1 }}
                                onClick={() => togglePlayPause(index)}
                            >
                                <motion.div
                                    className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-2xl"
                                    style={{
                                        background: '#FF6B35',
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isPlaying[index] ? (
                                        <Pause size={48} fill="white" color="white" />
                                    ) : (
                                        <Play size={48} fill="white" color="white" />
                                    )}
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Video Info */}
                        <motion.div
                            className="mt-6 md:mt-8"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.2 + 0.2 }}
                            viewport={{ once: true, margin: '-100px' }}
                        >
                            <h3
                                className="text-2xl md:text-3xl font-black mb-2"
                                style={{ color: '#1A1208' }}
                            >
                                {video.title}
                            </h3>
                            <p
                                className="text-base md:text-lg font-semibold"
                                style={{ color: '#FF6B35' }}
                            >
                                {video.year}
                            </p>
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default ScrollytellingAfterMovie;
