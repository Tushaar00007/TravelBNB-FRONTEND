import { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import API from "../../../services/api";
import { toast } from "react-hot-toast";
import { Globe, UserX, Search, Filter, ChevronLeft, ChevronRight, MapPin, User, ShieldAlert, Check, X, Loader2, Globe as GlobeIcon, Users, Trash2, AlertCircle } from "lucide-react";

const STATUS_COLORS = {
    pending: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    approved: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    rejected: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    banned: "bg-gray-900 text-white border-gray-800 dark:bg-black dark:text-gray-400 dark:border-gray-900",
};

export default function TravelBuddyTable() {
    const [buddies, setBuddies] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [processingIds, setProcessingIds] = useState(new Set());
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const token = Cookies.get("token");
    const LIMIT = 10;

    const fetchBuddies = useCallback(() => {
        setLoading(true);
        API.get("/admin/travel-buddies", {
            headers: { Authorization: `Bearer ${token}` },
            params: { page, limit: LIMIT }
        })
            .then(res => {
                setBuddies(res.data.data);
                setTotal(res.data.total);
            })
            .catch(() => toast.error("Failed to load travel buddies"))
            .finally(() => setLoading(false));
    }, [token, page]);

    useEffect(() => { fetchBuddies(); }, [fetchBuddies]);

    const handleDelete = async (id) => {
        setProcessingIds(prev => new Set(prev).add(id));
        const loadingToast = toast.loading("Deleting profile...");
        
        try {
            await API.delete(`/admin/travel-buddy/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success("Profile deleted permanently", { id: loadingToast });
            setBuddies(prev => prev.filter(b => b._id !== id));
            setConfirmDeleteId(null);
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to delete profile", { id: loadingToast });
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const handleModeration = async (userId, action) => {
        setProcessingIds(prev => new Set(prev).add(userId));
        const loadingToast = toast.loading(`${action.charAt(0).toUpperCase() + action.slice(1)}ing user...`);
        
        try {
            await API.patch(`/admin/travelbuddy/${userId}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success(`User ${action === 'approve' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Banned'} successfully`, { id: loadingToast });
            
            // Optimistically update status locally or refetch
            setBuddies(prev => prev.map(b => 
                b._id === userId ? { ...b, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'banned' } : b
            ));
        } catch (err) {
            toast.error(err.response?.data?.detail || `Failed to ${action} user`, { id: loadingToast });
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        }
    };

    const pages = Math.ceil(total / LIMIT);

    return (
        <div className="space-y-6 pb-12">
            <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
                    <GlobeIcon className="text-blue-500" />
                    Travel Buddy Monitoring
                </h2>
                <p className="text-sm text-gray-500 font-medium italic">Safety monitoring for social travel profiles</p>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 border-b border-gray-50 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">User Profile</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Bio / Bio Snippet</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Interests</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {[...Array(5)].map((_, j) => (
                                            <td key={j} className="px-6 py-5"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-3/4" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : buddies.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-bold italic">No active travel buddy profiles found.</td></tr>
                            ) : buddies.map(buddy => (
                                <tr key={buddy._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs uppercase">
                                                {buddy.name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 dark:text-white uppercase text-[11px]">{buddy.name || "Trip User"}</p>
                                                <p className="text-[10px] text-gray-400 font-medium underline">USER_ID: ...{buddy.user_id?.slice(-6)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 max-w-xs">
                                        <p className="text-gray-600 dark:text-gray-400 text-xs italic leading-tight line-clamp-2">
                                            {buddy.bio || buddy.about || "No bio available."}
                                        </p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-wrap gap-1">
                                            {(buddy.interests || []).slice(0, 3).map(int => (
                                                <span key={int} className="bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase">
                                                    {int}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${STATUS_COLORS[buddy.status || "pending"]}`}>
                                            {buddy.status || "pending"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleModeration(buddy._id, "approve")}
                                                disabled={processingIds.has(buddy._id) || buddy.status === "approved"}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-600 hover:bg-green-600 hover:text-white disabled:opacity-50 rounded-lg transition-all font-black text-[10px] uppercase shadow-sm active:scale-95"
                                                title="Accept Profile"
                                            >
                                                {processingIds.has(buddy._id) ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                                Accept
                                            </button>
                                            
                                            <button
                                                onClick={() => handleModeration(buddy._id, "reject")}
                                                disabled={processingIds.has(buddy._id) || buddy.status === "rejected"}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50 rounded-lg transition-all font-black text-[10px] uppercase shadow-sm active:scale-95"
                                                title="Reject Profile"
                                            >
                                                {processingIds.has(buddy._id) ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                                                Reject
                                            </button>

                                            <button
                                                onClick={() => handleModeration(buddy._id, "ban")}
                                                disabled={processingIds.has(buddy._id) || buddy.status === "banned"}
                                                className="group flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 text-pink-600 hover:bg-pink-600 hover:text-white disabled:opacity-50 rounded-lg transition-all font-black text-[10px] uppercase shadow-sm active:scale-95"
                                                title="Flag & Ban"
                                            >
                                                {processingIds.has(buddy._id) ? <Loader2 size={12} className="animate-spin" /> : <ShieldAlert size={12} className="group-hover:animate-shake" />}
                                                Flag & Ban
                                            </button>

                                            <div className="h-6 w-[1px] bg-gray-100 dark:bg-gray-800 mx-1" />

                                            {confirmDeleteId === buddy._id ? (
                                                <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/10 p-1 rounded-xl border border-red-100 dark:border-red-900/30 animate-in fade-in zoom-in duration-200">
                                                    <span className="text-[9px] font-black text-red-600 px-2 uppercase tracking-tighter">Are you sure?</span>
                                                    <button
                                                        onClick={() => handleDelete(buddy._id)}
                                                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-black text-[10px] uppercase hover:bg-red-700 shadow-md active:scale-95"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDeleteId(null)}
                                                        className="p-1.5 text-gray-400 hover:text-gray-600 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmDeleteId(buddy._id)}
                                                    disabled={processingIds.has(buddy._id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50 rounded-lg transition-all font-black text-[10px] uppercase shadow-sm active:scale-105"
                                                    title="Permanently Delete Entry"
                                                >
                                                    <Trash2 size={12} />
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {pages > 1 && (
                    <div className="flex items-center justify-between px-8 py-5 border-t border-gray-50 dark:border-gray-800">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{total} PROFILES</span>
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
        </div>
    );
}
