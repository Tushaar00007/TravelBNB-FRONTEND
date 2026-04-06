import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import HomeCard from "../components/ListingCard";
import API from "../../../services/api";
import CrashpadService from "../../../services/crashpads";
import { useTranslation } from "react-i18next";
import {
    ChevronDown, Check, LayoutGrid, List, X, SlidersHorizontal,
    Wifi, Waves, UtensilsCrossed, Laptop, Dumbbell,
    Heart, Star, MapPin, Users, Shield, ArrowRight, BedDouble, Bath
} from "lucide-react";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const PROPERTY_TYPES = [
    { id: "Apartment", label: "Modern Lofts" },
    { id: "Treehouse", label: "Treehouses" },
    { id: "Crashpad", label: "Unique Crashpads" },
    { id: "Villa", label: "Villas" },
    { id: "Cottage", label: "Cottages" },
];

const AMENITIES = [
    { id: "Wifi", label: "Wi-Fi", Icon: Wifi },
    { id: "Pool", label: "Pool", Icon: Waves },
    { id: "Kitchen", label: "Kitchen", Icon: UtensilsCrossed },
    { id: "Workspace", label: "Workspace", Icon: Laptop },
    { id: "Gym", label: "Gym", Icon: Dumbbell },
];

const SORT_OPTIONS = [
    { id: "newest", label: "Newest" },
    { id: "price_asc", label: "Price ↑" },
    { id: "price_desc", label: "Price ↓" },
];

const DEFAULT_FILTERS = {
    minPrice: 0,
    maxPrice: 10000,
    propertyType: [],
    amenities: [],
};

