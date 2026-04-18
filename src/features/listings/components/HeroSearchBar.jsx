import { useState, useRef, useEffect, useMemo } from "react";
import { Search, MapPin, Navigation, Compass, Map, Building2, Plus, Minus, CalendarDays, ChevronLeft, ChevronRight, Plane, History } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Dropdown from "../../../components/ui/Dropdown";
import CrashpadService from "../../../services/crashpads";
import { motion } from "framer-motion";

function HeroSearchBar({ onSearch, initialValues = {} }) {
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
    const [checkIn, setCheckIn] = useState(initialValues.checkIn ? new Date(initialValues.checkIn) : null);
    const [checkOut, setCheckOut] = useState(initialValues.checkOut ? new Date(initialValues.checkOut) : null);
    const [hoverDate, setHoverDate] = useState(null);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    useEffect(() => {
        const fetchLocs = async () => {
            const locs = await CrashpadService.getLocations();
            setDbLocations(locs);
        };
        fetchLocs();
    }, []);

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
                setActiveTab("who"); 
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
        const parts = location.split(/[\s,]+/).filter(Boolean);
        
        if (parts.length > 0) {
            const exactMatch = dbLocations.find(l => 
                l.city.toLowerCase() === parts[0].toLowerCase() && 
                (parts[1] ? l.state.toLowerCase() === parts[1].toLowerCase() : true)
            );
            if (exactMatch) {
                params.append("city", exactMatch.city);
                params.append("state", exactMatch.state);
            } else {
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
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="w-full max-w-5xl mx-auto"
        >
            <div
                ref={barRef}
                className={`flex items-stretch rounded-full transition-all duration-500 relative border w-full backdrop-blur-2xl ${activeTab
                    ? "bg-white/20 border-white/40 shadow-[0_0_50px_rgba(234,88,12,0.2)]"
                    : "bg-white/10 border-white/20 shadow-2xl hover:bg-white/15"
                    } h-[80px]`}
            >
                {/* LOCATION */}
                <div className={`flex-[1.5] relative h-full ${activeTab === "where" ? "z-40" : "z-10"}`}>
                    <div
                        onClick={() => setActiveTab(activeTab === "where" ? null : "where")}
                        className={`px-10 py-4 cursor-pointer h-full transition-all duration-300 flex flex-col justify-center rounded-full ${activeTab === "where" ? "bg-white/20" : "hover:bg-white/10"}`}
                    >
                        <p className="text-[10px] font-black text-primary tracking-widest uppercase mb-1 drop-shadow-sm">Where</p>
                        <input
                            type="text"
                            className="w-full bg-transparent outline-none text-base font-bold text-white placeholder-white/60 truncate"
                            placeholder="Search your destination..."
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
                        className="w-[420px] top-[90px] bg-white/95 backdrop-blur-xl border-white/20"
                    >
                        <div className="p-6">
                            <p className="text-[10px] font-black text-gray-400 mb-4 px-4 uppercase tracking-widest">
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
                                        className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-primary/5 group`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 bg-gray-50`}>
                                            <MapPin size={22} className="text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="text-gray-900 font-bold group-hover:text-primary transition-colors">{item.city}</h4>
                                            <p className="text-xs text-gray-500 font-medium">{item.state}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Dropdown>
                </div>

                <div className="w-[1px] bg-white/20 my-6"></div>

                {/* DATES */}
                <div className={`flex-1 relative h-full ${activeTab === "when" ? "z-40" : "z-10"}`}>
                    <div
                        onClick={() => setActiveTab(activeTab === "when" ? null : "when")}
                        className={`px-10 py-4 cursor-pointer h-full transition-all duration-300 flex flex-col justify-center rounded-full ${activeTab === "when" ? "bg-white/20" : "hover:bg-white/10"}`}
                    >
                        <p className="text-[10px] font-black text-white/70 tracking-widest uppercase mb-1 drop-shadow-sm">When</p>
                        <p className={`text-base font-bold truncate ${checkIn ? 'text-white' : 'text-white/60'}`}>
                            {checkIn && checkOut
                                ? `${formatShortDate(checkIn)} - ${formatShortDate(checkOut)}`
                                : checkIn
                                    ? `${formatShortDate(checkIn)} - Add date`
                                    : "Add dates"}
                        </p>
                    </div>

                    <Dropdown 
                        isOpen={activeTab === "when"} 
                        onClose={() => setActiveTab(null)}
                        className="w-[850px] left-1/2 -translate-x-1/2 top-[90px] bg-white/95 backdrop-blur-xl"
                    >
                        <div className="p-8 flex gap-8">
                            <MonthCalendar 
                                month={calMonth} year={calYear} 
                                onPrev={prevMonth} onNext={nextMonth}
                                onDayClick={handleDayClick}
                                checkIn={checkIn} checkOut={checkOut}
                                hoverDate={hoverDate} setHoverDate={setHoverDate}
                                isPast={isPast}
                            />
                            <MonthCalendar 
                                month={(calMonth + 1) % 12} 
                                year={calMonth === 11 ? calYear + 1 : calYear} 
                                onPrev={null} onNext={nextMonth}
                                onDayClick={handleDayClick}
                                checkIn={checkIn} checkOut={checkOut}
                                hoverDate={hoverDate} setHoverDate={setHoverDate}
                                isPast={isPast} hidePrev={true}
                            />
                        </div>
                    </Dropdown>
                </div>

                <div className="w-[1px] bg-white/20 my-6"></div>

                {/* GUESTS */}
                <div className={`flex-1 relative h-full ${activeTab === "who" ? "z-40" : "z-10"}`}>
                    <div
                        onClick={() => setActiveTab(activeTab === "who" ? null : "who")}
                        className={`pl-10 pr-4 py-4 h-full cursor-pointer transition-all duration-300 flex items-center justify-between gap-4 rounded-full ${activeTab === "who" ? "bg-white/20" : "hover:bg-white/10"}`}
                    >
                        <div className="flex flex-col justify-center">
                            <p className="text-[10px] font-black text-white/70 tracking-widest uppercase mb-1 drop-shadow-sm">Who</p>
                            <p className={`text-base font-bold truncate ${totalGuests > 0 ? 'text-white' : 'text-white/60'}`}>
                                {totalGuests > 0 ? `${totalGuests} Guests` : "Add guests"}
                            </p>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSearchExecute();
                            }}
                            className={`bg-primary hover:bg-orange-700 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_rgba(234,88,12,0.4)] p-4 transform hover:scale-105 active:scale-95 h-14 w-14 shrink-0 self-center`}
                        >
                            <Search size={24} strokeWidth={3} />
                        </button>
                    </div>

                    <Dropdown 
                        isOpen={activeTab === "who"} 
                        onClose={() => setActiveTab(null)}
                        className="w-[400px] right-0 top-[90px] bg-white/95 backdrop-blur-xl"
                    >
                        <div className="p-8">
                            <GuestCounter title="Adults" subtitle="Ages 13+" count={guests.adults} onAdd={() => updateGuests("adults", "add")} onSub={() => updateGuests("adults", "sub")} />
                            <div className="h-[1px] w-full bg-gray-100 my-6"></div>
                            <GuestCounter title="Children" subtitle="Ages 2–12" count={guests.children} onAdd={() => updateGuests("children", "add")} onSub={() => updateGuests("children", "sub")} />
                            <div className="h-[1px] w-full bg-gray-100 my-6"></div>
                            <GuestCounter title="Infants" subtitle="Under 2" count={guests.infants} onAdd={() => updateGuests("infants", "add")} onSub={() => updateGuests("infants", "sub")} />
                        </div>
                    </Dropdown>
                </div>
            </div>
        </motion.div>
    );
}

