import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import API from "../../../services/api";
import TripOverview from "../../../components/TripOverview";
import TripMembers from "../../../components/TripMembers";
import TripChat from "../../../components/TripChat";
import TripExpenses from "../../../components/TripExpenses";
import { ArrowLeft, Loader2, Plane, Home, Users, MessageSquare, CreditCard, LayoutDashboard } from "lucide-react";

const TABS = [
    { key: "overview", label: "Overview", Icon: LayoutDashboard },
    { key: "members", label: "Members", Icon: Users },
    { key: "chat", label: "Chat", Icon: MessageSquare },
    { key: "expenses", label: "Expenses", Icon: CreditCard },
];

export default function TripDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const userId = Cookies.get("userId");
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    const fetchTrip = () =>
        API.get(`/trips/${id}`)
            .then((r) => setTrip(r.data.trip))
            .catch(console.error)
            .finally(() => setLoading(false));

    useEffect(() => {
        if (!userId) { navigate("/login"); return; }
        fetchTrip();
    }, [id]);

    if (!userId) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {loading ? (
                <div className="flex justify-center items-center h-[70vh]">
                    <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                </div>
            ) : !trip ? (
                <div className="flex flex-col items-center justify-center h-[70vh] text-gray-400">
                    <p className="text-xl font-bold mb-2">Trip not found</p>
                    <button onClick={() => navigate("/trips")} className="mt-4 text-orange-500 hover:underline">← Back to trips</button>
                </div>
            ) : (
                <div className="max-w-5xl mx-auto px-4 py-8">

                    {/* Back + Title */}
                    <button onClick={() => navigate("/trips")} className="flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-6 transition-colors text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> All Trips
                    </button>

                    <div className="mb-6">
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                            <Plane className="text-orange-500" /> {trip.property?.title || "Trip"}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                            {trip.property?.location} · {trip.members?.length || 1} traveller{(trip.members?.length || 1) > 1 ? "s" : ""}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-1 mb-6">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.key
                                        ? "bg-orange-500 text-white shadow-sm"
                                        : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-100"
                                    }`}
                            >
                                <tab.Icon size={18} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div>
                        {activeTab === "overview" && <TripOverview trip={trip} />}
                        {activeTab === "members" && <TripMembers trip={trip} currentUserId={userId} onRefresh={fetchTrip} />}
                        {activeTab === "chat" && <TripChat tripId={id} currentUserId={userId} />}
                        {activeTab === "expenses" && <TripExpenses tripId={id} trip={trip} currentUserId={userId} />}
                    </div>
                </div>
            )}
        </div>
    );
}
