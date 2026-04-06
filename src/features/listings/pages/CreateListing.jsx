import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Home, Building, Coffee, Warehouse, DoorOpen, Hotel, Landmark, 
    Users, Bed, Bath, Plus, Minus, Camera, X, Check, Search,
    Wifi, Snowflake, Car, Tv, Briefcase, Waves, Dumbbell, Utensils,
    Globe, ShieldCheck, Anchor, Tent, Wind, Trees,
    Castle, Tractor, Box, Leaf, Mountain, AlertCircle, 
    MapPin, Navigation, Info, Heart
} from "lucide-react";

import API from "../../../services/api";
import CreationLayout from "../../../components/layout/CreationLayout";
import { useHost } from "../../../context/HostContext";
import LocationStep from "../../crashpads/components/LocationStep";
import ImageUpload from "../../crashpads/components/ImageUpload";
import { toast } from "react-hot-toast";
import { geocodeAddress } from "../../../services/maps";

const propertyTypes = [
    { label: "House", icon: Home },
    { label: "Flat", icon: Building },
    { label: "Cabin", icon: Warehouse },
    { label: "Hotel", icon: Hotel },
    { label: "Guest house", icon: DoorOpen },
    { label: "Farm", icon: Tractor },
    { label: "Villa", icon: Landmark },
    { label: "Tree house", icon: Trees },
    { label: "Container", icon: Box },
];

const amenityOptions = [
    { label: "WiFi", icon: Wifi },
    { label: "Air Conditioning", icon: Snowflake },
    { label: "Kitchen", icon: Utensils },
    { label: "Free Parking", icon: Car },
    { label: "TV", icon: Tv },
    { label: "Workspace", icon: Briefcase },
    { label: "Pool", icon: Waves },
    { label: "Gym", icon: Dumbbell },
];

const safetyOptions = [
    { label: "Smoke alarm", icon: AlertCircle },
    { label: "First aid kit", icon: Heart },
    { label: "Fire extinguisher", icon: ShieldCheck },
];

