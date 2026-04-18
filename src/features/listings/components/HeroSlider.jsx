import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import hero1 from "../../../assets/images/hero/hero1.jpg";
import hero2 from "../../../assets/images/hero/hero2.jpg";
import hero3 from "../../../assets/images/hero/hero3.jpg";
import hero4 from "../../../assets/images/hero/hero4.jpg";
import hero5 from "../../../assets/images/hero/hero5.jpg";

const SLIDES = [
    { url: hero1, alt: "Majestic Mountain Dawn" },
    { url: hero2, alt: "Tropical Beach Paradise" },
    { url: hero3, alt: "Luxury Modern Villa" },
    { url: hero4, alt: "Cozy Winter Cabin" },
    { url: hero5, alt: "Exclusive Resort Penthouse" },
];

function HeroSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const nextSlide = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, []);

    const prevSlide = useCallback(() => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    }, []);

    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [nextSlide]);

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 1.1,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            transition: {
                duration: 1.2,
                ease: [0.4, 0, 0.2, 1],
            },
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
            transition: {
                duration: 1.2,
            },
        }),
    };

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 w-full h-full"
                >
                    <motion.img
                        src={SLIDES[currentIndex].url}
                        alt={SLIDES[currentIndex].alt}
                        className="absolute inset-0 w-full h-full object-cover"
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 10, ease: "linear" }}
                    />
                    {/* Dark Overlay with Gradient */}
                    <div className="absolute inset-0 bg-black/40 bg-gradient-to-b from-black/70 via-transparent to-black/20" />
                </motion.div>
            </AnimatePresence>

            {/* Manual Navigation - Dots */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                {SLIDES.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setDirection(idx > currentIndex ? 1 : -1);
                            setCurrentIndex(idx);
                        }}
                        className={`group relative h-1.5 transition-all duration-500 rounded-full ${currentIndex === idx ? "w-10 bg-primary" : "w-3 bg-white/40 hover:bg-white/60"}`}
                    >
                        {currentIndex === idx && (
                            <motion.div
                                layoutId="activeDot"
                                className="absolute inset-0 bg-primary rounded-full shadow-[0_0_15px_rgba(234,88,12,0.6)]"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Navigation Arrows */}
            <div className="absolute inset-0 z-10 flex items-center justify-between px-6 pointer-events-none">
                <button
                    onClick={prevSlide}
                    className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all pointer-events-auto"
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={nextSlide}
                    className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all pointer-events-auto"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
}

export default HeroSlider;
