import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Star, MapPin, Users, Wifi, Coffee, Utensils, ArrowLeft,
    X, Share2, Heart, Info, Clock, ShieldCheck, Moon, Sofa,
    DoorOpen, Globe, AlertCircle, Trash2, LayoutDashboard,
    Image as ImageIcon, ChevronDown, Minus, Plus, Tag, Loader2,
    CalendarDays, Tv, Wind, Car, Bath, BedDouble, CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import API from "../../../services/api";
import { useHost } from "../../../context/HostContext";
import ShareModal from "../../../components/ShareModal";

// ─── Helpers ────────────────────────────────────────────────────────────────

const AMENITY_ICONS = {
    wifi: Wifi, coffee: Coffee, breakfast: Coffee, kitchen: Utensils,
    tv: Tv, ac: Wind, aircon: Wind, parking: Car, bath: Bath, bedroom: BedDouble,
};

function amenityIcon(name) {
    const key = Object.keys(AMENITY_ICONS).find(k => name.toLowerCase().includes(k));
    const Icon = key ? AMENITY_ICONS[key] : CheckCircle2;
    return <Icon size={18} />;
}

function stayTypeIcon(type) {
    const t = type?.toLowerCase();
    if (t === "couch")   return <Sofa size={16} />;
    if (t === "shared")  return <Users size={16} />;
    if (t === "private") return <DoorOpen size={16} />;
    return <Moon size={16} />;
}

function nightsCount(ci, co) {
    if (!ci || !co) return 0;
    return Math.max(0, Math.round((new Date(co) - new Date(ci)) / 86400000));
}

// ─── Fade-in wrapper ─────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0, className = "" }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ title, children }) {
    return (
        <div className="py-8 border-b border-gray-100 last:border-0">
            {title && (
                <h2 className="text-xl font-bold text-gray-900 mb-5">{title}</h2>
            )}
            {children}
        </div>
    );
}

// ─── Hero Gallery ────────────────────────────────────────────────────────────

const FALLBACK = [
    "https://images.unsplash.com/photo-1555854817-5b2337a93d83?w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1536633390841-3310705f32cb?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop",
];

