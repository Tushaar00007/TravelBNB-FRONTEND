import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import API from "../../../services/api";
import { useHost } from "../../../context/HostContext";
import { 
    Compass, Calendar, Tag, Sparkles, X, Check, 
    Users, MapPin, Globe, Camera, Trash2, 
    Smile, Heart, Zap, User, Star
} from "lucide-react";
import CreationLayout from "../../../components/layout/CreationLayout";
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

const CreateTravelBuddy = () => {
    const navigate = useNavigate();
    const token = Cookies.get("token");
    const { refreshHostStatus } = useHost();
    const [saving, setSaving] = useState(false);
    const [step, setStep] = useState(1);
    const totalSteps = 5;
    const fileInputRef = useRef(null);

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
        images: []
    });

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const toggleItem = (listName, item) => {
        set(listName, form[listName].includes(item)
            ? form[listName].filter(x => x !== item)
            : [...form[listName], item]);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (form.images.length + files.length > 5) {
            toast.error("Maximum 5 photos allowed");
            return;
        }
        set("images", [...form.images, ...files]);
    };

    const removeImage = (index) => {
        set("images", form.images.filter((_, i) => i !== index));
    };

    const submit = async () => {
        if (!form.destination || !form.start_date || !form.end_date) {
            toast.error("Please fill in all required fields (Destination, Dates)");
            return;
        }

        setSaving(true);
        const formData = new FormData();
        
        // Append all text fields
        Object.keys(form).forEach(key => {
            if (key !== "images" && key !== "interests" && key !== "languages") {
                if (form[key]) formData.append(key, form[key]);
            }
        });

        // Append stringified arrays
        formData.append("interests", JSON.stringify(form.interests));
        formData.append("languages", JSON.stringify(form.languages));

        // Append images
        form.images.forEach(img => {
            formData.append("images", img);
        });

        try {
            await API.post("/travel-buddies/", formData, {
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                },
                // Prevent axios from interfering with multipart boundaries
                transformRequest: (data) => data 
            });
            
            await refreshHostStatus();
            toast.success("Trip posted successfully!");
            navigate("/travel-buddy");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.detail || "Failed to post trip");
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
    };

    // Sub-components
    const StepHeader = ({ label, title, subtitle }) => (
        <div className="mb-10 text-center sm:text-left">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#B3B3B3] mb-3 block">{label}</span>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">{title}</h1>
            {subtitle && <p className="text-gray-500 font-medium text-base leading-relaxed">{subtitle}</p>}
        </div>
    );

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-8">
                        <StepHeader 
                            label="Step 1" 
                            title="Where are you heading?" 
                            subtitle="Choose a destination and city for your next big adventure." 
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
                            label="Step 2" 
                            title="Dates & Logistics" 
                            subtitle="When are you going and how big is your squad?" 
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
                            label="Step 3" 
                            title="Trip Preferences" 
                            subtitle="Tell us about the trip style and your ideal companions." 
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
                            label="Step 4" 
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
                            label="Step 5" 
                            title="Trip Photos" 
                            subtitle="Upload up to 5 photos to make your trip listing stand out." 
                        />
                        <div className="space-y-6">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="group border-2 border-dashed border-gray-200 rounded-[2rem] p-12 flex flex-col items-center justify-center gap-4 hover:border-orange-500 hover:bg-orange-50/30 transition-all cursor-pointer bg-white"
                            >
                                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                    <Camera size={32} />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Click to upload photos</p>
                                    <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-tighter">Support for PNG, JPG (Max 5)</p>
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
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                    {form.images.map((img, i) => (
                                        <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-white shadow-md">
                                            <img 
                                                src={URL.createObjectURL(img)} 
                                                className="w-full h-full object-cover" 
                                                alt="preview" 
                                            />
                                            <button 
                                                onClick={() => removeImage(i)}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <CreationLayout
            currentStep={step}
            totalSteps={totalSteps}
            onBack={prevStep}
            onNext={nextStep}
            nextLabel={step === totalSteps ? (saving ? "Posting..." : "Finish Trip") : "Next Step"}
            loading={saving}
            saveAndExitPath="/travel-buddy"
        >
            <div className="min-h-[450px] flex flex-col justify-center py-4">
                {renderStepContent()}
            </div>
        </CreationLayout>
    );
};

export default CreateTravelBuddy;
