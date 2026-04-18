import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import API from "../../../services/api";
import {
    MapPin, Calendar, Users, ChevronRight, Plane, Clock, Loader2,
    Compass, ArrowRight, ShieldCheck, Map as MapIcon, Sparkles
} from "lucide-react";

function TripCard({ trip, onClick }) {
    const start = trip.start_date ? new Date(trip.start_date) : null;
    const end = trip.end_date ? new Date(trip.end_date) : null;
    const nights = start && end ? Math.round((end - start) / 86400000) : "?";

    return (
        <div
            onClick={onClick}
            className="group cursor-pointer bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:border-orange-500 transition-all duration-300 overflow-hidden"
        >
            {/* Property image */}
            <div className="h-56 bg-gradient-to-br from-orange-400 to-amber-600 relative overflow-hidden">
                {trip.property?.image ? (
                    <img src={trip.property.image} alt={trip.property?.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Plane className="w-20 h-20 text-white/20" strokeWidth={1} />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4">
                    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-gray-900 dark:text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-sm uppercase tracking-widest border border-white/20">
                        {nights} NIGHTS
                    </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                    <p className="font-black text-2xl leading-tight uppercase tracking-tighter drop-shadow-lg">{trip.property?.title || "Property"}</p>
                    <div className="flex items-center gap-2 mt-2 opacity-90 font-bold text-xs uppercase tracking-widest">
                        <MapPin size={14} className="text-orange-400" strokeWidth={3} />
                        {typeof trip.property?.location === "object" ? `${trip.property.location.city}, ${trip.property.location.state}` : (trip.property?.location || "Location TBD")}
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        <Calendar className="w-4 h-4 text-orange-500" strokeWidth={3} />
                        <span>
                            {start ? start.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "?"} –{" "}
                            {end ? end.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "?"}
                        </span>
                    </div>
                    <div className="flex -space-x-3">
                        {(trip.member_details || []).slice(0, 3).map((m, i) => (
                            <div key={i} className="w-9 h-9 rounded-full bg-orange-100 border-4 border-white dark:border-gray-900 overflow-hidden flex items-center justify-center text-xs font-black text-orange-600 shadow-sm">
                                {m.profile_image ? <img src={m.profile_image} className="w-full h-full object-cover" alt={m.name} /> : m.name?.[0]}
                            </div>
                        ))}
                        {(trip.members?.length || 1) > 3 && (
                            <div className="w-9 h-9 rounded-full bg-gray-100 border-4 border-white dark:border-gray-900 flex items-center justify-center text-[10px] font-black text-gray-500 shadow-sm">
                                +{(trip.members?.length || 1) - 3}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">View Details</span>
                    <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                        <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" strokeWidth={3} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Trips() {
    const navigate = useNavigate();
    const userId = Cookies.get("userId");
    const [trips, setTrips] = useState({ upcoming_trips: [], past_trips: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("upcoming");

    useEffect(() => {
        if (!userId) { navigate("/login"); return; }
        // Use the new /my endpoint
        API.get("/trips/my")
            .then((r) => {
                console.log("!!! DEBUG: Trips API Response:", r.data);
                setTrips(r.data);
            })
            .catch(err => {
                console.error("!!! ERROR: Failed to fetch trips:", err);
            })
            .finally(() => setLoading(false));
    }, [userId]);

    if (!userId) return null;

    const displayTrips = activeTab === "upcoming" ? trips.upcoming_trips : trips.past_trips;

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 py-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 pt-12">
                    <div>
                        <h1 className="text-[6rem] font-black text-gray-900 dark:text-white tracking-tighter leading-none flex items-center gap-6">
                            MY <span className="text-orange-500">TRIPS</span>
                        </h1>
                        <p className="text-xl font-bold text-gray-400 dark:text-gray-500 mt-6 uppercase tracking-widest flex items-center gap-3">
                            <Sparkles size={24} className="text-orange-500" /> Your shared travel workspace
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-gray-50 dark:bg-gray-900 p-1.5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <button
                            onClick={() => setActiveTab("upcoming")}
                            className={`px-10 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === "upcoming" ? "bg-white dark:bg-gray-800 text-orange-600 shadow-md" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"}`}
                        >
                            Upcoming
                        </button>
                        <button
                            onClick={() => setActiveTab("past")}
                            className={`px-10 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === "past" ? "bg-white dark:bg-gray-800 text-orange-600 shadow-md" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"}`}
                        >
                            Past
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-96">
                        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" strokeWidth={3} />
                    </div>
                ) : (
                    <div className="min-h-[400px]">
                        {displayTrips?.length ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {displayTrips.map((t) => (
                                    <TripCard key={t._id} trip={t} onClick={() => navigate(`/trips/${t._id}`)} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-40 text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[4rem]">
                                {activeTab === "upcoming" ? (
                                    <>
                                        <Plane className="w-24 h-24 mb-8 opacity-10" strokeWidth={1} />
                                        <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-300">No upcoming adventures</h2>
                                        <p className="text-sm font-bold mt-3 uppercase tracking-widest opacity-60">Ready to explore the world?</p>
                                        <button onClick={() => navigate("/")} className="mt-12 group flex items-center gap-4 bg-orange-500 text-white px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95">
                                            Start Exploring <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Clock className="w-24 h-24 mb-8 opacity-10" strokeWidth={1} />
                                        <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-300">No past trips yet</h2>
                                        <p className="text-sm font-bold mt-3 uppercase tracking-widest opacity-60">Your travel history will appear here.</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