function HeroGallery({ images = [], onShowAll, onShare, liked, onLike }) {
    const imgs = images.length ? images : FALLBACK;

    return (
        <div className="relative rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px]">
                {/* Main large image */}
                <div
                    className="col-span-2 row-span-2 cursor-pointer group relative overflow-hidden"
                    onClick={() => onShowAll(0)}
                >
                    <img
                        src={imgs[0]}
                        alt="Main"
                        onError={(e) => { e.target.src = FALLBACK[0]; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors pointer-events-none" />
                </div>
                {/* 4 smaller images */}
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="col-span-1 row-span-1 cursor-pointer group relative overflow-hidden"
                        onClick={() => onShowAll(i)}
                    >
                        <img
                            src={imgs[i] || imgs[0]}
                            alt={`View ${i}`}
                            onError={(e) => { e.target.src = FALLBACK[0]; }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors pointer-events-none" />
                    </div>
                ))}
            </div>

            {/* Overlay actions */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button
                    onClick={onShare}
                    className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-2 rounded-full shadow-md hover:bg-white hover:scale-105 active:scale-95 transition-all"
                >
                    <Share2 size={14} /> Share
                </button>
                <button
                    onClick={onLike}
                    className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-2 rounded-full shadow-md hover:bg-white hover:scale-105 active:scale-95 transition-all"
                >
                    <Heart size={14} className={liked ? "fill-red-500 text-red-500" : ""} />
                    {liked ? "Saved" : "Save"}
                </button>
            </div>

            {/* Show all button */}
            <button
                onClick={() => onShowAll(0)}
                className="absolute bottom-4 right-4 flex items-center gap-2 bg-white text-gray-900 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:scale-105 active:scale-95 transition-all z-10"
            >
                <ImageIcon size={15} /> Show all photos
            </button>
        </div>
    );
}

// ─── Lightbox ────────────────────────────────────────────────────────────────

function Lightbox({ images, index, onClose }) {
    const [current, setCurrent] = useState(index);
    const imgs = images.length ? images : FALLBACK;

    useEffect(() => {
        const handler = (e) => {
            if (e.key === "ArrowLeft")  setCurrent(c => (c - 1 + imgs.length) % imgs.length);
            if (e.key === "ArrowRight") setCurrent(c => (c + 1) % imgs.length);
            if (e.key === "Escape")     onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [imgs.length]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black/95 flex flex-col p-6"
        >
            <button onClick={onClose} className="self-end text-white/60 hover:text-white mb-4 transition">
                <X size={28} />
            </button>
            <div className="flex-1 flex items-center justify-center">
                <button
                    onClick={() => setCurrent(c => (c - 1 + imgs.length) % imgs.length)}
                    className="text-white/40 hover:text-white px-4 transition text-4xl font-thin"
                >‹</button>
                <img
                    src={imgs[current]}
                    alt=""
                    className="max-h-[75vh] max-w-[80vw] object-contain rounded-xl shadow-2xl"
                />
                <button
                    onClick={() => setCurrent(c => (c + 1) % imgs.length)}
                    className="text-white/40 hover:text-white px-4 transition text-4xl font-thin"
                >›</button>
            </div>
            <div className="flex justify-center gap-2 mt-4 flex-wrap">
                {imgs.map((img, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${current === i ? "border-orange-500 scale-110" : "border-transparent opacity-50"}`}
                    >
                        <img src={img} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        </motion.div>
    );
}

// ─── Date Field ──────────────────────────────────────────────────────────────

function DateField({ label, value, onChange, min }) {
    const ref = useRef(null);
    const display = value
        ? (() => { try { return format(new Date(value + "T00:00:00"), "MMM d, yyyy"); } catch { return value; } })()
        : null;

    const open = (e) => {
        e.preventDefault();
        try { ref.current?.showPicker(); } catch { ref.current?.focus(); }
    };

    return (
        <button type="button" onClick={open} className="p-4 text-left w-full group">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
            <div className="flex items-center gap-2">
                <CalendarDays size={15} className={`shrink-0 ${display ? "text-orange-500" : "text-gray-300 group-hover:text-orange-400 transition-colors"}`} />
                <span className={`text-sm font-semibold ${display ? "text-gray-900" : "text-gray-300 group-hover:text-gray-400 transition-colors"}`}>
                    {display || "Add date"}
                </span>
            </div>
            <input
                ref={ref}
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

// ─── Guest Selector ──────────────────────────────────────────────────────────

function GuestSelector({ adults, children, infants, maxGuests, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const max = maxGuests || 10;
    const totalPaid = adults + children;
    const label = [
        adults && `${adults} adult${adults > 1 ? "s" : ""}`,
        children && `${children} child${children !== 1 ? "ren" : ""}`,
        infants && `${infants} infant${infants > 1 ? "s" : ""}`,
    ].filter(Boolean).join(", ") || "Add guests";

    const Row = ({ name, sub, val, canDec, canInc, onDec, onInc }) => (
        <div className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
            <div>
                <p className="text-sm font-semibold text-gray-900">{name}</p>
                <p className="text-xs text-gray-400">{sub}</p>
            </div>
            <div className="flex items-center gap-3">
                <button type="button" onClick={onDec} disabled={!canDec}
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
                ><Minus size={12} strokeWidth={2.5} /></button>
                <span className="text-sm font-bold text-gray-900 w-3 text-center">{val}</span>
                <button type="button" onClick={onInc} disabled={!canInc}
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
                ><Plus size={12} strokeWidth={2.5} /></button>
            </div>
        </div>
    );

    return (
        <div ref={ref} className="relative">
            <button type="button" onClick={() => setOpen(o => !o)} className="p-4 text-left w-full group flex items-center justify-between">
                <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Guests</p>
                    <p className={`text-sm font-semibold ${totalPaid || infants ? "text-gray-900" : "text-gray-300 group-hover:text-gray-400 transition-colors"}`}>{label}</p>
                </div>
                <ChevronDown size={15} className={`text-gray-400 transition-transform ${open ? "rotate-180 text-orange-500" : ""}`} />
            </button>

            {open && (
                <div className="mx-3 mb-3 bg-white rounded-2xl border border-gray-100 shadow-xl p-4">
                    <Row name="Adults" sub="Age 13+" val={adults} canDec={adults > 1} canInc={totalPaid < max}
                        onDec={() => onChange({ adults: adults - 1, children, infants })}
                        onInc={() => onChange({ adults: adults + 1, children, infants })} />
                    <Row name="Children" sub="Ages 2–12" val={children} canDec={children > 0} canInc={totalPaid < max}
                        onDec={() => onChange({ adults, children: children - 1, infants })}
                        onInc={() => onChange({ adults, children: children + 1, infants })} />
                    <Row name="Infants" sub="Under 2" val={infants} canDec={infants > 0} canInc
                        onDec={() => onChange({ adults, children, infants: infants - 1 })}
                        onInc={() => onChange({ adults, children, infants: infants + 1 })} />
                    {maxGuests > 0 && (
                        <p className="text-[10px] text-gray-400 mt-3 pt-3 border-t border-gray-100">
                            Max {max} guests. Infants don't count toward the limit.
                        </p>
                    )}
                    <button type="button" onClick={() => setOpen(false)}
                        className="mt-3 w-full text-xs font-bold text-right text-gray-600 hover:text-orange-600 transition">
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Booking Card ─────────────────────────────────────────────────────────────

function BookingCard({
    pad, checkIn, setCheckIn, checkOut, setCheckOut,
    adults, children, infants, onGuestsChange,
    coupon, setCoupon, discount, setDiscount, isApplyingCoupon, applyCoupon,
    onRequest, isOwner
}) {
    const today = new Date().toISOString().split("T")[0];
    const toStr = (v) => { if (!v) return ""; if (v instanceof Date) return v.toISOString().split("T")[0]; return String(v).split("T")[0]; };
    const ciStr = toStr(checkIn), coStr = toStr(checkOut);
    const nights = nightsCount(ciStr, coStr);
    const pricePerNight = pad?.price_per_night || 0;
    const subtotal = pricePerNight * (nights || 1);
    const actualSubtotal = pricePerNight * nights;
    const gst = actualSubtotal * 0.18;
    const total = actualSubtotal + gst - discount;
    const hasValidDates = ciStr && coStr && nights > 0;
    const isFree = pad?.is_free;

    const handleCI = (s) => { setCheckIn(s); if (coStr && s >= coStr) setCheckOut(""); };
    const handleCO = (s) => setCheckOut(s);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-visible">
            {/* Price */}
            <div className="p-6 pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    {isFree ? (
                        <span className="text-3xl font-black text-gray-900">FREE Stay</span>
                    ) : (
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-gray-900">₹{pricePerNight.toLocaleString()}</span>
                            <span className="text-gray-400 font-medium text-sm">/ night</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1 text-sm font-bold bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1.5 rounded-full">
                        <Star size={13} className="fill-amber-500 text-amber-500" />
                        {pad?.host_details?.trust_score || "95"}%
                    </div>
                </div>
            </div>

            {/* Dates + Guests grid */}
            <div className="border-b border-gray-100">
                <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
                    <DateField label="Check-in"  value={ciStr} min={today} onChange={handleCI} />
                    <DateField label="Check-out" value={coStr} min={ciStr || today} onChange={handleCO} />
                </div>
                <GuestSelector
                    adults={adults} children={children} infants={infants}
                    maxGuests={pad?.max_guests}
                    onChange={onGuestsChange}
                />
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
                {/* Stay summary */}
                {hasValidDates && (
                    <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5">
                        <CalendarDays size={14} className="text-orange-500" />
                        <p className="text-xs font-bold text-orange-700">
                            {nights} night{nights !== 1 ? "s" : ""} · {format(new Date(ciStr + "T00:00:00"), "MMM d")} – {format(new Date(coStr + "T00:00:00"), "MMM d, yyyy")}
                        </p>
                    </div>
                )}

                {/* Price breakdown */}
                {!isFree && (
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span className="underline underline-offset-2 decoration-gray-300 font-medium">
                                ₹{pricePerNight.toLocaleString()} × {nights || 1} night{(nights || 1) !== 1 ? "s" : ""}
                            </span>
                            <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString()}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-emerald-600 font-semibold">
                                <span>Coupon discount</span>
                                <span>−₹{discount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-gray-600 font-medium">
                            <span className="underline underline-offset-2 decoration-gray-300">GST (18%)</span>
                            <span className="font-semibold text-gray-900">₹{gst.toLocaleString()}</span>
                        </div>
                        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                            <span className="font-black text-gray-900">Total</span>
                            <span className="font-black text-gray-900 text-lg">₹{total.toLocaleString()}</span>
                        </div>
                    </div>
                )}

                {/* Coupon */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                            value={coupon}
                            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                            placeholder="Coupon code"
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-xl text-xs font-bold outline-none text-gray-900 placeholder:text-gray-300 tracking-widest uppercase transition"
                        />
                    </div>
                    <button
                        onClick={applyCoupon}
                        disabled={isApplyingCoupon || !coupon}
                        className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-700 active:scale-95 transition-all disabled:opacity-40"
                    >
                        {isApplyingCoupon ? "…" : "Apply"}
                    </button>
                </div>

                {/* CTA */}
                {isOwner ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">You own this listing</p>
                    </div>
                ) : (
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={onRequest}
                        disabled={!hasValidDates}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl text-sm transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    >
                        {!hasValidDates ? "Select dates to continue" : "Request to stay"}
                        <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12 pointer-events-none" />
                    </motion.button>
                )}

                <p className="text-center text-xs text-gray-400 font-medium">You won't be charged yet</p>

                {/* Trust row */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    Community verified · Member Shield protected
                </div>
            </div>
        </div>
    );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({ title, onConfirm, onCancel, deleting }) {
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={!deleting ? onCancel : undefined}
        >
            <motion.div
                initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <AlertCircle size={28} className="text-red-500" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Delete listing?</h3>
                <p className="text-sm text-gray-500 mb-6">
                    This will permanently remove <strong className="text-gray-900">{title}</strong>. This can't be undone.
                </p>
                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={deleting}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={deleting}
                        className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition disabled:opacity-50">
                        {deleting ? "Deleting…" : "Yes, delete"}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Request Modal ────────────────────────────────────────────────────────────

function RequestModal({ pad, checkIn, checkOut, adults, children, total, onClose, onSend }) {
    const formattedDates = checkIn && checkOut
        ? `${format(new Date(checkIn + "T00:00:00"), "MMM d")} – ${format(new Date(checkOut + "T00:00:00"), "MMM d")}`
        : "";
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [err, setErr] = useState("");

    const submit = async () => {
        if (!message.trim()) { setErr("Please write a short introduction."); return; }
        setSending(true);
        try {
            const token = Cookies.get("token");
            await API.post(`/crashpads/${pad._id || pad.id}/request`, {
                message,
                check_in: checkIn,
                check_out: checkOut,
                guests: (adults || 1) + (children || 0),
                total_price: total,
            }, { headers: { Authorization: `Bearer ${token}` } });
            onSend();
            onClose();
        } catch (e) {
            setErr(e.response?.data?.detail || "Failed to send request.");
        } finally {
            setSending(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Stay Request</h2>
                        {formattedDates && <p className="text-sm text-gray-400 mt-0.5">{formattedDates}</p>}
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition"><X size={20} /></button>
                </div>

                {err && (
                    <div className="bg-red-50 text-red-600 text-xs font-bold px-4 py-3 rounded-xl mb-4">{err}</div>
                )}

                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Tell the host a bit about yourself and your travel plans..."
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-xl p-4 text-sm text-gray-900 outline-none resize-none transition placeholder:text-gray-300"
                />

                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={submit}
                    disabled={sending}
                    className="mt-4 w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-bold text-sm transition shadow-lg shadow-orange-500/20 disabled:opacity-50"
                >
                    {sending ? "Sending…" : "Send Request"}
                </motion.button>
            </motion.div>
        </motion.div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function CrashpadDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const routerLocation = useLocation();

    const [pad, setPad]     = useState(routerLocation.state?.listing || null);
    const [loading, setLoading] = useState(!routerLocation.state?.listing);
    const [error, setError]   = useState(null);

    // UI
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIdx, setLightboxIdx]   = useState(0);
    const [shareOpen, setShareOpen]       = useState(false);
    const [liked, setLiked]               = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting]         = useState(false);
    const [requestOpen, setRequestOpen]   = useState(false);

    // Booking
    const [checkIn, setCheckIn]   = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [adults, setAdults]     = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants]   = useState(0);
    const [coupon, setCoupon]     = useState("");
    const [discount, setDiscount] = useState(0);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    // Auth
    const token   = Cookies.get("token");
    const user    = token ? (() => { try { return jwtDecode(token); } catch { return null; } })() : null;
    const isOwner = user && pad ? (user.user_id === pad.host_id || user.id === pad.host_id) : false;
    const { isHost, refreshHostStatus } = useHost();

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    });

    // Fetch
    const fetchData = useCallback(async () => {
        try {
            const res = await API.get(`/crashpads/${id}`);
            setPad(res.data);
        } catch (e) {
            setError("Unable to load this crashpad.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);
    useEffect(() => {
        if (id) API.post(`/crashpads/${id}/view`).catch(() => {});
    }, [id]);
    useEffect(() => {
        if (isOwner && !isHost) refreshHostStatus();
    }, [isOwner, isHost]);

    const applyCoupon = () => {
        setIsApplyingCoupon(true);
        setTimeout(() => {
            if (coupon.toUpperCase() === "PROMO123") {
                setDiscount(500);
                toast.success("₹500 discount applied!");
            } else {
                setDiscount(0);
                toast.error("Invalid coupon code");
            }
            setIsApplyingCoupon(false);
        }, 600);
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await API.delete(`/crashpads/${id}`);
            toast.success("Listing deleted");
            navigate("/host/dashboard");
        } catch (e) {
            toast.error(e.response?.data?.detail || "Delete failed");
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const nights = nightsCount(checkIn, checkOut);
    const pricePerNight = pad?.price_per_night || 0;
    const total = pricePerNight * nights * 1.18 - discount;

    // ── Loading ──
    if (loading) return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading…</p>
        </div>
    );

    if (error || !pad) return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl p-10 max-w-sm w-full text-center shadow-lg">
                <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
                <h2 className="font-black text-gray-900 text-xl mb-2">Stay Not Found</h2>
                <p className="text-sm text-gray-500 mb-6">{error || "This crashpad may have been removed."}</p>
                <button onClick={() => navigate("/crashpads")}
                    className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-700 transition">
                    Browse Crashpads
                </button>
            </div>
        </div>
    );

    const { title, description, stay_type, location, host_bio, interests = [],
            languages = [], max_guests, max_nights, house_rules = [],
            preferences = [], is_free, images = [], host_details } = pad;

    return (
        <div className="bg-[#F8FAFC] min-h-screen pb-32 lg:pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

                {/* ── Nav Bar ── */}
                <FadeIn delay={0}>
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
                        >
                            <ArrowLeft size={18} />
                            <span>Back</span>
                        </button>
                        {routerLocation.state?.fromDashboard && (
                            <button onClick={() => navigate("/host/dashboard")}
                                className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-orange-600 transition">
                                <LayoutDashboard size={14} /> Dashboard
                            </button>
                        )}
                        {isOwner && (
                            <div className="flex gap-2">
                                <button onClick={() => navigate("/host/dashboard")}
                                    className="flex items-center gap-1.5 text-xs font-bold bg-orange-600 text-white px-4 py-2 rounded-full hover:bg-orange-700 transition">
                                    <LayoutDashboard size={13} /> Manage
                                </button>
                                <button onClick={() => setShowDeleteModal(true)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </FadeIn>

                {/* ── Hero Gallery ── */}
                <FadeIn delay={0.05}>
                    <HeroGallery
                        images={images}
                        onShowAll={(i) => { setLightboxIdx(i); setLightboxOpen(true); }}
                        onShare={() => setShareOpen(true)}
                        liked={liked}
                        onLike={() => setLiked(l => !l)}
                    />
                </FadeIn>

                {/* ── Title + Meta ── */}
                <FadeIn delay={0.1}>
                    <div className="mt-8 mb-2">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="flex items-center gap-1.5 text-[11px] font-black text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
                                {stayTypeIcon(stay_type)} {stay_type || "Community"} Stay
                            </span>
                            {is_free && (
                                <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
                                    Free Stay
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-3">{title}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                            <span className="flex items-center gap-1.5">
                                <MapPin size={15} className="text-orange-500" />
                                {location?.city || location?.address_line}, {location?.state}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Users size={15} className="text-gray-400" />
                                Up to {max_guests} guests
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Globe size={15} className="text-gray-400" />
                                {languages[0] || "English"}
                            </span>
                            {host_details?.trust_score && (
                                <span className="flex items-center gap-1">
                                    <Star size={13} className="fill-amber-500 text-amber-500" />
                                    {host_details.trust_score}% trust
                                </span>
                            )}
                        </div>
                    </div>
                </FadeIn>

                {/* ── Main Grid ── */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 items-start">

                    {/* LEFT */}
                    <div>
                        {/* About */}
                        <Section>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-orange-50 overflow-hidden border-2 border-white shadow-md shrink-0">
                                    {host_details?.profile_image
                                        ? <img src={host_details.profile_image} alt="Host" className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-orange-500">{(host_details?.name || "H").charAt(0)}</div>
                                    }
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Hosted by {host_details?.name || "A Community Member"}</h2>
                                    <p className="text-sm text-gray-400 mt-0.5">Max {max_nights} nights · {languages.join(", ") || "English"}</p>
                                </div>
                            </div>
                            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">{description || "A cozy community stay waiting for you."}</p>
                        </Section>

                        {/* Amenities */}
                        <Section title="What this place offers">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {["Fast Wifi", "Kitchen Access", "Morning Coffee", "Clean Linens", "Air Conditioning", "Free Parking"].map((a, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ y: -2 }}
                                        className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
                                    >
                                        <div className="text-orange-500">{amenityIcon(a)}</div>
                                        <span className="text-sm font-semibold text-gray-700">{a}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </Section>

                        {/* Host Bio */}
                        {(host_bio || interests.length > 0) && (
                            <Section title="Meet your host">
                                {host_bio && (
                                    <p className="text-base text-gray-600 leading-relaxed italic mb-4">"{host_bio}"</p>
                                )}
                                {interests.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {interests.map((interest, i) => (
                                            <span key={i} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full">
                                                <Heart size={12} className="text-orange-500 fill-orange-500" /> {interest}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </Section>
                        )}

                        {/* House Rules */}
                        {(house_rules.length > 0 || preferences.length > 0) && (
                            <Section title="House rules & preferences">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {house_rules.length > 0 && (
                                        <div>
                                            <p className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                <Clock size={14} /> House Rules
                                            </p>
                                            <ul className="space-y-2">
                                                {house_rules.map((r, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                        <span className="text-orange-400 mt-0.5">•</span> {r}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {preferences.length > 0 && (
                                        <div>
                                            <p className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                <Heart size={14} /> Preferences
                                            </p>
                                            <ul className="space-y-2">
                                                {preferences.map((p, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                        <span className="text-orange-400 mt-0.5">•</span> {p}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </Section>
                        )}

                        {/* Map */}
                        {isLoaded && location?.lat && (
                            <Section title="Where you'll be">
                                <div className="h-[340px] rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                                    <GoogleMap
                                        mapContainerStyle={{ width: "100%", height: "100%" }}
                                        center={{ lat: location.lat, lng: location.lng }}
                                        zoom={14}
                                        options={{ disableDefaultUI: true, zoomControl: true }}
                                    >
                                        <Marker position={{ lat: location.lat, lng: location.lng }} />
                                    </GoogleMap>
                                </div>
                                <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
                                    <Info size={13} /> Exact address provided after your request is accepted.
                                </p>
                            </Section>
                        )}
                    </div>

                    {/* RIGHT — Booking Card (sticky) */}
                    <FadeIn delay={0.2} className="lg:sticky lg:top-24 h-fit">
                        <BookingCard
                            pad={pad}
                            checkIn={checkIn} setCheckIn={setCheckIn}
                            checkOut={checkOut} setCheckOut={setCheckOut}
                            adults={adults} children={children} infants={infants}
                            onGuestsChange={({ adults: a, children: c, infants: inf }) => {
                                setAdults(a); setChildren(c); setInfants(inf);
                            }}
                            coupon={coupon} setCoupon={setCoupon}
                            discount={discount} setDiscount={setDiscount}
                            isApplyingCoupon={isApplyingCoupon}
                            applyCoupon={applyCoupon}
                            onRequest={() => {
                                if (!checkIn || !checkOut) { toast.error("Please select dates first"); return; }
                                if (!Cookies.get("token")) { toast.error("Please log in first"); navigate("/login"); return; }
                                setRequestOpen(true);
                            }}
                            isOwner={isOwner}
                        />
                    </FadeIn>
                </div>
            </div>

            {/* ── Mobile Sticky Bar ── */}
            {!isOwner && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between lg:hidden z-40 shadow-lg">
                    <div>
                        {is_free
                            ? <p className="font-black text-gray-900">Free</p>
                            : <p className="font-black text-gray-900 text-lg">₹{pricePerNight.toLocaleString()} <span className="text-sm font-medium text-gray-400">/ night</span></p>
                        }
                        {nights > 0 && <p className="text-xs text-gray-500">{nights} night{nights !== 1 ? "s" : ""} selected</p>}
                    </div>
                    <button
                        onClick={() => {
                            if (!checkIn || !checkOut) { toast.error("Select dates above first"); return; }
                            setRequestOpen(true);
                        }}
                        className="bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-orange-700 transition shadow-lg shadow-orange-500/20"
                    >
                        {!checkIn || !checkOut ? "Select Dates" : "Request to Stay"}
                    </button>
                </div>
            )}

            {/* ── Modals ── */}
            <AnimatePresence>
                {lightboxOpen && (
                    <Lightbox images={images} index={lightboxIdx} onClose={() => setLightboxOpen(false)} />
                )}
                {showDeleteModal && (
                    <DeleteModal
                        title={title}
                        onConfirm={handleDelete}
                        onCancel={() => setShowDeleteModal(false)}
                        deleting={deleting}
                    />
                )}
                {requestOpen && (
                    <RequestModal
                        pad={pad}
                        checkIn={checkIn}
                        checkOut={checkOut}
                        adults={adults}
                        children={children}
                        total={total}
                        onClose={() => setRequestOpen(false)}
                        onSend={() => toast.success("Request sent! The host will be in touch.")}
                    />
                )}
            </AnimatePresence>

            <ShareModal
                isOpen={shareOpen}
                url={`${window.location.origin}/crashpads/${id}`}
                onClose={() => setShareOpen(false)}
            />
        </div>
    );
}
