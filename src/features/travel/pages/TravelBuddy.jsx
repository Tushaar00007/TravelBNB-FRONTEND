import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import API from "../../../services/api";
import {
    Calendar, Tag, Search, Plus, Loader2,
    MessageSquare, ShieldCheck, Compass, Navigation,
    Users, Filter, User, MapPin, Globe, ChevronDown, 
    X, Sparkles
} from "lucide-react";

// New Modular Components
import TravelBuddyHero from "../components/TravelBuddyHero";

const interestColors = [
    "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-100 dark:border-orange-900/50",
    "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-100 dark:border-amber-900/50",
    "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-100 dark:border-yellow-900/50",
];

const getColor = (str) =>
    interestColors[str?.charCodeAt(0) % interestColors.length || 0];

// ─── BuddyCard ────────────────────────────────────────────────────────────────

function BuddyCard({ buddy, currentUserId, onConnect }) {
    const navigate = useNavigate();
    const isOwn = buddy.user_id === currentUserId;
    const firstImage = buddy.images?.[0];
    const initials = buddy.destination?.substring(0, 2).toUpperCase() || "TB";

    const handleCardClick = (e) => {
        // Don't navigate if clicking the connect button
        if (e.target.closest('button')) return;
        const tripId = buddy._id || buddy.id;
        navigate(`/travel-buddy/${tripId}`, { state: { trip: buddy } });
    };

    return (
        <div 
            onClick={handleCardClick}
            className="group bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:border-orange-500 transition-all duration-500 flex flex-col overflow-hidden cursor-pointer"
        >
            {/* Cover Image/Placeholder */}
            <div className="h-40 w-full relative overflow-hidden">
                {firstImage ? (
                    <img 
                        src={firstImage} 
                        alt={buddy.destination} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                        <span className="text-4xl font-black text-white/40 tracking-tighter">{initials}</span>
                    </div>
                )}
                
                {/* Meta Badges Overlay */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 scale-90 origin-top-right">
                    {buddy.user_verified && (
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-white uppercase tracking-widest bg-green-500/80 backdrop-blur-md px-3 py-1 rounded-full shadow-lg border border-white/20">
                            <ShieldCheck size={10} strokeWidth={4} /> Verified
                        </div>
                    )}
                    {buddy.travel_style && (
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-white uppercase tracking-widest bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                            <Sparkles size={10} /> {buddy.travel_style}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 pt-0 -mt-6 relative z-10 flex flex-col flex-1 gap-4">
                {/* Poster Info */}
                <div className="flex items-end gap-3 px-1">
                    <img 
                        src={buddy.avatar || `https://ui-avatars.com/api/?name=${buddy.name || 'User'}&background=random`} 
                        className="w-14 h-14 rounded-2xl border-4 border-white dark:border-gray-900 object-cover shadow-lg"
                        alt={buddy.name}
                    />
                    <div className="pb-1">
                        <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight line-clamp-1">
                            {buddy.name || "Adventurer"}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">POSTED BY</p>
                    </div>
                </div>

                {/* Trip Details */}
                <div className="space-y-3 mt-1">
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-500 font-black text-xl uppercase tracking-tighter">
                        <Navigation size={20} className="text-orange-500" strokeWidth={3} />
                        {buddy.destination}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        <Calendar size={14} strokeWidth={3} />
                        {buddy.start_date} → {buddy.end_date}
                    </div>
                </div>

                {/* Tags Row */}
                <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 text-[10px] font-black text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                        <Users size={12} strokeWidth={3} className="text-orange-500" /> 
                        Looking for {buddy.group_size || "1"}
                    </span>
                    {buddy.gender_preference && buddy.gender_preference !== "any" && (
                        <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 text-[10px] font-black text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                            {buddy.gender_preference}
                        </span>
                    )}
                    {buddy.budget && (
                        <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 text-[10px] font-black text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                            ₹{(buddy.budget).toLocaleString()}
                        </span>
                    )}
                </div>

                {/* Interests */}
                {buddy.interests?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {buddy.interests.slice(0, 3).map((interest) => (
                            <span key={interest} className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest ${getColor(interest)}`}>
                                {interest}
                            </span>
                        ))}
                    </div>
                )}

                {/* CTA */}
                {!isOwn && currentUserId ? (
                    <button
                        onClick={() => onConnect(buddy.id)}
                        className="w-full flex items-center justify-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl hover:bg-black dark:hover:bg-gray-100 mt-auto active:scale-95"
                    >
                        <MessageSquare size={16} strokeWidth={3} /> Connect & Chat
                    </button>
                ) : isOwn ? (
                    <div className="w-full text-center py-4 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/30 mt-auto">
                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em]">Your Active Request</p>
                    </div>
                ) : (
                    <button
                        onClick={() => onConnect(buddy.id)}
                        className="w-full flex items-center justify-center gap-3 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 py-4 rounded-2xl text-xs font-black uppercase tracking-widest mt-auto cursor-not-allowed"
                    >
                        Login to Connect
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TravelBuddy() {
    const navigate = useNavigate();
    const userId = Cookies.get("userId");
    const [buddies, setBuddies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        destination: "",
        travel_style: "",
        gender_preference: ""
    });

    const loadFiltered = async (params = filters) => {
        setLoading(true);
        try {
            // Clean empty strings from params
            const cleanParams = {};
            Object.keys(params).forEach(k => {
                if (params[k]) cleanParams[k] = params[k];
            });

            const res = await API.get("/travel-buddies/", { params: cleanParams });
            setBuddies(Array.isArray(res.data) ? res.data : res.data.data || []);
        } catch (err) {
            console.error("Failed to load buddies:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFiltered({});
    }, []);

    const handleConnect = async (buddyId) => {
        if (!userId) {
            navigate("/login");
            return;
        }

        const buddy = buddies.find(b => b.id === buddyId);
        if (!buddy) return;

        navigate("/messages", {
            state: {
                openConv: {
                    otherUserId: buddy.user_id,
                    otherUserName: buddy.name || "Travel Buddy",
                    otherUserPic: buddy.avatar || "",
                }
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-gray-950 transition-colors duration-300">
            {/* Cinematic Hero Section */}
            <TravelBuddyHero />

            <div className="max-w-7xl mx-auto px-6 py-20">
                
                {/* ADVANCED FILTER BAR */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[3rem] p-4 mb-20 shadow-2xl shadow-black/5 flex flex-col lg:flex-row items-center gap-4">
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative group">
                            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500 group-focus-within:scale-110 transition-transform" size={18} />
                            <input 
                                type="text"
                                placeholder="Destination..."
                                value={filters.destination}
                                onChange={e => setFilters(f => ({ ...f, destination: e.target.value }))}
                                className="w-full pl-14 pr-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-full border border-transparent focus:border-orange-500/30 focus:bg-white dark:focus:bg-gray-800 outline-none text-sm font-bold transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Compass className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                            <select 
                                value={filters.travel_style}
                                onChange={e => setFilters(f => ({ ...f, travel_style: e.target.value }))}
                                className="w-full pl-14 pr-10 py-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-full border border-transparent outline-none text-sm font-bold appearance-none cursor-pointer"
                            >
                                <option value="">Any Style</option>
                                <option value="backpacker">Backpacker</option>
                                <option value="budget">Budget</option>
                                <option value="comfort">Comfort</option>
                                <option value="luxury">Luxury</option>
                                <option value="adventure">Adventure</option>
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                            <select 
                                value={filters.gender_preference}
                                onChange={e => setFilters(f => ({ ...f, gender_preference: e.target.value }))}
                                className="w-full pl-14 pr-10 py-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-full border border-transparent outline-none text-sm font-bold appearance-none cursor-pointer"
                            >
                                <option value="">Any Gender</option>
                                <option value="any">No Preference</option>
                                <option value="male only">Male Only</option>
                                <option value="female only">Female Only</option>
                                <option value="mixed">Mixed Group</option>
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                    <button 
                        onClick={() => loadFiltered()}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-4 rounded-full font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all w-full lg:w-auto"
                    >
                        Filter Tribe
                    </button>
                    {(filters.destination || filters.travel_style || filters.gender_preference) && (
                        <button 
                            onClick={() => {
                                const reset = { destination: "", travel_style: "", gender_preference: "" };
                                setFilters(reset);
                                loadFiltered(reset);
                            }}
                            className="p-4 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center mb-16 px-2 gap-8">
                    <h2 className="text-[48px] font-black tracking-tighter text-gray-900 dark:text-white uppercase leading-none">
                        AVAILABLE <span className="text-orange-500 italic">SQUADS</span>
                    </h2>
                    <div className="flex gap-4">
                        {userId && (
                            <button onClick={() => navigate("/create-travel-buddy")}
                                className="flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-10 py-5 rounded-full font-black tracking-widest uppercase text-sm transition-all shadow-xl hover:bg-black dark:hover:bg-gray-100 active:scale-95"
                            >
                                <Plus size={20} strokeWidth={3} /> Post My Trip
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-[4/5] rounded-[2.5rem] bg-gray-100 dark:bg-gray-800 animate-pulse" />
                        ))}
                    </div>
                ) : buddies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40 text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[4rem]">
                        <Compass className="w-24 h-24 mb-6 opacity-20" />
                        <p className="text-3xl font-black uppercase tracking-tighter text-gray-300">No matching buddies</p>
                        <p className="text-sm font-bold mt-4 uppercase tracking-widest opacity-60">Try clearing filters or changing destination.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                        {buddies.map((b) => (
                            <BuddyCard
                                key={b.id}
                                buddy={b}
                                currentUserId={userId}
                                onConnect={handleConnect}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