// ─────────────────────────────────────────────
// Skeleton Card
// ─────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="flex flex-col gap-3 animate-pulse bg-white dark:bg-gray-800 p-4 rounded-[2.5rem] border border-gray-100 dark:border-gray-700">
            <div className="rounded-[2rem] bg-gray-200 dark:bg-gray-700 aspect-[4/5] w-full" />
            <div className="space-y-3 mt-4 px-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4" />
                <div className="h-4 bg-gray-100 dark:border-gray-800 rounded-full w-1/2" />
                <div className="flex justify-between items-center mt-6">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-1/3" />
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Search Page Component
// ─────────────────────────────────────────────
function Search() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    
    // Initial state from URL
    const initialLocation = searchParams.get("location") || "";
    const initialCity = searchParams.get("city")?.trim() || "";
    const initialState = searchParams.get("state")?.trim() || "";
    const initialGuests = parseInt(searchParams.get("guests")) || 0;
    const initialCheckIn = searchParams.get("checkIn") || "";
    const initialCheckOut = searchParams.get("checkOut") || "";

    const [homes, setHomes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [sort, setSort] = useState("newest");
    const [sortOpen, setSortOpen] = useState(false);
    const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
    const [activeLocation, setActiveLocation] = useState(initialLocation);
    const [activeCity, setActiveCity] = useState(initialCity);
    const [activeState, setActiveState] = useState(initialState);
    const [activeGuests, setActiveGuests] = useState(initialGuests);
    
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(true);
    const debounceRef = useRef(null);

    // ── Helpers ──────────────────────────────
    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const toggleArrayFilter = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: prev[key].includes(value)
                ? prev[key].filter(v => v !== value)
                : [...prev[key], value],
        }));
    };

    const clearFilters = () => {
        setFilters(DEFAULT_FILTERS);
        setSort("newest");
        setActiveCity("");
        setActiveState("");
        setActiveLocation("");
    };

    const activeCount = [
        filters.minPrice > 0 || filters.maxPrice < 10000 ? 1 : 0,
        filters.propertyType.length,
        filters.amenities.length,
    ].reduce((a, b) => a + b, 0);


    // ── Fetch with debounce ───────────────────
    const fetchHomes = useCallback(async (currentFilters, currentSort, loc, g, city, state) => {
        setLoading(true);
        try {
            // Build shared params for homes endpoint
            const homeParams = {
                minPrice: currentFilters.minPrice,
                maxPrice: currentFilters.maxPrice,
                propertyType: currentFilters.propertyType.join(",") || undefined,
                amenities: currentFilters.amenities.join(",") || undefined,
                sort: currentSort,
                guests: g || undefined,
            };

            // Use city/state for filtered search, or location for text search
            if (city) homeParams.city = city.trim();
            if (state) homeParams.state = state.trim();
            if (!city && !state && loc) homeParams.location = loc;

            // ── Fetch from homes and crashpads in parallel ──
            const homesPromise = API.get("/homes/", { params: homeParams })
                .then(res => Array.isArray(res.data) ? res.data.map(h => ({ ...h, _type: "home" })) : [])
                .catch(err => { console.error("❌ Homes fetch error:", err); return []; });

            // Only search crashpads when city/state given (different location schema)
            const crashpadsPromise = (city || state)
                ? CrashpadService.search(city, state, g)
                    .then(res => Array.isArray(res) ? res.map(c => ({ ...c, _type: "crashpad" })) : [])
                    .catch(err => { console.error("❌ Crashpads fetch error:", err); return []; })
                : Promise.resolve([]);

            const [homesData, crashpadsData] = await Promise.all([homesPromise, crashpadsPromise]);
            const combined = [...homesData, ...crashpadsData];

            console.log(`🔍 Search results: city=${city}, state=${state} → ${homesData.length} homes + ${crashpadsData.length} crashpads`);
            setHomes(combined);
        } catch (err) {
            console.error("❌ Error fetching listings:", err);
            setHomes([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchHomes(filters, sort, activeLocation, activeGuests, activeCity, activeState);
        }, 400);
        return () => clearTimeout(debounceRef.current);
    }, [filters, sort, activeLocation, activeGuests, activeCity, activeState, fetchHomes]);

    // Handle search update from Bar
    const handleSearch = (params) => {
        setActiveLocation(params.location);
        setActiveGuests(params.guests);
        // Also update city/state if they came from the smart parser
        if (params.city) setActiveCity(params.city);
        if (params.state) setActiveState(params.state);
    };

    const currentSortLabel = SORT_OPTIONS.find(o => o.id === sort)?.label ?? "Sort";

    return (
        <div className="bg-[#F8FAFC] dark:bg-gray-950 min-h-screen font-sans transition-colors duration-300 pb-20">
            {/* Header / SearchBar context */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-16 z-30 py-4 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-full max-w-3xl">
                        <SearchBar 
                            onSearch={handleSearch} 
                            initialValues={{ 
                                location: initialCity ? `${initialCity}${initialState ? `, ${initialState}` : ""}` : initialLocation,
                                guests: initialGuests,
                                checkIn: initialCheckIn,
                                checkOut: initialCheckOut,
                            }} 
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-12">
                <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>

                    {/* ─── Sidebar (Desktop) ─────────────────────────── */}
                    <aside className="hidden lg:block shrink-0" style={{
                         width: filtersOpen ? '320px' : '0px',
                         opacity: filtersOpen ? 1 : 0,
                         overflow: 'hidden',
                         visibility: filtersOpen ? 'visible' : 'hidden',
                         transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, margin 0.4s',
                         marginRight: filtersOpen ? '0px' : '-40px'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '20px',
                            border: '1px solid #F3F4F6',
                            padding: '24px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            position: 'sticky',
                            top: '100px',
                            zIndex: 10,
                        }}>
                            <FilterContent 
                                activeCount={activeCount} 
                                clearFilters={clearFilters} 
                                filters={filters} 
                                updateFilter={updateFilter} 
                                toggleArrayFilter={toggleArrayFilter} 
                            />
                        </div>
                    </aside>

                    {/* ─── Results Area ─────────────────────── */}
                    <div className="flex-1 min-w-0">
                        {/* Results header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <h1 style={{ fontSize: '32px', fontWeight: '900',
                                        color: '#111827', margin: 0 }}>
                                        <span style={{ color: '#EA580C' }}>{homes.length} STAYS</span>
                                        {' '}AVAILABLE
                                    </h1>
                                    
                                    <button
                                        onClick={() => setFiltersOpen(!filtersOpen)}
                                        className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-xs text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm"
                                        style={{ height: '38px' }}
                                    >
                                        {filtersOpen ? <X size={14} /> : <SlidersHorizontal size={14} />}
                                        {filtersOpen ? 'Hide Filters' : 'Show Filters'}
                                    </button>
                                </div>
                                {(activeCity || activeState) ? (
                                    <p style={{ color: '#9CA3AF', fontSize: '14px', margin: 0 }}>
                                        Showing results for{' '}
                                        <strong style={{ color: '#374151' }}>
                                            {activeCity?.toUpperCase()}, {activeState?.toUpperCase()}
                                        </strong>
                                    </p>
                                ) : activeLocation && (
                                    <p style={{ color: '#9CA3AF', fontSize: '14px', margin: 0 }}>
                                        Showing results for <strong style={{ color: '#374151' }}>"{activeLocation.toUpperCase()}"</strong>
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                {/* Mobile Filter Toggle */}
                                <button 
                                    onClick={() => setMobileFiltersOpen(true)}
                                    className="lg:hidden flex-1 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-3 font-bold text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900"
                                >
                                    <SlidersHorizontal size={18} />
                                    Filters
                                </button>

                                {/* Sort dropdown */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '10px 16px',
                                    border: '1.5px solid #E5E7EB', borderRadius: '12px',
                                    backgroundColor: 'white', cursor: 'pointer',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                    position: 'relative',
                                }}>
                                    <SlidersHorizontal size={15} color="#9CA3AF" />
                                    <select 
                                        value={sort}
                                        onChange={(e) => setSort(e.target.value)}
                                        style={{
                                            border: 'none', outline: 'none', backgroundColor: 'transparent',
                                            fontWeight: '600', fontSize: '13px', color: '#374151',
                                            cursor: 'pointer', appearance: 'none', paddingRight: '20px'
                                        }}
                                    >
                                        {SORT_OPTIONS.map(opt => (
                                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', pointerEvents: 'none' }} />
                                </div>

                                {/* View toggles */}
                                <div className="hidden md:flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-1 shadow-sm">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-2 rounded-xl transition-all duration-300 ${viewMode === "grid"
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                            }`}
                                    >
                                        <LayoutGrid size={20} strokeWidth={2.5} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-2 rounded-xl transition-all duration-300 ${viewMode === "list"
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                            }`}
                                    >
                                        <List size={20} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Grid / List */}
                        {loading ? (
                            <div className={`grid gap-8 ${viewMode === "list"
                                ? "grid-cols-1"
                                : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                                }`}>
                                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        ) : homes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                                <div className="w-24 h-24 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mb-8 border border-gray-100 dark:border-gray-800">
                                    <SlidersHorizontal size={40} className="text-gray-200 dark:text-gray-700" />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter uppercase">No stays found</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-sm font-medium">
                                    Try expanding your search or adjusting your filters to find more properties.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="px-10 py-4 bg-primary text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-primary/20"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className={`grid gap-8 ${viewMode === "list"
                                ? "grid-cols-1"
                                : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                                }`}>
                                {homes.map((home, index) => (
                                    <HomeCard key={`${home._type}_${home._id || home.id || index}`} home={home} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

                    {/* Mobile Filter Modal (Drawer Pattern) */}
            {mobileFiltersOpen && (
                <div 
                    className="fixed inset-0 z-[100] lg:hidden animate-fade-in"
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                >
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                        onClick={() => setMobileFiltersOpen(false)} 
                    />
                    <div 
                        className="absolute top-0 right-0 h-full w-[320px] bg-white dark:bg-gray-900 p-8 overflow-y-auto animate-slide-left shadow-2xl"
                        style={{ borderLeft: '1px solid #E5E7EB' }}
                    >
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Filters</h2>
                            <button onClick={() => setMobileFiltersOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-orange-50 hover:text-orange-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="pb-24">
                            <FilterContent 
                                activeCount={activeCount} 
                                clearFilters={clearFilters} 
                                filters={filters} 
                                updateFilter={updateFilter} 
                                toggleArrayFilter={toggleArrayFilter} 
                            />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-white border-t border-gray-100">
                            <button 
                                onClick={() => setMobileFiltersOpen(false)}
                                className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                            >
                                Show {homes.length} Stays
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function FilterContent({ activeCount, clearFilters, filters, updateFilter, toggleArrayFilter }) {
    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal size={20} className="text-primary" />
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Filters</h2>
                    {activeCount > 0 && (
                        <span className="bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                            {activeCount}
                        </span>
                    )}
                </div>
                {activeCount > 0 && (
                    <button
                        onClick={clearFilters}
                        className="text-xs font-black text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors uppercase tracking-widest"
                    >
                        <X size={12} strokeWidth={3} /> Clear
                    </button>
                )}
            </div>

            {/* ── Price Range ──────────────────── */}
            <div className="mb-10">
                <h3 style={{
                    fontSize: '10px', fontWeight: '800',
                    color: '#9CA3AF', textTransform: 'uppercase',
                    letterSpacing: '0.08em', marginBottom: '12px',
                }}>Price Range / night</h3>
                <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#EA580C' }}>
                        ₹{filters.minPrice.toLocaleString()} — ₹{filters.maxPrice >= 10000 ? "10,000+" : filters.maxPrice.toLocaleString()}
                    </span>
                </div>
                <div className="space-y-4">
                    <input
                        type="range"
                        min={0}
                        max={10000}
                        step={100}
                        value={filters.minPrice}
                        onChange={e => {
                            const v = Number(e.target.value);
                            if (v < filters.maxPrice) updateFilter("minPrice", v);
                        }}
                        className="w-full accent-primary cursor-pointer h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none"
                    />
                    <input
                        type="range"
                        min={0}
                        max={10000}
                        step={100}
                        value={filters.maxPrice}
                        onChange={e => {
                            const v = Number(e.target.value);
                            if (v > filters.minPrice) updateFilter("maxPrice", v);
                        }}
                        className="w-full accent-primary cursor-pointer h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none"
                    />
                </div>
            </div>

            {/* ── Property Type ────────────────── */}
            <div className="mb-10">
                <h3 style={{
                    fontSize: '10px', fontWeight: '800',
                    color: '#9CA3AF', textTransform: 'uppercase',
                    letterSpacing: '0.08em', marginBottom: '12px',
                }}>Property Type</h3>
                <div className="grid grid-cols-1 gap-2.5">
                    {PROPERTY_TYPES.map(({ id, label }) => {
                        const selected = filters.propertyType.includes(id);
                        return (
                            <label key={id} style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '10px 12px', borderRadius: '10px',
                                cursor: 'pointer', fontSize: '14px',
                                backgroundColor: selected ? '#FFF7ED' : 'transparent',
                                color: selected ? '#EA580C' : '#374151',
                                fontWeight: selected ? '700' : '400',
                                border: `1px solid ${selected ? '#FED7AA' : 'transparent'}`,
                                transition: 'all 0.15s',
                            }}>
                                <input 
                                    type="checkbox" 
                                    style={{ display: 'none' }} 
                                    checked={selected}
                                    onChange={() => toggleArrayFilter("propertyType", id)}
                                />
                                <div style={{
                                    width: '18px', height: '18px', borderRadius: '5px',
                                    border: `2px solid ${selected ? '#EA580C' : '#D1D5DB'}`,
                                    backgroundColor: selected ? '#EA580C' : 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    {selected && <Check size={11} color="white" strokeWidth={3} />}
                                </div>
                                {label}
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* ── Amenities ────────────────────── */}
            <div>
                <h3 style={{
                    fontSize: '10px', fontWeight: '800',
                    color: '#9CA3AF', textTransform: 'uppercase',
                    letterSpacing: '0.08em', marginBottom: '12px',
                }}>Amenities</h3>
                <div className="flex flex-wrap gap-2">
                    {AMENITIES.map(({ id, label, Icon }) => {
                        const active = filters.amenities.includes(id);
                        return (
                            <button
                                key={id}
                                onClick={() => toggleArrayFilter("amenities", id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 border ${active
                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                    : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-200 dark:hover:border-gray-700"
                                    }`}
                            >
                                <Icon size={14} strokeWidth={2.5} />
                                <span>{label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

export default Search;
