import React from 'react';
import { motion } from 'framer-motion';
import AvatarCluster from './AvatarCluster';
import BuddySearchBar from './BuddySearchBar';

function TravelBuddyHero() {

    return (
        <section className="relative pt-32 pb-40 px-6 overflow-hidden bg-gradient-to-br from-[#fff7ed] via-white to-[#ffe4cc] dark:from-gray-950 dark:via-gray-900 dark:to-orange-950/20">
            {/* Visual Depth Blobs */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-200/20 dark:bg-orange-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 -z-0" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-100/30 dark:bg-orange-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4 -z-0" />

            {/* Floating Avatars */}
            <AvatarCluster />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] mb-12 shadow-sm border border-orange-200/50 dark:border-orange-500/20"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                        Community Matching Active
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white tracking-tighter leading-[0.85] mb-8"
                    >
                        FIND YOUR <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 tracking-tight italic">
                            SQUAD.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg md:text-xl font-bold text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-16 leading-relaxed"
                    >
                        Connect with like-minded travelers, split costs, and create <br className="hidden md:block" /> memories together. Better adventures start with company.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="w-full"
                    >
                        <BuddySearchBar />
                        <p className="text-sm font-black text-gray-300 dark:text-gray-600 mt-6 uppercase tracking-widest animate-pulse">
                            Start by exploring communities below ↓
                        </p>
                    </motion.div>

                    {/* Quick Stats Tags */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-wrap justify-center gap-8 mt-16 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest"
                    >
                        <span className="flex items-center gap-2">
                             Verified Accounts
                        </span>
                        <span className="flex items-center gap-2">
                             24/7 Group Safety
                        </span>
                        <span className="flex items-center gap-2">
                             Seamless Chat
                        </span>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default TravelBuddyHero;
