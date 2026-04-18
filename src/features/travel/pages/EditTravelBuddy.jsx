import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import API from "../../../services/api";
import {
    Compass, Calendar, Tag, Sparkles, X, Check,
    Users, MapPin, Globe, Camera, Trash2,
    Smile, Heart, Zap, User, Star, Loader2, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const INTEREST_OPTIONS = [
    "Trekking", "Photography", "Food", "Culture", "Music",
    "Adventure", "Camping", "Cycling", "Wildlife", "Backpacking",
];

const LANGUAGE_OPTIONS = [
    "Hindi", "English", "Tamil", "Telugu", "Kannada", "Marathi", "Bengali", "Gujarati", "Punjabi"
];

const TRAVEL_STYLES = ["Backpacker", "Budget", "Comfort", "Luxury", "Adventure"];
const GENDER_PREFS = ["Any", "Male only", "Female only", "Mixed"];
const GROUP_SIZES = ["1", "2", "3", "4", "5+"];

const EditTravelBuddy = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const token = Cookies.get("token");
    const [saving, setSaving] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [step, setStep] = useState(1);
    const totalSteps = 5;
    const fileInputRef = useRef(null);

    const progress = (step / totalSteps) * 100;

    const [form, setForm] = useState({
        destination: "",
        city: "",
        start_date: "",
        end_date: "",
        budget: "",
        group_size: "1",
        description: "",
        interests: [],
        travel_style: "Backpacker",
        gender_preference: "Any",
        age_range: "",
        languages: [],
        images: [],         // new File objects to upload
        existingImages: [], // current Cloudinary URLs (display only)
    });

    // Fetch existing buddy data and pre-populate form
    useEffect(() => {
        const fetchBuddy = async () => {
            try {
                setLoadingData(true);
                const res = await API.get(`/travel-buddies/${id}`);
                const d = res.data;
                setForm({
                    destination: d.destination || "",
                    city: d.city || d.destination || "",
                    start_date: d.start_date || "",
                    end_date: d.end_date || "",
                    budget: d.budget != null ? String(d.budget) : "",
                    group_size: d.group_size || "1",
                    description: d.description || "",
                    interests: d.interests || [],
                    travel_style: d.travel_style || "Backpacker",
                    gender_preference: d.gender_preference || "Any",
                    age_range: d.age_range || "",
                    languages: d.languages || [],
                    images: [],
                    existingImages: d.images || [],
                });
            } catch (err) {
                console.error(err);
                toast.error("Failed to load listing");
                navigate("/host-dashboard");
            } finally {
                setLoadingData(false);
            }
        };
        fetchBuddy();
    }, [id, navigate]);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const toggleItem = (listName, item) => {
        set(listName, form[listName].includes(item)
            ? form[listName].filter(x => x !== item)
            : [...form[listName], item]);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const total = form.existingImages.length + form.images.length + files.length;
        if (total > 5) {
            toast.error("Maximum 5 photos allowed");
            return;
        }
        set("images", [...form.images, ...files]);
    };

    const removeNewImage = (index) => {
        set("images", form.images.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        set("existingImages", form.existingImages.filter((_, i) => i !== index));
    };

    const submit = async () => {
        if (!form.destination || !form.start_date || !form.end_date) {
            toast.error("Please fill in all required fields (Destination, Dates)");
            return;
        }

        setSaving(true);
        const formData = new FormData();

        // Text fields
        const textFields = ["destination", "city", "start_date", "end_date", "budget",
            "group_size", "description", "travel_style", "gender_preference", "age_range"];
        textFields.forEach(key => {
            if (form[key]) formData.append(key, form[key]);
        });

        // Array fields
        formData.append("interests", JSON.stringify(form.interests));
        formData.append("languages", JSON.stringify(form.languages));

        // New image files only
        form.images.forEach(img => {
            formData.append("images", img);
        });

        try {
            await API.patch(`/travel-buddies/${id}`, formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                },
                transformRequest: (data) => data
            });
            toast.success("Trip listing updated!");
            navigate("/host-dashboard");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.detail || "Failed to update trip");
        } finally {
            setSaving(false);
        }
    };

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
        else submit();
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
        else navigate("/host-dashboard");
    };

    const StepHeader = ({ label, title, subtitle }) => (
        <div className="mb-10 text-center sm:text-left">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#B3B3B3] mb-3 block">{label}</span>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight leading-none">{title}</h1>
            {subtitle && <p className="text-gray-500 font-medium text-base leading-relaxed">{subtitle}</p>}
        </div>
    );

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-8">
                        <StepHeader
                            label="Step 1 — Edit"
                            title="Where are you heading?"
                            subtitle="Update your destination and city."
                        />
                        <div className="space-y-6 mt-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Destination</label>
                                <div className="relative">
                                    <Compass className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                                    <input
                                        type="text"
                                        placeholder="e.g. Iceland Road Trip"
                                        value={form.destination}
                                        onChange={e => set("destination", e.target.value)}
                                        className="w-full pl-11 pr-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 bg-white shadow-sm transition-all text-sm font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">City (Optional)</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                                    <input
                                        type="text"
                                        placeholder="e.g. Reykjavik"
                                        value={form.city}
                                        onChange={e => set("city", e.target.value)}
                                        className="w-full pl-11 pr-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 bg-white shadow-sm transition-all text-sm font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-10">
                        <StepHeader
                            label="Step 2 — Edit"
                            title="Dates & Logistics"
                            subtitle="Update when you're going and how big your squad is."
                        />
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Start Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                                        <input
                                            type="date"
                                            value={form.start_date}
                                            onChange={e => set("start_date", e.target.value)}
                                            className="w-full pl-11 pr-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 bg-white shadow-sm transition-all text-sm font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">End Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                                        <input
                                            type="date"
                                            value={form.end_date}
                                            onChange={e => set("end_date", e.target.value)}
                                            className="w-full pl-11 pr-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 bg-white shadow-sm transition-all text-sm font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Budget (Optional)</label>
                                    <div className="relative">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                                        <input
                                            type="number"
                                            placeholder="e.g. 50000"
                                            value={form.budget}
                                            onChange={e => set("budget", e.target.value)}
                                            className="w-full pl-11 pr-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 bg-white shadow-sm transition-all text-sm font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Looking for (Travelers)</label>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                                        <select
                                            value={form.group_size}
                                            onChange={e => set("group_size", e.target.value)}
                                            className="w-full pl-11 pr-10 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 bg-white shadow-sm transition-all text-sm font-bold appearance-none cursor-pointer"
                                        >
                                            {GROUP_SIZES.map(s => <option key={s} value={s}>{s === "5+" ? "5 or more" : `${s} traveler${s === "1" ? "" : "s"}`}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-8">
                        <StepHeader
                            label="Step 3 — Edit"
                            title="Trip Preferences"
                            subtitle="Update the trip style and your ideal companions."
                        />
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Description</label>
                                <textarea
                                    rows={3}
                                    placeholder="Looking for someone who loves hiking and exploring hidden lagoons..."
                                    value={form.description}
                                    onChange={e => set("description", e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-xl py-4 px-5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all resize-none shadow-sm"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Travel Style</label>
                                    <select
                                        value={form.travel_style}
                                        onChange={e => set("travel_style", e.target.value)}
                                        className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 bg-white shadow-sm transition-all text-sm font-bold cursor-pointer"
                                    >
                                        {TRAVEL_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Gender Preference</label>
                                    <select
                                        value={form.gender_preference}
                                        onChange={e => set("gender_preference", e.target.value)}
                                        className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 bg-white shadow-sm transition-all text-sm font-bold cursor-pointer"
                                    >
                                        {GENDER_PREFS.map(p => <option key={p} value={p.toLowerCase()}>{p}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Age Range (Optional)</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                                        <input
                                            type="text"
                                            placeholder="e.g. 20-30"
                                            value={form.age_range}
                                            onChange={e => set("age_range", e.target.value)}
                                            className="w-full pl-11 pr-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 bg-white shadow-sm transition-all text-sm font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Select Interests</label>
                                    <div className="flex flex-wrap gap-2 py-1">
                                        {INTEREST_OPTIONS.slice(0, 4).map(i => (
                                            <button
                                                key={i} type="button" onClick={() => toggleItem("interests", i)}
                                                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase border-2 transition-all ${form.interests.includes(i) ? "bg-orange-500 text-white border-orange-500 shadow-sm" : "bg-white text-gray-400 border-gray-100"}`}
                                            >
                                                {i}
                                            </button>
                                        ))}
                                        <span className="text-[9px] font-bold text-gray-400 self-center">+ More in search</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-10">
                        <StepHeader
                            label="Step 4 — Edit"
                            title="Languages"
                            subtitle="What languages are you comfortable communicating in?"
                        />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
                            {LANGUAGE_OPTIONS.map(lang => (
                                <button
                                    key={lang}
                                    type="button"
                                    onClick={() => toggleItem("languages", lang)}
                                    className={`
                                        group relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all
                                        ${form.languages.includes(lang)
                                            ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20 scale-[1.02]"
                                            : "bg-white border-gray-100 text-gray-500 hover:border-orange-200 hover:bg-orange-50/30"}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${form.languages.includes(lang) ? "bg-white/20" : "bg-gray-100"}`}>
                                            {lang[0]}
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-wider">{lang}</span>
                                    </div>
                                    {form.languages.includes(lang) && <Check size={14} strokeWidth={4} />}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-8">
                        <StepHeader
                            label="Step 5 — Edit"
                            title="Trip Photos"
                            subtitle="Add or remove photos for your trip listing (max 5 total)."
                        />
                        <div className="space-y-6">
                            {/* Existing photos */}
                            {form.existingImages.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">Current Photos</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                        {form.existingImages.map((url, i) => (
                                            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-white shadow-md">
                                                <img src={url} className="w-full h-full object-cover" alt="existing" />
                                                <button
                                                    onClick={() => removeExistingImage(i)}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload new */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="group border-2 border-dashed border-gray-200 rounded-[2rem] p-12 flex flex-col items-center justify-center gap-4 hover:border-orange-500 hover:bg-orange-50/30 transition-all cursor-pointer bg-white"
                            >
                                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                    <Camera size={32} />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Click to add more photos</p>
                                    <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-tighter">PNG, JPG — {5 - form.existingImages.length - form.images.length} slot(s) remaining</p>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </div>

                            {form.images.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">New Photos to Upload</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                        {form.images.map((img, i) => (
                                            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-orange-200 shadow-md">
                                                <img
                                                    src={URL.createObjectURL(img)}
                                                    className="w-full h-full object-cover"
                                                    alt="preview"
                                                />
                                                <button
                                                    onClick={() => removeNewImage(i)}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
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

            <div className="min-h-[450px] flex flex-col justify-center">
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
                    disabled={saving}
                    className={`px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${saving ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-700 shadow-xl shadow-orange-500/20 active:scale-95'}`}
                >
                    {saving ? "Saving..." : (step === totalSteps ? "Save Changes" : "Next")}
                </button>
            </div>
        </div>
    );
};

export default EditTravelBuddy;
