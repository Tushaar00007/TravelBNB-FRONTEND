import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, IndianRupee, Star, Wifi, UtensilsCrossed, Monitor } from 'lucide-react';

const AMENITY_ICONS = {
    'Co-working': <Monitor size={14} />,
    'Fast WiFi': <Wifi size={14} />,
    'Community Dinners': <UtensilsCrossed size={14} />,
};

function CrashpadCard({ pad, userId, onRequest, onDetail }) {
    const isHost = pad.host_id === userId;
    
    // Fallback image if pad.images is empty
    const image = pad.images?.[0] || "https://images.unsplash.com/photo-1555854817-5b27381b4f8d?q=80&w=2070&auto=format&fit=crop";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            className="group relative bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:border-orange-500/50 transition-all duration-500 flex flex-col h-full"
        >
            <div className="relative h-64 overflow-hidden" onClick={onDetail}>
                <motion.img 
                    src={image} 
                    alt={pad.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="bg-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider backdrop-blur-md">
                        {pad.stay_type}
                    </div>
                </div>

                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-[10px] font-black p-2 rounded-xl border border-white/20 flex items-center gap-1.5 shadow-xl">
                    <Star size={12} className="fill-orange-400 text-orange-400" />
                    <span>4.9</span>
                </div>

                <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-xl font-black tracking-tight mb-1 group-hover:text-orange-400 transition-colors">{pad.title}</h3>
                    <p className="text-xs font-bold text-gray-300 flex items-center gap-1.5 uppercase tracking-widest">
                        <MapPin size={12} className="text-orange-500" /> {pad.city}
                    </p>
                </div>
            </div>

            <div className="p-6 flex flex-col flex-1 gap-6">
                {/* Tags Section */}
                <div className="flex flex-wrap gap-2">
                    {['Co-working', 'Fast WiFi', 'Community Dinners'].map((tag) => (
                        <span key={tag} className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider border border-gray-100 dark:border-gray-700 group-hover:border-orange-500/30 group-hover:bg-orange-500/5 transition-all">
                            {AMENITY_ICONS[tag]}
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Footer Section */}
                <div className="mt-auto flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-6">
                    <div className="flex flex-col">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">From</p>
                        <div className="flex items-center gap-0.5 text-gray-900 dark:text-white font-black text-xl">
                            <IndianRupee size={16} strokeWidth={3} className="text-orange-500" />
                            <span>{pad.price_per_night || "500"}</span>
                            <span className="text-xs font-bold text-gray-400 ml-1">/night</span>
                        </div>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                        {isHost ? (
                             <div className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 dark:bg-orange-950/20 px-6 py-3 rounded-xl border border-orange-100 dark:border-orange-900/30">
                                Yours
                            </div>
                        ) : (
                            <button
                                onClick={() => onRequest(pad)}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-orange-500/30 active:scale-95 whitespace-nowrap"
                            >
                                Join Tribe
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Hover Glow Effect Border */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-orange-500/20 rounded-[2rem] pointer-events-none transition-all duration-500" />
        </motion.div>
    );
}

export default CrashpadCard;