// Simplified Calendar for Hero
function MonthCalendar({ month, year, onPrev, onNext, onDayClick, checkIn, checkOut, hoverDate, setHoverDate, isPast, hidePrev, hideNext }) {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const blanks = Array(firstDay).fill(null);
    const daysArr = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const days = [...blanks, ...daysArr];

    const isInRange = (day) => {
        if (!day || !checkIn) return false;
        const d = new Date(year, month, day).getTime();
        const end = checkOut ? checkOut.getTime() : (hoverDate ? hoverDate.getTime() : 0);
        return d > checkIn.getTime() && d < end;
    };
    const isCheckIn = (day) => checkIn && day && new Date(year, month, day).getTime() === checkIn.getTime();
    const isCheckOut = (day) => checkOut && day && new Date(year, month, day).getTime() === checkOut.getTime();

    return (
        <div className="flex-1 min-w-[320px]">
            <div className="flex justify-between items-center mb-6 px-2">
                <div className="w-8 h-8 flex items-center justify-center">
                    {!hidePrev && onPrev && <button onClick={onPrev} className="text-gray-400 hover:text-primary transition"><ChevronLeft size={20} /></button>}
                </div>
                <h3 className="font-bold text-gray-900 text-base">{monthNames[month]} {year}</h3>
                <div className="w-8 h-8 flex items-center justify-center">
                    {!hideNext && onNext && <button onClick={onNext} className="text-gray-400 hover:text-primary transition"><ChevronRight size={20} /></button>}
                </div>
            </div>
            <div className="grid grid-cols-7 text-center gap-y-1 text-xs">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-gray-400 font-bold pb-2">{d}</div>)}
                {days.map((day, i) => {
                    const isDisabled = day ? isPast(day, month, year) : true;
                    return (
                        <div key={i} className={`flex items-center justify-center relative ${day && isInRange(day) ? 'bg-primary/10' : ''} ${day && isCheckIn(day) ? 'rounded-l-full bg-primary/10' : ''} ${day && isCheckOut(day) ? 'rounded-r-full bg-primary/10' : ''}`}>
                            {day ? (
                                <button
                                    onClick={() => onDayClick(day, month, year)}
                                    onMouseEnter={() => { if (checkIn && !checkOut && !isDisabled) setHoverDate(new Date(year, month, day)); }}
                                    onMouseLeave={() => setHoverDate(null)}
                                    disabled={isDisabled}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all relative z-10
                                        ${isDisabled ? 'text-gray-200' : 'text-gray-800 hover:bg-primary/20'}
                                        ${isCheckIn(day) || isCheckOut(day) ? 'bg-primary text-white shadow-md shadow-primary/30' : ''}
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
                <h4 className="text-gray-900 font-bold text-sm">{title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={onSub} disabled={count === 0} className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${count === 0 ? 'border-gray-200 text-gray-200' : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary'}`}><Minus size={14} strokeWidth={3} /></button>
                <span className="w-4 text-center text-gray-900 font-bold text-sm">{count}</span>
                <button onClick={onAdd} className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"><Plus size={14} strokeWidth={3} /></button>
            </div>
        </div>
    )
}

export default HeroSearchBar;
