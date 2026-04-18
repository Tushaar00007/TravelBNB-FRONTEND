import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import API from "../../../services/api";
import { format } from "date-fns";
import { 
    MapPin, 
    Users, 
    IndianRupee, 
    XCircle, 
    Home, 
    Loader2, 
    Sparkles, 
    Compass, 
    ArrowRight, 
    Clock,
    AlertCircle,
    RefreshCw,
    Search
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

const KIND_STYLES = {
    home: {
        label: 'Home',
        accent: 'bg-orange-500',
        accentText: 'text-orange-500',
        accentBg: 'bg-orange-50',
        emoji: '🏠',
    },
    crashpad: {
        label: 'Crashpad',
        accent: 'bg-blue-500',
        accentText: 'text-blue-500',
        accentBg: 'bg-blue-50',
        emoji: '🛏️',
    },
    buddy: {
        label: 'Travel Buddy',
        accent: 'bg-purple-500',
        accentText: 'text-purple-500',
        accentBg: 'bg-purple-50',
        emoji: '🧳',
    },
};

const MyBookings = () => {
    const { t } = useTranslation();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchBookings = async () => {
        const token = Cookies.get("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            console.log("=== FETCHING BOOKINGS ===");
            const res = await API.get("/bookings/user/all", {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("API Response:", res.data);

            if (res.data?.error) {
                throw new Error(res.data.error);
            }

            const fetchedBookings = res.data?.bookings || [];
            
            // Sort by check-in date (closest first)
            fetchedBookings.sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));
            
            setBookings(fetchedBookings);
        } catch (err) {
            console.error("Fetch bookings error:", err);
            const errorMsg = err.response?.data?.detail || err.message || "Failed to load bookings";
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (bookingId) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <p className="font-bold text-gray-900 dark:text-white">Cancel reservation?</p>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await doCancel(bookingId);
                        }}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                        Yes, cancel
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                        Keep it
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const doCancel = async (bookingId) => {
        const loadingToast = toast.loading("Cancelling reservation...");
        const token = Cookies.get("token");
        try {
            await API.delete(`/bookings/`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { booking_id: bookingId }
            });
            toast.success("Reservation cancelled", { id: loadingToast });
            fetchBookings();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to cancel booking", { id: loadingToast });
        }
    };

    // 1. LOADING STATE
    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center transition-colors">
                <div className="relative mb-8">
                    <div className="w-16 h-16 border-4 border-orange-100 dark:border-orange-900/30 border-t-orange-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="text-orange-600 animate-pulse" size={24} />
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-gray-900 dark:text-white font-black uppercase tracking-[0.3em] text-sm mb-2">
                        {t("syncing", "Syncing bookings")}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.1em] text-[10px]">
                        {t("preparing_itinerary", "Preparing your itinerary...")}
                    </p>
                </div>
            </div>
        );
    }

    // 2. ERROR STATE
    if (error) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mb-8">
                    <AlertCircle size={40} className="text-red-500" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">
                    {t("ooops", "Something went wrong")}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-bold max-w-xs mx-auto mb-10 uppercase tracking-widest text-[10px] leading-loose">
                    {typeof error === 'string' ? error : JSON.stringify(error)}
                </p>
                <button
                    onClick={fetchBookings}
                    className="flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:scale-105 active:scale-95 shadow-xl"
                >
                    <RefreshCw size={18} />
                    {t("try_again", "Try again")}
                </button>
            </div>
        );
    }

    // Separate active and cancelled bookings
    const activeBookings = bookings.filter(b => b.bookingStatus === 'confirmed' || b.bookingStatus === 'approved' || b.bookingStatus === 'pending');
    const pastOrCancelled = bookings.filter(b => b.bookingStatus === 'cancelled' || b.bookingStatus === 'rejected');

    return (
        <div className="bg-white dark:bg-gray-950 min-h-screen pb-24 transition-colors duration-300 font-sans">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
                <div className="mb-20">
                    <div className="flex items-center gap-3 text-orange-500 font-black uppercase tracking-[0.3em] text-[10px] mb-4">
                        <Sparkles size={16} />
                        <span>Member Portal</span>
                    </div>
                    <h1 className="text-[5rem] sm:text-[7rem] font-black text-gray-900 dark:text-white leading-[0.8] tracking-tighter uppercase mb-8">
                        MY <span className="text-orange-500">BOOKINGS</span>
                    </h1>
                    <p className="text-lg font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none">
                        {t("manage_bookings", "Manage your upcoming and past adventures")}
                    </p>
                </div>

                {/* 3. EMPTY STATE */}
                {bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 px-6 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[4rem] bg-gray-50/30 dark:bg-gray-900/30 backdrop-blur-sm">
                        <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-2xl mb-10 relative group">
                            <Compass size={56} className="text-gray-200 dark:text-gray-700 group-hover:rotate-45 transition-transform duration-700" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Search size={32} className="text-orange-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-6">
                            {t("no_bookings_yet", "No bookings... yet!")}
                        </h2>
                        <div className="space-y-2 mb-12">
                            <p className="text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest text-[10px]">
                                {t("start_exploring", "Start exploring and book your next stay ✨")}
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-[8px] max-w-xs mx-auto leading-relaxed">
                                {t("time_to_dust", "Time to dust off your bags and start planning your next great adventure.")}
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/crashpads")}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-orange-500/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-4 group"
                        >
                            <Home size={20} />
                            {t("explore_homes", "Explore Homes")}
                            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-32">
                        {/* Active Bookings */}
                        {activeBookings.length > 0 && (
                            <div>
                                <div className="flex items-center gap-6 mb-12">
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Upcoming Stays</h3>
                                    <div className="h-[2px] flex-1 bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                                    {activeBookings.map((booking) => (
                                        <BookingCard
                                            key={booking._id}
                                            booking={booking}
                                            onCancel={() => handleCancel(booking._id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Cancelled/Past Bookings */}
                        {pastOrCancelled.length > 0 && (
                            <div className="opacity-60 grayscale-[0.5] hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                                <div className="flex items-center gap-6 mb-12">
                                    <h3 className="text-3xl font-black text-gray-400 dark:text-gray-600 uppercase tracking-tighter">Archive</h3>
                                    <div className="h-[2px] flex-1 bg-gradient-to-r from-gray-200 dark:from-gray-800 to-transparent"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                                    {pastOrCancelled.map((booking) => (
                                        <BookingCard
                                            key={booking._id}
                                            booking={booking}
                                            disabled
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function BookingCard({ booking, onCancel, disabled }) {
    const home = booking.homeDetails;
    const isCancelled = booking.bookingStatus === 'cancelled' || booking.bookingStatus === 'rejected';
    const kind = booking.kind || 'home';
    const style = KIND_STYLES[kind] || KIND_STYLES.home;

    const formatDate = (dateStr) => {
        try {
            return format(new Date(dateStr), 'MMM d, yyyy');
        } catch {
            return dateStr || '';
        }
    };

    return (
        <div className={`group bg-white dark:bg-gray-900 rounded-[3rem] overflow-hidden border ${isCancelled ? 'border-red-100 dark:border-red-900/20' : 'border-gray-100 dark:border-gray-800'} shadow-sm hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] hover:border-orange-500/30 transition-all duration-700 flex flex-col h-full ring-1 ring-transparent hover:ring-orange-500/10`}>
            <div className="h-72 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                {(() => {
                    const imgSrc = home?.images?.[0] || booking.image || null;
                    return imgSrc ? (
                        <img
                            src={imgSrc}
                            alt={home?.title || booking.title || "Listing"}
                            className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${!disabled && 'group-hover:scale-110'} ${isCancelled && 'grayscale opacity-60'}`}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.querySelector('.fallback-emoji')?.classList.remove('hidden');
                            }}
                        />
                    ) : null;
                })()}

                {/* Fallback emoji (always rendered, hidden if image loads) */}
                <div className={`fallback-emoji absolute inset-0 flex flex-col items-center justify-center gap-3 ${(home?.images?.[0] || booking.image) ? 'hidden' : ''}`}>
                    <span className="text-7xl opacity-40">{style.emoji}</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">No image</span>
                </div>

                {/* TYPE BADGE (top right) */}
                <div className="absolute top-8 right-8 z-10">
                    <div className={`${style.accent} text-white text-[9px] font-black px-5 py-2 rounded-full shadow-2xl uppercase tracking-[0.2em] border border-white/20 flex items-center gap-2`}>
                        <span>{style.emoji}</span> {style.label}
                    </div>
                </div>

                {/* STATUS BADGE (top left) */}
                <div className="absolute top-8 left-8 z-10">
                    {booking.bookingStatus === 'pending' && (
                        <div className="bg-yellow-500/90 backdrop-blur-xl text-white text-[9px] font-black px-5 py-2 rounded-full shadow-2xl uppercase tracking-[0.2em] border border-white/20 flex items-center gap-2">
                            <Clock size={12} /> PENDING
                        </div>
                    )}
                    {booking.bookingStatus === 'approved' && (
                        <div className="bg-blue-600/90 backdrop-blur-xl text-white text-[9px] font-black px-5 py-2 rounded-full shadow-2xl uppercase tracking-[0.2em] border border-white/20 flex items-center gap-2">
                            <IndianRupee size={12} /> ACTION REQUIRED
                        </div>
                    )}
                    {booking.bookingStatus === 'confirmed' && (
                        <div className="bg-green-500/90 backdrop-blur-xl text-white text-[9px] font-black px-5 py-2 rounded-full shadow-2xl uppercase tracking-[0.2em] border border-white/20 flex items-center gap-2">
                            <ArrowRight size={12} /> CONFIRMED
                        </div>
                    )}
                    {booking.bookingStatus === 'rejected' && (
                        <div className="bg-red-500/90 backdrop-blur-xl text-white text-[9px] font-black px-5 py-2 rounded-full shadow-2xl uppercase tracking-[0.2em] border border-white/20 flex items-center gap-2">
                            <XCircle size={12} /> DECLINED
                        </div>
                    )}
                    {booking.bookingStatus === 'cancelled' && (
                        <div className="bg-gray-800/90 backdrop-blur-xl text-white text-[9px] font-black px-5 py-2 rounded-full shadow-2xl uppercase tracking-[0.2em] border border-white/20">
                            CANCELLED
                        </div>
                    )}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            </div>

            {/* Content */}
            <div className="p-10 flex-1 flex flex-col">
                <div className="mb-6 flex items-center justify-between">
                    <div className={`flex items-center gap-3 text-[10px] font-black ${style.accentText} uppercase tracking-[0.2em] ${style.accentBg} dark:bg-opacity-20 px-3 py-1.5 rounded-lg`}>
                        <Clock size={14} strokeWidth={3} />
                        <span>{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</span>
                    </div>
                </div>

                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3 line-clamp-1 uppercase tracking-tighter group-hover:text-orange-500 transition-colors duration-300">
                    {home?.title || booking.title || "Unknown"}
                </h3>

                <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black flex items-center gap-2 mb-8 uppercase tracking-[0.2em] transition-colors">
                    <MapPin size={16} className={style.accentText} />
                    {home?.city || booking.city || 'Unknown Location'}
                    {home?.address && `, ${home.address?.split(',').pop()}`}
                </p>

                {/* Show message for crashpad requests */}
                {kind === 'crashpad' && booking.message && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border-l-4 border-blue-500">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 mb-1">Your message</p>
                        <p className="text-xs text-gray-700 dark:text-gray-300 italic line-clamp-2">"{booking.message}"</p>
                    </div>
                )}

                {/* Detail Row */}
                <div className="grid grid-cols-2 gap-8 py-8 border-t border-gray-50 dark:border-gray-800 mt-auto">
                    <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">
                            {kind === 'buddy' ? 'Group' : 'Guests'}
                        </span>
                        <div className="flex items-center gap-3 font-black text-xl text-gray-900 dark:text-white">
                            <Users size={20} className={style.accentText} />
                            <span>{booking.guests}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 text-right">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">
                            {kind === 'buddy' ? 'Budget' : 'Total'}
                        </span>
                        <div className="flex items-center justify-end gap-1 font-black text-2xl text-gray-900 dark:text-white">
                            <IndianRupee size={20} strokeWidth={3} className={style.accentText} />
                            <span>{(booking.totalPrice || 0).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

                {!disabled && !isCancelled && kind === 'home' && (
                    <button
                        onClick={onCancel}
                        className="mt-8 w-full flex items-center justify-center gap-4 bg-gray-50 hover:bg-red-500 hover:text-white dark:bg-gray-800 dark:hover:bg-red-900/40 text-gray-400 dark:text-gray-500 hover:shadow-[0_20px_40px_-12px_rgba(239,68,68,0.3)] py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 group/btn"
                    >
                        <XCircle size={20} className="group-hover/btn:rotate-90 transition-transform duration-500" />
                        Cancel Reservation
                    </button>
                )}
            </div>
        </div>
    );
}

export default MyBookings;
