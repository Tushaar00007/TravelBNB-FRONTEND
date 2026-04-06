import { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import API from "../../../services/api";
import { toast } from "react-hot-toast";
import { ChevronLeft, ChevronRight, ScrollText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ActivityLogs() {
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const token = Cookies.get("token");
    const LIMIT = 20;

    const fetch = useCallback(() => {
        setLoading(true);
        API.get("/admin/logs", {
            headers: { Authorization: `Bearer ${token}` },
            params: { page, limit: LIMIT },
        })
            .then(r => { setLogs(r.data.data); setTotal(r.data.total); })
            .catch(() => toast.error("Failed to load logs"))
            .finally(() => setLoading(false));
    }, [token, page]);

    useEffect(() => { fetch(); }, [fetch]);

    const pages = Math.ceil(total / LIMIT);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <ScrollText size={22} className="text-gray-500" />
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Activity Logs</h2>
                <span className="text-sm text-gray-400 font-medium">({total} total)</span>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                            <tr>{["Action", "Admin", "Entity", "When"].map(h => <th key={h} className="px-5 py-3.5 text-left">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {loading ? [...Array(8)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {[...Array(4)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-3/4" /></td>)}
                                </tr>
                            )) : logs.length === 0 ? (
                                <tr><td colSpan={4} className="text-center py-16 text-gray-400 font-semibold">No activity logs yet</td></tr>
                            ) : logs.map(log => (
                                <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">{log.action}</td>
                                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{log.admin_name || log.admin_id || "—"}</td>
                                    <td className="px-5 py-4">
                                        {log.entity ? (
                                            <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">{log.entity}</span>
                                        ) : "—"}
                                    </td>
                                    <td className="px-5 py-4 text-gray-400 text-xs">
                                        {log.timestamp
                                            ? formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })
                                            : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {pages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50 dark:border-gray-800">
                        <span className="text-xs text-gray-400">Page {page} of {pages}</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronLeft size={16} /></button>
                            {[...Array(Math.min(pages, 5))].map((_, i) => <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${page === i + 1 ? "bg-orange-500 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>{i + 1}</button>)}
                            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
