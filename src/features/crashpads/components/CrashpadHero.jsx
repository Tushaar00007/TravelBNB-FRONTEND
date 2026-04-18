import React from 'react';
import { motion } from 'framer-motion';
import { Users, Globe, MapPin, Sparkles } from 'lucide-react';
import nomad1 from '../../../assets/images/community/nomad1.jpg';
import nomad2 from '../../../assets/images/community/nomad2.jpg';
import nomad3 from '../../../assets/images/community/nomad3.jpg';

const STATS = [
    { label: "Travelers", value: "10,000+", icon: <Users size={20} /> },
    { label: "Crashpads", value: "500+", icon: <Sparkles size={20} /> },
    { label: "Cities", value: "50+", icon: <Globe size={20} /> },
];

const AVATARS = [
    { src: nomad1, className: "top-10 left-10 w-20 h-20" },
    { src: nomad2, className: "bottom-10 right-20 w-24 h-24" },
    { src: nomad3, className: "top-20 right-10 w-16 h-16" },
];

function CrashpadHero() {
    return (
        <section className="relative pt-32 pb-24 overflow-hidden bg-white dark:bg-gray-950">
            {/* Ambient Background Gradient */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-orange-500/10 via-orange-500/5 to-transparent blur-3xl -z-10" />

            <div className="max-w-7xl mx-auto px-6 relative">
                {/* Floating Avatars */}
                {AVATARS.map((avatar, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                        className={`absolute hidden lg:block rounded-full border-4 border-white dark:border-gray-900 shadow-2xl overflow-hidden z-10 ${avatar.className}`}
                    >
                        <img src={avatar.src} alt="Traveler" className="w-full h-full object-cover" />
                    </motion.div>
                ))}

                <div className="flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-widest mb-10 border border-orange-200 dark:border-orange-500/20 shadow-sm"
                    >
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        The Community layer
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white tracking-tighter leading-[0.9] mb-8"
                    >
                        FIND YOUR <br />
                        <span className="text-orange-500 italic relative">
                            TRIBE.
                            <svg className="absolute -bottom-2 left-0 w-full h-4 text-orange-500/20 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="transparent" stroke="currentColor" strokeWidth="8" />
                            </svg>
                        </span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-500 max-w-3xl mb-24 leading-tight"
                    >
                        Budget-friendly shared spaces designed for the next generation <br className="hidden md:block" /> of nomads, creators, and world-shakers.
                    </motion.p>

                    {/* Stats Row */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl p-8 rounded-[2.5rem] bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-100 dark:border-gray-800"
                    >
                        {STATS.map((stat, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className="text-orange-500 bg-orange-500/10 p-3 rounded-2xl">
                                    {stat.icon}
                                </div>
                                <div className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default CrashpadHero;
