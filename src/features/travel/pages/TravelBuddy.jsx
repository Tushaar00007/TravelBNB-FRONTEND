import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import API from "../../../services/api";
import CustomDropdown from "../../../components/ui/CustomDropdown";
import {
    MapPin, Calendar, Tag, Users, Search, Plus, X, Loader2,
    MessageSquare, Link2, UserCheck, Compass, ShieldCheck,
    Globe, Heart, Sparkles, Navigation, Map as MapIcon, Briefcase
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const INTEREST_OPTIONS = [
    { value: "Trekking", label: "Trekking", icon: <MapIcon size={14} /> },
    { value: "Photography", label: "Photography", icon: <Search size={14} /> },
    { value: "Food", label: "Food & Drinks", icon: <Sparkles size={14} /> },
    { value: "Culture", label: "Culture & History", icon: <Globe size={14} /> },
    { value: "Music", label: "Music & Festivals", icon: <Heart size={14} /> },
    { value: "Adventure", label: "Adventure Sports", icon: <Navigation size={14} /> },
    { value: "Camping", label: "Camping", icon: <Compass size={14} /> },
    { value: "Cycling", label: "Cycling", icon: <Navigation size={14} /> },
    { value: "Wildlife", label: "Wildlife Safari", icon: <Search size={14} /> },
    { value: "Backpacking", label: "Backpacking", icon: <Briefcase size={14} /> },
];

const DESTINATION_OPTIONS = [
    { value: "Manali", label: "Manali, HP", icon: <MapPin size={14} /> },
    { value: "Goa", label: "Goa, India", icon: <MapPin size={14} /> },
    { value: "Leh", label: "Leh Ladakh", icon: <MapPin size={14} /> },
    { value: "Rishikesh", label: "Rishikesh, UK", icon: <MapPin size={14} /> },
    { value: "Pondicherry", label: "Pondicherry", icon: <MapPin size={14} /> },
    { value: "Munnar", label: "Munnar, Kerala", icon: <MapPin size={14} /> },
    { value: "Udaipur", label: "Udaipur, Rajasthan", icon: <MapPin size={14} /> },
];

const interestColors = [
    "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-100 dark:border-orange-900/50",
    "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-100 dark:border-amber-900/50",
    "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-100 dark:border-yellow-900/50",
];

const getColor = (str) =>
    interestColors[str.charCodeAt(0) % interestColors.length];

// ─── BuddyCard ────────────────────────────────────────────────────────────────

function BuddyCard({ buddy, currentUserId, onConnect }) {
    const isOwn = buddy.user_id === currentUserId;

    return (
        <div className="group bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:border-orange-500 transition-all duration-300 p-6 flex flex-col gap-5">
            {/* Header: destination + dates */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 text-orange-600 font-black text-xl uppercase tracking-tighter">
                        <Navigation size={20} className="text-orange-500" strokeWidth={3} />
                        {buddy.destination}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 dark:text-gray-500 mt-2 uppercase tracking-widest">
                        <Calendar size={14} strokeWidth={3} />
                        {buddy.start_date} → {buddy.end_date}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {buddy.user_verified && (
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full border border-green-100 dark:border-green-800/50">
                            <ShieldCheck size={12} strokeWidth={3} /> Verified
                        </div>
                    )}
                    {isOwn && (
                        <span className="text-[10px] font-black bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full uppercase tracking-widest border border-orange-100 dark:border-orange-900/30">
                            Your Trip
                        </span>
                    )}
                </div>
            </div>

            {/* Description */}
            {buddy.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed font-medium">
                    {buddy.description}
                </p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap gap-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                {buddy.budget && (
                    <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                        <Tag size={13} strokeWidth={3} className="text-orange-500" /> Budget ₹{buddy.budget.toLocaleString("en-IN")}
                    </span>
                )}
            </div>

            {/* Interests */}
            {buddy.interests?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {buddy.interests.map((interest) => (
                        <span key={interest} className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest transition-all ${getColor(interest)}`}>
                            {interest}
                        </span>
                    ))}
                </div>
            )}

            {/* CTA */}
            {!isOwn && currentUserId && (
                <button
                    onClick={() => onConnect(buddy.id)}
                    className="w-full flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-orange-500/10 hover:shadow-orange-500/30 mt-auto active:scale-95"
                >
                    <MessageSquare size={16} strokeWidth={3} /> Connect & Chat
                </button>
            )}
        </div>
    );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────

function SearchPanel({ onSearch }) {
    const [dest, setDest] = useState("");
    const [interests, setInterests] = useState("");

    const submit = (e) => {
        e.preventDefault();
        onSearch({ dest, interests });
    };

    return (
        <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-3 border border-gray-100 dark:border-gray-700 shadow-2xl w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center relative z-30 transition-all hover:shadow-orange-500/5 mb-10">
            {/* Destination */}
            <div className="flex-1 w-full px-6 py-2">
                <label className="block text-[10px] font-black uppercase text-orange-500 mb-2 tracking-[0.2em] ml-1">Destination</label>
                <CustomDropdown
                    options={DESTINATION_OPTIONS}
                    selected={dest}
                    onChange={setDest}
                    placeholder="Where are you headed?"
                    className="border-none"
                />
            </div>

            <div className="hidden md:block w-[1px] h-12 bg-gray-100 dark:bg-gray-700 mx-2"></div>

            {/* Interests */}
            <div className="flex-1 w-full px-6 py-2">
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[0.2em] ml-1">Interests</label>
                <CustomDropdown
                    options={INTEREST_OPTIONS}
                    selected={interests}
                    onChange={setInterests}
                    placeholder="Hiking, Food, Music..."
                    className="border-none"
                />
            </div>

            {/* Button */}
            <div className="p-1 w-full md:w-auto">
                <button
                    type="submit"
                    className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white font-black tracking-[0.1em] text-sm px-10 py-5 rounded-[2rem] transition-all flex items-center justify-center gap-3 shadow-xl shadow-orange-600/20 active:scale-95 uppercase"
                >
                    <Search className="h-5 w-5" strokeWidth={3} /> Find Buddies
                </button>
            </div>
        </form>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TravelBuddy() {
    const navigate = useNavigate();
    const userId = Cookies.get("userId");
    const [buddies, setBuddies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSearch, setIsSearch] = useState(false);
    const [error, setError] = useState(null);


    const loadAll = async () => {
        setLoading(true);
        setError(null);
        setIsSearch(false);
        try {
            const res = await API.get("/travel-buddies/");
            setBuddies(Array.isArray(res.data) ? res.data : res.data.data || []);
        } catch (err) {
            console.error("Failed to load buddies:", err);
            setError("Failed to load travel buddies.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    const handleSearch = async ({ dest, interests }) => {
        setLoading(true);
        setError(null);
        setIsSearch(true);
        try {
            const res = await API.get("/travel-buddies/", {
                params: { destination: dest, interests: interests }
            });
            setBuddies(Array.isArray(res.data) ? res.data : res.data.data || []);
        } catch (err) {
            setError("Search failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

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
                    otherUserPic: buddy.profile_image || "",
                }
            }
        });
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
            {/* Toast, Modals, etc. */}
            {/* Hero section */}
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="relative w-full overflow-hidden rounded-[4rem] mb-20 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-orange-900/10 dark:via-gray-900 dark:to-orange-950/10 border border-orange-100/50 dark:border-orange-500/10 px-6 pt-32 pb-24 flex flex-col items-center text-center">
                    {/* Badge */}
                    <div className="inline-block bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-[10px] font-black px-6 py-2 rounded-full tracking-[0.2em] uppercase mb-10 shadow-sm border border-orange-200/50">
                        COMMUNITY FIRST • TRAVEL TOGETHER
                    </div>

                    {/* Headline */}
                    <h1 className="text-[6rem] md:text-[8rem] font-black tracking-tighter text-gray-900 dark:text-white mb-6 leading-[0.8]">
                        FIND YOUR
                        <br />
                        <span className="text-orange-500 tracking-tight">SQUAD<span className="animate-pulse">.</span></span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-2xl font-bold text-gray-500 dark:text-gray-400 max-w-4xl mx-auto mt-10 mb-20 leading-relaxed tracking-tight px-6">
                        Connect with like-minded travelers, split costs, and create memories together. Better adventures start with better company.
                    </p>

                    {/* Search panel */}
                    <SearchPanel onSearch={handleSearch} />
                </div>

                {/* Sub-header / Smart Matches Section */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-12 px-2 gap-8">
                    <h2 className="text-[48px] font-black tracking-tighter text-gray-900 dark:text-white uppercase leading-none">
                        SMART <span className="text-orange-500">MATCHES</span>
                    </h2>
                    <div className="flex gap-4">
                        {isSearch && (
                            <button onClick={loadAll}
                                className="px-8 py-4 rounded-full border-2 border-gray-100 dark:border-gray-800 text-[10px] font-black tracking-widest uppercase text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                            >
                                SHOW ALL
                            </button>
                        )}
                        {userId && (
                            <button onClick={() => navigate("/create-travel-buddy")}
                                className="flex items-center gap-3 bg-[#0f172a] hover:bg-black text-white px-8 py-4 rounded-full font-black tracking-[0.1em] uppercase text-sm transition-all shadow-xl hover:translate-y-[-2px] active:scale-95"
                            >
                                <Plus size={20} strokeWidth={3} /> Post My Trip
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-96">
                        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" strokeWidth={3} />
                    </div>
                ) : buddies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40 text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem]">
                        <Compass className="w-20 h-20 mb-6 opacity-20" />
                        <p className="text-2xl font-black uppercase tracking-tighter text-gray-300">No matching buddies</p>
                        <p className="text-sm font-bold mt-2 uppercase tracking-widest opacity-60">Try different dates or destination.</p>
                        {userId && !isSearch && (
                            <button onClick={() => navigate("/create-travel-buddy")}
                                className="mt-10 px-10 py-4 bg-[#0f172a] text-white rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all">
                                Start Your Squad
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
