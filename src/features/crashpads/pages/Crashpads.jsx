import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import API from "../../../services/api";
import { Loader2, Home, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// New Modular Components
import CrashpadHero from "../components/CrashpadHero";
import FiltersBar from "../components/FiltersBar";
import CrashpadCard from "../components/CrashpadCard";
import CommunitySection from "../components/CommunitySection";
import ExperienceBenefits from "../components/ExperienceBenefits";
import HowItWorks from "../components/HowItWorks";
import RequestModal from "../components/RequestModal";

export default function Crashpads() {
    const navigate = useNavigate();
    const userId = Cookies.get("userId");
    const [pads, setPads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cityFilter, setCityFilter] = useState("");
    const [requestPad, setRequestPad] = useState(null);
    const [toast, setToast] = useState("");

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const load = async (filters = {}) => {
        setLoading(true);
        try {
            const res = await API.get("/crashpads/", { params: filters });
            setPads(res.data);
            if (filters.city) setCityFilter(filters.city);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 pb-20">
            {/* Notification Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black uppercase tracking-widest px-10 py-5 rounded-3xl shadow-2xl border border-gray-800 dark:border-gray-100"
                    >
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Application Modal */}
            {requestPad && (
                <RequestModal
                    pad={requestPad}
                    onClose={() => setRequestPad(null)}
                    onSend={() => showToast("Stay request sent!")}
                />
            )}

            {/* 1. Cinematic Hero */}
            <CrashpadHero />

            {/* 2. Sticky Glass FiltersBar */}
            <FiltersBar 
                currentCity={cityFilter}
                onFilterChange={(filters) => load(filters)} 
            />

            <div className="max-w-7xl mx-auto px-6 py-20">
                {/* 3. Listings Section Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
                    <div className="flex items-center gap-6">
                        <h2 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                            ALL <span className="text-orange-500 italic">STAYS</span>
                        </h2>
                        {cityFilter && (
                            <button 
                                onClick={() => { setCityFilter(""); load(); }}
                                className="px-6 py-2 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100 dark:border-orange-500/20 hover:bg-orange-100 transition-colors"
                            >
                                Clear: "{cityFilter}"
                            </button>
                        )}
                    </div>
                    {userId && (
                        <button 
                            onClick={() => navigate("/create-crashpad")}
                            className="flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-10 py-5 rounded-full font-black tracking-widest uppercase text-sm transition-all shadow-xl hover:bg-black dark:hover:bg-gray-100 active:scale-95"
                        >
                            <Plus size={20} strokeWidth={3} /> List a Crashpad
                        </button>
                    )}
                </div>

                {/* 4. Grid of Listing Cards */}
                {loading ? (
                    <div className="flex justify-center items-center h-96">
                        <Loader2 className="w-16 h-16 text-orange-500 animate-spin" strokeWidth={3} />
                    </div>
                ) : pads.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-40 text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[4rem]"
                    >
                        <Home className="w-24 h-24 mb-6 opacity-20" />
                        <p className="text-3xl font-black uppercase tracking-tighter text-gray-300">No crashpads found</p>
                        <p className="text-sm font-bold mt-4 uppercase tracking-widest opacity-60">
                            {cityFilter ? `No results for "${cityFilter}". ` : ""}
                            Be the first to build a community!
                        </p>
                        {userId && (
                            <button onClick={() => navigate("/create-crashpad")}
                                className="mt-12 px-12 py-5 bg-orange-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:bg-orange-700 transition-all">
                                Post Now
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                        {pads.map((pad) => (
                            <CrashpadCard
                                key={pad.id}
                                pad={pad}
                                userId={userId}
                                onRequest={(p) => userId ? setRequestPad(p) : navigate("/login")}
                                onDetail={() => navigate(`/crashpads/${pad.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* 5. Experience Benefits */}
            <ExperienceBenefits />

            {/* 6. Community & Testimonials */}
            <CommunitySection />

            {/* 7. How it Works */}
            <HowItWorks />

            {/* Featured Section (Spotlight) */}
            <section className="max-w-7xl mx-auto px-6 py-32">
                 <div className="relative h-[500px] w-full rounded-[4rem] overflow-hidden group">
                    <img 
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                        alt="Community Hub" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-center px-16">
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 uppercase">
                            Build Your <br />
                            <span className="text-orange-500 italic uppercase">Own Empire.</span>
                        </h2>
                        <p className="text-gray-200 font-bold max-w-xl mb-10 text-lg uppercase tracking-tight">
                            Have an extra room or a shared space? Turn it into a nomad hub and start building your own community empire today.
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => navigate("/create-crashpad")} className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all">
                                Host a Hub
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