export default function CreateListing() {
    const navigate = useNavigate();
    const token = Cookies.get("token");
    const { refreshHostStatus } = useHost();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState("");
    const [geocoding, setGeocoding] = useState(false);
    const [geocodeError, setGeocodeError] = useState("");
    const geocodedForStep = useRef(null); // track which step we last geocoded for
    
    // State for ImageUpload component
    const [images, setImages] = useState([]);

    const [formData, setFormData] = useState({
        type: "",
        location: {
            address_line: "",
            city: "",
            state: "",
            country: "INDIA",
            pincode: "",
            lat: null,
            lng: null,
            flat_suite: "",
            street: "",
            landmark: "",
            locality: ""
        },
        lat: null, // Duplicated here for easier access as per user req
        lng: null,
        guests: 1,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        amenities: [],
        safety: [],
        title: "",
        description: "",
        is_free: true,
        price_per_night: 0
    });

    useEffect(() => {
        if (!token) navigate("/login");
    }, [token, navigate]);

    // ─── Geocode when Step 3 mounts ────────────────────────────────────────────
    // CreateListing jumps straight to step 3 without going through LocationStep's
    // internal handleNextToMap(), so geocoding would never run. We do it here.
    useEffect(() => {
        if (step !== 3) return;

        // Don't re-geocode if we already did it and the location hasn't changed
        const locKey = `${formData.location.flat_suite}|${formData.location.street}|${formData.location.city}|${formData.location.pincode}`;
        if (geocodedForStep.current === locKey) return;

        const loc = formData.location;

        // Build the most precise address string possible from all Step 2 fields
        const fullAddress = [
            loc.flat_suite,
            loc.street,
            loc.landmark,
            loc.locality,
            loc.city,
            loc.state,
            loc.pincode,
            loc.country
        ].filter(Boolean).join(", ");

        if (!fullAddress.trim()) return;

        setGeocoding(true);
        setGeocodeError("");

        geocodeAddress(fullAddress)
            .then((result) => {
                if (result && result.lat && result.lng) {
                    set("location", {
                        ...formData.location,
                        lat: result.lat,
                        lng: result.lng,
                        address: result.formatted_address || fullAddress
                    });
                    geocodedForStep.current = locKey;
                } else {
                    // Fallback: try city-level geocode
                    const fallbackAddress = [loc.city, loc.state, loc.country].filter(Boolean).join(", ");
                    return geocodeAddress(fallbackAddress).then((fallback) => {
                        if (fallback && fallback.lat && fallback.lng) {
                            set("location", {
                                ...formData.location,
                                lat: fallback.lat,
                                lng: fallback.lng,
                                address: fullAddress // keep original address text
                            });
                            setGeocodeError("Could not find exact location. Please drag the pin to your property.");
                            geocodedForStep.current = locKey;
                        } else {
                            setGeocodeError("Could not find exact location. Please drag the pin to your property.");
                        }
                    });
                }
            })
            .catch(() => {
                // If we already have PIN-code coordinates from Step 2 auto-fill, use them
                if (!formData.location.lat || !formData.location.lng) {
                    setGeocodeError("Could not locate address. Please drag the pin to your property.");
                } else {
                    // We have coords from pincode lookup — populate address field at minimum
                    if (!formData.location.address) {
                        set("location", {
                            ...formData.location,
                            address: fullAddress
                        });
                    }
                }
            })
            .finally(() => {
                setGeocoding(false);
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step]);

    const set = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleMultiSelect = (field, item) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(item)
                ? prev[field].filter(i => i !== item)
                : [...prev[field], item]
        }));
    };

    const isStepValid = () => {
        switch (step) {
            case 1: return !!formData.type;
            case 2: return !!formData.location.city && !!formData.location.pincode;
            case 3: return !!formData.location.lat && !!formData.location.lng;
            case 4: return formData.guests > 0;
            case 5: return true; // Amenities optional
            case 6: return true; // Safety optional
            case 7: 
                const isTitleValid = /^[A-Za-z\s]+$/.test(formData.title) && formData.title.length <= 50;
                const isDescValid = formData.description.length >= 20;
                return isTitleValid && isDescValid;
            case 8: return images.length > 0;
            case 9: return formData.is_free || formData.price_per_night > 0;
            default: return true;
        }
    };

    const handleNext = async () => {
        if (step === 2) {
            if (!formData.location.city || !formData.location.pincode) {
                setGlobalError("Please fill in at least the City and PIN Code fields.");
                return;
            }
            setGlobalError("");
            setGeocodeError("");
            geocodedForStep.current = null; // reset so geocoding re-runs on Step 3
            setStep(3);
            return;
        }

        if (step < 9) {
            setStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setGlobalError("");
        try {
            const fd = new FormData();
            
            // Basic Info
            fd.append("title", formData.title);
            fd.append("description", formData.description);
            fd.append("property_type", formData.type);
            
            // Location
            fd.append("city", formData.location.city.toUpperCase());
            fd.append("state", formData.location.state.toUpperCase());
            fd.append("country", formData.location.country.toUpperCase());
            fd.append("pincode", formData.location.pincode);
            fd.append("lat", formData.location.lat);
            fd.append("lng", formData.location.lng);
            fd.append("address", formData.location.address || `${formData.location.street}, ${formData.location.locality}, ${formData.location.city}`);
            
            // Capacity & Rooms
            fd.append("max_guests", formData.guests);
            fd.append("bedrooms", formData.bedrooms);
            fd.append("beds", formData.beds);
            fd.append("bathrooms", formData.bathrooms);
            
            // Features (JSON strings for Form data)
            fd.append("amenities", JSON.stringify(formData.amenities));
            fd.append("safety_features", JSON.stringify(formData.safety));
            
            // Pricing
            fd.append("is_free", formData.is_free);
            fd.append("price_per_night", formData.price_per_night);

            // Images - we now send a JSON string of URLs
            fd.append("image_urls", JSON.stringify(images.map(img => img.url)));

            // Point to the correct /homes endpoint
            await API.post("/homes/", fd, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            
            toast.success("Home listing published successfully!");
            await refreshHostStatus();
            navigate("/host/dashboard");
        } catch (err) {
            setGlobalError(err.response?.data?.detail || "Failed to create listing.");
        } finally {
            setLoading(false);
        }
    };

    // Sub-components
    const StepHeader = ({ title, subtitle }) => (
        <div className="mb-10 text-center sm:text-left">
            <span className="text-[11px] font-black uppercase tracking-widest text-orange-500 mb-3 block">Step {step} of 9</span>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tighter leading-none italic">{title}</h1>
            {subtitle && <p className="text-gray-500 font-medium text-base leading-relaxed italic">{subtitle}</p>}
        </div>
    );

    const SelectionCard = ({ active, onClick, icon: Icon, title }) => (
        <button
            onClick={onClick}
            className={`
                flex items-center gap-5 p-6 rounded-2xl border-2 text-left transition-all duration-300
                ${active 
                    ? 'border-orange-500 bg-orange-50/50 ring-4 ring-orange-500/5 shadow-lg shadow-orange-500/5' 
                    : 'border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 bg-white'}
            `}
        >
            <div className={`p-3 rounded-xl transition-all ${active ? 'bg-orange-500 text-white scale-110 rotate-3 shadow-md' : 'bg-gray-50 text-gray-400'}`}>
                <Icon size={24} />
            </div>
            <span className={`font-black text-lg italic ${active ? 'text-orange-600' : 'text-gray-900'}`}>{title}</span>
            {active && <Check size={20} className="ml-auto text-orange-600" strokeWidth={3} />}
        </button>
    );

    const Counter = ({ label, value, onIncrease, onDecrease, min = 1, icon: Icon }) => (
        <div className="flex items-center justify-between py-6 border-b border-gray-100 h-20 last:border-0 px-2 group">
            <div className="flex items-center gap-4">
                {Icon && <div className="text-gray-400 group-hover:text-orange-500 transition-colors"><Icon size={20} /></div>}
                <span className="font-bold text-gray-700 italic">{label}</span>
            </div>
            <div className="flex items-center gap-5">
                <button 
                    onClick={onDecrease}
                    disabled={value <= min}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-900 hover:border-orange-500 hover:bg-orange-50 transition-all font-black disabled:opacity-30 disabled:border-gray-100"
                >
                    <Minus size={18} />
                </button>
                <span className="w-6 text-center text-lg font-black text-gray-900 tabular-nums">{value}</span>
                <button 
                    onClick={onIncrease}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-900 hover:border-orange-500 hover:bg-orange-50 transition-all font-black"
                >
                    <Plus size={18} />
                </button>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <StepHeader 
                            title="Which of these best describes your place?" 
                            subtitle="Choose the most accurate category for your property." 
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {propertyTypes.map(t => (
                                <SelectionCard 
                                    key={t.label} 
                                    active={formData.type === t.label} 
                                    onClick={() => set("type", t.label)} 
                                    icon={t.icon} 
                                    title={t.label} 
                                />
                            ))}
                        </div>
                    </div>
                );
            case 2:
                // Reuse LocationStep sub-step A logic
                return (
                    <div className="space-y-6">
                        <LocationStep 
                            value={formData.location} 
                            onChange={(loc) => set("location", loc)}
                            forcedSubStep="A"
                            hideHeader={true}
                        />
                    </div>
                );
            case 3:
                // Show Map Pin specifically
                return (
                    <div className="space-y-6 h-full">
                        <StepHeader 
                            title="Is the pin in the right spot?" 
                            subtitle="Drag the map to position the pin exactly over your entrance." 
                        />

                        {/* Geocoding in-progress spinner overlay */}
                        {geocoding && (
                            <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-2xl text-orange-700 text-xs font-bold animate-pulse">
                                <Navigation size={16} className="animate-spin" />
                                Finding your exact location on the map...
                            </div>
                        )}

                        {/* Geocoding failed fallback message */}
                        {!geocoding && geocodeError && (
                            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 text-xs font-bold">
                                <MapPin size={16} />
                                {geocodeError}
                            </div>
                        )}

                        {/* Only render map once we have coordinates */}
                        {formData.location.lat && formData.location.lng ? (
                            <LocationStep 
                                value={formData.location} 
                                onChange={(loc) => set("location", loc)}
                                forcedSubStep="B"
                                hideHeader={true}
                            />
                        ) : !geocoding ? (
                            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 gap-3">
                                <MapPin size={32} strokeWidth={1.5} />
                                <p className="text-sm font-bold">Could not determine coordinates.</p>
                                <p className="text-xs">Go back and double-check your address fields.</p>
                            </div>
                        ) : null}
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-8">
                        <StepHeader 
                            title="Share some basics about your place" 
                            subtitle="You'll add more details later, like bed types." 
                        />
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-gray-500/5">
                            <Counter label="Guests" value={formData.guests} onIncrease={() => set("guests", formData.guests + 1)} onDecrease={() => set("guests", formData.guests - 1)} icon={Users} />
                            <Counter label="Bedrooms" value={formData.bedrooms} onIncrease={() => set("bedrooms", formData.bedrooms + 1)} onDecrease={() => set("bedrooms", formData.bedrooms - 1)} icon={Home} />
                            <Counter label="Beds" value={formData.beds} onIncrease={() => set("beds", formData.beds + 1)} onDecrease={() => set("beds", formData.beds - 1)} icon={Bed} />
                            <Counter label="Bathrooms" value={formData.bathrooms} onIncrease={() => set("bathrooms", formData.bathrooms + 1)} onDecrease={() => set("bathrooms", formData.bathrooms - 1)} icon={Bath} />
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6">
                        <StepHeader 
                            title="Tell guests what your place has to offer" 
                            subtitle="Select the amenities available at your stay." 
                        />
                        <div className="grid grid-cols-2 gap-4">
                            {amenityOptions.map(amn => (
                                <button
                                    key={amn.label}
                                    onClick={() => toggleMultiSelect("amenities", amn.label)}
                                    className={`
                                        flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-300 gap-3 text-center
                                        ${formData.amenities.includes(amn.label)
                                            ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-inner' 
                                            : 'border-gray-100 hover:border-orange-200 bg-white text-gray-500'}
                                    `}
                                >
                                    <amn.icon size={32} strokeWidth={1.5} className={formData.amenities.includes(amn.label) ? "text-orange-500" : "text-gray-400"} />
                                    <span className="font-black text-sm uppercase tracking-widest">{amn.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-6">
                        <StepHeader 
                            title="Do you have any of these safety items?" 
                            subtitle="Safety features help travelers feel secure." 
                        />
                        <div className="grid grid-cols-1 gap-4">
                            {safetyOptions.map(s => (
                                <SelectionCard 
                                    key={s.label} 
                                    active={formData.safety.includes(s.label)} 
                                    onClick={() => toggleMultiSelect("safety", s.label)} 
                                    icon={s.icon} 
                                    title={s.label} 
                                />
                            ))}
                        </div>
                    </div>
                );
            case 7:
                return (
                    <div className="space-y-8">
                        <StepHeader 
                            title="Now, let's describe your place" 
                            subtitle="Share what makes your stay special and give it a catchy title." 
                        />
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Title</label>
                                <input 
                                    type="text"
                                    placeholder="e.g. Modern Studio in South Delhi"
                                    value={formData.title}
                                    onChange={e => set("title", e.target.value)}
                                    maxLength={50}
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-orange-500 focus:outline-none bg-white transition-all text-xl font-black italic shadow-sm"
                                />
                                <div className="text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {formData.title.length}/50
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Description</label>
                                <textarea
                                    rows={8}
                                    placeholder="Tell travelers about your neighborhood, the bed, local spots..."
                                    value={formData.description}
                                    onChange={e => set("description", e.target.value)}
                                    className="w-full px-6 py-5 rounded-3xl border-2 border-gray-100 focus:border-orange-500 focus:outline-none bg-white transition-all text-base font-medium leading-relaxed resize-none shadow-sm"
                                />
                                <div className="flex justify-between items-center px-1">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${formData.description.length >= 20 ? 'text-green-500' : 'text-orange-400'}`}>
                                        {formData.description.length >= 20 ? "Perfect!" : "Min 20 characters"}
                                    </span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        {formData.description.length} chars
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 8:
                return (
                    <div className="space-y-6">
                        <StepHeader 
                            title="Add some photos of your place" 
                            subtitle="Upload up to 5 photos. Travelers love to see where they'll stay." 
                        />
                        <ImageUpload images={images} setImages={setImages} maxFiles={5} />
                    </div>
                );
            case 9:
                return (
                    <div className="space-y-10">
                        <StepHeader 
                            title="Finally, set your price" 
                            subtitle="Is this stay free for the community, or do you have a nightly fee?" 
                        />
                        
                        <div className="space-y-8">
                            <div className="flex items-center justify-between p-6 bg-white rounded-3xl border-2 border-gray-100 shadow-sm">
                                <div>
                                    <h3 className="font-black text-lg italic tracking-tight">Free Stay</h3>
                                    <p className="text-sm text-gray-500 font-medium">Hosting for the love of travel</p>
                                </div>
                                <button 
                                    onClick={() => set("is_free", !formData.is_free)}
                                    className={`w-14 h-8 rounded-full transition-all relative ${formData.is_free ? 'bg-orange-500' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.is_free ? 'left-7 shadow-md' : 'left-1'}`} />
                                </button>
                            </div>

                            {!formData.is_free && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4">Price Per Night (₹)</label>
                                    <div className="relative">
                                        <div className="absolute left-8 top-1/2 -translate-y-1/2 text-4xl font-black text-gray-900 italic">₹</div>
                                        <input 
                                            type="number"
                                            placeholder="0"
                                            value={formData.price_per_night}
                                            onChange={e => set("price_per_night", e.target.value)}
                                            className="w-full pl-16 pr-8 py-8 rounded-[2.5rem] border-4 border-gray-100 focus:border-orange-500 focus:outline-none bg-white transition-all text-5xl font-black italic shadow-xl"
                                        />
                                    </div>
                                    <p className="text-center text-gray-400 text-xs font-bold italic">Suggested: ₹499 - ₹999 for community stays</p>
                                </motion.div>
                            )}
                            
                            <div className="p-6 bg-orange-50 rounded-3xl flex items-start gap-4 border border-orange-100">
                                <Info className="text-orange-500 mt-1 shrink-0" size={20} />
                                <p className="text-xs text-orange-800 font-medium leading-relaxed italic">
                                    You can change your price or switch to free hosting at any time from your dashboard. Most hosts start with a lower price to build trust scores.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const nextLabel = step === 9 ? (loading ? "Publishing..." : "Publish Stay") : "Next";

    return (
        <CreationLayout 
            currentStep={step} 
            totalSteps={9} 
            onBack={() => setStep(s => Math.max(1, s - 1))} 
            onNext={handleNext}
            nextLabel={nextLabel}
            loading={loading}
            disableNext={!isStepValid()}
        >
            <div className="min-h-[450px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
                
                {globalError && (
                    <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-shake">
                        <AlertCircle size={16} />
                        {globalError}
                    </div>
                )}
            </div>
        </CreationLayout>
    );
}
