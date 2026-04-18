import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
    MapPin, Navigation, AlertCircle 
} from "lucide-react";
import CreationLayout from "../../../components/layout/CreationLayout";
import { useHostOnboardingStore } from "../../../shared/stores/useHostOnboardingStore";
import LocationStep from "../../crashpads/components/LocationStep";
import { geocodeAddress } from "../../../services/maps";

export default function HostLocationPage() {
    const navigate = useNavigate();
    const { formData, setNestedLocation } = useHostOnboardingStore();
    const [geocoding, setGeocoding] = useState(false);
    const [geocodeError, setGeocodeError] = useState("");
    const geocodedForStep = useRef(null);

    // Geocode on mount to ensure coordinates exist for the map
    useEffect(() => {
        const locKey = `${formData.location.flat_suite}|${formData.location.street}|${formData.location.city}|${formData.location.pincode}`;
        if (geocodedForStep.current === locKey) return;

        const loc = formData.location;
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
                    setNestedLocation({
                        lat: result.lat,
                        lng: result.lng,
                        address: result.formatted_address || fullAddress
                    });
                    geocodedForStep.current = locKey;
                } else {
                    setGeocodeError("Could not find exact location. Please drag the pin to your property.");
                }
            })
            .catch(() => {
                setGeocodeError("Could not locate address. Please drag the pin to your property.");
            })
            .finally(() => {
                setGeocoding(false);
            });
    }, [formData.location.city, formData.location.pincode, setNestedLocation]);

    const handleNext = () => {
        navigate("/host/details");
    };

    const handleBack = () => {
        navigate("/host/address");
    };

    const isStepValid = () => {
        return !!formData.location.lat && !!formData.location.lng;
    };

    const StepHeader = ({ title, subtitle }) => (
        <div className="mb-10 text-center sm:text-left">
            <span className="text-[11px] font-black uppercase tracking-widest text-orange-500 mb-3 block">Step 2 of 3</span>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tighter leading-none italic">{title}</h1>
            {subtitle && <p className="text-gray-500 font-medium text-base leading-relaxed italic">{subtitle}</p>}
        </div>
    );

    return (
        <CreationLayout 
            currentStep={2} 
            totalSteps={3} 
            onBack={handleBack} 
            onNext={handleNext}
            disableNext={!isStepValid()}
        >
            <div className="min-h-[450px]">
                <div className="space-y-6">
                    <StepHeader 
                        title="Is the pin in the right spot?" 
                        subtitle="Drag the map to position the pin exactly over your entrance." 
                    />

                    {geocoding && (
                        <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-2xl text-orange-700 text-xs font-bold animate-pulse">
                            <Navigation size={16} className="animate-spin" />
                            Finding your exact location on the map...
                        </div>
                    )}

                    {!geocoding && geocodeError && (
                        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 text-xs font-bold">
                            <MapPin size={16} />
                            {geocodeError}
                        </div>
                    )}

                    {formData.location.lat && formData.location.lng ? (
                        <LocationStep 
                            value={formData.location} 
                            onChange={(loc) => setNestedLocation(loc)}
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
            </div>
        </CreationLayout>
    );
}
