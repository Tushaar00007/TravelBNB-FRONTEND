import { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import API from "../../../services/api";
import { toast } from "react-hot-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STATUSES = ["", "pending", "confirmed", "cancelled", "completed"];

const STATUS_COLORS = {
    confirmed: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
    pending: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
    cancelled: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    completed: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
};

export default function BookingsTable() {
    const [bookings, setBookings] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const token = Cookies.get("token");
    const LIMIT = 10;

    const fetch = useCallback(() => {
        setLoading(true);
        API.get("/admin/bookings", {
            headers: { Authorization: `Bearer ${token}` },
            params: { page, limit: LIMIT, status },
        })
            .then(r => { setBookings(r.data.data); setTotal(r.data.total); })
            .catch(() => toast.error("Failed to load bookings"))
            .finally(() => setLoading(false));
    }, [token, page, status]);

    useEffect(() => { fetch(); }, [fetch]);
    useEffect(() => { setPage(1); }, [status]);

    const pages = Math.ceil(total / LIMIT);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Bookings</h2>

            <select value={status} onChange={e => setStatus(e.target.value)} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 outline-none">
                {STATUSES.map(s => <option key={s} value={s}>{s || "All statuses"}</option>)}
            </select>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                            <tr>{["Booking ID", "Guest", "Check-in", "Check-out", "Amount", "Status"].map(h => <th key={h} className="px-5 py-3.5 text-left">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {loading ? [...Array(6)].map((_, i) => (
                                <tr key={i} className="animate-pulse">{[...Array(6)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-3/4" /></td>)}</tr>
                            )) : bookings.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-400 font-semibold">No bookings found</td></tr>
                            ) : bookings.map(b => (
                                <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-5 py-4 text-xs text-gray-400 font-mono">{b._id.slice(-8).toUpperCase()}</td>
                                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">{b.userId || b.user_id || "—"}</td>
                                    <td className="px-5 py-4 text-gray-500">{b.checkIn || b.check_in ? new Date(b.checkIn || b.check_in).toLocaleDateString() : "—"}</td>
                                    <td className="px-5 py-4 text-gray-500">{b.checkOut || b.check_out ? new Date(b.checkOut || b.check_out).toLocaleDateString() : "—"}</td>
                                    <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">₹{b.totalPrice ?? b.total_price ?? "—"}</td>
                                    <td className="px-5 py-4">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[b.bookingStatus || b.status] || "bg-gray-100 text-gray-500"}`}>
                                            {b.bookingStatus || b.status || "unknown"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {pages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50 dark:border-gray-800">
                        <span className="text-xs text-gray-400">{total} total bookings</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronLeft size={16} /></button>
                            {[...Array(pages)].map((_, i) => <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${page === i + 1 ? "bg-orange-500 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>{i + 1}</button>)}
                            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
