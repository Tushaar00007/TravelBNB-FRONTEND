import { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../../services/api";
import Cookies from "js-cookie";

import ReviewCard from "../../../components/ReviewCard";
import ShareModal from "../../../components/ShareModal";
import { CurrencyContext } from "../../../context/CurrencyContext";
import { convertCurrency } from "../../../utils/convertCurrency";
import { toast } from "react-hot-toast";
import { Star, MapPin, Users, BedDouble, Bath, Wifi, Coffee, Car, Waves, Droplets, Wind, Flame, Tv, Shirt, Dumbbell, Utensils, ArrowLeft, Image as ImageIcon, MessageSquare, Send, X, ChevronLeft as ChevLeft, ChevronRight as ChevRight, Share2, Tag, CheckCircle2, ShieldAlert, ShieldCheck, TrendingUp, Loader2 } from "lucide-react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { differenceInDays, format } from "date-fns";
import { useTranslation } from "react-i18next";
import ReportModal from "../../auth/components/ReportModal";

// ── Valid coupons (extend freely) ─────────────────────────────
const VALID_COUPONS = {
    SAVE10: { discount: 10, label: "10% off" },
    TRAVEL20: { discount: 20, label: "20% off" },
    TBNB15: { discount: 15, label: "15% off" },
    FIRST25: { discount: 25, label: "25% off (first booking)" },
};
const GST_RATE = 0.18;

const getAmenityIcon = (amenity) => {
    switch (amenity) {
        case "Wifi": return <Wifi size={20} />;
        case "Kitchen": return <Utensils size={20} />;
        case "Free parking": return <Car size={20} />;
        case "Pool": return <Waves size={20} />;
        case "Hot tub": return <Droplets size={20} />;
        case "Air conditioning": return <Wind size={20} />;
        case "Heating": return <Flame size={20} />;
        case "TV": return <Tv size={20} />;
        case "Washer": return <Shirt size={20} />;
        case "Dryer": return <Shirt size={20} />;
        case "Gym": return <Dumbbell size={20} />;
        case "Breakfast": return <Coffee size={20} />;
        default: return <Star size={20} />;
    }
};

function HomeDetails() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [home, setHome] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Booking States
    const [checkIn, setCheckIn] = useState(null);
    const [checkOut, setCheckOut] = useState(null);
    const [guests, setGuestCount] = useState(1);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);
    const [highlightDates, setHighlightDates] = useState(false);
    const [bookingError, setBookingError] = useState(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Coupon / Discount States
    const [couponInput, setCouponInput] = useState("");
    const [discountPercent, setDiscountPercent] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponMsg, setCouponMsg] = useState(null); // { type: 'success'|'error', text }

    // Share modal
    const [shareOpen, setShareOpen] = useState(false);

    // Review States
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [reviewFormOpen, setReviewFormOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState(null);

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Host info state
    const [hostInfo, setHostInfo] = useState(null);
    const [reportModalOpen, setReportModalOpen] = useState(false);

    const openLightbox = (index) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => setLightboxOpen(false);

    const prevImage = useCallback(() => {
        if (!home?.images) return;
        setLightboxIndex(prev => (prev - 1 + home.images.length) % home.images.length);
    }, [home]);

    const nextImage = useCallback(() => {
        if (!home?.images) return;
        setLightboxIndex(prev => (prev + 1) % home.images.length);
    }, [home]);

    // Keyboard navigation for lightbox
    useEffect(() => {
        if (!lightboxOpen) return;
        const handleKey = (e) => {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowLeft") prevImage();
            if (e.key === "ArrowRight") nextImage();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [lightboxOpen, prevImage, nextImage]);

    const currentUserId = Cookies.get("userId");
    const isAuthenticated = !!currentUserId;

    const { currency, exchangeRate } = useContext(CurrencyContext);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    useEffect(() => {
        const fetchHomeDetails = async () => {
            try {
                const res = await API.get(`/homes/${id}`);
                setHome(res.data);
            } catch (err) {
                console.error("Failed to load home details", err);
                setError("Unable to load property details at this time.");
            }
        };

        const fetchReviews = async () => {
            try {
                const res = await API.get(`/reviews/${id}`);
                setReviews(res.data.reviews || []);
                setAverageRating(res.data.averageRating || 0);
                setTotalReviews(res.data.totalReviews || 0);
            } catch (err) {
                console.error("Failed to load reviews", err);
            }
        };

        Promise.all([fetchHomeDetails(), fetchReviews()]).finally(() => {
            setLoading(false);
        });
    }, [id]);

    // Fetch host info once home is loaded
    useEffect(() => {
        if (!home?.host_id) return;
        API.get(`/auth/user/${home.host_id}`)
            .then(res => setHostInfo(res.data))
            .catch(err => console.error("Failed to fetch host info", err));
    }, [home?.host_id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">

                <div className="flex flex-col items-center justify-center pt-32">
                    <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium tracking-wide">Loading property details...</p>
                </div>
            </div>
        );
    }

    if (error || !home) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">

                <div className="flex flex-col items-center justify-center pt-32 px-4 text-center">
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-8 rounded-2xl border border-red-200 dark:border-red-800 max-w-md w-full shadow-sm">
                        <h2 className="text-3xl font-bold mb-3">Oops!</h2>
                        <p className="font-medium text-lg opacity-90">{error || "Property not found."}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-8 bg-orange-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-md hover:bg-orange-700 hover:shadow-lg transition-all"
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Coupon handler
    const handleApplyCoupon = () => {
        const code = couponInput.trim().toUpperCase();
        if (!code) {
            setCouponMsg({ type: "error", text: "Please enter a coupon code." });
            return;
        }
        if (VALID_COUPONS[code]) {
            const { discount, label } = VALID_COUPONS[code];
            setDiscountPercent(discount);
            setAppliedCoupon({ code, label });
            setCouponMsg({ type: "success", text: `🎉 "${code}" applied — ${label}!` });
        } else {
            setDiscountPercent(0);
            setAppliedCoupon(null);
            setCouponMsg({ type: "error", text: `"${code}" is not a valid coupon code.` });
        }
    };

    const handleRemoveCoupon = () => {
        setCouponInput("");
        setDiscountPercent(0);
        setAppliedCoupon(null);
        setCouponMsg(null);
    };

    // Calculations
    const nights = (checkIn && checkOut) ? differenceInDays(checkOut, checkIn) : 0;
    const basePrice = home.price_per_night;
    // Raw subtotal (always in INR / base currency)
    const subtotalRaw = nights > 0 ? nights * basePrice : basePrice;
    const discountAmt = subtotalRaw * (discountPercent / 100);
    const afterDiscount = subtotalRaw - discountAmt;
    const taxAmt = afterDiscount * GST_RATE;
    const finalTotal = afterDiscount + taxAmt;

    // Display conversions
    const symbol = currency === 'USD' ? '$' : '₹';
    const price = convertCurrency(basePrice, currency, exchangeRate);
    const subtotalDisplay = convertCurrency(subtotalRaw, currency, exchangeRate);
    const discountDisplay = convertCurrency(discountAmt, currency, exchangeRate);
    const taxDisplay = convertCurrency(taxAmt, currency, exchangeRate);
    const finalDisplay = convertCurrency(finalTotal, currency, exchangeRate);

    // Share URL
    const shareUrl = `${window.location.origin}/homes/${home._id}`;

    async function handleRequestToBook() {
        console.log("Request to Book clicked");
        console.log("checkIn:", checkIn, "checkOut:", checkOut);
        
        const hostId = home?.host_id || home?.host?._id || home?.host?.id;
        const propertyId = home?._id;
        const propertyName = home?.title || home?.name || 'Property';
        const hostName = hostInfo?.name || "Host";

        console.log("hostId:", hostId, "propertyId:", propertyId, "propertyName:", propertyName);

        if (!checkIn || !checkOut) {
            toast.error("Please select check-in and check-out dates first");
            
            // Scroll to the date picker section smoothly
            const dateSection = document.getElementById('date-picker-section');
            if (dateSection) {
                dateSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            // Flash highlight the empty date fields
            setHighlightDates(true);
            setTimeout(() => setHighlightDates(false), 2000);
            return;
        }
        if (!isAuthenticated) {
            toast.error("Please login to request a booking");
            navigate('/login');
            return;
        }

        try {
            setIsRequesting(true);
            const token = Cookies.get("token");
            
            // 1. Create booking request
            const response = await API.post('/bookings/request', {
                property_id: String(propertyId),
                host_id: String(hostId),
                guest_id: String(currentUserId),
                check_in: checkIn.toISOString(),
                check_out: checkOut.toISOString(),
                guests: parseInt(guests),
                total_price: finalTotal,
                status: 'pending'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("Booking request response:", response.data);
            const bookingRequestId = response.data.booking_request_id;
            console.log("bookingRequestId:", bookingRequestId);

            // 2. Send automated message to host
            await API.post('/messages/send', {
                sender_id: String(currentUserId || Cookies.get("userId")),
                recipient_id: String(hostId),
                message: `Hi! I would like to request a booking for your property from ${format(checkIn, 'MMM d')} to ${format(checkOut, 'MMM d')} for ${guests} guest(s). Total: ₹${finalTotal.toLocaleString()}. Booking Request ID: #${bookingRequestId}`,
                booking_request_id: String(bookingRequestId),
                booking_status: 'pending',
                property_id: String(propertyId),
                property_name: propertyName,
            });

            console.log("Message sent successfully");
            toast.success("Booking request sent! Redirecting to messages...");
            
            setTimeout(() => {
                console.log("Navigating to messages...");
                navigate(`/messages?host=${hostId}&request=${bookingRequestId}&property_id=${propertyId}&property_name=${encodeURIComponent(propertyName)}&hostName=${encodeURIComponent(hostName)}`);
            }, 1500);

        } catch (err) {
            console.error("Request to Book failed:", err);
            console.error("Error response:", err.response?.data);
            toast.error(err.response?.data?.detail || "Failed to send request. Please try again.");
        } finally {
            setIsRequesting(false);
        }
    }

    const handleCreateReview = async () => {
        if (!reviewComment.trim()) {
            setReviewError("Please write a comment.");
            return;
        }

        setReviewError(null);
        setReviewLoading(true);

        try {
            const token = Cookies.get("token");

            await API.post("/reviews/", {
                propertyId: home._id,
                rating: reviewRating,
                comment: reviewComment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Reset form and close
            setReviewComment("");
            setReviewRating(5);
            setReviewFormOpen(false);

            // Re-fetch reviews to update the feed
            const res = await API.get(`/reviews/${id}`);
            setReviews(res.data.reviews || []);
            setAverageRating(res.data.averageRating || 0);
            setTotalReviews(res.data.totalReviews || 0);
        } catch (err) {
            setReviewError(err.response?.data?.detail || "Failed to post review.");
        } finally {
            setReviewLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <p className="font-bold text-gray-900 dark:text-white">Delete review?</p>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await doDeleteReview(reviewId);
                        }}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const doDeleteReview = async (reviewId) => {
        const loadingToast = toast.loading("Deleting review...");
        try {
            const token = Cookies.get("token");

            await API.delete(`/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Review deleted", { id: loadingToast });

            // Re-fetch reviews to update the feed
            const res = await API.get(`/reviews/${id}`);
            setReviews(res.data.reviews || []);
            setAverageRating(res.data.averageRating || 0);
            setTotalReviews(res.data.totalReviews || 0);
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to delete review", { id: loadingToast });
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 min-h-screen pb-24 transition-colors duration-300 font-sans">


            <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-white rounded-xl mb-6 transition font-bold">
                        <ArrowLeft size={18} /> Back
                    </button>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">{home.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-base font-semibold text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full border border-orange-100 dark:border-orange-800">
                            {totalReviews > 0 ? (
                                <>
                                    <Star size={16} className="fill-current" />
                                    <span>{averageRating} ({totalReviews} reviews)</span>
                                </>
                            ) : (
                                <>
                                    <Star size={16} className="fill-current" />
                                    <span>New Listing</span>
                                </>
                            )}
                        </div>
                        <span className="underline decoration-gray-400 cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1.5 transition-colors">
                            <MapPin size={18} /> {home.city}, {home.state}, {home.country || "India"}
                        </span>
                    </div>
                </div>

                {/* Image Gallery Grid */}
                <div className="animate-fade-in delay-100">
                    {home.images && home.images.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3 rounded-[2rem] overflow-hidden h-[300px] md:h-[450px] lg:h-[550px] relative shadow-lg">
                            <div className="w-full h-full group overflow-hidden cursor-pointer relative" onClick={() => openLightbox(0)}>
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10 w-full h-full"></div>
                                <img src={home.images[0]} alt="Main Property" className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" />
                            </div>
                            <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-3 w-full h-full">
                                {[1, 2, 3, 4].map((index) => (
                                    <div key={index} className="w-full h-full bg-gray-100 dark:bg-gray-800 overflow-hidden relative group cursor-pointer" onClick={() => home.images[index] && openLightbox(index)}>
                                        {home.images[index] ? (
                                            <>
                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10 w-full h-full"></div>
                                                <img src={home.images[index]} alt={`Gallery ${index}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" />
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-600">
                                                <ImageIcon size={48} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {home.images.length > 5 && (
                                <button
                                    onClick={() => openLightbox(0)}
                                    className="absolute bottom-6 right-6 z-20 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-transparent hover:border-gray-900 dark:hover:border-white font-bold px-6 py-2.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all flex items-center gap-2"
                                >
                                    <ImageIcon size={20} /> Show all {home.images.length} photos
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-[300px] md:h-[450px] rounded-[2rem] bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 shadow-inner border-4 border-dashed border-gray-200 dark:border-gray-700">
                            <ImageIcon size={80} className="mb-4 opacity-50" />
                            <p className="font-bold text-2xl">No photos available</p>
                        </div>
                    )}
                </div>

                {/* Main Content & Sidebar Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12 mt-12 animate-fade-in delay-200">

                    {/* Left Column - Details */}
                    <div className="space-y-10">

                        {/* Title & Basics */}
                        <div className="border-b border-gray-200 dark:border-gray-800 pb-8">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                {home.property_type || "Entire place"} hosted by TravelBNB Host
                            </h2>
                            <ul className="flex flex-wrap items-center text-gray-700 dark:text-gray-300 gap-x-6 gap-y-3 font-medium text-lg">
                                <li className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl"><Users size={20} className="text-orange-600" /> {home.max_guests} guests</li>
                                <li className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl"><BedDouble size={20} className="text-orange-600" /> {home.bedrooms} bedrooms</li>
                                <li className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl"><BedDouble size={20} className="text-orange-600" /> {home.beds} beds</li>
                                <li className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl"><Bath size={20} className="text-orange-600" /> {home.bathrooms} baths</li>
                            </ul>
                        </div>

                        {/* Description */}
                        <div className="border-b border-gray-200 dark:border-gray-800 pb-8">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">About this place</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-line font-medium">
                                {home.description || "The host hasn't provided a description for this property yet."}
                            </p>
                        </div>

                        {/* Amenities */}
                        <div className="border-b border-gray-200 dark:border-gray-800 pb-8">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">What this place offers</h3>
                            {home.amenities && home.amenities.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {home.amenities.map((amenity, idx) => (
                                        <div key={idx} className="flex items-center gap-4 text-gray-800 dark:text-gray-200 text-lg font-medium">
                                            <div className="bg-orange-50 dark:bg-gray-800 p-3 rounded-xl text-orange-600 dark:text-orange-400">
                                                {getAmenityIcon(amenity)}
                                            </div>
                                            <span>{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Amenities unlisted.</p>
                            )}
                        </div>

                        {/* Meet Your Host */}
                        <div className="border-b border-gray-200 dark:border-gray-800 pb-10">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Meet your host</h3>
                                {isAuthenticated && home.host_id !== currentUserId && (
                                    <button
                                        onClick={() => setReportModalOpen(true)}
                                        className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors py-2 px-4 rounded-xl border border-gray-100 hover:border-red-100 dark:border-gray-800"
                                    >
                                        <ShieldAlert size={14} /> Report this user
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left: host card + bio */}
                                <div className="space-y-5">
                                    {/* Profile card */}
                                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex flex-col items-center text-center">
                                        {/* Avatar */}
                                        <div className="relative mb-3">
                                            {hostInfo?.profile_image ? (
                                                <img src={hostInfo.profile_image} alt={hostInfo?.name}
                                                    className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md" />
                                            ) : (
                                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-3xl font-extrabold text-white shadow-md">
                                                    {(hostInfo?.name || "H").charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            {/* Verified badge */}
                                            {hostInfo?.is_verified && (
                                                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 shadow-lg border-2 border-white dark:border-gray-800">
                                                    <ShieldCheck className="w-4 h-4 text-white" strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>

                                        <h4 className="text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">
                                            {hostInfo?.name || "Your Host"}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                            <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            Superhost
                                        </p>

                                        {/* Stats */}
                                        <div className="mt-5 grid grid-cols-3 gap-3 w-full text-center border-t border-gray-100 dark:border-gray-700 pt-5">
                                            <div>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">{totalReviews}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Reviews</p>
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">{averageRating > 0 ? averageRating : "–"}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                    {new Date().getFullYear() - new Date(hostInfo?.created_at || home.created_at || Date.now()).getFullYear() || 1}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Years hosting</p>
                                            </div>
                                        </div>

                                        {/* Trust Score Indicator */}
                                        <div className="mt-4 px-4 py-2 bg-orange-50 dark:bg-gray-700/50 rounded-2xl border border-orange-100 dark:border-gray-700 w-full">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">Trust Score</span>
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">{hostInfo?.trust_score || 0}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white dark:bg-gray-800 rounded-full overflow-hidden shadow-inner flex">
                                                <div
                                                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-1000"
                                                    style={{ width: `${Math.min(100, hostInfo?.trust_score || 0)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Caretaker info as bio */}
                                    {home.caretaker_info && (
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                                            {home.caretaker_info}
                                        </p>
                                    )}
                                </div>

                                {/* Right: superhost badge + details + message */}
                                <div className="space-y-6">
                                    {/* Superhost */}
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">
                                            {hostInfo?.name || "Your host"} is a Superhost
                                        </h4>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                            Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.
                                        </p>
                                    </div>

                                    {/* Co-Hosts */}
                                    {home.co_hosts && home.co_hosts.length > 0 && (
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-base mb-3">Co-Hosts</h4>
                                            <div className="flex flex-wrap gap-3">
                                                {home.co_hosts.map((cohost, i) => (
                                                    <div key={i} className="flex items-center gap-2">
                                                        {cohost.pic ? (
                                                            <img src={cohost.pic} alt={cohost.name} className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow" />
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300">
                                                                {cohost.name?.charAt(0) || "C"}
                                                            </div>
                                                        )}
                                                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{cohost.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Host details */}
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-base mb-2">Host details</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">Response rate: 100%</p>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">Responds within an hour</p>
                                    </div>

                                    {/* Message host button */}
                                    {isAuthenticated && home.host_id && home.host_id !== currentUserId && (
                                        <button
                                            onClick={() => navigate("/messages", {
                                                state: {
                                                    openConv: {
                                                        otherUserId: home.host_id,
                                                        propertyId: home._id,
                                                        propertyTitle: home.title,
                                                        otherUserName: hostInfo?.name || "Host",
                                                        otherUserPic: hostInfo?.profile_image || "",
                                                    }
                                                }
                                            })}
                                            className="w-full sm:w-auto px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-all shadow-sm"
                                        >
                                            Message host
                                        </button>
                                    )}

                                    {/* Safety note */}
                                    <div className="flex items-start gap-3 text-xs text-gray-500 dark:text-gray-400 pt-2">
                                        <svg className="w-8 h-8 shrink-0 text-orange-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <span>To help protect your payment, always use TravelBNB to send money and communicate with hosts.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location / Google Map */}
                        {home.location && home.location.lat && home.location.lng && (
                            <div className="border-b border-gray-200 dark:border-gray-800 pb-8">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Where you'll be</h3>
                                <div className="h-[400px] w-full rounded-3xl overflow-hidden relative shadow-inner border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                                    {isLoaded ? (
                                        <GoogleMap
                                            mapContainerStyle={{ width: '100%', height: '100%' }}
                                            center={home.location}
                                            zoom={14}
                                            options={{
                                                disableDefaultUI: true,
                                                zoomControl: true,
                                                gestureHandling: 'cooperative' // Allows scrolling past the map
                                            }}
                                        >
                                            <Marker
                                                position={home.location}
                                            />
                                        </GoogleMap>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium">
                                            Loading map...
                                        </div>
                                    )}
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 font-medium mt-4 flex items-center gap-2">
                                    <MapPin size={18} /> Exact location provided after booking.
                                </p>
                            </div>
                        )}

                        {/* Guest Reviews Section */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mt-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Star className="text-orange-600 fill-orange-600" />
                                    {totalReviews > 0 ? `${averageRating} · ${totalReviews} review${totalReviews !== 1 ? 's' : ''}` : "No reviews (yet)"}
                                </h3>
                                {isAuthenticated && !reviews.some(r => r.userId === currentUserId) && (
                                    <button
                                        onClick={() => setReviewFormOpen(!reviewFormOpen)}
                                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 px-4 py-2 rounded-xl font-bold transition-colors"
                                    >
                                        + Write a review
                                    </button>
                                )}
                            </div>

                            {/* Write Review Form Block */}
                            {reviewFormOpen && isAuthenticated && (
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 mb-8 animate-fade-in shadow-inner">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">Leave your feedback</h4>

                                    {/* Star Rating Selector */}
                                    <div className="flex gap-2 mb-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setReviewRating(star)}
                                                className={`p-2 rounded-full transition-colors ${reviewRating >= star ? 'text-orange-500' : 'text-gray-300 dark:text-gray-600 hover:text-orange-300'}`}
                                            >
                                                <Star size={28} className={reviewRating >= star ? 'fill-current' : ''} />
                                            </button>
                                        ))}
                                    </div>

                                    {/* Comment Textarea */}
                                    <textarea
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        placeholder="How was your stay?"
                                        className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none mb-3 min-h-[100px]"
                                    ></textarea>

                                    {reviewError && (
                                        <div className="text-red-500 text-sm font-semibold mb-4">{reviewError}</div>
                                    )}

                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => setReviewFormOpen(false)}
                                            className="px-6 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreateReview}
                                            disabled={reviewLoading}
                                            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl flex items-center gap-2 transition disabled:opacity-50"
                                        >
                                            <Send size={16} /> {reviewLoading ? "Posting..." : "Post Review"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Reviews Grid */}
                            {reviews.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {reviews.map((review) => (
                                        <ReviewCard
                                            key={review._id}
                                            review={review}
                                            currentUserId={currentUserId}
                                            onDelete={handleDeleteReview}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-200 dark:border-gray-700 border-dashed">
                                    <MessageSquare size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No reviews yet</h4>
                                    <p className="text-gray-500 dark:text-gray-400">Be the first to share your experience staying here.</p>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Report Modal */}
                    <ReportModal
                        isOpen={reportModalOpen}
                        onClose={() => setReportModalOpen(false)}
                        targetId={home.host_id}
                        targetName={hostInfo?.name}
                    />

                    {/* Right Column - Sticky Widget */}
                    <div className="relative">
                        <div className="sticky top-32 bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 p-8 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all">

                            {/* Price headline + Share */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-end gap-1">
                                    <span className="text-5xl font-extrabold text-gray-900 dark:text-white tabular-nums tracking-tight">
                                        {symbol}{price}
                                    </span>
                                    <span className="text-lg text-gray-500 dark:text-gray-400 font-bold mb-1 ml-1">night</span>
                                </div>
                                <button
                                    onClick={() => setShareOpen(true)}
                                    className="flex items-center gap-1.5 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors px-3 py-1.5 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                >
                                    <Share2 size={16} /> Share
                                </button>
                            </div>

                            {bookingSuccess ? (
                                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl">
                                    <h3 className="text-green-600 dark:text-green-400 font-bold text-xl mb-2">Reservation Confirmed! 🎉</h3>
                                    <p className="text-gray-600 dark:text-gray-300">Redirecting to your bookings...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Date + Guest pickers */}
                                    <div id="date-picker-section" className="border-2 border-gray-200 dark:border-gray-600 rounded-2xl overflow-hidden mb-4 group hover:border-orange-400 focus-within:border-orange-500 transition-colors">
                                        <div className="grid grid-cols-2 border-b-2 border-gray-200 dark:border-gray-600">
                                            <div className={`p-4 border-r-2 border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${highlightDates && !checkIn ? 'border-2 border-orange-500 animate-pulse rounded-xl' : ''}`}>
                                                <p className="text-xs uppercase font-extrabold tracking-wider text-gray-900 dark:text-gray-300">Check-in</p>
                                                <DatePicker
                                                    selected={checkIn}
                                                    onChange={(date) => setCheckIn(date)}
                                                    selectsStart
                                                    startDate={checkIn}
                                                    endDate={checkOut}
                                                    minDate={new Date()}
                                                    placeholderText="Add date"
                                                    className="w-full bg-transparent outline-none text-gray-900 dark:text-white font-medium mt-1 cursor-pointer"
                                                />
                                                {highlightDates && !checkIn && (
                                                    <p style={{ color: '#EA580C', fontSize: '11px', marginTop: '4px', fontWeight: '600' }}>
                                                        ← Please select check-in date
                                                    </p>
                                                )}
                                            </div>
                                            <div className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${highlightDates && !checkOut ? 'border-2 border-orange-500 animate-pulse rounded-xl' : ''}`}>
                                                <p className="text-xs uppercase font-extrabold tracking-wider text-gray-900 dark:text-gray-300">Checkout</p>
                                                <DatePicker
                                                    selected={checkOut}
                                                    onChange={(date) => setCheckOut(date)}
                                                    selectsEnd
                                                    startDate={checkIn}
                                                    endDate={checkOut}
                                                    minDate={checkIn || new Date()}
                                                    placeholderText="Add date"
                                                    className="w-full bg-transparent outline-none text-gray-900 dark:text-white font-medium mt-1 cursor-pointer"
                                                />
                                                {highlightDates && !checkOut && (
                                                    <p style={{ color: '#EA580C', fontSize: '11px', marginTop: '4px', fontWeight: '600' }}>
                                                        ← Please select check-out date
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                            <p className="text-xs uppercase font-extrabold tracking-wider text-gray-900 dark:text-gray-300">Guests</p>
                                            <select
                                                className="w-full bg-transparent outline-none text-gray-900 dark:text-white font-bold mt-1 appearance-none cursor-pointer"
                                                value={guests}
                                                onChange={(e) => setGuestCount(e.target.value)}
                                            >
                                                {[...Array(home.max_guests)].map((_, i) => (
                                                    <option key={i + 1} value={i + 1} className="text-gray-900">{i + 1} guest{i > 0 && 's'}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* ── Coupon code ───────────────────────── */}
                                    <div className="mb-4">
                                        {appliedCoupon ? (
                                            <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl px-4 py-3">
                                                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold text-sm">
                                                    <CheckCircle2 size={16} />
                                                    <span>{appliedCoupon.code}</span>
                                                    <span className="font-medium text-green-600 dark:text-green-500">· {appliedCoupon.label}</span>
                                                </div>
                                                <button
                                                    onClick={handleRemoveCoupon}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <div className="flex-1 flex items-center gap-2 border-2 border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-3 focus-within:border-orange-400 transition-colors">
                                                    <Tag size={14} className="text-gray-400 shrink-0" />
                                                    <input
                                                        type="text"
                                                        value={couponInput}
                                                        onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponMsg(null); }}
                                                        onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                                                        placeholder="Coupon code"
                                                        className="w-full bg-transparent outline-none text-sm font-bold text-gray-900 dark:text-white placeholder:font-medium placeholder:text-gray-400"
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleApplyCoupon}
                                                    className="shrink-0 px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm rounded-2xl hover:opacity-80 transition-opacity active:scale-95"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        )}
                                        {couponMsg && (
                                            <p className={`text-xs font-semibold mt-2 ml-1 ${couponMsg.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                                {couponMsg.text}
                                            </p>
                                        )}
                                    </div>

                                    {bookingError && (
                                        <div className="mb-4 text-red-500 text-sm font-semibold">{bookingError}</div>
                                    )}

                                    <button
                                        onClick={handleRequestToBook}
                                        disabled={isRequesting}
                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all shadow-md active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                                    >
                                        {isRequesting 
                                            ? <><Loader2 className="animate-spin" size={18}/> Sending Request...</> 
                                            : '📩 Request to Book'
                                        }
                                    </button>
                                    <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mt-3">
                                        🔒 Your booking is confirmed only after host approval
                                    </p>

                                    {/* ── Price breakdown ───────────────────── */}
                                    <div className="mt-6 pt-6 border-t-2 border-gray-100 dark:border-gray-700 space-y-3">
                                        {/* Subtotal row */}
                                        <div className="flex justify-between text-gray-700 dark:text-gray-300 text-sm font-medium">
                                            <span>{symbol}{price} × {nights > 0 ? nights : 1} night{nights !== 1 && 's'}</span>
                                            <span className="font-bold">{symbol}{subtotalDisplay}</span>
                                        </div>

                                        {/* Discount row (only when active) */}
                                        {discountPercent > 0 && (
                                            <div className="flex justify-between text-sm font-medium text-green-600 dark:text-green-400">
                                                <span className="flex items-center gap-1.5">
                                                    <Tag size={13} /> Discount ({discountPercent}%)
                                                </span>
                                                <span className="font-bold">−{symbol}{discountDisplay}</span>
                                            </div>
                                        )}

                                        {/* Tax row */}
                                        <div className="flex justify-between text-gray-500 dark:text-gray-400 text-sm font-medium">
                                            <span>Taxes & fees (18% GST)</span>
                                            <span className="font-bold text-gray-700 dark:text-gray-300">{symbol}{taxDisplay}</span>
                                        </div>

                                        {/* Total row */}
                                        <div className="flex justify-between font-extrabold text-gray-900 dark:text-white text-lg border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
                                            <span>Total</span>
                                            <span>{symbol}{finalDisplay}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Photo Lightbox Modal */}
            {lightboxOpen && home.images && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
                    {/* Close button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-6 right-6 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all backdrop-blur-sm"
                    >
                        <X size={28} />
                    </button>

                    {/* Image counter */}
                    <div className="absolute top-6 left-6 z-50 text-white/80 font-bold text-lg bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full">
                        {lightboxIndex + 1} / {home.images.length}
                    </div>

                    {/* Previous button */}
                    {home.images.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            className="absolute left-4 md:left-8 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all backdrop-blur-sm"
                        >
                            <ChevLeft size={32} />
                        </button>
                    )}

                    {/* Main image */}
                    <div className="max-w-[90vw] max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={home.images[lightboxIndex]}
                            alt={`Photo ${lightboxIndex + 1}`}
                            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl select-none"
                            draggable={false}
                        />
                    </div>

                    {/* Next button */}
                    {home.images.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            className="absolute right-4 md:right-8 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all backdrop-blur-sm"
                        >
                            <ChevRight size={32} />
                        </button>
                    )}

                    {/* Thumbnail strip */}
                    {home.images.length > 1 && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-2 overflow-x-auto max-w-[90vw] px-4 py-2 bg-black/40 backdrop-blur-md rounded-2xl">
                            {home.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                                    className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${idx === lightboxIndex ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-80'}`}
                                >
                                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Share Modal ─────────────────────────── */}
            {shareOpen && (
                <ShareModal url={shareUrl} onClose={() => setShareOpen(false)} />
            )}
        </div>
    );
}

export default HomeDetails;