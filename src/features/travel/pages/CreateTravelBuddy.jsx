import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import API from "../../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useHost } from "../../../context/HostContext";

import { Compass, Calendar, Tag, Sparkles, X, Check } from "lucide-react";
import CreationLayout from "../../../components/layout/CreationLayout";

const INTEREST_OPTIONS = [
    "Trekking", "Photography", "Food", "Culture", "Music",
    "Adventure", "Camping", "Cycling", "Wildlife", "Backpacking",
];

const CreateTravelBuddy = () => {
    const navigate = useNavigate();
    const token = Cookies.get("token");
    const { refreshHostStatus } = useHost();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState(1);
    const totalSteps = 3;

    const [form, setForm] = useState({
        destination: "", 
        start_date: "", 
        end_date: "",
        budget: "", 
        description: "", 
        interests: [],
    });

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const toggleInterest = (i) => {
        set("interests", form.interests.includes(i)
            ? form.interests.filter(x => x !== i)
            : [...form.interests, i]);
    };

    const submit = async () => {
        if (!form.destination || !form.start_date || !form.end_date) {
            setError("Destination, start date and end date are required.");
            return;
        }
        setSaving(true);
        try {
            await API.post("/travel-buddies/", {
                ...form,
                budget: form.budget ? parseFloat(form.budget) : undefined,
            }, { headers: { Authorization: `Bearer ${token}` } });
            await refreshHostStatus();
            navigate("/travel-buddy");
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to create listing.");
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
                    <div className="space-y-6">
                        <StepHeader 
                            label="Step 1" 
                            title="Where are you heading?" 
                            subtitle="Choose a destination for your next big adventure." 
                        />
                        <div className="space-y-2 mt-8">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Destination</label>
                            <div className="relative">
                                <Compass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input 
                                    type="text"
                                    placeholder="e.g. Iceland Road Trip"
                                    value={form.destination}
                                    onChange={e => set("destination", e.target.value)}
                                    className="w-full pl-11 pr-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black bg-white shadow-sm transition-all text-sm font-bold"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8">
                        <StepHeader 
                            label="Step 2" 
                            title="When is the trip?" 
                            subtitle="Select the dates you'll be traveling." 
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Start Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input 
                                        type="date"
                                        value={form.start_date}
                                        onChange={e => set("start_date", e.target.value)}
                                        className="w-full pl-11 pr-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black bg-white shadow-sm transition-all text-sm font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">End Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input 
                                        type="date"
                                        value={form.end_date}
                                        onChange={e => set("end_date", e.target.value)}
                                        className="w-full pl-11 pr-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black bg-white shadow-sm transition-all text-sm font-bold"
                                    />
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
                            title="Describe the vibe" 
                            subtitle="Share your plans and select your interests." 
                        />
                        <div className="space-y-6">
                            <textarea
                                rows={4}
                                placeholder="Looking for someone who loves hiking..."
                                value={form.description}
                                onChange={e => set("description", e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl py-4 px-5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all resize-none shadow-sm"
                            />
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Interests</label>
                                <div className="flex flex-wrap gap-2">
                                    {INTEREST_OPTIONS.map(i => (
                                        <button 
                                            key={i} 
                                            type="button" 
                                            onClick={() => toggleInterest(i)}
                                            className={`
                                                px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2
                                                ${form.interests.includes(i)
                                                    ? "bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200"
                                                    : "bg-white text-gray-400 border-gray-100 hover:border-gray-900 hover:text-gray-900"}
                                            `}
                                        >
                                            {i}
                                        </button>
                                    ))}
                                </div>
                            </div>
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
            nextLabel={step === totalSteps ? (saving ? "Posting..." : "Post My Trip") : "Next"}
            loading={saving}
            saveAndExitPath="/travel-buddy"
        >
            <div className="min-h-[400px] flex flex-col justify-center">
                {renderStepContent()}
                
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 flex items-center gap-2 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold"
                    >
                        <X size={14} className="flex-shrink-0" />
                        {error}
                    </motion.div>
                )}
            </div>
        </CreationLayout>
    );
};

export default CreateTravelBuddy;
