import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import API from "../../../services/api";
import HomeCard from "../../listings/components/ListingCard";
import { toast } from "react-hot-toast";
import { PlusCircle, Loader2, LayoutDashboard, Home as HomeIcon, CalendarCheck, CalendarDays, Star, Trash2, AlertTriangle, MapPin, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import BookingDetailsModal from '../components/BookingDetailsModal';

const STATUS_BADGES = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
    approved: "bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    rejected: "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
};

const HostDashboard = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("listings"); // default to listings for now
    const [homes, setHomes] = useState([]);
    const [hostBookings, setHostBookings] = useState([]);
    const [hostReviews, setHostReviews] = useState([]);
    const [crashpadRequests, setCrashpadRequests] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [loadingCrashpads, setLoadingCrashpads] = useState(false);
    const navigate = useNavigate();
    const token = Cookies.get("token");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [viewingBookingId, setViewingBookingId] = useState(null);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await API.delete(`/homes/${deleteTarget._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHomes(prev => prev.filter(h => h._id !== deleteTarget._id));
            setDeleteTarget(null);
        } catch (err) {
            console.error("Failed to delete listing:", err);
            toast.error("Failed to delete listing: " + (err.response?.data?.detail || err.message));
        } finally {
            setDeleting(false);
        }
    };

    const tabs = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "listings", label: "Listings", icon: HomeIcon },
        { id: "bookings", label: "Bookings", icon: CalendarCheck },
        { id: "crashpads", label: "Crashpad Requests", icon: Users },
        { id: "calendar", label: "Calendar", icon: CalendarDays },
        { id: "reviews", label: "Reviews", icon: Star },
    ];

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchMyListings = async () => {
            try {
                const res = await API.get("/homes/host/me", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setHomes(res.data);
            } catch (err) {
                console.error("Failed to fetch host properties:", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchHostBookings = async () => {
            setLoadingBookings(true);
            try {
                const res = await API.get("/bookings/host/me", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setHostBookings(res.data);
            } catch (err) {
                console.error("Failed to fetch host bookings:", err);
            } finally {
                setLoadingBookings(false);
            }
        };

        const fetchAnalytics = async () => {
            setLoadingAnalytics(true);
            try {
                const res = await API.get("/bookings/host/analytics", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setAnalytics(res.data);
            } catch (err) {
                console.error("Failed to fetch analytics:", err);
            } finally {
                setLoadingAnalytics(false);
            }
        };

        const fetchHostReviews = async () => {
            setLoadingReviews(true);
            try {
                const res = await API.get("/reviews/host/me", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setHostReviews(res.data);
            } catch (err) {
                console.error("Failed to fetch host reviews:", err);
            } finally {
                setLoadingReviews(false);
            }
        };

        const fetchCrashpadRequests = async () => {
            setLoadingCrashpads(true);
            try {
                const res = await API.get("/crashpads/host-requests", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCrashpadRequests(res.data);
            } catch (err) {
                console.error("Failed to fetch crashpad reqs:", err);
            } finally {
                setLoadingCrashpads(false);
            }
        };

        if (activeTab === "listings") {
            fetchMyListings();
        } else if (activeTab === "bookings" || activeTab === "calendar") {
            // "calendar" also needs the bookings data to render the timeline
            if (hostBookings.length === 0) fetchHostBookings();
        } else if (activeTab === "overview") {
            if (!analytics) fetchAnalytics();
        } else if (activeTab === "reviews") {
            if (hostReviews.length === 0) fetchHostReviews();
        } else if (activeTab === "crashpads") {
            fetchCrashpadRequests();
        }
    }, [token, navigate, activeTab, hostBookings.length, analytics, hostReviews.length]);

    const handleCrashpadAction = async (requestId, action) => {
        try {
            await API.post(`/crashpads/requests/${requestId}/respond?action=${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Request ${action}!`);
            setCrashpadRequests(prev => prev.map(r => r._id === requestId ? { ...r, status: action } : r));
        } catch (err) {
            toast.error("Failed to update request.");
        }
    };

    return (
        <div className="bg-[#f8f9fa] dark:bg-gray-950 min-h-screen text-gray-900 dark:text-gray-100 transition-colors flex flex-col font-sans">

            <div className="flex flex-1 w-full relative">
                {/* SIDEBAR */}
                <div className="w-64 shrink-0 hidden lg:block z-10 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div className="sticky top-20 p-6">
                        <div className="mb-8">
                            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                                <LayoutDashboard className="text-orange-600" size={24} />
                                Host Dashboard
                            </h1>
                        </div>
                        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Navigation</h2>
                        <nav className="flex flex-col gap-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left relative overflow-hidden group ${isActive
                                            ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                                            }`}
                                    >
                                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-600 rounded-r-md"></div>}
                                        <Icon size={20} className={`${isActive ? "text-orange-600 dark:text-orange-400" : "group-hover:scale-110 transition-transform"}`} />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 bg-white dark:bg-gray-900 p-8 sm:p-12 min-h-[600px] z-10">

                    {activeTab === "overview" && (
                        <div>
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-5 mb-8">
                                <div>
                                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                            <LayoutDashboard size={24} />
                                        </div>
                                        Overview
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Your hosting performance at a glance.</p>
                                </div>
                            </div>

                            {loadingAnalytics || !analytics ? (
                                <div className="flex justify-center flex-col items-center py-32 text-orange-600">
                                    <Loader2 className="animate-spin mb-4" size={48} />
                                    Loading analytics...
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6">
                                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-3xl shadow-lg shadow-orange-500/20 transform hover:-translate-y-1 transition-all">
                                        <p className="text-sm text-orange-100 font-semibold mb-2 uppercase tracking-wide">Total Earnings</p>
                                        <h3 className="text-4xl font-extrabold tracking-tight">₹{analytics.total_revenue.toLocaleString()}</h3>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-2 uppercase tracking-wide">Total Bookings</p>
                                        <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white">{analytics.total_bookings}</h3>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-2 uppercase tracking-wide">Upcoming</p>
                                        <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white">{analytics.upcoming_bookings}</h3>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-2 uppercase tracking-wide">Guests Hosted</p>
                                        <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white">{analytics.total_guests}</h3>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "listings" && (
                        <div>
                            <div className="flex justify-between items-end border-b border-gray-100 dark:border-gray-800 pb-5 mb-8">
                                <div>
                                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                            <HomeIcon size={24} />
                                        </div>
                                        Listings
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Manage your active properties.</p>
                                </div>
                                <Link
                                    to="/become-host"
                                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full font-bold transition-all shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40 hover:-translate-y-0.5"
                                >
                                    <PlusCircle size={20} />
                                    New Listing
                                </Link>
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center py-32">
                                    <Loader2 className="animate-spin text-orange-600 mb-2" size={48} />
                                </div>
                            ) : homes.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center">
                                    <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                                        <img src="https://cdn-icons-png.flaticon.com/512/619/619034.png" alt="house outline" className="w-full h-full object-contain opacity-50 dark:invert" />
                                    </div>
                                    <h2 className="text-3xl font-extrabold mb-3 text-gray-900 dark:text-white">No Properties Found</h2>
                                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm text-lg">Looks like you haven't published any listings yet! Start your hosting journey today.</p>
                                    <Link
                                        to="/become-host"
                                        className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-full font-bold transition-all shadow-xl shadow-orange-600/20 hover:shadow-orange-600/40 hover:-translate-y-1"
                                    >
                                        <PlusCircle size={20} />
                                        Create First Listing
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {homes.map((home) => (
                                        <div key={home._id} className="relative group cursor-pointer block rounded-2xl">
                                            <div className="transform transition-transform group-hover:scale-[1.02] duration-300">
                                                <HomeCard home={home} />
                                            </div>
                                            {/* Edit overlay */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center gap-4 backdrop-blur-[2px] z-10">
                                                <Link
                                                    to={`/edit-property/${home._id}`}
                                                    className="bg-white text-gray-900 font-bold px-6 py-3 rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-105"
                                                >
                                                    Manage Listing
                                                </Link>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTarget(home); }}
                                                    className="bg-red-500 hover:bg-red-600 text-white font-bold p-3 rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-105"
                                                    title="Delete listing"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                            <div className="absolute top-4 right-4 z-20 pointer-events-none">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${STATUS_BADGES[home.status || "pending"]}`}>
                                                    {home.status || "pending"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "bookings" && (
                        <div>
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-5 mb-8">
                                <div>
                                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                                            <CalendarCheck size={24} />
                                        </div>
                                        Bookings
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Manage reservations for your properties.</p>
                                </div>
                            </div>

                            {loadingBookings ? (
                                <div className="flex justify-center flex-col items-center py-32 text-orange-600">
                                    <Loader2 className="animate-spin mb-4" size={48} />
                                    Loading your bookings...
                                </div>
                            ) : hostBookings.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center">
                                    <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center mb-6">
                                        <CalendarCheck size={40} />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">No Bookings Yet</h2>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">When guests book your properties, they'll appear here. Ensure your listings look great to attract more guests!</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-3xl border border-gray-100 dark:border-gray-800 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                                                <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs">Property</th>
                                                <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs">Dates</th>
                                                <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs">Guests</th>
                                                <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs">Earnings</th>
                                                <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900/50">
                                            {hostBookings.map((b) => (
                                                <tr key={b._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-colors group">
                                                    <td className="p-5 font-medium flex items-center gap-4">
                                                        {b.property_image && (
                                                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm border border-gray-100 dark:border-gray-800">
                                                                <img src={b.property_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Property" />
                                                            </div>
                                                        )}
                                                        <span className="truncate max-w-[200px] text-gray-900 dark:text-gray-200 font-semibold">{b.property_title}</span>
                                                    </td>
                                                    <td className="p-5 text-sm text-gray-600 dark:text-gray-400">
                                                        <div className="font-medium text-gray-800 dark:text-gray-300">In: {new Date(b.checkIn).toLocaleDateString()}</div>
                                                        <div>Out: {new Date(b.checkOut).toLocaleDateString()}</div>
                                                    </td>
                                                    <td className="p-5 text-gray-700 dark:text-gray-300 font-medium">{b.guests}</td>
                                                    <td className="p-5 font-bold text-gray-900 dark:text-white">₹{b.totalPrice}</td>
                                                    <td className="p-5">
                                                        <div className="flex items-center gap-3">
                                                            <span className="px-4 py-1.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                                {b.bookingStatus}
                                                            </span>
                                                            <button 
                                                                onClick={() => setViewingBookingId(b._id)}
                                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-orange-600 transition-colors"
                                                                title="View Details"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "calendar" && (
                        <div>
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-5 mb-8">
                                <div>
                                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                            <CalendarDays size={24} />
                                        </div>
                                        Calendar & Availability
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">View upcoming reservations across your properties.</p>
                                </div>
                            </div>

                            {loadingBookings ? (
                                <div className="flex justify-center flex-col items-center py-32 text-orange-600">
                                    <Loader2 className="animate-spin mb-4" size={48} />
                                    Loading your calendar...
                                </div>
                            ) : hostBookings.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center">
                                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                                        <CalendarDays size={40} />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Fully Available</h2>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">Your properties are wide open for guests! When they book, a timeline of availability will appear here.</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Group bookings by property */}
                                    {Object.entries(
                                        hostBookings.reduce((acc, booking) => {
                                            if (!acc[booking.property_title]) acc[booking.property_title] = [];
                                            // Only show future or ongoing
                                            if (new Date(booking.checkOut) >= new Date()) {
                                                acc[booking.property_title].push(booking);
                                            }
                                            return acc;
                                        }, {})
                                    ).map(([title, bookingsForProp]) => (
                                        <div key={title} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                                            <h3 className="text-xl font-extrabold mb-6 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4 text-gray-900 dark:text-white">
                                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600">
                                                    <HomeIcon size={20} />
                                                </div>
                                                {title}
                                            </h3>
                                            {bookingsForProp.length === 0 ? (
                                                <p className="text-gray-500 text-sm font-medium py-4 px-2">No upcoming bookings. Fully available!</p>
                                            ) : (
                                                <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbars">
                                                    {bookingsForProp.sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn)).map((b) => (
                                                        <div key={b._id} className="min-w-[240px] snap-center bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shrink-0 hover:border-orange-300 dark:hover:border-orange-700 transition-colors">
                                                            <div className="font-bold text-gray-900 dark:text-white mb-2 text-lg">
                                                                {new Date(b.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} <span className="text-gray-400 font-normal">to</span> {new Date(b.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                            </div>
                                                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                                                                {b.guests} Guests
                                                            </div>
                                                            <div className="flex items-center justify-between mt-auto pt-4">
                                                                <div className="text-xs font-bold px-3 py-1.5 rounded-lg inline-block bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wide">
                                                                    {b.bookingStatus}
                                                                </div>
                                                                <button 
                                                                    onClick={() => setViewingBookingId(b._id)}
                                                                    className="flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
                                                                >
                                                                    <Eye size={14} />
                                                                    View
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "reviews" && (
                        <div>
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-5 mb-8">
                                <div>
                                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600 dark:text-yellow-500">
                                            <Star size={24} fill="currentColor" />
                                        </div>
                                        Reviews
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Read what guests are saying about your homes.</p>
                                </div>
                            </div>

                            {loadingReviews ? (
                                <div className="flex justify-center flex-col items-center py-32 text-orange-600">
                                    <Loader2 className="animate-spin mb-4" size={48} />
                                    Loading reviews...
                                </div>
                            ) : hostReviews.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center">
                                    <div className="w-20 h-20 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500 rounded-full flex items-center justify-center mb-6">
                                        <Star size={40} fill="currentColor" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">No Reviews Yet</h2>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">Deliver great stays and memorable experiences to earn your first glowing review!</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {hostReviews.map((review) => (
                                        <div key={review._id} className="bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 p-8 rounded-3xl flex flex-col md:flex-row gap-8 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                                            <div className="flex items-center gap-4 md:w-[280px] shrink-0 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 pb-6 md:pb-0 md:pr-6">
                                                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 shrink-0 border-2 border-white shadow-sm">
                                                    {review.reviewer_image ? (
                                                        <img src={review.reviewer_image} alt={review.reviewer_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-700 font-bold text-xl">
                                                            {review.reviewer_name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{review.reviewer_name}</p>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
                                                </div>
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex text-yellow-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={18} fill={i < Math.round(review.rating) ? "currentColor" : "none"} className={i >= Math.round(review.rating) ? "text-gray-300 dark:text-gray-700" : ""} />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 shadow-sm truncate max-w-[200px]">
                                                        {review.property_title}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                                                    "{review.comment}"
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "crashpads" && (
                        <div>
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-5 mb-8">
                                <div>
                                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                                        <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-600">
                                            <Users size={24} />
                                        </div>
                                        Crashpad Requests
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Manage community stay requests.</p>
                                </div>
                            </div>

                            {loadingCrashpads ? (
                                <div className="flex justify-center flex-col items-center py-32 text-orange-600">
                                    <Loader2 className="animate-spin mb-4" size={48} />
                                    Loading requests...
                                </div>
                            ) : crashpadRequests.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center">
                                    <div className="w-20 h-20 bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-full flex items-center justify-center mb-6">
                                        <Users size={40} />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">No Requests Yet</h2>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">When travelers request a stay at your crashpad, they'll appear here.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {crashpadRequests.map((req) => (
                                        <div key={req._id} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border-4 border-gray-900 dark:border-gray-700 shadow-[0px_8px_0px_#000] transition-all hover:translate-y-[2px] hover:shadow-[0px_6px_0px_#000]">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">{req.guest_name}</h3>
                                                    <p className="text-xs font-bold text-orange-500">{req.dates}</p>
                                                </div>
                                                <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-2 border-gray-900 dark:border-white">
                                                    {req.status}
                                                </div>
                                            </div>
                                            <p className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl text-gray-700 dark:text-gray-300 font-bold mb-6 italic">
                                                "{req.message}"
                                            </p>
                                            {req.status === "pending" && (
                                                <div className="flex gap-4">
                                                    <button onClick={() => handleCrashpadAction(req._id, "accepted")} className="flex-1 bg-[#B5FF3B] text-black font-black uppercase tracking-widest text-xs py-3 rounded-xl shadow-[0px_4px_0px_#8C0] hover:translate-y-[2px] hover:shadow-[0px_2px_0px_#8C0] transition-all">Accept</button>
                                                    <button onClick={() => handleCrashpadAction(req._id, "rejected")} className="flex-1 bg-gray-100 text-gray-500 font-black uppercase tracking-widest text-xs py-3 rounded-xl border-2 border-gray-200">Reject</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => !deleting && setDeleteTarget(null)}>
                    <div
                        className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800 animate-fade-in mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                                <AlertTriangle className="text-red-600 dark:text-red-400" size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Delete Listing</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This action cannot be undone.</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 mb-6 border border-gray-100 dark:border-gray-700">
                            <p className="text-gray-700 dark:text-gray-300 text-lg">
                                Are you sure you want to permanently delete <strong className="text-gray-900 dark:text-white">{deleteTarget.title}</strong>?
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">All associated data, bookings, and reviews will be removed.</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                                className="flex-1 px-6 py-3.5 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 px-6 py-3.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-red-600/20"
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={18} />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BookingDetailsModal
                bookingId={viewingBookingId}
                onClose={() => setViewingBookingId(null)}
                onApprove={(id) => {
                    setHostBookings(prev => prev.map(b =>
                        b._id === id ? { ...b, bookingStatus: 'confirmed' } : b
                    ));
                }}
                onDecline={(id) => {
                    setHostBookings(prev => prev.map(b =>
                        b._id === id ? { ...b, bookingStatus: 'rejected' } : b
                    ));
                }}
            />
        </div >
    );
}

export default HostDashboard;
