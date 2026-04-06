import { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../../services/api";
import Cookies from "js-cookie";

import { 
    Star, MapPin, Users, Wifi, Coffee, Utensils, 
    ArrowLeft, Image as ImageIcon, MessageSquare, 
    X, ChevronLeft, ChevronRight, Share2, 
    ShieldCheck, Moon, Sofa, DoorOpen, Globe, Heart, Info, Clock, AlertCircle,
    Trash2, LayoutDashboard
} from "lucide-react";
import { useHost } from "../../../context/HostContext";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

const getAmenityIcon = (amenity) => {
    const a = amenity.toLowerCase();
    if (a.includes("wifi")) return <Wifi size={20} />;
    if (a.includes("breakfast") || a.includes("coffee")) return <Coffee size={20} />;
    if (a.includes("kitchen")) return <Utensils size={20} />;
    return <Star size={20} />;
};

const getStayTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
        case "couch": return <Sofa size={20} />;
        case "shared": return <Users size={20} />;
        case "private": return <DoorOpen size={20} />;
        default: return <Moon size={20} />;
    }
};

export default function CrashpadDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pad, setPad] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    
    // Auth
    const token = Cookies.get("token");
    const user = token ? jwtDecode(token) : null;
    const isOwner = user?.user_id === pad?.host_id || user?.id === pad?.host_id;
    const { isHost, refreshHostStatus } = useHost();

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    const fetchData = useCallback(async () => {
        try {
            const res = await API.get(`/crashpads/${id}`);
            setPad(res.data);
        } catch (err) {
            console.error("Failed to load crashpad", err);
            setError("Unable to load crashpad details.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Track View Analytics
    useEffect(() => {
        if (id) {
            API.post(`/crashpads/${id}/view`).catch(err => {
                console.error("Analytics tracking failed", err);
            });
        }
    }, [id]);

    // Sync host status if viewing own listing
    useEffect(() => {
        if (isOwner && !isHost) {
            console.log("Detecting host status from ownership, refreshing...");
            refreshHostStatus();
        }
    }, [isOwner, isHost, refreshHostStatus]);

    const openLightbox = (index) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await API.delete(`/crashpads/${id}`);
            toast.success("Listing deleted successfully!");
            navigate("/host/dashboard");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to delete listing");
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Accessing Community Stay...</p>
            </div>
        );
    }

    if (error || !pad) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl max-w-md w-full">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Stay Not Found</h2>
                    <p className="text-gray-500 font-medium mb-8 leading-relaxed">{error || "This crashpad might have been moved or removed."}</p>
                    <button 
                        onClick={() => navigate('/crashpads')} 
                        className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-700 transition-all active:scale-95 shadow-xl shadow-orange-500/20"
                    >
                        Return to Explore
                    </button>
                </div>
            </div>
        );
    }

    const { 
        title, description, stay_type, location, 
        host_bio, interests = [], languages = [],
        max_guests, max_nights, house_rules = [], 
        preferences = [], is_free, price_per_night,
        images = [], host_details
    } = pad;

    return (
        <div className="bg-[#F8FAFC] dark:bg-gray-950 min-h-screen pb-24 transition-all animate-fade-in font-sans">
            {/* Gallery Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <header className="mb-8">
                    <div className="flex items-center justify-between mb-8">
                        <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-gray-900 text-gray-500 hover:text-orange-500 rounded-full transition-all active:scale-95 shadow-sm border border-gray-100 dark:border-gray-800">
                            <ArrowLeft size={20} strokeWidth={2.5} />
                        </button>
                        <div className="flex gap-2">
                            <button className="p-3 bg-white dark:bg-gray-900 text-gray-500 hover:text-orange-500 rounded-full transition-all active:scale-95 shadow-sm border border-gray-100 dark:border-gray-800">
                                <Share2 size={20} strokeWidth={2.5} />
                            </button>
                            {isOwner && (
                                <>
                                    <button 
                                        onClick={() => navigate("/host/dashboard")}
                                        className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-full transition-all active:scale-95 shadow-lg shadow-orange-500/20 font-black text-[10px] uppercase tracking-widest hover:bg-orange-700"
                                    >
                                        <LayoutDashboard size={16} /> Manage Listing
                                    </button>
                                    <button 
                                        onClick={() => setShowDeleteModal(true)}
                                        className="p-3 bg-red-50 dark:bg-red-900/10 text-red-600 hover:bg-red-600 hover:text-white rounded-full transition-all active:scale-95 shadow-sm border border-red-100 dark:border-red-900/50"
                                    >
                                        <Trash2 size={20} strokeWidth={2.5} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <span className="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border border-orange-200 dark:border-orange-800/50">
                            {stay_type} Community Stay
                        </span>
                        <h1 className="text-4xl sm:text-6xl font-black text-[#0f0f0f] dark:text-white mt-4 mb-3 tracking-tighter leading-none italic">{title}</h1>
                        <div className="flex items-center gap-2 text-gray-500 font-bold">
                            <MapPin size={18} className="text-orange-500" />
                            <span className="underline decoration-orange-500/30 underline-offset-4 decoration-2">
                                {location?.address_line}, {location?.city}, {location?.state}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Image Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 aspect-[16/11] md:aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl relative mb-16 ring-1 ring-black/5 dark:ring-white/5">
                    <div className="md:col-span-2 row-span-2 cursor-pointer group relative" onClick={() => openLightbox(0)}>
                        <img src={images[0] || "https://images.unsplash.com/photo-1555854817-5b2337a93d83?q=80&w=2070&auto=format&fit=crop"} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all duration-500" />
                    </div>
                    <div className="hidden md:block cursor-pointer group relative" onClick={() => openLightbox(1)}>
                        <img src={images[1] || "https://images.unsplash.com/photo-1536633390841-3310705f32cb?q=80&w=2000&auto=format&fit=crop"} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all" />
                    </div>
                    <div className="hidden md:block cursor-pointer group relative" onClick={() => openLightbox(2)}>
                        <img src={images[2] || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop"} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all" />
                    </div>
                    <div className="hidden md:block cursor-pointer group relative" onClick={() => openLightbox(3)}>
                        <img src={images[3] || "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=2070&auto=format&fit=crop"} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all" />
                    </div>
                    <div className="hidden md:block cursor-pointer group relative" onClick={() => openLightbox(4)}>
                        <img src={images[4] || "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=2070&auto=format&fit=crop"} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all" />
                    </div>

                    <button onClick={() => openLightbox(0)} className="absolute bottom-8 right-8 bg-[#0f0f0f] border border-gray-800 text-white font-black px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 hover:scale-105 hover:bg-black transition-all text-xs uppercase tracking-widest ring-8 ring-white/5 active:scale-95">
                        <ImageIcon size={20} /> Show All Photos
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Left side */}
                    <div className="lg:col-span-2 space-y-16">
                        <section className="border-b border-gray-100 dark:border-gray-900 pb-12">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black text-[#0f0f0f] dark:text-white tracking-tight italic">Hosted by {host_details?.name || "Community Member"}</h2>
                                    <div className="flex flex-wrap gap-3 font-bold text-gray-500">
                                        {[
                                            { icon: Users, label: `${max_guests} Guests` },
                                            { icon: Moon, label: `${max_nights} Nights Max` },
                                            { icon: Globe, label: languages[0] || "English" }
                                        ].map((stat, i) => (
                                            <div key={i} className="flex items-center gap-2.5 bg-white dark:bg-gray-900 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-tight shadow-sm border border-gray-50 dark:border-gray-800">
                                                <stat.icon size={18} className="text-orange-500" /> {stat.label}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="w-24 h-24 rounded-[2rem] bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0 border-4 border-white dark:border-gray-800 shadow-2xl relative">
                                    {host_details?.profile_image ? (
                                        <img src={host_details.profile_image} className="w-full h-full object-cover rounded-[2rem]" alt="Host" />
                                    ) : (
                                        <Users size={40} className="text-orange-500" />
                                    )}
                                    <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white p-1.5 rounded-full border-4 border-white dark:border-gray-800 shadow-lg">
                                        <ShieldCheck size={16} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[50px] -z-0 group-hover:bg-orange-500/10 transition-colors" />
                                <h3 className="flex items-center gap-2 text-[11px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest relative z-10">
                                    <Info size={16} /> About this community stay
                                </h3>
                                <p className="text-2xl text-gray-700 dark:text-gray-300 leading-relaxed font-black tracking-tight italic whitespace-pre-wrap relative z-10">
                                    {description || "A cozy community stay waiting for a traveler like you."}
                                </p>
                            </div>
                        </section>

                        <section className="space-y-10">
                            <h3 className="text-3xl font-black text-[#0f0f0f] dark:text-white uppercase tracking-tighter italic">Stay Amenities</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {["Fast Wifi", "Kitchen Access", "Morning Coffee", "Clean Linens"].map((amenity, i) => (
                                    <div key={i} className="flex items-center gap-5 text-gray-700 dark:text-gray-300 group p-2 rounded-2xl hover:bg-white dark:hover:bg-gray-900 transition-all duration-300">
                                        <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-all text-orange-600 dark:text-orange-400 group-hover:scale-110 group-hover:rotate-6">
                                            {getAmenityIcon(amenity)}
                                        </div>
                                        <span className="text-xl font-black italic tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity">{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Host Bio Section */}
                        <section className="pt-12 border-t border-gray-100 dark:border-gray-900">
                            <div className="flex flex-col md:flex-row gap-16">
                                <div className="md:w-1/3">
                                    <h3 className="text-3xl font-black text-[#0f0f0f] dark:text-white uppercase tracking-tighter mb-8 italic">Meet your host</h3>
                                    <div className="bg-[#0f0f0f] dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl text-center relative overflow-hidden">
                                         <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-orange-500/20 to-transparent" />
                                         <div className="w-28 h-28 rounded-full bg-orange-100 mx-auto mb-6 border-4 border-white shrink-0 overflow-hidden shadow-2xl relative z-10">
                                            {host_details?.profile_image ? (
                                                <img src={host_details.profile_image} className="w-full h-full object-cover" alt="Host" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-orange-500">
                                                    {(host_details?.name || "H").charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                         </div>
                                         <h4 className="text-2xl font-black text-white relative z-10 italic tracking-tighter leading-none">{host_details?.name}</h4>
                                         <div className="mt-3 flex justify-center gap-1.5 relative z-10">
                                            <span className="bg-orange-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">Verified</span>
                                            <span className="bg-white/10 text-white/70 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">Host</span>
                                         </div>
                                         <div className="mt-8 pt-8 border-t border-white/10 flex justify-center gap-8 relative z-10">
                                            <div className="text-center">
                                                <p className="text-2xl font-black text-white italic">{host_details?.trust_score || 95}%</p>
                                                <p className="text-[9px] text-white/50 font-black uppercase tracking-widest">Trust Index</p>
                                            </div>
                                         </div>
                                    </div>
                                </div>
                                <div className="md:w-2/3 flex flex-col justify-center space-y-8">
                                    <p className="text-2xl text-gray-700 dark:text-gray-300 font-bold italic leading-relaxed tracking-tight">
                                        "{host_bio || "I'm excited to host fellow travelers and share my home with the global community!"}"
                                    </p>
                                    <div className="flex flex-wrap gap-2.5">
                                        {interests.map(interest => (
                                            <span key={interest} className="px-5 py-2.5 bg-white dark:bg-gray-900 rounded-2xl text-[11px] font-black text-gray-700 dark:text-gray-300 border border-gray-50 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-900 transition-all flex items-center gap-2.5 uppercase tracking-tight shadow-sm cursor-default">
                                                <Heart size={14} className="text-orange-500 fill-orange-500" /> {interest}
                                            </span>
                                        ))}
                                    </div>
                                    <button className="w-fit text-orange-600 font-black text-sm uppercase tracking-widest border-b-4 border-orange-500/20 hover:border-orange-500 transition-all pb-1 active:scale-95">
                                        Message Host
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Location */}
                        {isLoaded && location.lat && (
                            <section className="space-y-8 pt-12 border-t border-gray-100 dark:border-gray-900">
                                <h3 className="text-3xl font-black text-[#0f0f0f] dark:text-white uppercase tracking-tighter italic">Where you'll be crashed</h3>
                                <div className="h-[500px] w-full rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-900 relative group">
                                    <GoogleMap
                                        mapContainerStyle={{ width: '100%', height: '100%' }}
                                        center={{ lat: location.lat, lng: location.lng }}
                                        zoom={14}
                                        options={{
                                            disableDefaultUI: true,
                                            zoomControl: true,
                                            styles: [
                                                { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#747474" }] },
                                                { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#f3f3f3" }] }
                                            ]
                                        }}
                                    >
                                        <Marker 
                                            position={{ lat: location.lat, lng: location.lng }}
                                            icon={{
                                                path: google.maps.SymbolPath.CIRCLE,
                                                fillColor: '#f97316',
                                                fillOpacity: 1,
                                                strokeWeight: 4,
                                                strokeColor: '#ffffff',
                                                scale: 10,
                                            }}
                                        />
                                    </GoogleMap>
                                    <div className="absolute top-6 left-6 bg-[#0f0f0f] text-white px-5 py-3 rounded-2xl shadow-2xl text-[10px] font-black uppercase tracking-widest border border-gray-800 flex items-center gap-3">
                                        <MapPin size={16} className="text-orange-500" /> Precise Location Verified
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-5 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-50 dark:border-gray-800 shadow-sm">
                                    <Info size={20} className="text-orange-500 shrink-0" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tight leading-relaxed">
                                        Exact address and check-in instructions provided after your stay request is accepted by the host.
                                    </p>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right side: Booking Card */}
                    <div className="relative">
                        <div className="sticky top-32 bg-white dark:bg-gray-900 border border-gray-50 dark:border-gray-800 p-10 rounded-[3rem] shadow-[0_30px_80px_-15px_rgba(249,115,22,0.1)] dark:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)] space-y-10 group">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Average Nightly</p>
                                    {is_free ? (
                                        <span className="text-6xl font-black text-[#0f0f0f] dark:text-white tracking-tighter italic leading-none">FREE</span>
                                    ) : (
                                        <div className="flex items-end gap-1.5">
                                            <span className="text-6xl font-black text-[#0f0f0f] dark:text-white tracking-tighter italic leading-none">₹{price_per_night}</span>
                                            <span className="text-sm font-black text-gray-400 mb-2">/night</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 text-right">Trust Score</p>
                                    <div className="bg-orange-500 text-white px-3 py-1 rounded-xl text-sm font-black italic shadow-lg shadow-orange-500/20 transform -rotate-3">
                                        {host_details?.trust_score || "95"}%
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[2rem] border-2 border-gray-50 dark:border-gray-800">
                                    <div className="bg-gray-50/50 dark:bg-gray-950/50 p-5 group-hover:bg-orange-50/20 transition-colors">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-[.2em] block mb-2">Check-In</label>
                                        <span className="text-sm font-black text-gray-900 dark:text-white italic tracking-tight">Select your arrival date</span>
                                    </div>
                                    <div className="bg-gray-50/50 dark:bg-gray-950/50 p-5 border-t-2 border-gray-50 dark:border-gray-800 group-hover:bg-orange-50/20 transition-colors">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-[.2em] block mb-2">Travelers</label>
                                        <span className="text-sm font-black text-gray-900 dark:text-white italic tracking-tight">1 Guest (Max {max_guests})</span>
                                    </div>
                                </div>

                                <button 
                                    className="w-full bg-[#0f0f0f] dark:bg-white text-white dark:text-gray-900 font-black py-5 rounded-[2rem] transition-all shadow-2xl shadow-black/20 text-xs uppercase tracking-[0.3em] active:scale-95 hover:shadow-orange-500/10 hover:border-orange-500 hover:border-2"
                                >
                                    Request to Stay
                                </button>
                                
                                <p className="text-center text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] py-2">Community Verification Applied</p>
                            </div>

                            <div className="pt-8 border-t border-gray-100 dark:border-gray-800 space-y-5">
                                <div className="flex items-center justify-between text-[11px] font-black text-gray-500 uppercase tracking-widest">
                                    <span className="underline decoration-orange-500/30 underline-offset-4">Community Fee</span>
                                    <span className="text-[#0f0f0f] dark:text-white">₹0</span>
                                </div>
                                <div className="flex items-center justify-between text-2xl font-black text-[#0f0f0f] dark:text-white pt-2 italic">
                                    <span>Total Value</span>
                                    <span className="text-orange-600">{is_free ? "FREE" : `₹${price_per_night}`}</span>
                                </div>
                            </div>

                            <div className="p-5 bg-orange-600 rounded-[2rem] flex items-start gap-4 shadow-xl shadow-orange-600/20 transform hover:scale-[1.02] transition-transform">
                                <ShieldCheck size={24} className="text-white shrink-0" strokeWidth={2.5} />
                                <p className="text-[9px] font-black text-white leading-relaxed uppercase tracking-[0.05em]">
                                    Each crashpad stay is protected by our <span className="underline">Member Shield</span>. We ensure trust and transparency for every community connection.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Rules Section */}
                <section className="mt-32 pt-16 border-t border-gray-100 dark:border-gray-900">
                    <div className="mb-16">
                        <h3 className="text-4xl font-black text-[#0f0f0f] dark:text-white uppercase tracking-tighter italic leading-none">House Rules &<br/>Community Guidelines</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        {[
                            { icon: Clock, title: "House Rules", items: house_rules, fallback: "Host has not listed specific rules. Always be a respectful community guest." },
                            { icon: ShieldCheck, title: "Safety & Health", items: ["Community verified stay", "Safety check applicable", "Boundary respect"], fallback: "" },
                            { icon: Heart, title: "Preferences", items: preferences, fallback: "No specific host preferences listed." }
                        ].map((section, idx) => (
                            <div key={idx} className="space-y-8 p-1">
                                <h4 className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest flex items-center gap-3">
                                    <section.icon size={20} /> {section.title}
                                </h4>
                                <ul className="space-y-5">
                                    {section.items?.length > 0 ? section.items.map((r, i) => (
                                        <li key={i} className="flex items-start gap-4 text-sm font-bold text-gray-600 dark:text-gray-400 leading-relaxed italic">
                                            <span className="text-orange-500 shrink-0">•</span> {r}
                                        </li>
                                    )) : (
                                        <li className="text-sm font-bold text-gray-400 dark:text-gray-600 leading-relaxed italic uppercase tracking-tighter">{section.fallback}</li>
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Lightbox placeholder logic */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl animate-fade-in flex flex-col p-8">
                    <button onClick={() => setLightboxOpen(false)} className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors">
                        <X size={32} strokeWidth={3} />
                    </button>
                    <div className="flex-1 flex items-center justify-center relative">
                        <img 
                            src={images[lightboxIndex] || "https://images.unsplash.com/photo-1555854817-5b2337a93d83?q=80&w=2070&auto=format&fit=crop"} 
                            className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl" 
                            alt="Full Preview" 
                        />
                    </div>
                    <div className="h-24 flex items-center justify-center gap-4">
                        {images.map((img, i) => (
                            <button 
                                key={i} 
                                onClick={() => setLightboxIndex(i)}
                                className={`w-16 h-16 rounded-xl overflow-hidden border-4 transition-all ${lightboxIndex === i ? 'border-orange-500 scale-110 shadow-lg shadow-orange-500/20' : 'border-transparent opacity-50 hover:opacity-100'}`}
                            >
                                <img src={img || images[0]} className="w-full h-full object-cover" alt={`Thumb ${i}`} />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in" onClick={() => !deleting && setShowDeleteModal(false)}>
                    <div 
                        className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl text-center relative z-[1001]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Delete Listing?</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed">
                            Are you sure you want to remove <span className="text-[#0f0f0f] dark:text-white font-black italic">{title}</span>? This action <span className="text-red-500 font-bold underline">cannot be undone</span>.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleDelete}
                                disabled={deleting}
                                className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95 shadow-xl shadow-red-500/20 disabled:opacity-50"
                            >
                                {deleting ? "Deleting..." : "Yes, Delete Listing"}
                            </button>
                            <button 
                                onClick={() => setShowDeleteModal(false)}
                                disabled={deleting}
                                className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
