import React, { useState } from 'react';
import API from '../../../services/api';
import { arrayMove } from '@dnd-kit/sortable';
import {
    MapPin,
    Calendar,
    Clock,
    Sparkles,
    FileDown,
    Plane,
    Train,
    Hotel,
    Star,
    Navigation,
    Loader2,
    AlertCircle,
    Info,
    ChevronLeft,
    Wallet,
    Compass,
    Users,
    Car,
    Coffee,
    Moon,
    EyeOff,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ItineraryEditor from '../../../components/ItineraryEditor';
import GoogleMapPanel from '../../../components/GoogleMapPanel';
import PlaceDetailModal from '../../../components/PlaceDetailModal';

class MapErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        console.error("Map Error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '24px',
                    color: '#9CA3AF',
                    fontSize: '14px',
                    flexDirection: 'column',
                    gap: '12px',
                    border: '1px solid #E5E7EB'
                }}>
                    <span style={{ fontSize: '32px' }}>🗺️</span>
                    <p className="font-bold text-gray-400">Map unavailable</p>
                    <button 
                        onClick={() => this.setState({ hasError: false })}
                        className="text-xs text-orange-500 font-bold hover:underline"
                    >
                        Try again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

function AiPlanner() {
    const [destination, setDestination] = useState("Goa, India");
    const [days, setDays] = useState(2);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [plannerData, setPlannerData] = useState(null);
    const [rankedPlaces, setRankedPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [error, setError] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [itineraryId, setItineraryId] = useState(null);
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    const [budget, setBudget] = useState('Mid-Range');
    const [style, setStyle] = useState('Adventure');
    const [group, setGroup] = useState('Solo');
    const [transport, setTransport] = useState('Public');
    const [includeNightlife, setIncludeNightlife] = useState(true);
    const [includeFood, setIncludeFood] = useState(true);
    const [avoidCrowds, setAvoidCrowds] = useState(false);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8
            }
        })
    );

    // Scroll to top on step change
    React.useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    function extractPlacesFromPlan(plan) {
        if (!plan) return [];
        const places = [];
        Object.values(plan).forEach(dayEvents => {
            dayEvents.forEach(event => {
                if (typeof event === 'object' && event.place_name
                    && event.latitude && event.longitude) {
                    // Check for duplicates
                    if (!places.find(p => p.place_name === event.place_name)) {
                        places.push(event);
                    }
                }
            });
        });
        return places;
    }

    const handlePlanTrip = async () => {
        setIsLoading(true);
        setError(null);
        setPlannerData(null);
        setRankedPlaces([]);
        setSelectedLocation(null);

        try {
            const formattedLocation = destination.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');

            const response = await API.post('/ml/generate', {
                location: formattedLocation,
                days: parseInt(days),
                start_date: startDate,
                preferences: {
                    budget,
                    style,
                    group,
                    transport,
                    includeNightlife,
                    includeFood,
                    avoidCrowds
                }
            });

            if (response.data && response.data.success) {
                console.log('[AiPlanner] Full API response:', response.data);
                const data = response.data.data;
                setPlannerData(data);

                // ✅ NEW: Save itinerary to DB to get an ID for PDF download
                try {
                    const saveResponse = await API.post('/itinerary/save', {
                        location: formattedLocation,
                        days: parseInt(days),
                        start_date: startDate,
                        preferences: {
                            budget, style, group, transport,
                            includeNightlife, includeFood, avoidCrowds
                        },
                        planner_data: data
                    });
                    if (saveResponse.data?.success) {
                        setItineraryId(saveResponse.data.itinerary_id);
                        console.log("!!! Itinerary saved successfully with ID:", saveResponse.data.itinerary_id);
                    }
                } catch (saveErr) {
                    console.error("Failed to save itinerary:", saveErr);
                }

                // Set ranked places for map
                const placesForMap = data.ranked_places?.length > 0
                    ? data.ranked_places
                    : extractPlacesFromPlan(data.plan);
                setRankedPlaces(placesForMap);

                setStep(3);
            } else {
                const serverMsg = response.data?.message || response.data?.error || response.data?.detail;
                setError(serverMsg
                    ? `Generation failed: ${serverMsg}`
                    : "Failed to generate plan — travel planner service unavailable."
                );
            }
        } catch (err) {
            console.error("API Error:", err);
            const detail = err.response?.data?.detail || err.response?.data?.error;
            if (detail) {
                setError(`Server error: ${detail}`);
            } else if (!err.response) {
                setError("Cannot reach the backend service. Ensure the servers are operational.");
            } else {
                setError("An error occurred while generating your plan. Check browser console for details.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!itineraryId) {
            toast.error("Please generate an itinerary first.");
            return;
        }

        setIsDownloading(true);
        try {
            const formattedLocation = destination.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');

            const response = await API.get(`/itinerary/pdf/${itineraryId}`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `itinerary_${formattedLocation.toLowerCase().replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("PDF Download Error:", err);
            toast.error("Failed to download PDF. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDragEnd = ({ active, over }) => {
        if (!over || !active?.data?.current?.fromDay) return;

        const { fromDay, fromIndex } = active.data.current;
        const isOverItem = over.data?.current?.type === 'itinerary-item';
        const targetDay = isOverItem ? over.data.current.fromDay : over.id;

        if (typeof targetDay !== 'string') return;

        setPlannerData((prev) => {
            if (!prev?.plan?.[fromDay] || !prev?.plan?.[targetDay]) return prev;

            const sourceEvents = [...prev.plan[fromDay]];
            const [movedEvent] = sourceEvents.splice(fromIndex, 1);

            if (!movedEvent) return prev;

            if (fromDay === targetDay) {
                const targetIndex = isOverItem ? over.data.current.fromIndex : sourceEvents.length;
                return {
                    ...prev,
                    plan: {
                        ...prev.plan,
                        [fromDay]: arrayMove(prev.plan[fromDay], fromIndex, targetIndex)
                    }
                };
            }

            const targetEvents = [...prev.plan[targetDay]];
            const targetIndex = isOverItem ? over.data.current.fromIndex : targetEvents.length;
            targetEvents.splice(targetIndex, 0, movedEvent);

            return {
                ...prev,
                plan: {
                    ...prev.plan,
                    [fromDay]: sourceEvents,
                    [targetDay]: targetEvents
                }
            };
        });
    };

    // Existing helper components (SummaryAndTransport, etc.) remain largely the same,
    // they'll be rendered inside the new layout.
    // ...

    const SummaryAndTransport = (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-2 p-4 
              bg-gray-900 border-[3px] border-black rounded-2xl 
              shadow-[4px_4px_0px_#F97316] mb-2">
                <Sparkles size={16} className="text-[#F97316] shrink-0" />
                <span className="text-xs font-black uppercase tracking-tight text-white">
                    Itinerary crafted for:
                </span>
                {[
                    { label: budget },
                    { label: style },
                    { label: group },
                    { label: transport },
                    ...(includeNightlife ? [{ label: "Nightlife ✓" }] : []),
                    ...(includeFood ? [{ label: "Food Spots ✓" }] : []),
                    ...(avoidCrowds ? [{ label: "Avoid Crowds ✓" }] : []),
                ].map(({ label }) => (
                    <span
                        key={label}
                        className="px-3 py-1 rounded-full text-[11px] font-black 
                    border-[2px] border-[#F97316] uppercase tracking-tight 
                    bg-transparent text-[#F97316]"
                    >
                        {label}
                    </span>
                ))}
            </div>

            {/* Intro Header */}
            <div className="pb-2">
                <h2 className="text-4xl font-normal text-gray-900 dark:text-white mb-2">
                    Your <span className="text-orange-500 font-medium">{plannerData?.destination || destination.split(',')[0]}</span> Adventure
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
                    <Calendar size={16} className="text-orange-500" /> A perfectly curated {days}-day journey awaits.
                </p>
            </div>

            {/* Travel Summary */}
            {plannerData?.travel_summary && (
                <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-6 items-start">
                    <Sparkles className="absolute -top-12 -right-4 text-orange-50 dark:text-orange-900/10 w-48 h-48 pointer-events-none" />
                    <div className="bg-orange-500 p-3 rounded-full text-white shrink-0 shadow-md shadow-orange-500/30">
                        <Info size={24} />
                    </div>
                    <div className="relative z-10 flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Trip Summary</h3>
                        <p className="text-[15px] text-gray-500 dark:text-gray-400 leading-relaxed">
                            "{plannerData.travel_summary}"
                        </p>
                    </div>
                </section>
            )}

            {/* Transport Overview */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-gray-100 dark:bg-gray-800 text-orange-500 p-1.5 rounded-full">
                        <Plane size={16} className="-rotate-45" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Transport Hubs</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                        <div className="bg-gray-100 dark:bg-gray-800 text-orange-500 p-3 rounded-xl">
                            <Plane size={24} className="-rotate-45" />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Nearest Airport</h4>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{plannerData?.transport?.airport || "Locating..."}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                        <div className="bg-gray-100 dark:bg-gray-800 text-orange-500 p-3 rounded-xl">
                            <Train size={24} />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Nearest Railway</h4>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{plannerData?.transport?.railway || "Locating..."}</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );

    const TitleAndDownload = (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
                <div className="bg-orange-50 dark:bg-orange-900/30 text-orange-500 p-1.5 rounded-full">
                    <MapPin size={16} />
                </div>
                <h3 className="text-2xl font-normal text-gray-900 dark:text-white">Your Itinerary</h3>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                    onClick={() => navigate('/itinerary-editor', {
                        state: { plannerData, rankedPlaces, destination, days, startDate, selectedPlace }
                    })}
                    className="flex-1 sm:flex-none items-center justify-center gap-2 bg-orange-500 text-white 
                    px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-600 
                    transition-all shadow-md active:scale-95 flex"
                >
                    ✏️ Edit Itinerary
                </button>
                <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="flex-1 sm:flex-none items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-black dark:hover:bg-gray-100 transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:pointer-events-none flex"
                >
                    {isDownloading ? (
                        <><Loader2 className="animate-spin" size={16} /> Downloading...</>
                    ) : (
                        <><FileDown size={16} /> Download PDF</>
                    )}
                </button>
            </div>
        </div>
    );

    const variants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    const StepProgressBar = (
        <div className="sticky top-0 z-[100] w-full bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between shadow-sm">
            {/* Logo */}
            <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate('/')}
            >
                <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Travel<span className="text-orange-500">BNB</span>
                </h1>
                <div className="hidden sm:block h-4 w-[1px] bg-gray-300 mx-2"></div>
                <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-orange-500">AI PLANNER</span>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-6">
                <div className="flex flex-col items-end sm:items-center gap-1.5">
                    <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                        STEP {step} OF 3
                    </span>
                    <div className="w-32 sm:w-48 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{
                                width: step === 1 ? "33%" : step === 2 ? "66%" : "100%"
                            }}
                            className="h-full bg-orange-500 transition-all duration-300 shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                        />
                    </div>
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
                {step > 1 && (
                    <button
                        onClick={() => setStep(step - 1)}
                        className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-500 hover:text-black transition-colors uppercase tracking-tight"
                    >
                        <ChevronLeft size={16} /> Back
                    </button>
                )}
            </div>
        </div>
    );

    const PreferenceCard = ({ title, options, value, onChange, icon: Icon, accentColor }) => (
        <div className="bg-white border-[3px] border-black rounded-3xl 
        shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden
        hover:translate-y-[-3px] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] 
        transition-all duration-200">

            {/* Header — orange only */}
            <div className="px-5 py-4 flex items-center gap-3 
          border-b-[3px] border-black bg-[#F97316]">
                <Icon size={20} className="text-white" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white">
                    {title}
                </h3>
            </div>

            {/* Options */}
            <div className="p-4 flex flex-col gap-2 bg-white">
                {options.map((opt) => (
                    <button
                        key={opt}
                        onClick={() => onChange(opt)}
                        className={`py-3 px-4 rounded-xl border-[2px] font-black text-sm 
                transition-all text-left flex justify-between items-center
                active:scale-95 ${value === opt
                                ? "bg-black text-white border-black"
                                : "bg-gray-50 border-gray-200 text-gray-700 hover:border-black hover:bg-gray-100"
                            }`}
                    >
                        {opt}
                        {value === opt && (
                            <span className="text-[#F97316] text-base font-black">✓</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );

    const TogglePref = ({ label, value, onChange, icon: Icon }) => (
        <button
            onClick={() => onChange(!value)}
            className={`flex items-center justify-between p-5 rounded-3xl 
          border-[3px] border-black transition-all duration-200 w-full
          active:scale-95 ${value
                    ? "bg-[#F97316] shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] hover:translate-y-[-2px]"
                    : "bg-white shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:translate-y-[-2px]"
                }`}
        >
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-2xl border-[2px] border-black transition-colors ${value ? "bg-black" : "bg-gray-100"
                    }`}>
                    <Icon size={20} className={value ? "text-[#F97316]" : "text-black"} />
                </div>
                <span className={`font-black text-sm uppercase tracking-tight ${value ? "text-white" : "text-black"
                    }`}>
                    {label}
                </span>
            </div>

            {/* Toggle pill */}
            <div className={`w-12 h-6 rounded-full border-[2px] border-black 
          relative transition-colors ${value ? "bg-black" : "bg-gray-200"}`}>
                <motion.div
                    animate={{ x: value ? 24 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full 
              transition-colors ${value ? "bg-[#F97316]" : "bg-white border border-gray-300"
                        }`}
                />
            </div>
        </button>
    );

    return (
        <div className="fixed inset-0 z-[99999] bg-white dark:bg-gray-950 font-sans transition-colors duration-300 flex flex-col overflow-y-auto">
            {StepProgressBar}

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="flex-1 flex flex-col"
                    >
                        {/* Hero Section */}
                        <div className="relative w-full h-screen bg-[#181817] flex justify-center items-center overflow-hidden border-b-[8px] border-gray-900">

                            {/* Huge Background Text */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                                <span className="text-[26vw] font-black text-[#262626] select-none leading-none tracking-tighter mix-blend-normal uppercase">AI PLAN</span>
                            </div>

                            <div className="relative z-20 flex flex-col items-center justify-center w-full px-6 text-center">

                                {/* Badge */}
                                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gray-700 bg-transparent text-gray-300 mb-8 text-xs font-bold uppercase tracking-widest shadow-sm">
                                    <Sparkles size={14} className="text-orange-500" />
                                    <span>AI-POWERED TRAVEL PLANNING</span>
                                </div>

                                {/* Headline */}
                                <h1 className="text-[4rem] md:text-[5.5rem] lg:text-[7rem] font-black tracking-tighter mb-4 text-white leading-[0.9] uppercase">
                                    Plan Dream Trip <span className="text-orange-500">AI</span>
                                </h1>

                                {/* Subheadline */}
                                <p className="text-xl md:text-2xl font-bold mb-16 text-gray-400 tracking-wider uppercase">
                                    Intelligent Itineraries
                                </p>

                                {/* Search Pill */}
                                <form
                                    onSubmit={(e) => { e.preventDefault(); setError(null); setStep(2); }}
                                    className="bg-white rounded-full border-[4px] border-black shadow-[0px_10px_0px_#000] w-full max-w-4xl flex flex-col md:flex-row items-center relative z-30 overflow-hidden group hover:translate-y-[2px] transition-transform hover:shadow-[0px_8px_0px_#000] mx-4"
                                >
                                    {/* Destination */}
                                    <div className="flex-1 w-full text-left px-8 py-3.5 flex flex-col justify-center">
                                        <label className="block text-[10px] font-black uppercase text-orange-500 mb-1 tracking-widest">DESTINATION</label>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="text-gray-400 h-5 w-5" strokeWidth={2.5} />
                                            <input
                                                type="text"
                                                value={destination}
                                                onChange={(e) => setDestination(e.target.value)}
                                                className="w-full bg-transparent border-none text-black font-bold focus:outline-none focus:ring-0 text-lg placeholder-gray-300"
                                                placeholder="Where to?"
                                            />
                                        </div>
                                    </div>

                                    <div className="hidden md:block w-[1px] h-12 bg-gray-200"></div>

                                    {/* Days */}
                                    <div className="w-full md:w-40 text-left px-6 py-3.5 flex flex-col justify-center">
                                        <label className="block text-[10px] font-black uppercase text-orange-500 mb-1 tracking-widest">DAYS</label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="text-gray-400 h-5 w-5" strokeWidth={2.5} />
                                            <input
                                                type="number"
                                                min="1"
                                                max="30"
                                                value={days}
                                                onChange={(e) => setDays(e.target.value)}
                                                className="w-full bg-transparent border-none text-black font-bold focus:outline-none focus:ring-0 text-lg"
                                            />
                                        </div>
                                    </div>

                                    <div className="hidden md:block w-[1px] h-12 bg-gray-200"></div>

                                    {/* Start Date */}
                                    <div className="w-full md:w-48 text-left px-6 py-3.5 flex flex-col justify-center">
                                        <label className="block text-[10px] font-black uppercase text-orange-500 mb-1 tracking-widest">START DATE</label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="text-gray-400 h-5 w-5" strokeWidth={2.5} />
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full bg-transparent border-none text-black font-bold focus:outline-none focus:ring-0 text-lg [&::-webkit-calendar-picker-indicator]:opacity-50"
                                            />
                                        </div>
                                    </div>

                                    {/* Button */}
                                    <div className="p-2 w-full md:w-auto">
                                        <button
                                            type="submit"
                                            className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white font-black tracking-widest uppercase text-sm px-10 py-4 rounded-full transition-colors flex items-center justify-center gap-2 mx-auto"
                                        >
                                            NEXT STEP <ChevronLeft className="h-5 w-5 rotate-180" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="flex-1 bg-white"
                    >
                        {/* Sub-header / Fine-tune Section */}
                        <div className="w-full border-b-[8px] border-black pt-20 pb-12 px-6 lg:px-24 flex flex-col md:flex-row justify-between items-start md:items-end">
                            <div>
                                <h2 className="text-5xl md:text-7xl font-black text-black tracking-tighter mb-4 uppercase">
                                    FINE-TUNE YOUR{" "}
                                    <span className="text-orange-500 underline decoration-black underline-offset-4 decoration-[8px]">
                                        VIBE
                                    </span>
                                </h2>
                                <p className="text-xl font-bold text-gray-400 uppercase tracking-widest flex items-center gap-3">
                                    <Sparkles size={24} className="text-orange-500" /> Tell us what makes your heart race.
                                </p>
                            </div>
                        </div>

                        <div className="max-w-[1400px] mx-auto px-6 py-16">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                                <PreferenceCard
                                    title="Budget"
                                    icon={Wallet}
                                    options={['Low', 'Mid-Range', 'Luxury']}
                                    value={budget}
                                    onChange={setBudget}
                                />
                                <PreferenceCard
                                    title="Style"
                                    icon={Compass}
                                    options={['Adventure', 'Relaxation', 'Cultural', 'Nightlife']}
                                    value={style}
                                    onChange={setStyle}
                                />
                                <PreferenceCard
                                    title="Group"
                                    icon={Users}
                                    options={['Solo', 'Couple', 'Friends', 'Family']}
                                    value={group}
                                    onChange={setGroup}
                                />
                                <PreferenceCard
                                    title="Transport"
                                    icon={Car}
                                    options={['Public', 'Rental', 'Private Cab']}
                                    value={transport}
                                    onChange={setTransport}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                                <TogglePref
                                    label="Include Nightlife"
                                    icon={Moon}
                                    value={includeNightlife}
                                    onChange={setIncludeNightlife}
                                />
                                <TogglePref
                                    label="Include Food Spots"
                                    icon={Coffee}
                                    value={includeFood}
                                    onChange={setIncludeFood}
                                />
                                <TogglePref
                                    label="Avoid Crowds"
                                    icon={EyeOff}
                                    value={avoidCrowds}
                                    onChange={setAvoidCrowds}
                                />
                            </div>

                            {/* Error banner — shown here on step 2 so API failures are visible */}
                            {error && (
                                <div className="flex justify-center mb-8">
                                    <div className="flex items-center gap-3 bg-gray-100 border border-gray-200 text-orange-600 px-6 py-4 rounded-2xl max-w-2xl w-full">
                                        <AlertCircle size={20} className="shrink-0" />
                                        <p className="font-bold text-sm">{error}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                                <button
                                    onClick={() => { setError(null); setStep(1); }}
                                    className="w-full md:w-auto px-12 py-5 border-[4px] border-black rounded-full font-black uppercase text-lg hover:bg-gray-100 transition-colors shadow-[6px_6px_0px_#000] active:translate-y-1 active:shadow-none"
                                >
                                    GO BACK
                                </button>
                                <button
                                    onClick={handlePlanTrip}
                                    disabled={isLoading}
                                    className="w-full md:w-auto px-16 py-5 bg-[#F97316] border-[4px] border-black rounded-full font-black uppercase text-lg text-white flex items-center justify-center gap-3 shadow-[8px_8px_0px_#000] hover:shadow-[12px_12px_0px_#000] hover:translate-y-[-4px] transition-all duration-200 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                                >
                                    {isLoading ? (
                                        <><Loader2 className="animate-spin h-6 w-6" /> GENERATING...</>
                                    ) : (
                                        <><Sparkles className="h-6 w-6" /> GENERATE ITINERARY</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="flex-1 bg-white dark:bg-gray-950"
                    >
                        <div className="w-full px-6 py-6 max-w-[1600px] mx-auto">
                            {error && (
                                <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-orange-600 dark:text-orange-400 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3 animate-fade-in-up">
                                    <AlertCircle size={24} />
                                    <p className="font-medium">{error}</p>
                                </div>
                            )}

                            {!plannerData && !isLoading && !error && (
                                <div className="text-center py-24 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-full mb-6 shadow-sm">
                                        <Navigation size={48} className="text-gray-300 dark:text-gray-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Ready for your next adventure?</h3>
                                    <p className="text-lg">Fill out the details above and let AI craft your perfect itinerary.</p>
                                </div>
                            )}

                            {plannerData && (
                                <div className="flex flex-col lg:flex-row gap-8 animate-fade-in-up w-full">
                                    {/* Left Column: Itinerary Content */}
                                    <div className="flex-1 min-w-0">
                                        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                                            <ItineraryEditor
                                                plannerData={plannerData}
                                                setPlannerData={setPlannerData}
                                                SummaryAndTransport={SummaryAndTransport}
                                                TitleAndDownload={TitleAndDownload}
                                                onPlaceClick={(place) => {
                                                    console.log("onPlaceClick called with:", place);
                                                    // Enrichment: find the matching place in rankedPlaces to get photos & full description
                                                    const enriched = rankedPlaces.find(
                                                        p => p.place_name === place.place_name
                                                    );
                                                    const merged = {
                                                        ...place,
                                                        photo_url: enriched?.photo_url || enriched?.place_image_url || place.photo_url || '',
                                                        place_image_url: enriched?.place_image_url || place.place_image_url || '',
                                                        short_description: place.short_description || enriched?.short_description || enriched?.place_description_ai || '',
                                                        place_description_ai: enriched?.place_description_ai || '',
                                                        significance: place.significance || enriched?.significance || '',
                                                        travel_tip: place.travel_tip || enriched?.travel_tip || '',
                                                        must_try_food: place.must_try_food || enriched?.must_try_food || '',
                                                        famous_restaurant: enriched?.famous_restaurant || '',
                                                        food_specialty: enriched?.food_specialty || '',
                                                        packing_suggestions: place.packing_suggestions || enriched?.packing_suggestions || '',
                                                        common_questions: enriched?.common_questions || '',
                                                        airport: enriched?.airport || '',
                                                        railway: enriched?.railway || '',
                                                    };
                                                    console.log("Enriched place for modal:", merged);
                                                    setSelectedPlace(merged);
                                                }}
                                            />
                                        </DndContext>

                                        <div className="mt-12 flex justify-center pb-12">
                                            <button
                                                onClick={() => setStep(1)}
                                                className="px-8 py-3 border-[3px] border-black rounded-full font-black uppercase text-sm hover:bg-gray-50 transition-all flex items-center gap-2"
                                            >
                                                <Sparkles size={16} /> PLAN ANOTHER TRIP
                                            </button>
                                        </div>
                                    </div>

                                    <div className="hidden lg:block w-[420px] shrink-0">
                                        <MapErrorBoundary>
                                            <GoogleMapPanel
                                                plannerData={plannerData}
                                                onPlaceClick={(place) => {
                                                    console.log("onPlaceClick (map) called with:", place);
                                                    const enriched = rankedPlaces.find(
                                                        p => p.place_name === place.place_name
                                                    );
                                                    const merged = {
                                                        ...place,
                                                        photo_url: enriched?.photo_url || enriched?.place_image_url || place.photo_url || '',
                                                        place_image_url: enriched?.place_image_url || place.place_image_url || '',
                                                        short_description: place.short_description || enriched?.short_description || enriched?.place_description_ai || '',
                                                        place_description_ai: enriched?.place_description_ai || '',
                                                        significance: place.significance || enriched?.significance || '',
                                                        travel_tip: place.travel_tip || enriched?.travel_tip || '',
                                                        must_try_food: place.must_try_food || enriched?.must_try_food || '',
                                                        famous_restaurant: enriched?.famous_restaurant || '',
                                                        food_specialty: enriched?.food_specialty || '',
                                                        packing_suggestions: place.packing_suggestions || enriched?.packing_suggestions || '',
                                                        common_questions: enriched?.common_questions || '',
                                                        airport: enriched?.airport || '',
                                                        railway: enriched?.railway || '',
                                                    };
                                                    setSelectedPlace(merged);
                                                }}
                                            />
                                        </MapErrorBoundary>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal must be here at root level of step 3 */}
                        <PlaceDetailModal
                            place={selectedPlace}
                            onClose={() => setSelectedPlace(null)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>


            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}} />

        </div>
    );
}

export default AiPlanner;
