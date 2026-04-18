import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../../services/api";
import { handleProtectedRoute } from "../../../utils/auth";
import toast from "react-hot-toast";
import { 
    Search, MapPin, Sparkles, Navigation, Calendar, 
    ShieldCheck, Tag, MessageSquare, Loader2, Compass, 
    ArrowLeft, Users, User, Globe, Activity
} from "lucide-react";
import BuddySearchBar from "../components/BuddySearchBar";

const interestColors = [
    "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-100 dark:border-orange-900/50",
    "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-100 dark:border-amber-900/50",
    "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-100 dark:border-yellow-900/50",
];

const getColor = (str) =>
    interestColors[str?.charCodeAt(0) % interestColors.length || 0];

function BuddyCard({ buddy, onConnect }) {
    const [connecting, setConnecting] = useState(false);
    const firstImage = buddy.images?.[0];
    const initials = buddy.destination?.substring(0, 2).toUpperCase() || "TB";

    const handleConnect = async () => {
        setConnecting(true);
        try {
            await onConnect(buddy.id);
            toast.success(`Connection request sent to ${buddy.name || 'Travel Buddy'}!`);
        } catch (err) {
            // Error handled by global interceptor if needed
        } finally {
            setConnecting(false);
        }
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:border-orange-500 transition-all duration-500 flex flex-col overflow-hidden"
        >
            {/* Cover Image */}
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
                
                {/* Meta Badges */}
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
            <div className="p-8 pt-0 -mt-8 relative z-10 flex flex-col flex-1 gap-5">
                {/* Poster Info */}
                <div className="flex items-end gap-3 px-1">
                    <img 
                        src={buddy.avatar || `https://ui-avatars.com/api/?name=${buddy.name || 'User'}&background=random`} 
                        className="w-16 h-16 rounded-2xl border-4 border-white dark:border-gray-900 object-cover shadow-lg"
                        alt={buddy.name}
                    />
                    <div className="pb-1">
                        <p className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight line-clamp-1">
                            {buddy.name || "Adventurer"}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SQUAD LEAD</p>
                    </div>
                </div>

                {/* Trip Details */}
                <div className="space-y-3 mt-1">
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-500 font-black text-2xl uppercase tracking-tighter">
                        <Navigation size={24} className="text-orange-500" strokeWidth={3} />
                        {buddy.destination}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        <Calendar size={14} strokeWidth={3} />
                        {buddy.start_date} → {buddy.end_date}
                    </div>
                </div>

                {/* Description Clip */}
                {buddy.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed font-medium px-1">
                        {buddy.description}
                    </p>
                )}

                {/* Meta Icons Row */}
                <div className="flex flex-wrap gap-2 px-1">
                    <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 text-[10px] font-black text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                        <Users size={12} strokeWidth={3} className="text-orange-500" /> 
                        {buddy.group_size || "1"} Travelers
                    </span>
                    {buddy.gender_preference && buddy.gender_preference !== "any" && (
                        <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 text-[10px] font-black text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                            <Activity size={12} strokeWidth={3} className="text-orange-500" />
                            {buddy.gender_preference}
                        </span>
                    )}
                </div>

                {/* Interests */}
                {buddy.interests?.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-1">
                        {buddy.interests.slice(0, 4).map((interest) => (
                            <span key={interest} className={`text-[9px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest transition-all ${getColor(interest)}`}>
                                {interest}
                            </span>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="w-full flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 text-white py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-500/10 hover:shadow-orange-500/30 active:scale-95 mt-auto"
                >
                    {connecting ? <Loader2 className="animate-spin" size={18} /> : <MessageSquare size={18} strokeWidth={3} />}
                    {connecting ? "Sending..." : "Request Connection"}
                </button>
            </div>
        </motion.div>
    );
}

export default function BuddySearch() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [buddies, setBuddies] = useState([]);
    const [loading, setLoading] = useState(true);

    const destination = searchParams.get("destination");
    const interests = searchParams.get("interests");

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                const res = await API.get("/travel-buddies/", {
                    params: { destination, interests }
                });
                setBuddies(Array.isArray(res.data) ? res.data : res.data.data || []);
            } catch (err) {
                console.error("Search fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [destination, interests]);

    const handleConnectRequest = async (buddyId) => {
        return new Promise((resolve, reject) => {
            handleProtectedRoute(navigate, location.pathname + location.search, async () => {
                try {
                    // Endpoint matches user requirement or best guess
                    await API.post("/api/travelbuddy/connect", { targetUserId: buddyId });
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-gray-950 pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                
                {/* Search Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <button 
                            onClick={() => navigate("/travel-buddy")}
                            className="flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors text-[10px] font-black uppercase tracking-widest mb-4"
                        >
                            <ArrowLeft size={14} /> Back to Tribe
                        </button>
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none mb-4">
                            SQUAD <span className="text-orange-500 italic">RESULTS</span>
                        </h1>
                        <p className="text-sm font-bold text-gray-500 pl-1 uppercase tracking-widest">
                            Found {buddies.length} travelers Matching your vibe
                        </p>
                    </div>
                    <div className="w-full md:max-w-2xl">
                        <BuddySearchBar />
                    </div>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="aspect-[4/5] rounded-[2.5rem] bg-gray-100 dark:bg-gray-800 animate-pulse" />
                        ))}
                    </div>
                ) : buddies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40 bg-white dark:bg-gray-900 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[4rem]">
                        <Compass className="w-24 h-24 mb-6 opacity-10 text-orange-500" />
                        <p className="text-3xl font-black uppercase tracking-tighter text-gray-300">No Squad Found</p>
                        <p className="text-sm font-bold mt-4 uppercase tracking-widest text-gray-400">Try adjusting your filters or destination.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <AnimatePresence mode="popLayout">
                            {buddies.map((buddy) => (
                                <BuddyCard 
                                    key={buddy.id} 
                                    buddy={buddy} 
                                    onConnect={handleConnectRequest}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
