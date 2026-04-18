import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Sparkles, X, ChevronDown } from 'lucide-react';

const INTEREST_OPTIONS = [
    "Trekking", "Photography", "Food", "Culture", "Music", 
    "Adventure", "Camping", "Cycling", "Wildlife", "Backpacking"
];

function BuddySearchBar() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [destination, setDestination] = useState(searchParams.get("destination") || "");
    const [selectedInterests, setSelectedInterests] = useState(
        searchParams.get("interests")?.split(",").filter(Boolean) || []
    );
    const [isInterestOpen, setIsInterestOpen] = useState(false);

    const toggleInterest = (interest) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(selectedInterests.filter(i => i !== interest));
        } else {
            setSelectedInterests([...selectedInterests, interest]);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (destination) params.set("destination", destination);
        if (selectedInterests.length) params.set("interests", selectedInterests.join(","));
        
        navigate(`/travel-buddy/search?${params.toString()}`);
    };

    return (
        <form 
            onSubmit={handleSearch}
            className="w-full max-w-6xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl p-2.5 border border-white/30 dark:border-gray-800/30 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] hover:shadow-2xl rounded-full flex flex-col md:flex-row items-center gap-2 transition-all group"
        >
            {/* Destination Input */}
            <div className="flex-[1.2] w-full flex items-center gap-4 px-8 py-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-full border-2 border-transparent focus-within:border-orange-500/30 focus-within:bg-white dark:focus-within:bg-gray-800 transition-all">
                <MapPin size={22} className="text-orange-500" />
                <div className="flex-1 text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Where to?</p>
                    <input 
                        type="text"
                        placeholder="e.g. Manali, Goa..."
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="bg-transparent w-full text-sm font-bold text-gray-900 dark:text-white outline-none placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Interest Multi-Select */}
            <div className="flex-[1.5] w-full relative">
                <div 
                    onClick={() => setIsInterestOpen(!isInterestOpen)}
                    className="flex items-center gap-4 px-8 py-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-full border-2 border-transparent hover:bg-white dark:hover:bg-gray-800 transition-all cursor-pointer h-full"
                >
                    <Sparkles size={22} className="text-orange-500 shrink-0" />
                    <div className="flex-1 text-left overflow-hidden">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Common Interests</p>
                        <div className="flex flex-wrap gap-1 max-h-[20px] overflow-hidden">
                            {selectedInterests.length > 0 ? (
                                selectedInterests.map(interest => (
                                    <span key={interest} className="text-[10px] bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                                        {interest}
                                    </span>
                                ))
                            ) : (
                                <p className="text-sm font-bold text-gray-400">Hiking, Food, Music...</p>
                            )}
                        </div>
                    </div>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform ${isInterestOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {isInterestOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsInterestOpen(false)} />
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-0 right-0 mt-3 p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] shadow-2xl z-50"
                            >
                                <div className="grid grid-cols-2 gap-2">
                                    {INTEREST_OPTIONS.map(interest => (
                                        <button
                                            key={interest}
                                            type="button"
                                            onClick={() => toggleInterest(interest)}
                                            className={`px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                                selectedInterests.includes(interest)
                                                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                                    : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600"
                                            }`}
                                        >
                                            {interest}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* CTA Button */}
            <div className="p-1 w-full md:w-auto">
                <button 
                    type="submit"
                    className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:to-orange-700 text-white px-12 py-5 rounded-full text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-3"
                >
                    <Search size={22} strokeWidth={3} />
                    <span>Find Squad</span>
                </button>
            </div>
        </form>
    );
}

export default BuddySearchBar;
