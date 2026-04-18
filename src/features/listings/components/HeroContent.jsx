import React from 'react';
import { motion } from 'framer-motion';

function HeroContent() {
    return (
        <div className="relative z-20 flex flex-col items-center text-center px-6 pt-20">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest mb-6 shadow-xl"
            >
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Explore the Extraordinary
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-tight"
            >
                Find your next <br />
                <span className="text-primary italic relative">
                    adventure
                    <motion.svg
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, delay: 1 }}
                        className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-3 text-primary/40 -z-10"
                        viewBox="0 0 100 10"
                        preserveAspectRatio="none"
                    >
                        <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="transparent" stroke="currentColor" strokeWidth="8" />
                    </motion.svg>
                </span>
                {' '}with TravelBNB
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="text-gray-200 text-lg md:text-xl max-w-2xl font-medium mb-12 drop-shadow-md"
            >
                Discover curated luxury stays, unique cabins, and exotic villas around the globe.
                Your dream getaway is just a click away.
            </motion.p>
        </div>
    );
}

export default HeroContent;
