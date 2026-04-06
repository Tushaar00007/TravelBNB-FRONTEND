import { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import API from "../../../services/api";
import { toast } from "react-hot-toast";
import { CreditCard, IndianRupee, TrendingUp, Search, Calendar, Filter, ChevronLeft, ChevronRight } from "lucide-react";

export default function Payments() {
    const [txs, setTxs] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const token = Cookies.get("token");
    const LIMIT = 20;

    const fetchPayments = useCallback(() => {
        setLoading(true);
        API.get("/admin/transactions", {
            headers: { Authorization: `Bearer ${token}` },
            params: { page, limit: LIMIT }
        })
            .then(res => {
                setTxs(res.data.data);
                setTotal(res.data.total);
            })
            .catch(() => toast.error("Failed to load transactions"))
            .finally(() => setLoading(false));
    }, [token, page]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const pages = Math.ceil(total / LIMIT);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <CreditCard className="text-emerald-500" size={32} />
                        Payments & Transactions
                    </h2>
                    <p className="text-sm text-gray-500 font-medium italic">Monitor every rupee flowing through the system</p>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none mb-1">Total Flow</p>
                        <p className="text-xl font-black text-gray-900 dark:text-white leading-none">₹{txs.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
                    <h3 className="font-black text-gray-900 dark:text-white text-base">Transaction History</h3>
                    <div className="flex gap-2">
                        <button className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all">
                            <Search size={18} />
                        </button>
                        <button className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Transaction ID</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">User</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Amount</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Type</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Date</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {loading ? (
                                [...Array(6)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {[...Array(6)].map((_, j) => (
                                            <td key={j} className="px-6 py-5"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-3/4" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : txs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold italic">
                                        No transactions recorded yet.
                                    </td>
                                </tr>
                            ) : txs.map(tx => (
                                <tr key={tx._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-5 font-mono text-[10px] text-gray-400">
                                        #{tx._id.slice(-8).toUpperCase()}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-black text-[10px] text-gray-600 dark:text-gray-300">
                                                ID
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white uppercase text-[11px]">{tx.user_name}</p>
                                                <p className="text-[10px] text-gray-400 font-medium italic">...{tx.user_id.slice(-6)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="font-black text-gray-900 dark:text-white">₹{tx.amount.toLocaleString()}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-lg font-black text-[10px] uppercase">
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-gray-500 font-medium text-xs">
                                            <Calendar size={12} />
                                            {new Date(tx.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`flex items-center gap-1.5 font-black text-[10px] uppercase ${tx.status === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${tx.status === 'success' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pages > 1 && (
                    <div className="flex items-center justify-between px-8 py-5 border-t border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{total} TRANSACTIONS</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl disabled:opacity-30 bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 hover:scale-105 transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-black px-4">{page} / {pages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(pages, p + 1))}
                                disabled={page === pages}
                                className="p-2 rounded-xl disabled:opacity-30 bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 hover:scale-105 transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
