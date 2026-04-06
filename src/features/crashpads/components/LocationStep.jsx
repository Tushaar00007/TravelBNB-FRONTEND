import { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, Navigation, MousePointer2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Plus, Minus, Maximize2, X as CloseIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, useMap } from "@vis.gl/react-google-maps";
import { geocodeAddress, reverseGeocode, pincodeLookup } from "../../../services/maps";
import GoogleMapsProvider from "../../../components/shared/GoogleMapsProvider";
import { Loader2 } from "lucide-react";

/**
 * LocationStep — 2-step location UX:
 *   Step A: Address form input
 *   Step B: Map confirmation
 *
 * MAP UX (Step B):
 *   The orange marker is a FIXED CSS div at top:50% / left:50% of the map container.
 *   This means it can NEVER drift on zoom — it's positioned by CSS, not map coordinates.
 *   The geographic coordinate is captured via onIdle (fires once after any map interaction
 *   fully settles — drag OR zoom), not onCenterChanged (fires on every pixel during animation).
 */

// ─── Shared form field ────────────────────────────────────────────────────────
const InputField = ({ label, name, value, onChange, placeholder, required = false, loading = false, error = false }) => (
    <div className="flex flex-col gap-1.5 w-full">
        <label className={`text-[10px] font-black uppercase tracking-widest pl-1 ${error ? "text-red-500" : "text-gray-400"}`}>
            {label} {required && "*"}
        </label>
        <div className="relative">
            <input
                name={name}
                value={value || ""}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full px-5 py-4 rounded-xl border focus:outline-none focus:ring-4 transition-all text-sm font-bold shadow-sm placeholder:text-gray-300 ${
                    error
                        ? "border-red-500 focus:ring-red-500/10 focus:border-red-500 bg-red-50/30"
                        : "border-gray-200 focus:ring-orange-500/10 focus:border-orange-500 bg-white"
                }`}
            />
            {loading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="animate-spin text-orange-500" size={18} />
                </div>
            )}
        </div>
    </div>
);

// ─── Fixed CSS center-pin ─────────────────────────────────────────────────────
// Renders as position:absolute top:50% left:50% so it is ALWAYS at the visual
// center of its parent (position:relative map container). No map coordinate magic
// needed — CSS handles it perfectly and zoom can never move it.
const CenterPin = ({ isDetecting }) => (
    <div
        style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }}
    >
        {/* Decorative pulsing ring — paused while detecting to signal activity */}
        <div
            style={{
                position: "absolute",
                width: 48,
                height: 48,
                borderRadius: "50%",
                backgroundColor: "rgba(234,88,12,0.18)",
                animation: isDetecting
                    ? "none"
                    : "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
            }}
        />
        {/* The actual orange dot — anchored dead-center by the parent transform */}
        <div
            style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                backgroundColor: "#EA580C",
                border: "3px solid #ffffff",
                boxShadow: "0 2px 12px rgba(234,88,12,0.45)",
                position: "relative",
                zIndex: 1,
            }}
        />
    </div>
);

// ─── MapControlPanel — zoom/pan buttons ──────────────────────────────────────
// Must be a child of <Map> so useMap() works.
const MapControlPanel = () => {
    const map = useMap();
    if (!map) return null;

    const pan = (dLat, dLng) => {
        const c = map.getCenter();
        map.panTo({ lat: c.lat() + dLat, lng: c.lng() + dLng });
    };

    const Btn = ({ icon: Icon, onClick }) => (
        <button
            onClick={onClick}
            className="w-12 h-12 flex items-center justify-center bg-white hover:bg-gray-50 text-gray-900 border-b border-gray-100 last:border-b-0 transition-all active:scale-90"
        >
            <Icon size={18} />
        </button>
    );

    return (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[10]">
            <Btn icon={Plus}        onClick={() => map.setZoom(map.getZoom() + 1)} />
            <Btn icon={Minus}       onClick={() => map.setZoom(map.getZoom() - 1)} />
            <div className="h-px bg-gray-100 w-full" />
            <Btn icon={ChevronUp}    onClick={() => pan(0.001, 0)} />
            <Btn icon={ChevronDown}  onClick={() => pan(-0.001, 0)} />
            <Btn icon={ChevronLeft}  onClick={() => pan(0, -0.001)} />
            <Btn icon={ChevronRight} onClick={() => pan(0, 0.001)} />
        </div>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────
const LocationStep = ({ value, onChange, onSubStepChange, forcedSubStep, hideHeader = false }) => {
    const [subStep,        setSubStep]        = useState(forcedSubStep || "A");
    const [loading,        setLoading]        = useState(false);
    const [pinLoading,     setPinLoading]     = useState(false);
    const [isDetecting,    setIsDetecting]    = useState(false);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [error,          setError]          = useState("");
    const [pinError,       setPinError]       = useState("");

    // Keep a ref to the latest value so onIdle closure never goes stale
    const valueRef = useRef(value);
    useEffect(() => { valueRef.current = value; }, [value]);

    const debounceTimer = useRef(null);

    // Sync forced sub-step from parent
    useEffect(() => {
        if (forcedSubStep && forcedSubStep !== subStep) setSubStep(forcedSubStep);
    }, [forcedSubStep]);

    useEffect(() => {
        if (onSubStepChange) onSubStepChange(subStep);
    }, [subStep, onSubStepChange]);

    // ── Field input ────────────────────────────────────────────────────────────
    const handleInputChange = (e) => {
        const { name, value: val } = e.target;
        const formatted = ["city", "locality", "state"].includes(name) ? val.toUpperCase() : val;
        onChange({ ...value, [name]: formatted });
    };

    // ── PIN Code auto-fill ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!value.pincode || value.pincode.length !== 6 || !/^\d+$/.test(value.pincode)) {
            if (value.pincode?.length < 6) setPinError("");
            return;
        }
        let cancelled = false;
        setPinLoading(true);
        setPinError("");
        pincodeLookup(value.pincode)
            .then((data) => {
                if (cancelled) return;
                onChange({
                    ...value,
                    city:     data.city,
                    locality: data.district,
                    state:    data.state,
                    country:  data.country,
                    lat:      data.lat,
                    lng:      data.lng,
                });
            })
            .catch(() => { if (!cancelled) setPinError("Invalid PIN code. Please check again."); })
            .finally(() => { if (!cancelled) setPinLoading(false); });
        return () => { cancelled = true; };
    }, [value.pincode]);

    // ── Move to map sub-step ───────────────────────────────────────────────────
    const handleNextToMap = async () => {
        if (!value.pincode || value.pincode.length !== 6) {
            setError("Please enter a valid 6-digit PIN code.");
            return;
        }
        if (!value.street || !value.city || !value.state || !value.country) {
            setError("Please fill in all required address fields.");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const fullAddress = [
                value.flat_suite, value.street, value.landmark, value.locality,
                value.city, value.state, value.pincode, value.country,
            ].filter(Boolean).join(", ");
            const result = await geocodeAddress(fullAddress);
            onChange({ ...value, lat: result.lat, lng: result.lng, address: result.formatted_address });
            setSubStep("B");
        } catch {
            if (value.lat && value.lng) setSubStep("B");
            else setError("Could not locate address. Please check your details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (value.triggerNext && subStep === "A") {
            handleNextToMap();
            onChange({ ...value, triggerNext: false });
        }
    }, [value.triggerNext]);

    // ── Map idle handler ───────────────────────────────────────────────────────
    // Fires ONCE after any map interaction (drag OR zoom) fully settles.
    // This is what captures the coordinate that the fixed CSS center-pin is pointing at.
    const handleMapIdle = useCallback((e) => {
        const map = e.map;
        if (!map) return;
        const center = map.getCenter();
        if (!center) return;

        const lat = center.lat();
        const lng = center.lng();

        // Skip if essentially same position (prevents initial-load fire from triggering API)
        const prev = valueRef.current;
        if (
            prev.lat && prev.lng &&
            Math.abs(lat - prev.lat) < 0.00001 &&
            Math.abs(lng - prev.lng) < 0.00001
        ) return;

        setIsDetecting(true);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(async () => {
            try {
                const result = await reverseGeocode(lat, lng);
                onChange({ ...valueRef.current, lat, lng, address: result.formatted_address });
            } catch {
                onChange({ ...valueRef.current, lat, lng });
            } finally {
                setIsDetecting(false);
            }
        }, 600);
    }, [onChange]);

    // ── Shared Map JSX ─────────────────────────────────────────────────────────
    // Both the inline map and the fullscreen modal use the same Map + CenterPin pattern.
    const MapView = ({ defaultZoom = 16 }) => (
        <div className="relative w-full h-full">
            <GoogleMapsProvider>
                <Map
                    defaultCenter={{ lat: value.lat, lng: value.lng }}
                    defaultZoom={defaultZoom}
                    gestureHandling="greedy"
                    disableDefaultUI={true}
                    onIdle={handleMapIdle}
                    mapId="DEMO_MAP_ID"
                    className="w-full h-full"
                >
                    <MapControlPanel />
                </Map>
            </GoogleMapsProvider>

            {/* Fixed center-pin — CSS absolute, never tied to map coords → no zoom drift */}
            <CenterPin isDetecting={isDetecting} />
        </div>
    );

    // ── Fullscreen modal ───────────────────────────────────────────────────────
    const MapModal = () => (
        <AnimatePresence>
            {isMapModalOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[99] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="w-full h-full max-w-6xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-white/20 flex flex-col"
                    >
                        {/* Header */}
                        <div className="absolute top-6 left-6 right-6 z-10 pointer-events-none flex justify-between items-start">
                            <div className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-gray-100 max-w-lg pointer-events-auto">
                                <h3 className="text-xs font-black uppercase text-orange-600 tracking-widest">
                                    {isDetecting ? "Detecting..." : "Precise Location"}
                                </h3>
                                <p className="text-sm font-bold text-gray-900 leading-tight mt-1">{value.address}</p>
                            </div>
                            <button
                                onClick={() => setIsMapModalOpen(false)}
                                className="w-12 h-12 bg-white/95 backdrop-blur-md rounded-2xl flex items-center justify-center text-gray-900 shadow-xl border border-gray-100 hover:bg-black hover:text-white transition-all pointer-events-auto"
                            >
                                <CloseIcon size={24} />
                            </button>
                        </div>

                        {/* Map (fills remaining space) */}
                        <div className="flex-1 w-full overflow-hidden">
                            <MapView defaultZoom={18} />
                        </div>

                        {/* Footer */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md px-8 py-4 rounded-full flex items-center gap-3 text-white shadow-2xl z-20 pointer-events-none">
                            <MousePointer2 size={16} className="text-orange-500 animate-bounce" />
                            <span className="text-xs font-black uppercase tracking-widest">Drag the map to reposition</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {subStep === "A" ? (
                    /* ── Step A: Address form ────────────────────────────────── */
                    <motion.div
                        key="step2a"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="space-y-10"
                    >
                        {!hideHeader && (
                            <div className="text-center sm:text-left">
                                <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Confirm your address</h1>
                                <p className="text-gray-500 font-medium text-base">
                                    Your address is only shared with guests after they've made a reservation.
                                </p>
                            </div>
                        )}

                        <div className="space-y-6">
                            <InputField label="Country / Region" name="country"   value={value.country}    onChange={handleInputChange} placeholder="e.g. India" required />

                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Flat / House / Suite" name="flat_suite" value={value.flat_suite} onChange={handleInputChange} placeholder="Apt 4B" />
                                <InputField label="Street Address"       name="street"     value={value.street}     onChange={handleInputChange} placeholder="123 Main St" required />
                            </div>

                            <InputField label="Nearby Landmark" name="landmark" value={value.landmark} onChange={handleInputChange} placeholder="Near Central Park" />

                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="District / Locality" name="locality" value={value.locality} onChange={handleInputChange} placeholder="Andheri West" required />
                                <InputField label="City"                name="city"     value={value.city}     onChange={handleInputChange} placeholder="Mumbai" required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="State" name="state" value={value.state} onChange={handleInputChange} placeholder="MAHARASHTRA" required />
                                <div className="space-y-1">
                                    <InputField
                                        label="PIN Code"
                                        name="pincode"
                                        value={value.pincode}
                                        onChange={handleInputChange}
                                        placeholder="400053"
                                        required
                                        loading={pinLoading}
                                        error={!!pinError}
                                    />
                                    {pinLoading && (
                                        <p className="text-[10px] font-black uppercase text-orange-500 tracking-widest pl-1 animate-pulse">
                                            Fetching location...
                                        </p>
                                    )}
                                    {pinError && (
                                        <p className="text-[10px] font-black uppercase text-red-500 tracking-widest pl-1">
                                            {pinError}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-xs font-bold text-center mt-4">{error}</p>}
                    </motion.div>
                ) : (
                    /* ── Step B: Map confirmation ─────────────────────────────── */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {!hideHeader && (
                            <div className="text-center sm:text-left">
                                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Is the pin in the right spot?</h1>
                                <p className="text-gray-500 font-medium text-base">Drag the map to reposition the pin precisely.</p>
                            </div>
                        )}

                        {/* Map container — must be position:relative for the CenterPin to anchor */}
                        <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl ring-1 ring-gray-100 group/map">
                            <MapView defaultZoom={16} />

                            {/* Fullscreen button */}
                            <button
                                onClick={() => setIsMapModalOpen(true)}
                                className="absolute bottom-24 right-8 px-4 py-3 bg-white/95 backdrop-blur-md hover:bg-black hover:text-white text-gray-900 rounded-2xl flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest shadow-xl border border-gray-100 transition-all active:scale-95 group-hover/map:opacity-100 opacity-0 duration-500 hidden sm:flex z-10"
                            >
                                <Maximize2 size={14} className="text-orange-500" />
                                Fullscreen Map
                            </button>

                            {/* Editable address overlay */}
                            <div className="absolute top-6 left-6 right-6 z-10">
                                <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-gray-100 flex items-start gap-4">
                                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                        <MapPin size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">
                                            {isDetecting ? "Detecting location..." : "Confirm or Edit Address"}
                                        </p>
                                        <textarea
                                            value={value.address || ""}
                                            onChange={(e) => onChange({ ...value, address: e.target.value })}
                                            rows={2}
                                            className={`w-full bg-transparent border-none p-0 text-sm font-bold leading-tight focus:ring-0 resize-none transition-colors ${
                                                isDetecting ? "text-gray-400" : "text-gray-900"
                                            }`}
                                            placeholder="Enter precise address details..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bottom instruction strip */}
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
                                <div className="bg-black/80 backdrop-blur-md text-white px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-2xl">
                                    <MousePointer2 size={14} className="text-orange-400" />
                                    Drag the map to reposition
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-start items-center pt-6">
                            <button
                                onClick={() => setSubStep("A")}
                                className="text-sm font-black text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-2"
                            >
                                <Navigation size={14} className="rotate-[270deg]" />
                                Edit Address
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <MapModal />
        </div>
    );
};

export default LocationStep;
