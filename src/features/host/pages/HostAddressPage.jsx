import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
    Home, Building, Warehouse, Hotel, DoorOpen, Tractor, Landmark, Trees, Box, Check 
} from "lucide-react";
import CreationLayout from "../../../components/layout/CreationLayout";
import { useHostOnboardingStore } from "../../../shared/stores/useHostOnboardingStore";
import LocationStep from "../../crashpads/components/LocationStep";

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

export default function HostAddressPage() {
    const navigate = useNavigate();
    const { formData, setFormData, setNestedLocation } = useHostOnboardingStore();
    const [subStep, setSubStep] = useState(formData.type ? 2 : 1);

    const handleNext = () => {
        if (subStep === 1) {
            setSubStep(2);
        } else {
            navigate("/host/location");
        }
    };

    const handleBack = () => {
        if (subStep === 2) {
            setSubStep(1);
        } else {
            navigate("/become-a-host");
        }
    };

    const isStepValid = () => {
        if (subStep === 1) return !!formData.type;
        if (subStep === 2) return !!formData.location.city && !!formData.location.pincode && !!formData.location.street;
        return true;
    };

    const StepHeader = ({ title, subtitle, step }) => (
        <div className="mb-10 text-center sm:text-left">
            <span className="text-[11px] font-black uppercase tracking-widest text-orange-500 mb-3 block">Step {step} of 3</span>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tighter leading-none italic">{title}</h1>
            {subtitle && <p className="text-gray-500 font-medium text-base leading-relaxed italic">{subtitle}</p>}
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

    return (
        <CreationLayout 
            currentStep={subStep === 1 ? 1 : 1.5} 
            totalSteps={3} 
            onBack={handleBack} 
            onNext={handleNext}
            disableNext={!isStepValid()}
        >
            <div className="min-h-[450px]">
                {subStep === 1 ? (
                    <div className="space-y-6">
                        <StepHeader 
                            step={1}
                            title="Which of these best describes your place?" 
                            subtitle="Choose the most accurate category for your property." 
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {propertyTypes.map(t => (
                                <SelectionCard 
                                    key={t.label} 
                                    active={formData.type === t.label} 
                                    onClick={() => setFormData({ type: t.label })} 
                                    icon={t.icon} 
                                    title={t.label} 
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                         <StepHeader 
                            step={1}
                            title="Where's your place located?" 
                            subtitle="Your address is only shared with guests after they've booked." 
                        />
                        <LocationStep 
                            value={formData.location} 
                            onChange={(loc) => setNestedLocation(loc)}
                            forcedSubStep="A"
                            hideHeader={true}
                        />
                    </div>
                )}
            </div>
        </CreationLayout>
    );
}
