import React from 'react';
import { SlidersHorizontal, X, Check, Wifi, Waves, UtensilsCrossed, Laptop, Dumbbell } from 'lucide-react';
import { useSearchStore } from '../../../shared/stores/useSearchStore';

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

function FilterSidebar({ isOpen, onClose }) {
    const { filters, setFilters, toggleArrayFilter, clearFilters } = useSearchStore();

    const activeCount = [
        filters.minPrice > 0 || filters.maxPrice < 10000 ? 1 : 0,
        filters.propertyType.length,
        filters.amenities.length,
    ].reduce((a, b) => a + b, 0);

    const content = (
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

            {/* Price Range */}
            <div className="mb-10">
                <h3 className="text-[10px] font-800 text-gray-400 uppercase tracking-widest mb-3">Price Range / night</h3>
                <div className="mb-4">
                    <span className="text-[13px] font-800 text-primary">
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
                            if (v < filters.maxPrice) setFilters({ minPrice: v });
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
                            if (v > filters.minPrice) setFilters({ maxPrice: v });
                        }}
                        className="w-full accent-primary cursor-pointer h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none"
                    />
                </div>
            </div>

            {/* Property Type */}
            <div className="mb-10">
                <h3 className="text-[10px] font-800 text-gray-400 uppercase tracking-widest mb-3">Property Type</h3>
                <div className="grid grid-cols-1 gap-2.5">
                    {PROPERTY_TYPES.map(({ id, label }) => {
                        const selected = filters.propertyType.includes(id);
                        return (
                            <label key={id} className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer text-sm transition-all ${selected ? 'bg-orange-50 dark:bg-orange-950/20 text-primary font-bold border border-orange-100 dark:border-orange-900/30' : 'text-gray-600 dark:text-gray-400'}`}>
                                <input 
                                    type="checkbox" 
                                    className="hidden" 
                                    checked={selected}
                                    onChange={() => toggleArrayFilter("propertyType", id)}
                                />
                                <div className={`w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'bg-primary border-primary' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`}>
                                    {selected && <Check size={11} color="white" strokeWidth={3} />}
                                </div>
                                {label}
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Amenities */}
            <div>
                <h3 className="text-[10px] font-800 text-gray-400 uppercase tracking-widest mb-3">Amenities</h3>
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

    // Desktop version always visible if filtersOpen, mobile version in drawer handled by parent or here?
    // Let's make it a pure content component and handle the wrapper in Search.jsx for now to keep it simple,
    // OR handle the mobile drawer logic here.
    
    return (
        <div className="space-y-4">
            {content}
        </div>
    );
}

export default FilterSidebar;
