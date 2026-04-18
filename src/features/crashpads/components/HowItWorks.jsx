import React from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Coffee } from 'lucide-react';

const STEPS = [
    {
        title: "Find Your Vibe",
        desc: "Browse shared spaces based on community tags and creator vibes.",
        icon: <Search size={32} />,
    },
    {
        title: "Join a Crashpad",
        desc: "Apply to join a space that matches your nomadic journey.",
        icon: <Users size={32} />,
    },
    {
        title: "Connect & Explore",
        desc: "Arrive, connect with your tribe, and start your next adventure.",
        icon: <Coffee size={32} />,
    }
];

function HowItWorks() {
    return (
        <section className="py-32 bg-gray-50 dark:bg-gray-900/40">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.2em] mb-6 inline-block"
                    >
                        Success Roadmap
                    </motion.div>
                    <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                        HOW IT <span className="text-orange-500">WORKS</span>
                    </h2>
                </div>

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-24">
                    {/* Progress Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 dark:bg-gray-800 -translate-y-1/2 hidden md:block" />

                    {STEPS.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="relative z-10 flex flex-col items-center text-center bg-white dark:bg-gray-950 p-12 rounded-[3.5rem] shadow-xl border border-gray-100 dark:border-gray-800 w-full hover:shadow-2xl transition-all duration-500 group"
                        >
                            <div className="w-24 h-24 rounded-full bg-orange-500 text-white flex items-center justify-center mb-10 shadow-[0_0_30px_rgba(234,88,12,0.3)] group-hover:scale-110 transition-transform">
                                {step.icon}
                                <div className="absolute -top-2 -right-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg">
                                    {i + 1}
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">{step.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 font-bold max-w-[240px] leading-relaxed uppercase tracking-wide text-sm">
                                {step.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default HowItWorks;
