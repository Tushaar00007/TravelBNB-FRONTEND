import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import API from "../../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useHost } from "../../../context/HostContext";

import {
    Users, Plus, Minus, MapPin, 
    LayoutGrid, FileText, Sofa, DoorOpen, X, Check, ImagePlus, AlertCircle, Loader2, ArrowLeft
} from "lucide-react";
import LocationStep from "../../crashpads/components/LocationStep";
import ImageUpload from "../../crashpads/components/ImageUpload";
import toast from "react-hot-toast";

const EditCrashpad = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const token = Cookies.get("token");
    const { refreshHostStatus } = useHost();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [globalError, setGlobalError] = useState("");
    const [validationErrors, setValidationErrors] = useState({});
    const [step, setStep] = useState(1);
    const [locationSubStep, setLocationSubStep] = useState("A"); 
    const [images, setImages] = useState([]);
    const totalSteps = 5;

    const progress = (step / totalSteps) * 100;

    const [form, setForm] = useState({
        title: "",
        description: "",
        city: "",
        state: "",
        country: "INDIA",
        pincode: "",
        lat: null,
        lng: null,
        address: "",
        flat: "",
        street: "",
        landmark: "",
        locality: "",
        host_bio: "",
        interests: [],
        languages: [],
        stay_type: "couch",
        max_guests: 1,
        max_nights: 3,
        house_rules: [],
        preferences: [],
        is_free: true,
        price_per_night: 0
    });

    useEffect(() => {
        const fetchCrashpad = async () => {
            try {
                setLoading(true);
                const res = await API.get(`/crashpads/${id}`);
                const data = res.data;
                
                // Map API data to form state
                setForm({
                    title: data.title || "",
                    description: data.description || "",
                    city: data.location?.city || "",
                    state: data.location?.state || "",
                    country: data.location?.country || "INDIA",
                    pincode: data.location?.pincode || "",
                    lat: data.location?.lat || null,
                    lng: data.location?.lng || null,
                    address: data.location?.address_line || "",
                    flat: data.location?.flat_suite || "",
                    street: data.location?.street || "",
                    landmark: data.location?.landmark || "",
                    locality: data.location?.district || "",
                    host_bio: data.host_bio || "",
                    interests: data.interests || [],
                    languages: data.languages || [],
                    stay_type: data.stay_type || "couch",
                    max_guests: data.max_guests || 1,
                    max_nights: data.max_nights || 3,
                    house_rules: data.house_rules || [],
                    preferences: data.preferences || [],
                    is_free: data.hasOwnProperty('is_free') ? data.is_free : true,
                    price_per_night: data.price_per_night || 0
                });

                // Map images for ImageUpload component
                if (data.images && Array.isArray(data.images)) {
                    setImages(data.images.map(url => ({
                        url,
                        id: Math.random().toString(36).substr(2, 9)
                    })));
                } else if (data.image) {
                    setImages([{
                        url: data.image,
                        id: Math.random().toString(36).substr(2, 9)
                    }]);
                }
            } catch (err) {
                console.error("Error fetching crashpad:", err);
                toast.error("Failed to load crashpad details");
                navigate("/host-dashboard");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCrashpad();
        }
    }, [id, navigate]);

    const set = (k, v) => {
        setForm(f => ({ ...f, [k]: v }));
        if (validationErrors[k]) {
            setValidationErrors(prev => {
                const next = { ...prev };
                delete next[k];
                return next;
            });
        }
    };

    const validateField = (name, value) => {
        let error = "";
        if (name === "title") {
            const titleRegex = /^[A-Za-z\s]+$/;
            if (!value) error = "Title is required";
            else if (!titleRegex.test(value)) error = "Title can only contain letters (no numbers or symbols)";
        }
        if (name === "description") {
            if (!value) error = "Description is required";
            else if (value.length < 20) error = "Description must be at least 20 characters";
        }
        if (name === "host_bio") {
            if (value && value.length > 200) error = "Host bio cannot exceed 200 characters";
            else if (!value) error = "Host bio is required";
        }
        
        setValidationErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    const isStepValid = () => {
        if (step === 1) return !!form.stay_type;
        if (step === 2) return !!form.lat && !!form.lng;
        if (step === 3) return form.max_guests > 0 && form.max_nights > 0;
        if (step === 4) {
            const isTitleValid = /^[A-Za-z\s]+$/.test(form.title);
            const isDescValid = form.description.length >= 20;
            const isBioValid = !!form.host_bio && form.host_bio.length <= 200;
            return isTitleValid && isDescValid && isBioValid;
        }
        if (step === 5) return images.length > 0;
        return true;
    };

    const submit = async () => {
        if (!isStepValid()) {
            setGlobalError("Please fix the validation errors before submitting.");
            return;
        }

        setSaving(true);
        setGlobalError("");
        try {
            const payload = {
                title: form.title,
                description: form.description,
                stay_type: form.stay_type,
                location: {
                    city: form.city?.toUpperCase(),
                    state: form.state?.toUpperCase(),
                    country: form.country?.toUpperCase() || "INDIA",
                    pincode: form.pincode,
                    lat: form.lat,
                    lng: form.lng,
                    address_line: form.address || `${form.street}, ${form.locality}, ${form.city}, ${form.state}`,
                    flat_suite: form.flat,
                    landmark: form.landmark,
                    district: form.locality?.toUpperCase()
                },
                host_bio: form.host_bio,
                max_guests: form.max_guests,
                max_nights: form.max_nights,
                is_free: form.is_free,
                price_per_night: form.price_per_night,
                interests: form.interests || [],
                languages: form.languages || [],
                house_rules: form.house_rules || [],
                preferences: form.preferences || [],
                images: images.map(img => img.url)
            };

            await API.patch(`/crashpads/${id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            await refreshHostStatus();
            toast.success("Crashpad updated successfully!");
            navigate("/host-dashboard");
        } catch (err) {
            setGlobalError(err.response?.data?.detail || "Something went wrong.");
            toast.error("Failed to update crashpad");
        } finally {
            setSaving(false);
        }
    };

    const nextStep = () => {
        setGlobalError("");
        if (step === 4) {
            const t = validateField("title", form.title);
            const d = validateField("description", form.description);
            const b = validateField("host_bio", form.host_bio);
            if (!t || !d || !b) return;
        }

        if (step === 2) {
            if (locationSubStep === "A") {
                set("triggerNext", true);
                return; 
            }
            if (locationSubStep === "B" && !form.lat) {
                setGlobalError("Please confirm your location on the map.");
                return;
            }
        }

        if (step < totalSteps) setStep(step + 1);
        else submit();
    };

    const prevStep = () => {
        setGlobalError("");
        if (step === 2 && locationSubStep === "B") {
            setLocationSubStep("A");
            return;
        }
        if (step === 1) {
            navigate("/host-dashboard");
            return;
        }
        if (step > 1) setStep(step - 1);
    };

    const StepHeader = ({ label, title, subtitle }) => (
        <div className="mb-10 text-center sm:text-left">
            <span className="text-[11px] font-black uppercase tracking-widest text-orange-500 mb-3 block">{label}</span>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight leading-none">{title}</h1>
            {subtitle && <p className="text-gray-500 font-medium text-base leading-relaxed">{subtitle}</p>}
        </div>
    );

    const SelectionCard = ({ active, onClick, icon: Icon, title }) => (
        <button
            onClick={onClick}
            className={`
                flex items-center gap-5 p-6 rounded-2xl border-2 text-left transition-all duration-300
                ${active 
                    ? 'border-orange-500 bg-orange-50/50 ring-4 ring-orange-500/5' 
                    : 'border-gray-100 hover:border-orange-200 hover:bg-orange-50/30'}
            `}
        >
            <div className={`p-3 rounded-xl transition-all ${active ? 'bg-orange-500 text-white scale-110 rotate-3 shadow-lg shadow-orange-500/20' : 'bg-gray-50 text-gray-400'}`}>
                <Icon size={24} />
            </div>
            <span className={`font-black text-lg ${active ? 'text-orange-600' : 'text-gray-900'}`}>{title}</span>
            {active && <Check size={20} className="ml-auto text-orange-600" />}
        </button>
    );

    const Stepper = ({ label, value, onIncrease, onDecrease, min = 1, icon: Icon }) => (
        <div className="flex items-center justify-between py-6 border-b border-gray-100 h-20 last:border-0 px-2 group">
            <div className="flex items-center gap-4">
                {Icon && <div className="text-gray-400 group-hover:text-orange-500 transition-colors"><Icon size={20} /></div>}
                <span className="font-bold text-gray-700">{label}</span>
            </div>
            <div className="flex items-center gap-5">
                <button 
                    onClick={onDecrease}
                    disabled={value <= min}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-900 hover:border-orange-500 hover:bg-orange-50 transition-all font-black disabled:opacity-30 disabled:border-gray-100"
                >
                    <Minus size={18} />
                </button>
                <span className="w-6 text-center text-lg font-black text-gray-900">{value}</span>
                <button 
                    onClick={onIncrease}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-900 hover:border-orange-500 hover:bg-orange-50 transition-all font-black"
                >
                    <Plus size={18} />
                </button>
            </div>
        </div>
    );

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <StepHeader 
                            label="Phase 1" 
                            title="Edit stay type" 
                            subtitle="Update how you'll be hosting fellow travelers." 
                        />
                        <div className="grid grid-cols-1 gap-4">
                            <SelectionCard active={form.stay_type === "couch"} onClick={() => set("stay_type", "couch")} icon={Sofa} title="Couch" />
                            <SelectionCard active={form.stay_type === "shared"} onClick={() => set("stay_type", "shared")} icon={Users} title="Shared Room" />
                            <SelectionCard active={form.stay_type === "private"} onClick={() => set("stay_type", "private")} icon={DoorOpen} title="Private Room" />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <LocationStep 
                        value={form} 
                        onChange={(newVal) => setForm(newVal)}
                        onSubStepChange={(s) => setLocationSubStep(s)}
                    />
                );
            case 3:
                return (
                    <div className="space-y-8">
                        <StepHeader 
                            label="Phase 3" 
                            title="Update stay limits" 
                            subtitle="Define the guest count and duration." 
                        />
                        <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-xl shadow-gray-500/5 space-y-2">
                            <Stepper label="Guests" value={form.max_guests} onIncrease={() => set("max_guests", form.max_guests + 1)} onDecrease={() => set("max_guests", Math.max(1, form.max_guests - 1))} icon={Users} />
                            <Stepper label="Max Nights" value={form.max_nights} onIncrease={() => set("max_nights", form.max_nights + 1)} onDecrease={() => set("max_nights", Math.max(1, form.max_nights - 1))} icon={DoorOpen} />
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-8">
                        <StepHeader 
                            label="Phase 4" 
                            title="Edit listing details" 
                            subtitle="Final details to make your listing stand out." 
                        />
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Crashpad Title</label>
                                <div className="relative">
                                    <LayoutGrid className={`absolute left-4 top-1/2 -translate-y-1/2 ${validationErrors.title ? 'text-red-400' : 'text-gray-300'}`} size={18} />
                                    <input 
                                        type="text"
                                        placeholder="e.g. Cozy Central Couch"
                                        value={form.title}
                                        onChange={e => {
                                            set("title", e.target.value);
                                            validateField("title", e.target.value);
                                        }}
                                        className={`w-full pl-11 pr-5 py-4 rounded-xl border ${validationErrors.title ? 'border-red-300 focus:ring-red-500/5' : 'border-gray-200 focus:ring-orange-500/5 focus:border-orange-500'} focus:outline-none focus:ring-4 bg-white shadow-sm transition-all text-sm font-bold`}
                                    />
                                </div>
                                {validationErrors.title && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">{validationErrors.title}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Description</label>
                                <textarea
                                    rows={4}
                                    placeholder="Describe your space in a few sentences... (min 20 chars)"
                                    value={form.description}
                                    onChange={e => {
                                        set("description", e.target.value);
                                        validateField("description", e.target.value);
                                    }}
                                    className={`w-full bg-white border ${validationErrors.description ? 'border-red-300 focus:ring-red-500/5' : 'border-gray-200 focus:ring-orange-500/5 focus:border-orange-500'} rounded-xl py-4 px-5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 transition-all resize-none`}
                                />
                                {validationErrors.description && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">{validationErrors.description || "Min 20 characters required"}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Host Bio</label>
                                <div className="relative">
                                    <FileText className={`absolute left-4 top-1/2 -translate-y-1/2 ${validationErrors.host_bio ? 'text-red-400' : 'text-gray-300'}`} size={18} />
                                    <input 
                                        type="text"
                                        placeholder="Max 200 characters..."
                                        value={form.host_bio}
                                        onChange={e => {
                                            set("host_bio", e.target.value);
                                            validateField("host_bio", e.target.value);
                                        }}
                                        className={`w-full pl-11 pr-5 py-4 rounded-xl border ${validationErrors.host_bio ? 'border-red-300 focus:ring-red-500/5' : 'border-gray-200 focus:ring-orange-500/5 focus:border-orange-500'} focus:outline-none focus:ring-4 bg-white shadow-sm transition-all text-sm font-bold`}
                                    />
                                </div>
                                <div className="flex justify-between mt-1 px-1">
                                    {validationErrors.host_bio ? <p className="text-[10px] font-bold text-red-500">{validationErrors.host_bio}</p> : <div />}
                                    <p className={`text-[9px] font-black tracking-widest uppercase ${form.host_bio.length > 200 ? 'text-red-500' : 'text-gray-400'}`}>{form.host_bio.length}/200</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-8">
                        <StepHeader 
                            label="Phase 5" 
                            title="Edit photos" 
                            subtitle="Update your images. High quality photos attract 3x more travelers." 
                        />
                        <ImageUpload images={images} setImages={setImages} maxFiles={5} />
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 24px' }}>
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full mb-10 overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-orange-500"
                />
            </div>

            <div className="min-h-[400px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderStepContent()}
                    </motion.div>
                </AnimatePresence>
                
                {globalError && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold"
                    >
                        <AlertCircle size={16} className="flex-shrink-0" />
                        {globalError}
                    </motion.div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
                <button 
                    onClick={prevStep}
                    className={`flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-orange-600 transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                <button 
                    onClick={nextStep}
                    disabled={saving || !isStepValid()}
                    className={`px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${saving || !isStepValid() ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-700 shadow-xl shadow-orange-500/20 active:scale-95'}`}
                >
                    {saving ? "Saving..." : (step === totalSteps ? "Save Changes" : "Next")}
                </button>
            </div>
        </div>
    );
};


export default EditCrashpad;
