import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import API from "../../../services/api";
import {
    MapPin, Users, IndianRupee, Wifi, UtensilsCrossed, ParkingSquare,
    Plus, X, Loader2, Search, Home, ChevronRight, Tent
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const amenityIcon = (amenity) => {
    const lower = amenity.toLowerCase();
    if (lower.includes("wifi")) return <Wifi size={13} />;
    if (lower.includes("kitchen")) return <UtensilsCrossed size={13} />;
    if (lower.includes("parking")) return <ParkingSquare size={13} />;
    return null;
};

const gradients = [
    "from-orange-400 to-amber-500",
    "from-orange-500 to-orange-600",
    "from-amber-400 to-orange-500",
    "from-orange-600 to-red-500",
    "from-yellow-400 to-orange-500",
];

// ─── CrashpadCard ─────────────────────────────────────────────────────────────

function CrashpadCard({ pad, userId, onRequest, onDetail }) {
    const isHost = pad.host_id === userId;
    const grad = gradients[parseInt(pad.id?.slice(-1) || "0", 16) % gradients.length];

    return (
        <div
            onClick={onDetail}
            className="group cursor-pointer bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:border-orange-500 transition-all duration-300 overflow-hidden flex flex-col"
        >
            {/* Banner */}
            <div className={`h-48 bg-gradient-to-br ${grad} relative flex items-center justify-center`}>
                <Tent size={56} className="text-white/30" strokeWidth={1} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {pad.is_free && (
                        <div className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-wider">
                            Free Stay
                        </div>
                    )}
                    <div className="bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider">
                        {pad.stay_type}
                    </div>
                </div>

                <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-extrabold text-xl leading-tight drop-shadow-md">{pad.title}</p>
                    <p className="text-xs opacity-90 flex items-center gap-1.5 mt-1 font-medium">
                        <MapPin size={12} strokeWidth={2.5} /> {pad.city}
                    </p>
                </div>
            </div>

            {/* Body */}
            <div className="p-5 flex-1 flex flex-col gap-4">
                {/* Host info */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                            <Users size={14} className="text-orange-500" />
                        </div>
                        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Host Verified</span>
                    </div>
                    {pad.price_per_night > 0 && !pad.is_free && (
                        <div className="flex items-center gap-0.5 text-gray-900 dark:text-white font-black text-lg">
                            <IndianRupee size={14} strokeWidth={3} />
                            <span>{pad.price_per_night}</span>
                        </div>
                    )}
                </div>

                {/* Interests */}
                {pad.interests?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {pad.interests.slice(0, 3).map((a) => (
                            <span key={a} className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-gray-100 dark:border-gray-800 transition-colors group-hover:bg-orange-50 group-hover:text-orange-600 transition-all duration-300">
                                {a}
                            </span>
                        ))}
                    </div>
                )}

                {/* Action buttons */}
                <div className="mt-auto pt-2" onClick={(e) => e.stopPropagation()}>
                    {isHost ? (
                        <span className="block text-center text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 dark:bg-orange-950/20 py-3 rounded-xl border border-orange-100 dark:border-orange-900/30">
                            Your Crashpad
                        </span>
                    ) : (
                        <button
                            onClick={() => onRequest(pad)}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-orange-500/30 active:scale-95"
                        >
                            Send Request
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}



function RequestModal({ pad, onClose, onSend }) {
    const [form, setForm] = useState({ dates: "", message: "" });
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const submit = async () => {
        if (!form.dates || !form.message) {
            setError("Dates and message are required.");
            return;
        }
        setSending(true);
        try {
            const token = Cookies.get("token");
            await API.post("/crashpads/requests", {
                crashpad_id: pad.id,
                ...form
            }, { headers: { Authorization: `Bearer ${token}` } });
            onSend();
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to send request.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="p-10">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">STAY <span className="text-orange-500">REQUEST</span></h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors"><X size={24} strokeWidth={3} className="text-gray-400" /></button>
                    </div>

                    <div className="space-y-6">
                        {error && <div className="text-red-500 text-xs font-bold bg-red-50 p-4 rounded-xl uppercase tracking-widest">{error}</div>}

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Duration</label>
                            <input value={form.dates} onChange={(e) => setForm({ ...form, dates: e.target.value })}
                                placeholder="e.g. Oct 12 - Oct 15"
                                className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl px-6 py-4 font-bold text-gray-900 dark:text-white outline-none border-2 border-transparent focus:border-orange-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Introduction</label>
                            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                                rows={4} placeholder="Tell the host about your trip vibe..."
                                className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl px-6 py-4 font-bold text-gray-900 dark:text-white outline-none border-2 border-transparent focus:border-orange-500 transition-all resize-none"
                            />
                        </div>

                        <button onClick={submit} disabled={sending}
                            className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                        >
                            {sending ? "Sending..." : "Submit Request"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Crashpads() {
    const navigate = useNavigate();
    const userId = Cookies.get("userId");
    const token = Cookies.get("token");
    const [pads, setPads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cityFilter, setCityFilter] = useState("");
    const [requestPad, setRequestPad] = useState(null);
    const [toast, setToast] = useState("");

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const load = async (city = "") => {
        setLoading(true);
        try {
            const params = city ? { city } : {};
            const res = await API.get("/crashpads/", { params });
            setPads(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const onSearch = (e) => {
        e.preventDefault();
        load(cityFilter);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
            {/* Toast */}
            {toast && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black uppercase tracking-widest px-10 py-5 rounded-3xl shadow-2xl transition-all border border-gray-800 dark:border-gray-100 animate-fade-in-up">
                    {toast}
                </div>
            )}



            {requestPad && (
                <RequestModal
                    pad={requestPad}
                    onClose={() => setRequestPad(null)}
                    onSend={() => showToast("Stay request sent!")}
                />
            )}

            <div className="max-w-7xl mx-auto px-6 py-12">

                {/* Hero section */}
                <div className="flex flex-col items-center text-center pt-28 pb-32 relative overflow-hidden rounded-[4rem] mb-16 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-orange-950/20 dark:via-gray-900 dark:to-amber-950/20 border border-orange-100/50 dark:border-orange-500/10">

                    {/* Badge */}
                    <div className="inline-block bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-[10px] font-black px-6 py-2 rounded-full tracking-[0.2em] uppercase mb-8 shadow-sm border border-orange-200/50">
                        COMMUNITY STAYS • 100% SHARED BLISS
                    </div>

                    {/* Headline */}
                    <h1 className="text-[6rem] md:text-[7.5rem] font-black tracking-tighter text-gray-900 dark:text-white mb-6 leading-[0.8]">
                        FIND YOUR
                        <br />
                        <span className="text-orange-500 tracking-tight">TRIBE<span className="animate-pulse">.</span></span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-2xl font-bold text-gray-500 dark:text-gray-400 max-w-3xl mx-auto mt-8 mb-16 leading-relaxed tracking-tight px-6">
                        Budget-friendly shared spaces designed for the next generation of nomads, creators, and world-shakers.
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={onSearch} className="w-full max-w-3xl px-6 relative z-10">
                        <div className="flex items-center bg-white dark:bg-gray-800 rounded-full border border-gray-100 dark:border-gray-700 shadow-2xl p-2 pl-10 focus-within:ring-4 focus-within:ring-orange-500/5 transition-all">

                            {/* Where's the vibe? */}
                            <div className="flex-1 flex items-center gap-4 py-4">
                                <Search size={24} className="text-orange-500" strokeWidth={3} />
                                <input
                                    value={cityFilter}
                                    onChange={(e) => setCityFilter(e.target.value)}
                                    placeholder="Where's the vibe?"
                                    className="w-full bg-transparent text-gray-900 dark:text-white font-black text-xl focus:outline-none placeholder-gray-300"
                                />
                            </div>

                            {/* Let's Go Button */}
                            <button type="submit"
                                className="bg-orange-600 hover:bg-orange-700 text-white font-black tracking-[0.1em] text-sm px-12 py-5 rounded-full transition-all whitespace-nowrap shadow-xl shadow-orange-600/20 active:scale-95"
                            >
                                LET'S GO
                            </button>
                        </div>
                    </form>
                </div>

                {/* Grid header area */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8 px-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">ALL <span className="text-orange-500">STAYS</span></h2>
                        {cityFilter && (
                            <button type="button" onClick={() => { setCityFilter(""); load(""); }}
                                className="px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100 hover:bg-orange-100 transition-colors"
                            >
                                Clear: "{cityFilter}"
                            </button>
                        )}
                    </div>
                    {userId && (
                        <button onClick={() => navigate("/create-crashpad")}
                            className="flex items-center gap-3 bg-[#0f172a] hover:bg-black text-white px-8 py-4 rounded-full font-black tracking-[0.1em] uppercase text-sm transition-all shadow-xl hover:translate-y-[-2px] active:scale-95"
                        >
                            <Plus size={20} strokeWidth={3} /> List a Crashpad
                        </button>
                    )}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-96">
                        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" strokeWidth={3} />
                    </div>
                ) : pads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40 text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem]">
                        <Home className="w-20 h-20 mb-6 opacity-20" />
                        <p className="text-2xl font-black uppercase tracking-tighter text-gray-300">No crashpads found</p>
                        <p className="text-sm font-bold mt-2 uppercase tracking-widest opacity-60">
                            {cityFilter ? `No results for "${cityFilter}". ` : ""}
                            Be the first to list one!
                        </p>
                        {userId && (
                            <button onClick={() => navigate("/create-crashpad")}
                                className="mt-10 px-10 py-4 bg-[#0f172a] text-white rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all">
                                Post Now
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                        {pads.map((pad) => (
                            <CrashpadCard
                                key={pad.id}
                                pad={pad}
                                userId={userId}
                                onRequest={(p) => userId ? setRequestPad(p) : navigate("/login")}
                                onDetail={() => { }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
