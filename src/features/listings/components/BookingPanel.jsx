import { useState, useRef, useEffect } from 'react';
import {
    Star, ShieldCheck, TrendingUp, Tag, X,
    Loader2, ChevronDown, Minus, Plus, CalendarDays
} from 'lucide-react';
import { format } from 'date-fns';

// ─── Date field — showPicker() on click, full custom UI ──────────────────────
function DateField({ label, value, onChange, min }) {
    const inputRef = useRef(null);

    let display = null;
    if (value) {
        try { display = format(new Date(value + 'T00:00:00'), 'MMM d, yyyy'); } catch (_) {}
    }

    const openCalendar = (e) => {
        e.preventDefault();
        try {
            inputRef.current?.showPicker();   // Chrome 99+, Firefox 101+, Safari 16+
        } catch {
            inputRef.current?.focus();        // Fallback: focus opens the input
        }
    };

    return (
        <button type="button" onClick={openCalendar} className="p-4 text-left w-full group hover:bg-orange-50/40 dark:hover:bg-gray-700/30 transition-colors">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 select-none">
                {label}
            </p>
            <div className="flex items-center gap-2">
                <CalendarDays
                    size={16}
                    className={`shrink-0 transition-colors ${display ? 'text-orange-500' : 'text-gray-300 group-hover:text-orange-400'}`}
                />
                <span className={`text-sm font-bold select-none transition-colors ${display ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-600 group-hover:text-gray-400'}`}>
                    {display || 'Add date'}
                </span>
            </div>
            {/* Visually hidden but in DOM — showPicker() opens its native calendar */}
            <input
                ref={inputRef}
                type="date"
                value={value}
                min={min}
                onChange={(e) => onChange(e.target.value)}
                tabIndex={-1}
                className="sr-only"
            />
        </button>
    );
}

// ─── Stepper row inside the guests dropdown ──────────────────────────────────
function GuestRow({ label, sublabel, count, onDec, onInc, canDec, canInc }) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>
            </div>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onDec}
                    disabled={!canDec}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-500 flex items-center justify-center
                               hover:border-gray-800 dark:hover:border-white transition-colors
                               disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <Minus size={13} strokeWidth={3} />
                </button>
                <span className="text-base font-black text-gray-900 dark:text-white w-4 text-center tabular-nums">
                    {count}
                </span>
                <button
                    type="button"
                    onClick={onInc}
                    disabled={!canInc}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-500 flex items-center justify-center
                               hover:border-gray-800 dark:hover:border-white transition-colors
                               disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <Plus size={13} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
}

