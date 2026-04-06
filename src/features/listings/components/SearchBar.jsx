import { useState, useRef, useEffect, useMemo } from "react";
import { Search, MapPin, Navigation, Compass, Map, Building2, Plus, Minus, CalendarDays, ChevronLeft, ChevronRight, Plane, History } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Dropdown from "../../../components/ui/Dropdown";
import CrashpadService from "../../../services/crashpads";

function SearchBar({ onSearch, initialValues = {} }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(null);
    const barRef = useRef(null);

    const [location, setLocation] = useState(initialValues.location || "");
    const [guests, setGuests] = useState(initialValues.guests ? { adults: initialValues.guests, children: 0, infants: 0, pets: 0 } : { adults: 0, children: 0, infants: 0, pets: 0 });
    
    // Internal Search Data
    const [dbLocations, setDbLocations] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);

    // Calendar state
    const now = new Date();
    const [calMonth, setCalMonth] = useState(now.getMonth());
    const [calYear, setCalYear] = useState(now.getFullYear());
    // Pre-fill dates from initialValues (URL params) if provided
    const [checkIn, setCheckIn] = useState(
        initialValues.checkIn ? new Date(initialValues.checkIn) : null
    );
    const [checkOut, setCheckOut] = useState(
        initialValues.checkOut ? new Date(initialValues.checkOut) : null
    );
    const [hoverDate, setHoverDate] = useState(null);
    const [activeWhenTab, setActiveWhenTab] = useState("dates"); // "dates" | "flexible"
    const [flexibleDuration, setFlexibleDuration] = useState("weekend"); // "weekend" | "week" | "month"
    const [selectedFlexibleMonth, setSelectedFlexibleMonth] = useState(null);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Fetch unique locations from DB on mount
    useEffect(() => {
        const fetchLocs = async () => {
            const locs = await CrashpadService.getLocations();
            setDbLocations(locs);
        };
        fetchLocs();
    }, []);

    // Filter locations as user types
    useEffect(() => {
        if (!location.trim()) {
            setFilteredLocations([]);
            return;
        }
        const searchVal = location.toLowerCase();
        const filtered = dbLocations.filter(loc => 
            loc.city.toLowerCase().includes(searchVal) || 
            loc.state.toLowerCase().includes(searchVal)
        );
        setFilteredLocations(filtered);
    }, [location, dbLocations]);

    const prevMonth = () => {
        if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
        else setCalMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
        else setCalMonth(m => m + 1);
    };

    const isPast = (day, m = calMonth, y = calYear) => {
        const d = new Date(y, m, day);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return d < today;
    };

    const formatShortDate = (date) => `${date.getDate()} ${monthNames[date.getMonth()].slice(0, 3)}`;

    const handleDayClick = (day, m, y) => {
        if (!day || isPast(day, m, y)) return;
        const clicked = new Date(y, m, day);
        if (!checkIn || (checkIn && checkOut)) {
            setCheckIn(clicked);
            setCheckOut(null);
        } else {
            if (clicked <= checkIn) {
                setCheckIn(clicked);
                setCheckOut(null);
            } else {
                setCheckOut(clicked);
                setActiveTab("who"); // Switch to guests after selecting range
            }
        }
    };

    const updateGuests = (type, operation) => {
        setGuests(prev => {
            const current = prev[type];
            const newValue = operation === 'add' ? current + 1 : Math.max(0, current - 1);
            return { ...prev, [type]: newValue };
        });
    };

    const totalGuests = guests.adults + guests.children;

    const handleSearchExecute = () => {
        setActiveTab(null);
        const guestsCount = guests.adults + guests.children;
        const params = new URLSearchParams();
        
        // 🧠 Smart Parse Logic
        // Clean the input and split by common delimiters
        const parts = location.split(/[\s,]+/).filter(Boolean);
        
        if (parts.length > 0) {
            // Check if we have an exact match in our DB locations first
            const exactMatch = dbLocations.find(l => 
                l.city.toLowerCase() === parts[0].toLowerCase() && 
                (parts[1] ? l.state.toLowerCase() === parts[1].toLowerCase() : true)
            );

            if (exactMatch) {
                params.append("city", exactMatch.city);
                params.append("state", exactMatch.state);
            } else {
                // Fallback: Use individual parts
                params.append("city", parts[0]);
                if (parts[1]) params.append("state", parts[1]);
            }
        }

        if (guestsCount > 0) params.append("guests", guestsCount);
        if (checkIn) params.append("checkIn", checkIn.toISOString());
        if (checkOut) params.append("checkOut", checkOut.toISOString());
        
        navigate(`/search?${params.toString()}`);
        if (onSearch) onSearch({ location, guests: guestsCount });
    };

    return (
        <div className="w-full relative z-50">
            <div
                ref={barRef}
                className={`flex items-stretch rounded-full transition-all duration-500 relative border w-full ${activeTab
                    ? "border-primary shadow-premium ring-4 ring-primary/10"
                    : "border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600"
                    } bg-white dark:bg-gray-900 h-[72px]`}
            >
                {/* LOCATION */}
                <div className={`flex-[1.5] relative h-full ${activeTab === "where" ? "z-40" : "z-10"}`}>
                    <div
                        onClick={() => setActiveTab(activeTab === "where" ? null : "where")}
                        className={`px-8 py-4 cursor-pointer h-full transition-all duration-300 flex flex-col justify-center rounded-full ${activeTab === "where" ? "bg-gray-50 dark:bg-gray-800 shadow-inner" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                    >
                        <p className="text-[10px] font-black text-primary tracking-widest uppercase mb-1">Where</p>
                        <input
                            type="text"
                            className="w-full bg-transparent outline-none text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400 truncate"
                            placeholder="Search city or state"
                            value={location}
                            onChange={(e) => {
                                setLocation(e.target.value);
                                if (activeTab !== "where") setActiveTab("where");
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchExecute()}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <Dropdown 
                        isOpen={activeTab === "where"} 
                        onClose={() => setActiveTab(null)}
                        className="w-[420px]"
                    >
                        <div className="p-6">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 px-4 uppercase tracking-wider">
                                {filteredLocations.length > 0 ? "Matching locations" : "Suggested destinations"}
                            </p>
                            
                            <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {(filteredLocations.length > 0 ? filteredLocations : dbLocations.slice(0, 5)).map((item, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => { 
                                            setLocation(`${item.city}, ${item.state}`); 
                                            setActiveTab('when'); 
                                        }}
                                        className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 group`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 bg-gray-100 dark:bg-gray-800`}>
                                            <MapPin size={22} className="text-orange-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-gray-900 dark:text-white font-semibold group-hover:text-primary transition-colors">{item.city}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.state}</p>
                                        </div>
                                    </div>
                                ))}

                                {location && filteredLocations.length === 0 && (
                                    <div className="p-8 text-center">
                                        <p className="text-sm text-gray-500">No matching locations found in database.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Dropdown>
                </div>

                <div className="w-[1px] bg-gray-100 dark:bg-gray-800 my-4"></div>

                {/* DATES */}
                <div className={`flex-1 relative h-full ${activeTab === "when" ? "z-40" : "z-10"}`}>
                    <div
                        onClick={() => setActiveTab(activeTab === "when" ? null : "when")}
                        className={`px-8 py-4 cursor-pointer h-full transition-all duration-300 flex flex-col justify-center rounded-full ${activeTab === "when" ? "bg-gray-50 dark:bg-gray-800 shadow-inner" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                    >
                        <p className="text-[10px] font-black tracking-widest uppercase mb-1" style={{color: '#0D9488'}}>Check in / out</p>
                        <p className={`text-sm font-bold truncate ${checkIn || activeWhenTab === "flexible" ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                            {activeWhenTab === "flexible"
                                ? `${selectedFlexibleMonth ? selectedFlexibleMonth.split("-")[0] : "Any month"} · ${flexibleDuration.charAt(0).toUpperCase() + flexibleDuration.slice(1)}`
                                : checkIn && checkOut
                                    ? `${formatShortDate(checkIn)} - ${formatShortDate(checkOut)}`
                                    : checkIn
                                        ? `${formatShortDate(checkIn)} - Add date`
                                        : "Add dates"}
                        </p>
                    </div>

                    <Dropdown 
                        isOpen={activeTab === "when"} 
                        onClose={() => setActiveTab(null)}
                        className="w-[850px] left-1/2 -translate-x-1/2"
                    >
                        <div className="flex flex-col">
                            {/* Tab Switcher */}
                            <div className="flex justify-center pt-8">
                                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full">
                                    <button 
                                        onClick={() => setActiveWhenTab("dates")}
                                        className={`px-8 py-2 rounded-full text-sm font-bold transition-all ${activeWhenTab === "dates" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                    >
                                        Dates
                                    </button>
                                    <button 
                                        onClick={() => setActiveWhenTab("flexible")}
                                        className={`px-8 py-2 rounded-full text-sm font-bold transition-all ${activeWhenTab === "flexible" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                    >
                                        Flexible
                                    </button>
                                </div>
                            </div>

                            {activeWhenTab === "dates" ? (
                                <div className="p-8 flex gap-8">
                                    <MonthCalendar 
                                        month={calMonth} 
                                        year={calYear} 
                                        onPrev={prevMonth}
                                        onNext={nextMonth}
                                        onDayClick={handleDayClick}
                                        checkIn={checkIn}
                                        checkOut={checkOut}
                                        hoverDate={hoverDate}
                                        setHoverDate={setHoverDate}
                                        isPast={isPast}
                                    />
                                    <MonthCalendar 
                                        month={(calMonth + 1) % 12} 
                                        year={calMonth === 11 ? calYear + 1 : calYear} 
                                        onPrev={null}
                                        onNext={nextMonth}
                                        onDayClick={handleDayClick}
                                        checkIn={checkIn}
                                        checkOut={checkOut}
                                        hoverDate={hoverDate}
                                        setHoverDate={setHoverDate}
                                        isPast={isPast}
                                        hidePrev={true}
                                    />
                                </div>
                            ) : (
                                <div className="p-10 space-y-10">
                                    {/* Duration Selection */}
                                    <div className="space-y-6 text-center">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Stay for a {flexibleDuration}</h3>
                                        <div className="flex justify-center gap-4">
                                            {["weekend", "week", "month"].map(dur => (
                                                <button
                                                    key={dur}
                                                    onClick={() => setFlexibleDuration(dur)}
                                                    className={`px-8 py-3 rounded-full border-2 font-bold capitalize transition-all ${flexibleDuration === dur ? "border-orange-500 bg-orange-500 text-white shadow-lg" : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400"}`}
                                                >
                                                    {dur}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Month Selection */}
                                    <div className="space-y-6">
                                        <h3 className="text-center font-bold text-gray-500 uppercase tracking-widest text-xs">When do you want to go?</h3>
                                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar px-2">
                                            {Array.from({ length: 6 }).map((_, i) => {
                                                const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
                                                const mName = monthNames[d.getMonth()];
                                                const yName = d.getFullYear();
                                                const isSelected = selectedFlexibleMonth === `${mName}-${yName}`;
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => setSelectedFlexibleMonth(isSelected ? null : `${mName}-${yName}`)}
                                                        className={`flex-shrink-0 w-36 h-36 rounded-3xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${isSelected ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20" : "border-gray-100 dark:border-gray-800 hover:border-gray-300 bg-white dark:bg-gray-900"}`}
                                                    >
                                                        <CalendarDays size={32} className={isSelected ? "text-orange-500" : "text-gray-400"} />
                                                        <div className="text-center">
                                                            <p className={`font-bold ${isSelected ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>{mName}</p>
                                                            <p className="text-xs text-gray-400">{yName}</p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Dropdown>
                </div>

                <div className="w-[1px] bg-gray-100 dark:bg-gray-800 my-4"></div>

                {/* GUESTS */}
                <div className={`flex-1 relative h-full ${activeTab === "who" ? "z-40" : "z-10"}`}>
                    <div
                        onClick={() => setActiveTab(activeTab === "who" ? null : "who")}
                        className={`pl-8 pr-3 py-3 h-full cursor-pointer transition-all duration-300 flex items-center justify-between gap-4 rounded-full ${activeTab === "who" ? "bg-gray-50 dark:bg-gray-800 shadow-inner" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                    >
                        <div className="flex flex-col justify-center">
                            <p className="text-[10px] font-black text-orange-600 tracking-widest uppercase mb-1">Who</p>
                            <p className={`text-sm font-bold truncate ${totalGuests > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                {totalGuests > 0 ? `${totalGuests} Guests` : "Add guests"}
                            </p>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSearchExecute();
                            }}
                            className={`bg-primary hover:bg-orange-700 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg p-4 transform hover:scale-110 active:scale-95 h-12 w-12 shrink-0 self-center`}
                        >
                            <Search size={20} strokeWidth={3} />
                        </button>
                    </div>

                    <Dropdown 
                        isOpen={activeTab === "who"} 
                        onClose={() => setActiveTab(null)}
                        className="w-[400px] right-0"
                    >
                        <div className="p-8">
                            <GuestCounter
                                title="Adults"
                                subtitle="Ages 13 or above"
                                count={guests.adults}
                                onAdd={() => updateGuests("adults", "add")}
                                onSub={() => updateGuests("adults", "sub")}
                            />
                            <div className="h-[1px] w-full bg-gray-100 dark:bg-gray-800 my-6"></div>

                            <GuestCounter
                                title="Children"
                                subtitle="Ages 2–12"
                                count={guests.children}
                                onAdd={() => updateGuests("children", "add")}
                                onSub={() => updateGuests("children", "sub")}
                            />
                            <div className="h-[1px] w-full bg-gray-100 dark:bg-gray-800 my-6"></div>

                            <GuestCounter
                                title="Infants"
                                subtitle="Under 2"
                                count={guests.infants}
                                onAdd={() => updateGuests("infants", "add")}
                                onSub={() => updateGuests("infants", "sub")}
                            />
                            <div className="h-[1px] w-full bg-gray-100 dark:bg-gray-800 my-6"></div>

                            <GuestCounter
                                title="Pets"
                                subtitle={<a href="#" className="underline">Bringing a service animal?</a>}
                                count={guests.pets}
                                onAdd={() => updateGuests("pets", "add")}
                                onSub={() => updateGuests("pets", "sub")}
                            />
                        </div>
                    </Dropdown>
                </div>
            </div>
        </div>
    );
}

function MonthCalendar({ month, year, onPrev, onNext, onDayClick, checkIn, checkOut, hoverDate, setHoverDate, isPast, hidePrev, hideNext }) {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const days = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const blanks = Array(firstDay).fill(null);
        const daysArr = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        return [...blanks, ...daysArr];
    }, [month, year]);

    const isToday = (day) => {
        const now = new Date();
        return day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
    };

    const isInRange = (day) => {
        if (!day || !checkIn) return false;
        const d = new Date(year, month, day).getTime();
        const end = checkOut ? checkOut.getTime() : (hoverDate ? hoverDate.getTime() : 0);
        if (!end) return false;
        return d > checkIn.getTime() && d < end;
    };

    const isCheckIn = (day) => checkIn && day && new Date(year, month, day).getTime() === checkIn.getTime();
    const isCheckOut = (day) => checkOut && day && new Date(year, month, day).getTime() === checkOut.getTime();

    return (
        <div className="flex-1 min-w-[320px]">
            <div className="flex justify-between items-center mb-6 px-2">
                <div className="w-8 h-8 flex items-center justify-center">
                    {!hidePrev && onPrev && (
                        <button onClick={onPrev} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                            <ChevronLeft size={20} />
                        </button>
                    )}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{monthNames[month]} {year}</h3>
                <div className="w-8 h-8 flex items-center justify-center">
                    {!hideNext && onNext && (
                        <button onClick={onNext} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                            <ChevronRight size={20} />
                        </button>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-7 text-center gap-y-2 text-sm">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-gray-400 font-semibold text-xs pb-3">{day}</div>
                ))}
                {days.map((day, i) => {
                    const isDisabled = day ? isPast(day, month, year) : true;
                    return (
                        <div key={i} className={`flex items-center justify-center relative ${day && isInRange(day) ? 'bg-orange-50 dark:bg-orange-900/10' : ''} ${day && isCheckIn(day) ? 'rounded-l-full bg-orange-50 dark:bg-orange-900/10' : ''} ${day && isCheckOut(day) ? 'rounded-r-full bg-orange-50 dark:bg-orange-900/10' : ''}`}>
                            {day ? (
                                <button
                                    onClick={() => onDayClick(day, month, year)}
                                    onMouseEnter={() => { if (checkIn && !checkOut && !isDisabled) setHoverDate(new Date(year, month, day)); }}
                                    onMouseLeave={() => setHoverDate(null)}
                                    disabled={isDisabled}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all relative z-10
                                        ${isDisabled ? 'text-gray-300 dark:text-gray-600 cursor-default' : ''}
                                        ${isCheckIn(day) || isCheckOut(day) ? 'bg-orange-600 dark:bg-orange-500 text-white shadow-md' : ''}
                                        ${isToday(day) && !isCheckIn(day) && !isCheckOut(day) ? 'font-extrabold text-orange-600 dark:text-orange-400 underline underline-offset-4 decoration-2' : ''}
                                        ${!isDisabled && !isCheckIn(day) && !isCheckOut(day) ? 'text-gray-900 dark:text-white hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer' : ''}
                                    `}
                                >
                                    {day}
                                </button>
                            ) : <div className="w-10 h-10"></div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function GuestCounter({ title, subtitle, count, onAdd, onSub }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h4 className="text-gray-900 dark:text-white font-bold text-base">{title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={onSub}
                    disabled={count === 0}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${count === 0
                        ? 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : 'border-gray-400 dark:border-gray-500 text-gray-500 dark:text-gray-400 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    <Minus size={14} strokeWidth={3} />
                </button>
                <span className="w-4 text-center text-gray-900 dark:text-white font-medium">{count}</span>
                <button
                    onClick={onAdd}
                    className="w-8 h-8 rounded-full border border-gray-400 dark:border-gray-500 text-gray-500 dark:text-gray-400 flex items-center justify-center hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <Plus size={14} strokeWidth={3} />
                </button>
            </div>
        </div>
    )
}

export default SearchBar;