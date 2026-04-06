import { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import API from "../../../services/api";
import { toast } from "react-hot-toast";
import { CloudLightning, Check, X, Search, Filter, ChevronLeft, ChevronRight, MapPin, User, Eye, Trash2 } from "lucide-react";
import CrashpadDetailsModal from "../components/CrashpadDetailsModal";

export default function CrashpadsTable() {
    const [pads, setPads] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedPad, setSelectedPad] = useState(null);
    const token = Cookies.get("token");
    const LIMIT = 10;

    const fetchPads = useCallback(() => {
        setLoading(true);
        API.get("/admin/crashpads", {
            headers: { Authorization: `Bearer ${token}` },
            params: { page, limit: LIMIT, status }
        })
            .then(res => {
                setPads(res.data.data);
                setTotal(res.data.total);
            })
            .catch(() => toast.error("Failed to load crashpads"))
            .finally(() => setLoading(false));
    }, [token, page, status]);

    useEffect(() => { fetchPads(); }, [fetchPads]);

    const moderate = async (id, action) => {
        const loadingToast = toast.loading(`${action.toUpperCase()} crashpad...`);
        try {
            await API.post(`/admin/crashpads/${id}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Crashpad ${action}d`, { id: loadingToast });
            fetchPads();
        } catch {
            toast.error("Action failed", { id: loadingToast });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to PERMANENTLY delete this crashpad? This action cannot be undone.")) return;

        const loadingToast = toast.loading("Deleting crashpad...");
        try {
            await API.delete(`/admin/crashpads/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Crashpad deleted successfully", { id: loadingToast });
            fetchPads();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete crashpad", { id: loadingToast });
        }
    };

    const pages = Math.ceil(total / LIMIT);

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
                        <CloudLightning className="text-pink-500 fill-pink-500/20" />
                        Crashpad Moderation
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">Approve or reject community-driven stays</p>
                </div>

                <div className="flex bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-1 rounded-xl shadow-sm">
                    {["", "pending", "approved", "rejected"].map(s => (
                        <button
                            key={s}
                            onClick={() => { setStatus(s); setPage(1); }}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${status === s
                                    ? "bg-pink-500 text-white shadow-lg shadow-pink-200 dark:shadow-pink-900/30"
                                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            {s || "All"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 border-b border-gray-50 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Host / Title</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Location</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Stay Type</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Price</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Status</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {[...Array(6)].map((_, j) => (
                                            <td key={j} className="px-6 py-5"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-3/4" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : pads.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold italic">No crashpads found in this category.</td></tr>
                            ) : pads.map(pad => (
                                <tr key={pad._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-[10px] font-black text-gray-400">
                                                <User size={14} />
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 dark:text-white uppercase text-[11px]">{pad.title}</p>
                                                <p className="text-[10px] text-gray-400 font-medium italic">Host ID: ...{pad.host_id?.slice(-6)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-gray-500 font-bold text-xs">
                                            <MapPin size={12} className="text-pink-500" />
                                            {pad.city}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full font-black text-[10px] uppercase">
                                            {pad.stay_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="font-black text-gray-900 dark:text-white">{pad.is_free ? "FREE" : `₹${pad.price_per_night}`}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-2.5 py-1 rounded-lg font-black text-[9px] uppercase tracking-tighter ${pad.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                pad.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                                                    'bg-amber-100 text-amber-700'
                                            }`}>
                                            {pad.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setSelectedPad(pad._id)}
                                                className="p-2 bg-gray-100 text-gray-400 hover:bg-pink-100 hover:text-pink-600 rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {pad.status !== 'approved' && (
                                                <button
                                                    onClick={() => moderate(pad._id, "approve")}
                                                    className="p-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"
                                                    title="Approve"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            )}
                                            {pad.status !== 'rejected' && (
                                                <button
                                                    onClick={() => moderate(pad._id, "reject")}
                                                    className="p-2 bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-all"
                                                    title="Reject"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(pad._id)}
                                                className="p-2 bg-gray-100 text-gray-400 hover:bg-rose-600 hover:text-white rounded-lg transition-all"
                                                title="Delete permanently"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {pages > 1 && (
                    <div className="flex items-center justify-between px-8 py-5 border-t border-gray-50 dark:border-gray-800">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{total} CRASHPADS</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-xl disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-black">{page} / {pages}</span>
                            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-2 rounded-xl disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {selectedPad && (
                <CrashpadDetailsModal
                    padId={selectedPad}
                    onClose={() => setSelectedPad(null)}
                    onUpdate={fetchPads}
                />
            )}
        </div>
    );
}
