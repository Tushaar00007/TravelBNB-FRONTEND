import { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import API from "../../../services/api";
import { toast } from "react-hot-toast";
import { Globe, UserX, Search, Filter, ChevronLeft, ChevronRight, MapPin, User, ShieldAlert } from "lucide-react";
import { Globe as GlobeIcon, Users } from "lucide-react";

export default function TravelBuddyTable() {
    const [buddies, setBuddies] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
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

    const banUser = async (profileId) => {
        const loadingToast = toast.loading("Banning user profile...");
        try {
            await API.post(`/admin/travel-buddies/${profileId}/ban`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("User banned successfully", { id: loadingToast });
            fetchBuddies();
        } catch {
            toast.error("Failed to ban user", { id: loadingToast });
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
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Trust Score</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Actions</th>
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
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full w-16 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${buddy.trust_score > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                    style={{ width: `${buddy.trust_score || 50}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-gray-700 dark:text-gray-300">{buddy.trust_score || 50}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <button
                                            onClick={() => banUser(buddy._id)}
                                            className="group flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all font-black text-[10px] uppercase"
                                        >
                                            <ShieldAlert size={14} className="group-hover:animate-shake" />
                                            Flag & Ban
                                        </button>
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
