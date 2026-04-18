import React from 'react';
import { SlidersHorizontal, ChevronDown, LayoutGrid, List, X } from 'lucide-react';
import { useSearchStore } from '../../../shared/stores/useSearchStore';

const SORT_OPTIONS = [
    { id: "newest", label: "Newest" },
    { id: "price_asc", label: "Price ↑" },
    { id: "price_desc", label: "Price ↓" },
];

function SearchHeader({ 
    totalCount, 
    filtersOpen, 
    setFiltersOpen, 
    viewMode, 
    setViewMode, 
    onOpenMobileFilters 
}) {
    const { sort, setSort, city, state, location } = useSearchStore();

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
                <div className="flex items-center gap-4">
                    <h1 className="text-[32px] font-black text-gray-900 dark:text-white m-0">
                        <span className="text-primary">{totalCount} STAYS</span> AVAILABLE
                    </h1>
                    
                    <button
                        onClick={() => setFiltersOpen(!filtersOpen)}
                        className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl font-bold text-xs text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-primary hover:border-orange-200 transition-all shadow-sm h-[38px]"
                    >
                        {filtersOpen ? <X size={14} /> : <SlidersHorizontal size={14} />}
                        {filtersOpen ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </div>
                {(city || state) ? (
                    <p className="text-gray-400 dark:text-gray-500 text-sm m-0">
                        Showing results for{' '}
                        <strong className="text-gray-700 dark:text-gray-300">
                            {city?.toUpperCase()}, {state?.toUpperCase()}
                        </strong>
                    </p>
                ) : location && (
                    <p className="text-gray-400 dark:text-gray-500 text-sm m-0">
                        Showing results for <strong className="text-gray-700 dark:text-gray-300">"{location.toUpperCase()}"</strong>
                    </p>
                )}
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
                {/* Mobile Filter Toggle */}
                <button 
                    onClick={onOpenMobileFilters}
                    className="lg:hidden flex-1 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-3 font-bold text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900"
                >
                    <SlidersHorizontal size={18} />
                    Filters
                </button>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-1.5 border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 cursor-pointer shadow-sm relative">
                    <SlidersHorizontal size={15} className="text-gray-400" />
                    <select 
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="border-none outline-none bg-transparent font-semibold text-[13px] text-gray-700 dark:text-gray-300 cursor-pointer appearance-none pr-5"
                    >
                        {SORT_OPTIONS.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 pointer-events-none text-gray-400" />
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
    );
}

export default SearchHeader;
