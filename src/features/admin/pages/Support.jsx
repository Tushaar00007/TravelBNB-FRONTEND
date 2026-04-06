import { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import API from "../../../services/api";
import { toast } from "react-hot-toast";
import { LifeBuoy, MessageSquare, CheckCircle, Clock, Search, Send, User } from "lucide-react";

export default function Support() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("open");
    const [replyText, setReplyText] = useState("");
    const [selectedTicket, setSelectedTicket] = useState(null);
    const token = Cookies.get("token");

    const fetchTickets = useCallback(() => {
        setLoading(true);
        API.get("/admin/tickets", {
            headers: { Authorization: `Bearer ${token}` },
            params: { status }
        })
            .then(res => setTickets(res.data))
            .catch(() => toast.error("Failed to load tickets"))
            .finally(() => setLoading(false));
    }, [token, status]);

    useEffect(() => { fetchTickets(); }, [fetchTickets]);

    const handleRespond = async (e) => {
        e.preventDefault();
        if (!replyText) return;

        const loadingToast = toast.loading("Sending response...");
        try {
            await API.post("/admin/tickets/respond", {
                id: selectedTicket._id,
                response: replyText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Response sent & ticket resolved", { id: loadingToast });
            setReplyText("");
            setSelectedTicket(null);
            fetchTickets();
        } catch {
            toast.error("Failed to respond", { id: loadingToast });
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
                        <LifeBuoy className="text-blue-500" />
                        Support & Help Center
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">Manage user inquiries and technical support tickets</p>
                </div>

                <div className="flex bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-1 rounded-xl shadow-sm">
                    {["open", "resolved"].map(s => (
                        <button
                            key={s}
                            onClick={() => { setStatus(s); setSelectedTicket(null); }}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${status === s
                                    ? "bg-blue-500 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30"
                                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Tickets List */}
                <div className="lg:col-span-1 space-y-4">
                    {loading ? (
                        [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />)
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                            <p className="text-gray-400 font-bold text-xs uppercase italic">No {status} tickets</p>
                        </div>
                    ) : tickets.map(t => (
                        <button
                            key={t._id}
                            onClick={() => setSelectedTicket(t)}
                            className={`w-full text-left p-5 rounded-2xl border transition-all ${selectedTicket?._id === t._id
                                    ? "bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800 shadow-md"
                                    : "bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest">{t.category || "General"}</p>
                                <span className="text-[9px] text-gray-400 font-bold">{new Date(t.created_at).toLocaleDateString()}</span>
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate uppercase tracking-tight mb-1">{t.subject}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-3">{t.message}</p>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[8px] font-black text-gray-500 lowercase">
                                    {t.user_name?.[0]}
                                </div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase">{t.user_name}</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Ticket View & Reply */}
                <div className="lg:col-span-2">
                    {selectedTicket ? (
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm p-8 space-y-8 animate-fade-in">
                            <div className="flex justify-between items-start border-b border-gray-50 dark:border-gray-800 pb-6">
                                <div>
                                    <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 inline-block">
                                        Ticket ID: #{selectedTicket._id.slice(-8).toUpperCase()}
                                    </span>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{selectedTicket.subject}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-900 dark:text-white">{selectedTicket.user_name}</p>
                                    <p className="text-[10px] text-gray-400 font-medium italic">{selectedTicket.user_email}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl italic text-gray-700 dark:text-gray-300 text-sm leading-relaxed relative">
                                <MessageSquare size={16} className="absolute -top-2 -left-2 text-blue-500 opacity-20" />
                                "{selectedTicket.message}"
                            </div>

                            {status === "open" ? (
                                <form onSubmit={handleRespond} className="space-y-6 pt-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Admin Response</label>
                                        <textarea
                                            value={replyText}
                                            onChange={e => setReplyText(e.target.value)}
                                            rows={6}
                                            placeholder="Type your solution or inquiry for the user..."
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 resize-none"
                                        />
                                    </div>
                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-3 transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-100 dark:shadow-none ml-auto"
                                    >
                                        <Send size={18} />
                                        SEND RESPONSE & RESOLVE
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                                    <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest ml-1 flex items-center gap-1">
                                        <CheckCircle size={12} /> Resolution Details
                                    </p>
                                    <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-2xl">
                                        <p className="text-sm text-emerald-800 dark:text-emerald-400 font-semibold italic">"{selectedTicket.response}"</p>
                                        <div className="mt-4 flex items-center gap-2 text-[10px] text-emerald-600 dark:text-emerald-500 font-bold uppercase">
                                            <span>Resolved by Admin</span>
                                            <span className="opacity-30">|</span>
                                            <span>{new Date(selectedTicket.resolved_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-gray-50/50 dark:bg-gray-900/30 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[40px] h-[600px] flex flex-col items-center justify-center text-center p-12">
                            <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center shadow-xl mb-6 text-gray-300 dark:text-gray-600">
                                <MessageSquare size={40} />
                            </div>
                            <h3 className="text-lg font-black text-gray-400 dark:text-gray-600 uppercase tracking-tight">Select a ticket to view details</h3>
                            <p className="text-xs text-gray-400 font-medium max-w-xs mt-2 italic">Support tickets allow travelers and hosts to communicate technical issues or disputes directly with the admin team.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
