import { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import API from "../../../services/api";
import { toast } from "react-hot-toast";
import { AlertCircle, CheckCircle, XCircle, User, Filter } from "lucide-react";

export default function Reports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("pending");
    const token = Cookies.get("token");

    const fetchReports = useCallback(() => {
        setLoading(true);
        API.get("/trust/admin/reports", {
            headers: { Authorization: `Bearer ${token}` },
            params: { status }
        })
            .then(res => setReports(res.data))
            .catch(() => toast.error("Failed to load reports"))
            .finally(() => setLoading(false));
    }, [token, status]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const resolveReport = async (reportId, action) => {
        const loadingToast = toast.loading(`${action === 'resolved' ? 'Resolving' : 'Dismissing'} report...`);
        try {
            await API.put(`/trust/admin/reports/${reportId}`, {
                status: action,
                action_taken: action === 'resolved' ? "Confirmed safety violation" : "Dismissed - no violation found"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Report ${action}`, { id: loadingToast });
            fetchReports();
        } catch {
            toast.error("Action failed", { id: loadingToast });
        }
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <AlertCircle className="text-rose-500" />
                        Trust & Safety Reports
                    </h2>
                    <p className="text-sm text-gray-500 font-medium italic">Review and act on user reports</p>
                </div>

                <div className="flex bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    {["pending", "resolved", "dismissed"].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatus(s)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${status === s
                                    ? "bg-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-rose-900/20"
                                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Reporter</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Target User</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Reason</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Description</th>
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
                            ) : reports.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold italic">
                                        No {status} reports found.
                                    </td>
                                </tr>
                            ) : reports.map(report => (
                                <tr key={report._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-xs uppercase">
                                                {report.reporter_name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{report.reporter_name}</p>
                                                <p className="text-[10px] text-gray-400 font-mono">ID: ...{report.reporter_id?.slice(-6)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs uppercase">
                                                {report.target_name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{report.target_name}</p>
                                                <p className="text-[10px] text-rose-400 font-mono italic">{report.target_email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 rounded-full font-black text-[10px] uppercase">
                                            {report.reason}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 max-w-xs">
                                        <p className="text-gray-600 dark:text-gray-400 leading-tight text-xs line-clamp-2">
                                            {report.description || "No additional details provided."}
                                        </p>
                                    </td>
                                    <td className="px-6 py-5">
                                        {report.status === "pending" ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => resolveReport(report._id, "resolved")}
                                                    className="p-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"
                                                    title="Resolve & Penalize"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => resolveReport(report._id, "dismissed")}
                                                    className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-600 hover:text-white rounded-lg transition-all"
                                                    title="Dismiss"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className={`text-xs font-bold uppercase tracking-widest ${report.status === 'resolved' ? 'text-emerald-500' : 'text-gray-400'}`}>
                                                {report.status}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
