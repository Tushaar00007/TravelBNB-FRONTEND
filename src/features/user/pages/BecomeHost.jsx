import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, Users, Globe, ArrowRight, Sparkles, ShieldCheck, Heart, Zap } from "lucide-react";
import { motion } from "framer-motion";

const BecomeHost = () => {
    const navigate = useNavigate();

    const options = [
        {
            id: "property",
            title: "Host a Property",
            description: "List homes, villas, apartments, or unique stays and start earning.",
            icon: Home,
            path: "/create-listing",
            accent: "from-orange-500 to-amber-500",
            benefit: "High Earning Potential"
        },
        {
            id: "crashpad",
            title: "Host a Crashpad",
            description: "Offer a free or low-cost stay and connect with world travelers.",
            icon: Users,
            path: "/create-crashpad",
            accent: "from-orange-600 to-red-600",
            benefit: "Community Building"
        },
        {
            id: "travel_buddy",
            title: "Become a Travel Buddy",
            description: "Find fellow explorers and share the costs and joys of the journey.",
            icon: Globe,
            path: "/create-travel-buddy",
            accent: "from-amber-400 to-orange-500",
            benefit: "Shared Adventures"
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden font-sans">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-500/5 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-orange-600/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-sm">
                        <Sparkles size={14} /> Join our global community
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-[#0f0f0f] dark:text-white mb-6 leading-none">
                        Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Host</span>
                    </h1>
                    <p className="text-xl font-medium text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Explore the different ways you can share your space and experiences with travelers from across the globe.
                    </p>
                </motion.div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
                >
                    {options.map((option) => {
                        const Icon = option.icon;
                        return (
                            <motion.div
                                key={option.id}
                                variants={itemVariants}
                                whileHover={{ y: -10 }}
                                onClick={() => navigate(option.path)}
                                className="group cursor-pointer relative bg-white dark:bg-[#121212] rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] dark:shadow-none transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10 dark:hover:border-orange-500/30"
                            >
                                {/* Active Accent Bar */}
                                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-0 h-1.5 bg-gradient-to-r ${option.accent} rounded-full transition-all duration-500 group-hover:w-[60%]`} />

                                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-8 border border-gray-100 dark:border-gray-700 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-orange-600 group-hover:text-white transition-all duration-500 shadow-sm overflow-hidden relative">
                                    <Icon className="text-[#0f0f0f] dark:text-white group-hover:text-white transition-colors z-10" size={32} strokeWidth={1.5} />
                                    <div className="absolute inset-x-0 h-full w-full bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                </div>

                                <div className="mb-4 inline-block px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:bg-orange-500/10 group-hover:text-orange-600 transition-colors">
                                    {option.benefit}
                                </div>

                                <h2 className="text-2xl font-black text-[#0f0f0f] dark:text-white mb-4 tracking-tight uppercase italic group-hover:text-orange-500 transition-colors">
                                    {option.title}
                                </h2>

                                <p className="text-gray-500 dark:text-gray-400 font-bold mb-10 leading-relaxed text-sm">
                                    {option.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[#0f0f0f] dark:text-white font-black uppercase tracking-widest text-[10px] group-hover:text-orange-500 transition-all">
                                        Get Started <ArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
                                    </div>
                                    <div className="w-8 h-8 rounded-full border border-gray-100 dark:border-gray-800 flex items-center justify-center group-hover:border-orange-500/30 transition-colors">
                                        <Zap size={14} className="text-gray-300 group-hover:text-orange-500 transition-colors" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Trust Badges */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-32 pt-16 border-t border-gray-100 dark:border-gray-800"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 mb-4 border border-emerald-100 dark:border-emerald-900/30">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="font-extrabold text-[#0f0f0f] dark:text-white uppercase tracking-tighter mb-2">Verified Community</h3>
                            <p className="text-xs text-gray-500 font-bold">Every traveler is ID verified for your peace of mind.</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-rose-50 dark:bg-rose-900/10 text-rose-600 mb-4 border border-rose-100 dark:border-rose-900/30">
                                <Heart size={24} />
                            </div>
                            <h3 className="font-extrabold text-[#0f0f0f] dark:text-white uppercase tracking-tighter mb-2">Local Support</h3>
                            <p className="text-xs text-gray-500 font-bold">Our local team is here to help you 24/7 with any issues.</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-orange-50 dark:bg-orange-900/10 text-orange-600 mb-4 border border-orange-100 dark:border-orange-900/30">
                                <Zap size={24} />
                            </div>
                            <h3 className="font-extrabold text-[#0f0f0f] dark:text-white uppercase tracking-tighter mb-2">Instant Setup</h3>
                            <p className="text-xs text-gray-500 font-bold">List your place in minutes and start receiving guests.</p>
                        </div>
                    </div>
                </motion.div>
            </div>
            
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default BecomeHost;