// ─── Guests dropdown (Adults / Children / Infants) ───────────────────────────
function GuestsDropdown({ guests, setGuestCount, maxGuests }) {
    const max = maxGuests || 10;

    // Internal breakdown — adults default to current guests total
    const [adults,   setAdults]   = useState(Math.max(1, guests));
    const [children, setChildren] = useState(0);
    const [infants,  setInfants]  = useState(0);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Sync total upward whenever breakdown changes
    useEffect(() => {
        setGuestCount(adults + children);
    }, [adults, children]);

    // Close on outside click
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const totalPaid = adults + children; // infants don't count toward max
    const canAddPaid = totalPaid < max;

    // Summary label
    const parts = [];
    if (adults)   parts.push(`${adults} adult${adults > 1 ? 's' : ''}`);
    if (children) parts.push(`${children} child${children > 1 ? 'ren' : ''}`);
    if (infants)  parts.push(`${infants} infant${infants > 1 ? 's' : ''}`);
    const label = parts.length ? parts.join(', ') : '1 guest';

    return (
        <div ref={ref} className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between p-4 group text-left"
            >
                <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 select-none">
                        Guests
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[180px]">
                        {label}
                    </p>
                </div>
                <ChevronDown
                    size={15}
                    className={`shrink-0 transition-all duration-200 ${open ? 'rotate-180 text-orange-500' : 'text-gray-400 group-hover:text-gray-600'}`}
                />
            </button>

            {/* ── Dropdown panel — rendered in-flow below the trigger ── */}
            {open && (
                <div className="mx-3 mb-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg px-5 pt-1 pb-3">

                    <GuestRow
                        label="Adults"
                        sublabel="Age 13+"
                        count={adults}
                        canDec={adults > 1}
                        canInc={canAddPaid}
                        onDec={() => setAdults(a => Math.max(1, a - 1))}
                        onInc={() => setAdults(a => a + 1)}
                    />
                    <GuestRow
                        label="Children"
                        sublabel="Ages 2–12"
                        count={children}
                        canDec={children > 0}
                        canInc={canAddPaid}
                        onDec={() => setChildren(c => Math.max(0, c - 1))}
                        onInc={() => setChildren(c => c + 1)}
                    />
                    <GuestRow
                        label="Infants"
                        sublabel="Under 2"
                        count={infants}
                        canDec={infants > 0}
                        canInc={true}
                        onDec={() => setInfants(i => Math.max(0, i - 1))}
                        onInc={() => setInfants(i => i + 1)}
                    />

                    {maxGuests > 0 && (
                        <p className="text-[10px] text-gray-400 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                            This place allows max {max} guests. Infants don't count toward the limit.
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="mt-3 ml-auto block text-xs font-black text-gray-700 dark:text-gray-300 hover:text-orange-600 transition underline-offset-2 hover:underline"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Main Booking Panel ───────────────────────────────────────────────────────
const BookingPanel = ({
    price, symbol,
    checkIn, setCheckIn,
    checkOut, setCheckOut,
    guests, setGuestCount, maxGuests,
    nights,
    subtotalDisplay, discountDisplay, taxDisplay, finalDisplay,
    couponInput, setCouponInput, couponMsg, appliedCoupon,
    handleApplyCoupon, handleRemoveCoupon,
    handleRequestToBook, isRequesting, highlightDates
}) => {
    const today = new Date().toISOString().split('T')[0];

    const toStr = (v) => {
        if (!v) return '';
        if (v instanceof Date) return v.toISOString().split('T')[0];
        return String(v).split('T')[0];
    };

    const checkInStr  = toStr(checkIn);
    const checkOutStr = toStr(checkOut);

    const handleCheckInChange = (str) => {
        setCheckIn(str ? new Date(str + 'T00:00:00') : null);
        if (checkOutStr && str >= checkOutStr) setCheckOut(null);
    };
    const handleCheckOutChange = (str) => setCheckOut(str ? new Date(str + 'T00:00:00') : null);

    const hasValidDates = checkInStr && checkOutStr && nights > 0;

    return (
        <div className="lg:sticky lg:top-28 h-fit">
            <div className={`
                bg-white dark:bg-gray-800 rounded-3xl border-2 shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-300
                ${highlightDates ? 'border-orange-500' : 'border-gray-100 dark:border-gray-700'}
            `}>
                <div className="p-7 pb-0">
                    {/* ── Price header ── */}
                    <div className="flex items-center justify-between mb-7">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black text-gray-900 dark:text-white">{symbol}{price}</span>
                            <span className="text-gray-400 font-semibold text-sm">/ night</span>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-full text-sm font-bold">
                            <Star size={13} className="fill-current" />
                            4.9
                        </div>
                    </div>
                </div>

                {/* ── Date + Guests block — NO overflow:hidden so dropdown isn't clipped ── */}
                <div className={`
                    mx-7 rounded-2xl border-2 transition-colors duration-300
                    ${highlightDates ? 'border-orange-400' : 'border-gray-200 dark:border-gray-600'}
                `}>
                    {/* Dates row */}
                    <div className="grid grid-cols-2 divide-x-2 divide-gray-200 dark:divide-gray-600 border-b-2 border-gray-200 dark:border-gray-600">
                        <DateField label="Check-in"  value={checkInStr}  min={today} onChange={handleCheckInChange} />
                        <DateField label="Check-out" value={checkOutStr} min={checkInStr || today} onChange={handleCheckOutChange} />
                    </div>

                    {/* Guests row — dropdown flows in-document so it won't be clipped */}
                    <GuestsDropdown guests={guests} setGuestCount={setGuestCount} maxGuests={maxGuests} />
                </div>

                <div className="p-7 pt-5">
                    {/* ── Stay summary ── */}
                    {hasValidDates && (
                        <div className="flex items-center gap-2.5 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl px-4 py-2.5 mb-5">
                            <CalendarDays size={15} className="text-orange-500 shrink-0" />
                            <p className="text-sm font-bold text-orange-700 dark:text-orange-400">
                                {nights} night{nights !== 1 ? 's' : ''} &nbsp;·&nbsp;
                                {format(new Date(checkInStr + 'T00:00:00'), 'MMM d')} – {format(new Date(checkOutStr + 'T00:00:00'), 'MMM d, yyyy')}
                            </p>
                        </div>
                    )}

                    {/* ── Pricing ── */}
                    <div className="space-y-3 mb-5">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span className="underline underline-offset-2 decoration-gray-300 font-semibold">
                                {symbol}{price} × {nights || 1} night{(nights || 1) !== 1 ? 's' : ''}
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white">{symbol}{subtotalDisplay}</span>
                        </div>
                        {appliedCoupon && (
                            <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400 font-bold">
                                <span>Discount ({appliedCoupon.code})</span>
                                <span>−{symbol}{discountDisplay}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span className="underline underline-offset-2 decoration-gray-300 font-semibold">GST (18%)</span>
                            <span className="font-bold text-gray-900 dark:text-white">{symbol}{taxDisplay}</span>
                        </div>
                        <div className="pt-4 border-t-2 border-dashed border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <span className="text-base font-black text-gray-900 dark:text-white">Total</span>
                            <span className="text-xl font-black text-gray-900 dark:text-white">{symbol}{finalDisplay}</span>
                        </div>
                    </div>

                    {/* ── Coupon ── */}
                    <div className="mb-5">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    id="coupon-input"
                                    type="text"
                                    value={couponInput}
                                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                    placeholder="Coupon code"
                                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-orange-500 rounded-xl text-sm font-bold outline-none text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 transition tracking-widest uppercase"
                                />
                            </div>
                            <button
                                onClick={handleApplyCoupon}
                                className="px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm shrink-0"
                            >
                                Apply
                            </button>
                        </div>
                        {couponMsg && (
                            <p className={`text-xs font-bold mt-2 ml-1 ${couponMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                {couponMsg.text}
                            </p>
                        )}
                        {appliedCoupon && (
                            <div className="mt-2 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-2.5">
                                <span className="text-xs font-black uppercase tracking-wider">✓ {appliedCoupon.code} — {appliedCoupon.label}</span>
                                <button onClick={handleRemoveCoupon} className="hover:opacity-70 transition ml-2"><X size={13} strokeWidth={3} /></button>
                            </div>
                        )}
                    </div>

                    {/* ── CTA ── */}
                    <button
                        onClick={handleRequestToBook}
                        disabled={isRequesting}
                        className="w-full bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-black py-4 rounded-2xl text-base transition-all shadow-lg shadow-orange-500/20 mb-3 overflow-hidden relative group disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isRequesting ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 size={18} className="animate-spin" /> Requesting…
                            </span>
                        ) : 'Request to book'}
                        <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12 pointer-events-none" />
                    </button>
                    <p className="text-center text-gray-400 text-xs font-medium mb-6">You won't be charged yet</p>

                    {/* ── Trust badges ── */}
                    <div className="space-y-3 border-t border-gray-100 dark:border-gray-700 pt-6">
                        {[
                            { Icon: TrendingUp, bg: 'bg-orange-600', light: 'bg-orange-50/70 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/20', title: 'Price Guarantee', sub: 'Best rates found anywhere.' },
                            { Icon: ShieldCheck, bg: 'bg-emerald-600', light: 'bg-emerald-50/70 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20', title: 'Trust & Safety', sub: 'Fully verified hosts & properties.' },
                        ].map(({ Icon, bg, light, title, sub }) => (
                            <div key={title} className={`flex items-start gap-3 p-3 rounded-xl ${light} border`}>
                                <div className={`${bg} text-white p-2 rounded-lg shrink-0`}><Icon size={16} /></div>
                                <div>
                                    <p className="text-sm font-black text-gray-900 dark:text-white">{title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPanel;
