import { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import API from "../../../services/api";
import { toast } from "react-hot-toast";
import { Search, ChevronLeft, ChevronRight, Eye, Trash2 } from "lucide-react";
import ListingDetailsModal from "../components/ListingDetailsModal";

const STATUS_COLORS = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
    approved: "bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    rejected: "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
};

export default function ListingsTable() {
    const [homes, setHomes] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedListing, setSelectedListing] = useState(null);
    const token = Cookies.get("token");
    const LIMIT = 10;

    const fetch = useCallback(() => {
        setLoading(true);
        API.get("/admin/listings", {
            headers: { Authorization: `Bearer ${token}` },
            params: { page, limit: LIMIT, search, status },
        })
            .then(r => { setHomes(r.data.data); setTotal(r.data.total); })
            .catch(() => toast.error("Failed to load listings"))
            .finally(() => setLoading(false));
    }, [token, page, search, status]);

    useEffect(() => { fetch(); }, [fetch]);
    useEffect(() => { setPage(1); }, [search, status]);

    const pages = Math.ceil(total / LIMIT);
    
    const handleDeleteListing = async (listingId) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this listing? This cannot be undone.'
        );
        if (!confirmed) return;
        
        try {
            await API.delete(`/admin/listings/${listingId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Remove from local state
            setHomes(prev => prev.filter(l => 
                (l._id || l.id) !== listingId
            ));
            setTotal(prev => prev - 1);
            
            toast.success('Listing deleted successfully');
        } catch (err) {
            console.error('Delete error:', err);
            toast.error('Failed to delete listing');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Listings</h2>

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 max-w-sm flex-1">
                    <Search size={16} className="text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title or city…" className="bg-transparent outline-none text-sm text-gray-900 dark:text-white w-full" />
                </div>
                <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 outline-none"
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                            <tr>{["Title", "City", "Status", "Price / night", "Actions"].map(h => <th key={h} className="px-5 py-3.5 text-left">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {loading ? [...Array(6)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {[...Array(5)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-3/4" /></td>)}
                                </tr>
                            )) : homes.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-12 text-gray-400 font-semibold">No listings found</td></tr>
                            ) : homes.map(h => (
                                <tr key={h._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white max-w-[200px] truncate">{h.title}</td>
                                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{h.city}</td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${STATUS_COLORS[h.status || "pending"]}`}>
                                            {h.status || "pending"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">₹{h.price_per_night}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setSelectedListing(h._id)}
                                                className="flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
                                            >
                                                <Eye size={14} /> View Details
                                            </button>

                                            <button
                                                onClick={() => handleDeleteListing(h._id)}
                                                className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {pages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50 dark:border-gray-800">
                        <span className="text-xs text-gray-400">{total} total listings</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronLeft size={16} /></button>
                            {[...Array(pages)].map((_, i) => <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${page === i + 1 ? "bg-orange-500 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>{i + 1}</button>)}
                            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}
            </div>

            {selectedListing && (
                <ListingDetailsModal
                    listingId={selectedListing}
                    onClose={() => setSelectedListing(null)}
                    onUpdate={fetch}
                />
            )}
        </div>
    );
}
