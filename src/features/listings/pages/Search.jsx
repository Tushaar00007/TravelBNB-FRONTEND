import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import SearchHeader from "../components/SearchHeader";
import FilterSidebar from "../components/FilterSidebar";
import ResultsGrid from "../components/ResultsGrid";
import { useProperties } from "../hooks/useProperties";
import { useSearchStore } from "../../../shared/stores/useSearchStore";
import { X } from "lucide-react";

function Search() {
    const [searchParams] = useSearchParams();
    
    // Zustand Store
    const { 
        filters, sort, location, guests, city, state,
        setCity, setState, setLocation, setGuests, clearFilters
    } = useSearchStore();

    // Local UI States (Transient)
    const [viewMode, setViewMode] = useState("grid");
    const [filtersOpen, setFiltersOpen] = useState(true);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // Initial Sync from URL to Store
    useEffect(() => {
        const uCity = searchParams.get("city")?.trim();
        const uState = searchParams.get("state")?.trim();
        const uLoc = searchParams.get("location") || "";
        const uGuests = parseInt(searchParams.get("guests")) || 0;

        if (uCity) setCity(uCity);
        if (uState) setState(uState);
        if (uLoc) setLocation(uLoc);
        if (uGuests) setGuests(uGuests);
    }, []); // Only on mount

    // TanStack Query Hook
    const { data: homes = [], isLoading } = useProperties(
        filters, sort, location, guests, city, state
    );

    const handleSearchUpdate = (params) => {
        if (params.location) setLocation(params.location);
        if (params.guests) setGuests(params.guests);
        if (params.city) setCity(params.city);
        if (params.state) setState(params.state);
    };

    return (
        <div className="bg-[#F8FAFC] dark:bg-gray-950 min-h-screen font-sans transition-colors duration-300 pb-20">
            {/* Sticky Search Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-16 z-30 py-4 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-full max-w-3xl">
                        <SearchBar 
                            onSearch={handleSearchUpdate} 
                            initialValues={{ 
                                location: city ? `${city}${state ? `, ${state}` : ""}` : location,
                                guests: guests,
                            }} 
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-12">
                <div className="flex gap-10 items-start">

                    {/* Desktop Sidebar */}
                    <aside 
                        className={`hidden lg:block shrink-0 transition-all duration-400 ${filtersOpen ? 'w-[320px] opacity-100 mr-0' : 'w-0 opacity-0 -mr-10 invisible'}`}
                    >
                        <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100 dark:border-gray-800 p-6 shadow-sm sticky top-[100px] z-10 transition-colors">
                            <FilterSidebar />
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        <SearchHeader 
                            totalCount={homes.length}
                            filtersOpen={filtersOpen}
                            setFiltersOpen={setFiltersOpen}
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            onOpenMobileFilters={() => setMobileFiltersOpen(true)}
                        />

                        <ResultsGrid 
                            loading={isLoading}
                            homes={homes}
                            viewMode={viewMode}
                            onClearFilters={clearFilters}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
                    <div className="absolute top-0 right-0 h-full w-[320px] bg-white dark:bg-gray-950 p-8 overflow-y-auto animate-slide-left shadow-2xl border-l border-gray-100 dark:border-gray-800 transition-colors">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-2xl font-black uppercase tracking-tighter dark:text-white">Filters</h2>
                            <button onClick={() => setMobileFiltersOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-orange-50 hover:text-primary transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="pb-24">
                            <FilterSidebar />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
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

export default Search;
