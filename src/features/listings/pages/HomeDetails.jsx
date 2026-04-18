import { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";
import { format, differenceInDays } from "date-fns";
import { toast } from "react-hot-toast";
import { 
    Star, MapPin, Users, Wifi, Coffee, Utensils, 
    ArrowLeft, Image as ImageIcon, MessageSquare, 
    X, Heart, Info, BedDouble, Bath, Share2
} from "lucide-react";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
import API from "../../../services/api";
import { CurrencyContext } from "../../../context/CurrencyContext";
import { convertCurrency } from "../../../utils/convertCurrency";
import { usePropertyDetails, useReviews } from "../hooks/useProperties";

// Components
import BookingPanel from "../components/BookingPanel";
import ListingGallery from "../components/ListingGallery";
import ReviewCard from "../../../components/ReviewCard";
import ShareModal from "../../../components/ShareModal";
import ReportModal from "../../auth/components/ReportModal";

// Constants
const GST_RATE = 0.18;
const VALID_COUPONS = {
    "WELCOME10": { discount: 10, label: "10% Welcome Discount" },
    "TRAVELBNB": { discount: 15, label: "15% Special Discount" },
    "EXPLORE10": { discount: 10, label: "10% Explorer Discount" }
};

const getAmenityIcon = (amenity) => {
    const a = amenity.toLowerCase();
    if (a.includes("wifi")) return <Wifi size={20} />;
    if (a.includes("breakfast") || a.includes("coffee")) return <Coffee size={20} />;
    if (a.includes("kitchen")) return <Utensils size={20} />;
    return <Star size={20} />;
};

function HomeDetails() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();

    // TanStack Query Hooks
    const { 
        data: home, 
        isLoading: homeLoading, 
        error: homeError 
    } = usePropertyDetails(id);

    const { 
        data: reviewsData, 
        isLoading: reviewsLoading,
        refetch: refetchReviews
    } = useReviews(id);

    const reviews = reviewsData?.reviews || [];
    const averageRating = reviewsData?.averageRating || 0;
    const totalReviews = reviewsData?.totalReviews || 0;

    // Booking States
    const [checkIn, setCheckIn] = useState(null);
    const [checkOut, setCheckOut] = useState(null);
    const [guests, setGuestCount] = useState(1);
    const [isRequesting, setIsRequesting] = useState(false);
    const [highlightDates, setHighlightDates] = useState(false);

    // Coupon / Discount States
    const [couponInput, setCouponInput] = useState("");
    const [discountPercent, setDiscountPercent] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponMsg, setCouponMsg] = useState(null); 

    // UI States
    const [shareOpen, setShareOpen] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [liked, setLiked] = useState(false);

    // Review Form States (Transactional)
    const [reviewFormOpen, setReviewFormOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState(null);

    // Image/Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Host info state
    const [hostInfo, setHostInfo] = useState(null);

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

    const currentUserId = Cookies.get("userId");
    const isAuthenticated = !!currentUserId;
    const { currency, exchangeRate } = useContext(CurrencyContext);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    useEffect(() => {
        if (!home?.host_id) return;
        API.get(`/auth/user/${home.host_id}`)
            .then(res => setHostInfo(res.data))
            .catch(err => console.error(err));
    }, [home?.host_id]);

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

    const nights = (checkIn && checkOut) ? differenceInDays(checkOut, checkIn) : 0;
    const basePrice = home?.price_per_night || 0;
    const subtotalRaw = nights > 0 ? nights * basePrice : basePrice;
    const discountAmt = subtotalRaw * (discountPercent / 100);
    const afterDiscount = subtotalRaw - discountAmt;
    const taxAmt = afterDiscount * GST_RATE;
    const finalTotal = afterDiscount + taxAmt;

    const symbol = currency === 'USD' ? '$' : '₹';
    const price = convertCurrency(basePrice, currency, exchangeRate);
    const subtotalDisplay = convertCurrency(subtotalRaw, currency, exchangeRate);
    const discountDisplay = convertCurrency(discountAmt, currency, exchangeRate);
    const taxDisplay = convertCurrency(taxAmt, currency, exchangeRate);
    const finalDisplay = convertCurrency(finalTotal, currency, exchangeRate);

    const shareUrl = `${window.location.origin}/homes/${home?._id}`;

    async function handleRequestToBook() {
        const hostId = home?.host_id;
        const propertyId = home?._id;
        const propertyName = home?.title;
        const hostName = hostInfo?.name || "Host";

        if (!checkIn || !checkOut) {
            toast.error("Please select check-in and check-out dates first");
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
            const res = await API.post('/bookings/request', {
                property_id: String(propertyId),
                host_id: String(hostId),
                guest_id: String(currentUserId),
                check_in: checkIn.toISOString(),
                check_out: checkOut.toISOString(),
                guests: parseInt(guests),
                total_price: finalTotal,
                status: 'pending'
            });

            const bookingRequestId = res.data.booking_request_id;
            await API.post('/messages/send', {
                sender_id: String(currentUserId),
                recipient_id: String(hostId),
                message: `Hi! I would like to request a booking for your property from ${format(checkIn, 'MMM d')} to ${format(checkOut, 'MMM d')} for ${guests} guest(s). Total: ₹${finalTotal.toLocaleString()}. Booking Request ID: #${bookingRequestId}`,
                booking_request_id: String(bookingRequestId),
                booking_status: 'pending',
                property_id: String(propertyId),
                property_name: propertyName,
            });

            toast.success("Booking request sent! Redirecting to messages...");
            setTimeout(() => {
                navigate(`/messages?host=${hostId}&request=${bookingRequestId}&property_id=${propertyId}&property_name=${encodeURIComponent(propertyName)}&hostName=${encodeURIComponent(hostName)}`);
            }, 1500);
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to send request.");
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
            await API.post("/reviews/", {
                propertyId: home._id,
                rating: reviewRating,
                comment: reviewComment
            });
            setReviewComment("");
            setReviewRating(5);
            setReviewFormOpen(false);
            toast.success("Review posted!");
            refetchReviews();
        } catch (err) {
            setReviewError(err.response?.data?.detail || "Failed to post review.");
        } finally {
            setReviewLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        const loadingToast = toast.loading("Deleting review...");
        try {
            await API.delete(`/reviews/${reviewId}`);
            toast.success("Review deleted", { id: loadingToast });
            refetchReviews();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to delete review", { id: loadingToast });
        }
    };

    if (homeLoading || reviewsLoading) return (
        <div className="flex flex-col items-center justify-center pt-32 min-h-screen">
            <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Loading property details...</p>
        </div>
    );

    if (homeError || !home) return (
        <div className="flex flex-col items-center justify-center pt-32 px-4 text-center min-h-screen">
            <div className="bg-red-50 p-8 rounded-2xl border border-red-200 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-3 text-red-600">Property not found</h2>
                <button onClick={() => navigate('/')} className="mt-4 bg-orange-600 text-white px-6 py-2 rounded-xl font-bold">Return Home</button>
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-900 min-h-screen pb-24 transition-colors font-sans">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-orange-600 rounded-xl transition font-bold">
                            <ArrowLeft size={18} /> Back
                        </button>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setLiked(l => !l)}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:scale-105 active:scale-95 transition font-bold text-sm"
                            >
                                <Heart
                                    size={16}
                                    className={liked ? "fill-red-500 text-red-500" : "text-gray-500"}
                                />
                                {liked ? "Saved" : "Save"}
                            </button>
                            <button
                                onClick={() => setShareOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:scale-105 active:scale-95 transition font-bold text-sm"
                            >
                                <Share2 size={16} className="text-gray-500" />
                                Share
                            </button>
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">{home.title}</h1>
                    <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                        <div className="flex items-center gap-1.5 text-orange-600">
                             <Star size={16} className="fill-current" />
                             <span>{totalReviews > 0 ? `${averageRating} (${totalReviews} reviews)` : "New Listing"}</span>
                        </div>
                        <span className="flex items-center gap-1.5 underline">
                            <MapPin size={18} /> {home.city}, {home.state}
                        </span>
                    </div>
                </div>

                <ListingGallery 
                    images={home.images} 
                    openLightbox={openLightbox}
                    lightboxOpen={lightboxOpen}
                    closeLightbox={closeLightbox}
                    prevImage={prevImage}
                    nextImage={nextImage}
                    lightboxIndex={lightboxIndex}
                />

                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12 mt-12">
                    <div className="space-y-10">
                        <div className="border-b pb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                Hosted by {hostInfo?.name || "TravelBNB Host"}
                            </h2>
                            <ul className="flex flex-wrap gap-6 text-gray-700 dark:text-gray-300 font-medium">
                                <li className="flex items-center gap-2"><Users size={20} /> {home.max_guests} guests</li>
                                <li className="flex items-center gap-2"><BedDouble size={20} /> {home.bedrooms} bedrooms</li>
                                <li className="flex items-center gap-2"><Bath size={20} /> {home.bathrooms} baths</li>
                            </ul>
                        </div>

                        <div className="border-b pb-8">
                            <h3 className="text-xl font-bold mb-4">About this place</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{home.description}</p>
                        </div>

                        <div className="border-b pb-8">
                            <h3 className="text-xl font-bold mb-6">What this place offers</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {home.amenities?.map((amenity, idx) => (
                                    <div key={idx} className="flex items-center gap-4 text-gray-800 dark:text-gray-200">
                                        <div className="bg-orange-50 dark:bg-gray-800 p-3 rounded-xl text-orange-600">{getAmenityIcon(amenity)}</div>
                                        <span>{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Location Map */}
                        {home.location?.lat && (
                            <div className="border-b pb-8">
                                <h3 className="text-xl font-bold mb-6">Where you'll be</h3>
                                <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-inner border bg-gray-100">
                                    {isLoaded ? (
                                        <GoogleMap
                                            mapContainerStyle={{ width: '100%', height: '100%' }}
                                            center={home.location}
                                            zoom={14}
                                        >
                                            <Marker position={home.location} />
                                        </GoogleMap>
                                    ) : <div>Loading Map...</div>}
                                </div>
                            </div>
                        )}

                        {/* Reviews */}
                        <div className="pt-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Star className="text-orange-600 fill-orange-600" />
                                    {totalReviews > 0 ? `${averageRating} · ${totalReviews} reviews` : "No reviews yet"}
                                </h3>
                                {isAuthenticated && !reviews.some(r => r.userId === currentUserId) && (
                                    <button onClick={() => setReviewFormOpen(!reviewFormOpen)} className="text-orange-600 font-bold underline">Write a review</button>
                                )}
                            </div>

                            {reviewFormOpen && (
                                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-3xl mb-8 border transition-all">
                                    <h4 className="font-bold mb-4">Leave your feedback</h4>
                                    <div className="flex gap-2 mb-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button key={star} onClick={() => setReviewRating(star)} className={reviewRating >= star ? 'text-orange-500' : 'text-gray-300'}>
                                                <Star className={reviewRating >= star ? 'fill-current' : ''} />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="How was your stay?" className="w-full p-4 rounded-xl border dark:bg-gray-700 dark:text-white outline-none mb-3 min-h-[100px]"></textarea>
                                    {reviewError && <div className="text-red-500 text-sm mb-4">{reviewError}</div>}
                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => setReviewFormOpen(false)} className="px-6 py-2 text-gray-500">Cancel</button>
                                        <button onClick={handleCreateReview} disabled={reviewLoading} className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold disabled:opacity-50">Post Review</button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {reviews.map((review, rIdx) => (
                                    <ReviewCard 
                                        key={review._id || `review-${rIdx}`} 
                                        review={review} 
                                        currentUserId={currentUserId} 
                                        onDelete={handleDeleteReview} 
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <BookingPanel 
                        price={price} symbol={symbol} currency={currency}
                        checkIn={checkIn} setCheckIn={setCheckIn}
                        checkOut={checkOut} setCheckOut={setCheckOut}
                        guests={guests} setGuestCount={setGuestCount}
                        maxGuests={home.max_guests}
                        nights={nights}
                        subtotalDisplay={subtotalDisplay}
                        discountDisplay={discountDisplay}
                        taxDisplay={taxDisplay}
                        finalDisplay={finalDisplay}
                        couponInput={couponInput}
                        setCouponInput={setCouponInput}
                        couponMsg={couponMsg}
                        appliedCoupon={appliedCoupon}
                        handleApplyCoupon={handleApplyCoupon}
                        handleRemoveCoupon={handleRemoveCoupon}
                        handleRequestToBook={handleRequestToBook}
                        isRequesting={isRequesting}
                        highlightDates={highlightDates}
                    />
                </div>
            </div>

            <ShareModal isOpen={shareOpen} url={shareUrl} onClose={() => setShareOpen(false)} />
            <ReportModal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} reportedUserId={home?.host_id} />
        </div>
    );
}

export default HomeDetails;