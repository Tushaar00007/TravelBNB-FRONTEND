import React, { useState, useEffect } from "react";
import { X, Check, XCircle, MapPin, Users, BedDouble, Bath, ShieldCheck, Clock, CheckCircle2, Loader2, ChevronLeft, ChevronRight, Star, User, AlertTriangle } from "lucide-react";
import Cookies from "js-cookie";
import API from "../../../services/api";
import { toast } from "react-hot-toast";

const STATUS_COLORS = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
    approved: "bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    rejected: "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    flagged: "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
};

export default function ListingDetailsModal({ listingId, onClose, onUpdate }) {
    const [listing, setListing] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null); // 'approve' | 'reject'
    const [currentImg, setCurrentImg] = useState(0);
    const token = Cookies.get("token");

    const fetchListing = async () => {
        setLoading(true);
        try {
            const res = await API.get(`/homes/${listingId}`);
            setListing(res.data);
            fetchReviews();
        } catch (err) {
            toast.error("Failed to load listing details");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        setReviewsLoading(true);
        try {
            const res = await API.get(`/reviews/${listingId}`);
            setReviews(res.data.reviews || []);
        } catch (err) {
            console.error("Failed to load reviews:", err);
        } finally {
            setReviewsLoading(false);
        }
    };

    useEffect(() => {
        if (listingId) fetchListing();
    }, [listingId]);

    const handleApprove = async () => {
        setActionLoading("approve");
        try {
            await API.post(`/admin/listings/${listingId}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Approval recorded! 🎉");
            fetchListing();
            onUpdate();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to approve");
        } finally {
            setActionLoading(null);
        }
    };

    const handleFlag = async () => {
        if (!window.confirm("Flag this listing for safety review?")) return;
        setActionLoading("flag");
        try {
            await API.post(`/admin/listings/${listingId}/flag`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Listing flagged for review");
            fetchListing();
            onUpdate();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to flag");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!window.confirm("Are you sure you want to reject this listing?")) return;
        setActionLoading("reject");
        try {
            await API.post(`/admin/listings/${listingId}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Listing rejected");
            fetchListing();
            onUpdate();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to reject");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-gray-950 w-full max-w-4xl h-[80vh] rounded-3xl flex items-center justify-center">
                    <Loader2 className="animate-spin text-orange-500" size={40} />
                </div>
            </div>
        );
    }

    const {
        title, images = [], description, price_per_night,
        city, state, country, property_type, max_guests,
        bedrooms, bathrooms, amenities = [], status = "pending",
        approved_by = [], host_details, location
    } = listing;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-950 w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-scale-up">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Hero Gallery */}
                    <div className="relative h-96 group">
                        {images.length > 0 ? (
                            <>
                                <img
                                    src={images[currentImg]}
                                    className="w-full h-full object-cover"
                                    alt={title}
                                />
                                {images.length > 1 && (
                                    <>
                                        <button onClick={() => setCurrentImg(p => (p > 0 ? p - 1 : images.length - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 text-white rounded-full transition opacity-0 group-hover:opacity-100"><ChevronLeft /></button>
                                        <button onClick={() => setCurrentImg(p => (p < images.length - 1 ? p + 1 : 0))} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 text-white rounded-full transition opacity-0 group-hover:opacity-100"><ChevronRight /></button>
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                            {images.map((_, i) => (
                                                <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentImg ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400">No images available</div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-950/80 to-transparent" />
                        <div className="absolute bottom-6 left-8">
                            <h2 className="text-3xl font-black text-white drop-shadow-lg">{title}</h2>
                            <p className="flex items-center gap-1.5 text-gray-200 font-semibold mt-1">
                                <MapPin size={16} className="text-orange-400" /> {city}, {state}, {country}
                            </p>
                        </div>
                    </div>

                    <div className="p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-10">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">Description</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">{description}</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                {[
                                    { icon: Users, label: `${max_guests} Guests` },
                                    { icon: BedDouble, label: `${bedrooms} Bedrooms` },
                                    { icon: Bath, label: `${bathrooms} Bathrooms` },
                                    { icon: ShieldCheck, label: property_type },
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <item.icon size={20} className="text-orange-500 mb-2" />
                                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 text-center">{item.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tighter">Amenities</h3>
                                <div className="flex flex-wrap gap-2">
                                    {amenities.map(a => (
                                        <span key={a} className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 shadow-sm">
                                            {a}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Host Details Section */}
                            <div className="pt-10 border-t border-gray-100 dark:border-gray-800">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tighter flex items-center gap-2">
                                    Meet the Host
                                </h3>
                                <div className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl ring-4 ring-white dark:ring-gray-800">
                                        {host_details?.profile_image ? (
                                            <img src={host_details.profile_image} alt={host_details.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-500">
                                                <User size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-gray-900 dark:text-white">{host_details?.name || "Premium Host"}</h4>
                                        <p className="text-gray-500 font-bold">Fast response & Verified ID</p>
                                    </div>
                                </div>
                            </div>

                            {/* Map/Location Section */}
                            <div className="pt-10 border-t border-gray-100 dark:border-gray-800">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tighter">Location</h3>
                                <div className="rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 h-[300px] relative bg-gray-200 dark:bg-gray-800">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        scrolling="no"
                                        marginHeight="0"
                                        marginWidth="0"
                                        src={`https://maps.google.com/maps?q=${location?.lat || 20.5937},${location?.lng || 78.9629}&z=15&output=embed`}
                                        className="filter grayscale dark:invert-[0.9] dark:hue-rotate-180"
                                    ></iframe>
                                    <div className="absolute bottom-6 left-6 px-4 py-2 bg-white dark:bg-gray-950/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 flex items-center gap-2">
                                        <MapPin size={16} className="text-orange-500" />
                                        <span className="text-xs font-black uppercase text-gray-900 dark:text-white tracking-widest">{city}, {state}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Reviews Section */}
                            <div className="pt-10 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Reviews</h3>
                                    <div className="flex items-center gap-2 text-orange-500 font-black">
                                        <Star size={20} fill="currentColor" />
                                        <span>{reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : "0.0"}</span>
                                        <span className="text-gray-400 text-sm font-bold">({reviews.length} reviews)</span>
                                    </div>
                                </div>

                                {reviewsLoading ? (
                                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" /></div>
                                ) : reviews.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                                        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No reviews yet for this listing</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {reviews.map(r => (
                                            <div key={r._id} className="p-6 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400">
                                                        {r.user?.profileImage ? <img src={r.user.profileImage} className="w-full h-full object-cover" /> : <User size={18} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900 dark:text-white">{r.user?.firstName || "Guest"}</p>
                                                        <div className="flex text-orange-500">
                                                            {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < r.rating ? "currentColor" : "none"} />)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed font-medium">"{r.comment}"</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar: Approval Actions */}
                        <div className="space-y-6">
                            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 sticky top-8">
                                <div className="text-center mb-8">
                                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Current Status</p>
                                    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider border ${STATUS_COLORS[status]}`}>
                                        {status}
                                    </span>
                                </div>

                                <div className="space-y-4 mb-10">
                                    <div className="flex justify-between items-end mb-2">
                                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Verification Progress</p>
                                        <p className="text-sm font-black text-orange-500">{approved_by.length} / 1</p>
                                    </div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-700"
                                            style={{ width: `${(Math.min(approved_by.length, 1) / 1) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold italic leading-tight">1 admin approval is required to make this property live for users.</p>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Clock size={14} className="text-orange-500" /> Action Panel
                                    </h4>

                                    <button
                                        onClick={handleApprove}
                                        disabled={actionLoading || status === "approved"}
                                        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95"
                                    >
                                        {actionLoading === "approve" ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                                        {status === "approved" ? "ALREADY APPROVED" : "RECORD APPROVAL"}
                                    </button>

                                    <button
                                        onClick={handleReject}
                                        disabled={actionLoading || status === "rejected"}
                                        className="w-full flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-500 dark:text-gray-400 hover:text-red-600 transition-all py-4 rounded-2xl font-black text-sm"
                                    >
                                        {actionLoading === "reject" ? <Loader2 className="animate-spin" /> : <XCircle size={18} />}
                                        REJECT LISTING
                                    </button>

                                    <button
                                        onClick={handleFlag}
                                        disabled={actionLoading || status === "flagged"}
                                        className="w-full flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition-all py-3 rounded-2xl font-black text-xs uppercase"
                                    >
                                        {actionLoading === "flag" ? <Loader2 className="animate-spin" size={14} /> : <AlertTriangle size={14} />}
                                        FLAG FOR REVIEW
                                    </button>
                                </div>

                                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Pricing</p>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white">₹{price_per_night}<span className="text-xs font-bold text-gray-500 ml-1">/ night</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
