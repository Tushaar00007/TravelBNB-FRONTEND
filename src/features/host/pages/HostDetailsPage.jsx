import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Users, Bed, Bath, Plus, Minus, Check,
    Wifi, Snowflake, Car, Tv, Briefcase, Waves, Dumbbell, Utensils,
    ShieldCheck, AlertCircle, Heart, Info, Home
} from "lucide-react";

import API from "../../../services/api";
import CreationLayout from "../../../components/layout/CreationLayout";
import { useHostOnboardingStore } from "../../../shared/stores/useHostOnboardingStore";
import { useHost } from "../../../context/HostContext";
import ImageUpload from "../../crashpads/components/ImageUpload";
import { toast } from "react-hot-toast";

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

export default function HostDetailsPage() {
    const navigate = useNavigate();
    const { refreshHostStatus } = useHost();
    const { formData, images, setFormData, setImages, toggleMultiSelect, resetOnboarding } = useHostOnboardingStore();
    
    const [subStep, setSubStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState("");

    const handleNext = () => {
        if (subStep < 6) {
            setSubStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (subStep > 1) {
            setSubStep(prev => prev - 1);
        } else {
            navigate("/host/location");
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setGlobalError("");
        try {
            const token = Cookies.get("token");
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
            fd.append("address", formData.location.address || `${formData.location.street}, ${formData.location.city}`);
            
            // Capacity & Rooms
            fd.append("max_guests", formData.guests);
            fd.append("bedrooms", formData.bedrooms);
            fd.append("beds", formData.beds);
            fd.append("bathrooms", formData.bathrooms);
            
            // Features
            fd.append("amenities", JSON.stringify(formData.amenities));
            fd.append("safety_features", JSON.stringify(formData.safety));
            
            // Pricing
            fd.append("is_free", formData.is_free);
            fd.append("price_per_night", formData.price_per_night);

            // Images
            fd.append("image_urls", JSON.stringify(images.map(img => img.url)));

            await API.post("/homes/", fd, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            
            toast.success("Home listing published successfully!");
            await refreshHostStatus();
            resetOnboarding();
            navigate("/host/dashboard");
        } catch (err) {
            setGlobalError(err.response?.data?.detail || "Failed to create listing.");
        } finally {
            setLoading(false);
        }
    };

    const isStepValid = () => {
        switch (subStep) {
            case 1: return formData.guests > 0;
            case 2: return true; // Amenities optional
            case 3: return true; // Safety optional
            case 4: 
                const isTitleValid = /^[A-Za-z\s]+$/.test(formData.title) && formData.title.length <= 50 && formData.title.length > 0;
                const isDescValid = formData.description.length >= 20;
                return isTitleValid && isDescValid;
            case 5: return images.length > 0;
            case 6: return formData.is_free || formData.price_per_night > 0;
            default: return true;
        }
    };

    // Sub-components
    const StepHeader = ({ title, subtitle }) => (
        <div className="mb-10 text-center sm:text-left">
            <span className="text-[11px] font-black uppercase tracking-widest text-orange-500 mb-3 block">Step 3 of 3</span>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tighter leading-none italic">{title}</h1>
            {subtitle && <p className="text-gray-500 font-medium text-base leading-relaxed italic">{subtitle}</p>}
        </div>
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
                    type="button"
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-900 hover:border-orange-500 hover:bg-orange-50 transition-all font-black disabled:opacity-30 disabled:border-gray-100"
                >
                    <Minus size={18} />
                </button>
                <span className="w-6 text-center text-lg font-black text-gray-900 tabular-nums">{value}</span>
                <button 
                    onClick={onIncrease}
                    type="button"
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-900 hover:border-orange-500 hover:bg-orange-50 transition-all font-black"
                >
                    <Plus size={18} />
                </button>
            </div>
        </div>
    );

    const SelectionCard = ({ active, onClick, icon: Icon, title }) => (
        <button
            onClick={onClick}
            type="button"
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

    const renderContent = () => {
        switch (subStep) {
            case 1:
                return (
                    <div className="space-y-8">
                        <StepHeader 
                            title="Share some basics about your place" 
                            subtitle="You'll add more details later, like bed types." 
                        />
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-gray-500/5">
                            <Counter label="Guests" value={formData.guests} onIncrease={() => setFormData({ guests: formData.guests + 1 })} onDecrease={() => setFormData({ guests: formData.guests - 1 })} icon={Users} />
                            <Counter label="Bedrooms" value={formData.bedrooms} onIncrease={() => setFormData({ bedrooms: formData.bedrooms + 1 })} onDecrease={() => setFormData({ bedrooms: formData.bedrooms - 1 })} icon={Home} />
                            <Counter label="Beds" value={formData.beds} onIncrease={() => setFormData({ beds: formData.beds + 1 })} onDecrease={() => setFormData({ beds: formData.beds - 1 })} icon={Bed} />
                            <Counter label="Bathrooms" value={formData.bathrooms} onIncrease={() => setFormData({ bathrooms: formData.bathrooms + 1 })} onDecrease={() => setFormData({ bathrooms: formData.bathrooms - 1 })} icon={Bath} />
                        </div>
                    </div>
                );
            case 2:
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
                                    type="button"
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
            case 3:
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
            case 4:
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
                                    onChange={e => setFormData({ title: e.target.value })}
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
                                    onChange={e => setFormData({ description: e.target.value })}
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
            case 5:
                return (
                    <div className="space-y-6">
                        <StepHeader 
                            title="Add some photos of your place" 
                            subtitle="Upload up to 5 photos. Travelers love to see where they'll stay." 
                        />
                        <ImageUpload images={images} setImages={setImages} maxFiles={5} />
                    </div>
                );
            case 6:
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
                                    type="button"
                                    onClick={() => setFormData({ is_free: !formData.is_free })}
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
                                            onChange={e => setFormData({ price_per_night: e.target.value })}
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

    const nextLabel = subStep === 6 ? (loading ? "Publishing..." : "Publish Stay") : "Next";

    return (
        <CreationLayout 
            currentStep={2 + (subStep / 6)} 
            totalSteps={3} 
            onBack={handleBack} 
            onNext={handleNext}
            nextLabel={nextLabel}
            loading={loading}
            disableNext={!isStepValid()}
        >
            <div className="min-h-[450px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={subStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
                
                {globalError && (
                    <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold">
                        <AlertCircle size={16} />
                        {globalError}
                    </div>
                )}
            </div>
        </CreationLayout>
    );
}
