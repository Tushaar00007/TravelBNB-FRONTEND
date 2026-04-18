import React, { useState } from 'react';
import { Search, MapPin, IndianRupee, Users, Clock } from 'lucide-react';
import CustomDropdown from './CustomDropdown';

function FiltersBar({ onFilterChange, currentCity = "" }) {
    const [city, setCity] = useState(currentCity);
    const [maxPrice, setMaxPrice] = useState("Any Price");
    const [stayType, setStayType] = useState("All Types");
    const [duration, setDuration] = useState("Short Term");

    const handleSearch = (e) => {
        e.preventDefault();
        onFilterChange({ 
            city, 
            maxPrice: maxPrice === "Any Price" ? null : maxPrice.replace(/\D/g, ''),
            stayType: stayType === "All Types" ? null : stayType.toLowerCase(),
            duration: duration.toLowerCase()
        });
    };

    return (
        <div className="sticky top-20 z-40 px-6 py-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-gray-200 dark:border-gray-800 rounded-3xl shadow-２xl p-3 flex flex-col lg:flex-row items-center gap-2">
                    
                    {/* Location Input */}
                    <div className="flex-[1.2] flex items-center gap-4 px-6 py-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl w-full border-2 border-transparent hover:bg-white dark:hover:bg-gray-800 transition-all group">
                        <MapPin size={20} className="text-orange-500" />
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
                            <input 
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Where are you heading?"
                                className="bg-transparent w-full text-sm font-bold text-gray-900 dark:text-white outline-none placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* Custom Price Dropdown */}
                    <CustomDropdown 
                        label="Max Price"
                        icon={<IndianRupee size={20} />}
                        value={maxPrice}
                        onChange={setMaxPrice}
                        options={["Any Price", "Under ₹500", "Under ₹1000", "Under ₹2000"]}
                    />

                    {/* Custom Stay Type Dropdown */}
                    <CustomDropdown 
                        label="Stay Type"
                        icon={<Users size={20} />}
                        value={stayType}
                        onChange={setStayType}
                        options={["All Types", "Shared Room", "Private Room", "Dormitory"]}
                    />

                    {/* Custom Duration Dropdown */}
                    <CustomDropdown 
                        label="Duration"
                        icon={<Clock size={20} />}
                        value={duration}
                        onChange={setDuration}
                        options={["Short Term", "Long Term (1 mo+)"]}
                    />

                    {/* Global Search Button */}
                    <button 
                        onClick={handleSearch}
                        className="bg-orange-600 hover:bg-orange-700 text-white p-5 rounded-2xl shadow-xl shadow-orange-600/20 transform hover:scale-105 active:scale-95 transition-all lg:w-auto w-full flex items-center justify-center gap-3 shrink-0"
                    >
                        <Search size={22} strokeWidth={3} />
                        <span className="lg:hidden text-xs font-black uppercase tracking-widest">Update Results</span>
                    </button>

                </div>
            </div>
        </div>
    );
}

export default FiltersBar;
