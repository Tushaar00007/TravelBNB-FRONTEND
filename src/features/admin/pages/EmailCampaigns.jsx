import { useState, useEffect, useMemo, useCallback } from "react";
import {
    Mail, Users, Eye, CheckCircle2, AlertCircle,
    ChevronLeft, ChevronRight, Loader2, Send,
    Download, Trash2, Layout, AlertTriangle, 
    Filter, Search, MapPin, Zap, Calendar
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../../../services/api";

const BATCH_SIZE = 50;

export default function EmailCampaigns() {
    const [users, setUsers] = useState([]);
    const [selectedEmails, setSelectedEmails] = useState([]);
    const [allUsersSelected, setAllUsersSelected] = useState(false);
    
    // Filters
    const [cityFilter, setCityFilter] = useState("");
    const [isActiveOnly, setIsActiveOnly] = useState(false);
    const [isRecentOnly, setIsRecentOnly] = useState(false);
    
    // Content
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [ctaLink, setCtaLink] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [results, setResults] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [localSearch, setLocalSearch] = useState("");

    // ─── Fetch Users with Filters ──────────────────────────────────
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (cityFilter) params.city = cityFilter;
            if (isActiveOnly) params.isActive = true;
            if (isRecentOnly) params.recentBookings = true;
            
            const res = await API.get("/admin/users-compact", { params });
            setUsers(res.data || []);
            setAllUsersSelected(false);
            setSelectedEmails([]);
        } catch (err) {
            toast.error("Failed to fetch target audience");
        } finally {
            setLoading(false);
        }
    }, [cityFilter, isActiveOnly, isRecentOnly]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // ─── Batch Sending Logic (Frontend Managed for Progress) ───────
    const executeDispatch = async () => {
        if (!subject || !message || selectedEmails.length === 0) {
            toast.error("Missing required fields");
            return;
        }

        setShowConfirm(false);
        setIsSending(true);
        setResults(null);
        
        const total = selectedEmails.length;
        setProgress({ current: 0, total });

        let sent = 0;
        let failed = 0;
        let failedList = [];

        // Chunking the array into BATCH_SIZE
        const emailChunks = [];
        for (let i = 0; i < selectedEmails.length; i += BATCH_SIZE) {
            emailChunks.push(selectedEmails.slice(i, i + BATCH_SIZE));
        }

        for (const chunk of emailChunks) {
            try {
                const recipients = chunk.map(email => ({ email }));
                const res = await API.post("/admin/send-promotions", {
                    subject,
                    message,
                    users: recipients,
                    ctaLink
                });
                
                sent += res.data.sent || 0;
                failed += res.data.failed || 0;
                if (res.data.failedEmails) {
                    failedList = [...failedList, ...res.data.failedEmails];
                }
                
                setProgress(prev => ({ ...prev, current: prev.current + chunk.length }));
            } catch (err) {
                failed += chunk.length;
                failedList = [...failedList, ...chunk];
                toast.error("Batch failure, continuing...");
            }
        }

        setResults({
            sent,
            failed,
            total,
            failedEmails: failedList,
            subject
        });
        setIsSending(false);
        toast.success("Campaign Complete!");
    };

    // ─── Selection Logic ──────────────────────────────────────────
    const toggleUser = (email) => {
        setAllUsersSelected(false);
        setSelectedEmails(prev =>
            prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
        );
    };

    const toggleAll = () => {
        if (allUsersSelected) {
            setSelectedEmails([]);
            setAllUsersSelected(false);
        } else {
            setSelectedEmails(users.map(u => u.email));
            setAllUsersSelected(true);
        }
    };

    const previewHtml = useMemo(() => {
        const formattedMsg = message.replace(/\n/g, "<br>");
        const ctaBtn = ctaLink ? `
            <div style="text-align: center; margin: 30px 0;">
                <a href="${ctaLink}" style="background-color: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                    Claim Offer
                </a>
            </div>
        ` : "";

        return `
            <div style="font-family: sans-serif; background-color: #f8fafc; padding: 30px;">
                <div style="max-width: 500px; margin: auto; background-color: white; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
                    <div style="padding: 24px; border-bottom: 1px solid #f1f5f9; text-align: center;">
                        <b style="font-size: 22px; font-weight: 900; color: #0f172a;">Travel<span style="color: #f97316;">BNB</span></b>
                    </div>
                    <div style="padding: 35px; font-size: 15px; color: #334155; line-height: 1.7;">
                        ${formattedMsg || "<p style='color: #94a3b8; font-style: italic;'>Compose your campaign message...</p>"}
                        ${ctaBtn}
                    </div>
                    <div style="padding: 20px; text-align: center; font-size: 11px; background: #f8fafc; color: #94a3b8;">
                        © 2026 TravelBNB • <a href="#" style="color: #64748b;">Unsubscribe</a>
                    </div>
                </div>
            </div>
        `;
    }, [message, ctaLink]);

    if (results) return <CampaignSummary results={results} onReset={() => setResults(null)} />;

    return (
        <div className="space-y-8 animate-fade-in relative max-w-[1600px] mx-auto pb-12">
            {/* ── Header Section ─────────────────────────────────────────── */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                    <Mail size={160} />
                </div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center shadow-inner">
                        <Zap size={36} fill="currentColor" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">Email Campaigns</h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Advanced Segmentation & Dispatch</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <button
                        onClick={() => setShowConfirm(true)}
                        disabled={selectedEmails.length === 0 || !subject || !message}
                        className="bg-black hover:bg-gray-800 text-white px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 active:scale-95 transition-all shadow-xl shadow-black/10 disabled:opacity-20"
                    >
                        <Send size={16} /> Start Campaign
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* ── Left Sidebar: Filters & Audience (Col 4) ──────────────── */}
                <div className="lg:col-span-4 space-y-6 sticky top-8">
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-8 border-b border-gray-100 dark:border-gray-800 space-y-6 bg-gray-50/50">
                            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
                                <Filter size={14} className="text-orange-500" /> Segmentation
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex items-center gap-3 border border-gray-100 dark:border-gray-700 focus-within:ring-2 focus-within:ring-orange-500/20">
                                    <MapPin size={18} className="text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Filter by city..."
                                        className="bg-transparent outline-none text-sm font-bold w-full"
                                        value={cityFilter}
                                        onChange={(e) => setCityFilter(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-orange-500/30 transition-all">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 size={18} className={isActiveOnly ? "text-green-500" : "text-gray-300"} />
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Verified Users Only</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={isActiveOnly}
                                            onChange={() => setIsActiveOnly(!isActiveOnly)}
                                        />
                                        <div className={`w-10 h-5 rounded-full transition-all relative ${isActiveOnly ? "bg-orange-500" : "bg-gray-200"}`}>
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isActiveOnly ? "left-6" : "left-1"}`} />
                                        </div>
                                    </label>

                                    <label className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-orange-500/30 transition-all">
                                        <div className="flex items-center gap-3">
                                            <Calendar size={18} className={isRecentOnly ? "text-purple-500" : "text-gray-300"} />
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Recently Booked (30d)</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={isRecentOnly}
                                            onChange={() => setIsRecentOnly(!isRecentOnly)}
                                        />
                                        <div className={`w-10 h-5 rounded-full transition-all relative ${isRecentOnly ? "bg-orange-500" : "bg-gray-200"}`}>
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isRecentOnly ? "left-6" : "left-1"}`} />
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                Audience: {users.length} Candidates
                            </span>
                            <button onClick={toggleAll} className="text-[10px] font-black uppercase text-orange-600 hover:text-orange-700">
                                {allUsersSelected ? "Clear Selection" : "Select Result"}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {loading ? (
                                <div className="p-12 text-center space-y-4">
                                    <Loader2 className="animate-spin text-orange-500 mx-auto" size={40} />
                                    <p className="text-[10px] font-black uppercase text-gray-400 animate-pulse">Filtering Database...</p>
                                </div>
                            ) : users.length === 0 ? (
                                <div className="p-12 text-center text-gray-400">
                                    <Users size={40} className="mx-auto mb-4 opacity-20" />
                                    <p className="text-xs font-bold">No users match these criteria</p>
                                </div>
                            ) : users.map(u => (
                                <label
                                    key={u.email}
                                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer transition-all border ${selectedEmails.includes(u.email) ? "border-orange-500 bg-orange-50/20" : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedEmails.includes(u.email)}
                                        onChange={() => toggleUser(u.email)}
                                        className="w-5 h-5 accent-black rounded"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-gray-900 dark:text-white truncate">{u.name || "Traveller"}</p>
                                        <p className="text-[10px] font-bold text-gray-400 truncate mt-0.5">{u.email}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                        
                        <div className="p-6 bg-black text-white text-center">
                             <p className="text-lg font-black">{selectedEmails.length}</p>
                             <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 italic">Targets Selected</p>
                        </div>
                    </div>
                </div>

                {/* ── Main Panel: Composer & Preview (Col 8) ────────────────── */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden p-12">
                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center">
                                <Layout size={20} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Campaign Composer</h3>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest ml-1">Subject Line</label>
                                <input
                                    type="text"
                                    placeholder="Enter compelling subject..."
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-8 py-5 text-lg font-black tracking-tight focus:ring-4 focus:ring-orange-500/10 placeholder:text-gray-300"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest ml-1">Message Content</label>
                                <textarea
                                    className="w-full h-80 bg-gray-50 dark:bg-gray-800 border-none rounded-[2rem] px-8 py-8 text-md font-bold leading-relaxed focus:ring-4 focus:ring-orange-500/10 placeholder:text-gray-300 resize-none"
                                    placeholder="Type your announcement here... (HTML or double lines supported)"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest ml-1 inline-flex items-center gap-2">
                                    CTA Button Link <span className="text-[9px] lowercase italic opacity-50 font-medium">(Optional)</span>
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://travelbnb.com/your-promo"
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-8 py-5 text-sm font-bold focus:ring-4 focus:ring-orange-500/10"
                                    value={ctaLink}
                                    onChange={(e) => setCtaLink(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* ── Live Preview Canvas ───────────────────────── */}
                        <div className="mt-16 pt-16 border-t border-gray-100 dark:border-gray-800">
                             <div className="flex items-center justify-between mb-8">
                                <h4 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.3em] flex items-center gap-3">
                                    <Eye size={16} /> Real-Time Preview
                                </h4>
                                <span className="text-[9px] font-bold text-gray-300 uppercase">Branded HTML Template</span>
                             </div>
                             <div 
                                className="w-full bg-gray-100 dark:bg-black rounded-[2rem] overflow-hidden border border-gray-200 dark:border-gray-800 transition-all duration-500"
                                dangerouslySetInnerHTML={{ __html: previewHtml }}
                             />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Confirm Modal ─────────────────────────────────────────── */}
            {showConfirm && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[3rem] p-12 text-center shadow-3xl animate-scale-in border border-gray-100 dark:border-gray-800">
                        <div className="w-24 h-24 bg-orange-50 text-orange-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-xl shadow-orange-500/10 animate-bounce">
                            <AlertTriangle size={48} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter">Ready to blast?</h3>
                        <p className="text-gray-500 font-bold mb-12 leading-relaxed px-4">
                            You are about to broadcast to <span className="text-orange-600 font-black decoration-brand underline-offset-4">{selectedEmails.length} targeted individuals</span>. This deployment is high-impact.
                        </p>
                        
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={executeDispatch}
                                className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs hover:bg-gray-800 transition-all active:scale-95 shadow-2xl"
                            >
                                Dispatch Campaign
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="w-full bg-white text-gray-400 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-red-500 transition-all hover:bg-red-50/50"
                            >
                                Re-evaluate Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Sending Overlay (Progress) ────────────────────────────── */}
            {isSending && (
                <div className="fixed inset-0 z-[101] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-[4rem] p-16 text-center shadow-3xl border border-gray-100 dark:border-gray-800">
                        <div className="mb-12 relative flex justify-center items-center">
                            <Loader2 className="animate-spin text-orange-500 absolute" size={100} strokeWidth={1} />
                            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shadow-xl shadow-orange-500/20">
                                <Send size={32} fill="currentColor" />
                            </div>
                        </div>

                        <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2 italic tracking-tighter italic">Dispatching...</h3>
                        <p className="text-gray-400 font-bold mb-12 text-sm uppercase tracking-widest">Targeting Users via Resend Service</p>
                        
                        <div className="space-y-6">
                            <div className="flex items-center justify-between text-[11px] font-black uppercase text-gray-500 tracking-[0.2em] px-2">
                                <span className="flex items-center gap-2"><Layout size={12} /> BATCH PROGRESS</span>
                                <span className="text-orange-500">{progress.current} / {progress.total}</span>
                            </div>
                            <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-1.5 shadow-inner">
                                <div 
                                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-1000 shadow-xl"
                                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                />
                            </div>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest animate-pulse italic">Please do not disconnect your network...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function CampaignSummary({ results, onReset }) {
    return (
        <div className="max-w-4xl mx-auto py-20 animate-scale-in">
            <div className="bg-white dark:bg-gray-900 rounded-[4rem] p-20 text-center shadow-3xl border border-gray-100 dark:border-gray-800 relative z-20 overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                    <CheckCircle2 size={300} />
                </div>
                
                <div className="w-32 h-32 bg-green-50 text-green-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-green-500/10">
                    <CheckCircle2 size={64} strokeWidth={2.5} />
                </div>
                
                <h3 className="text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter italic">Broadcast Satisfied</h3>
                <p className="text-gray-400 font-bold mb-16 text-xl tracking-tight uppercase tracking-widest">Campaign: {results.subject}</p>
                
                <div className="grid grid-cols-2 gap-10 mb-16">
                    <div className="bg-gray-100/50 dark:bg-gray-800/50 p-12 rounded-[3rem] border border-gray-100 dark:border-gray-800 group hover:scale-[1.02] transition-transform">
                        <p className="text-7xl font-black text-blue-600 tracking-tighter mb-2">{results.sent}</p>
                        <p className="text-[12px] font-black uppercase text-gray-400 tracking-[0.3em]">Success</p>
                    </div>
                    <div className={`${results.failed > 0 ? "bg-red-50 p-12 rounded-[3.5rem] border border-red-100 group hover:scale-[1.05] transition-transform" : "bg-gray-100/50 dark:bg-gray-800/50 p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 opacity-30"}`}>
                        <p className={`text-7xl font-black ${results.failed > 0 ? "text-red-600 animate-pulse" : "text-gray-400"}`}>{results.failed}</p>
                        <p className="text-[12px] font-black uppercase text-gray-400 tracking-[0.3em]">Failures</p>
                    </div>
                </div>

                <div className="flex flex-col gap-6 max-w-sm mx-auto">
                    <button
                        onClick={onReset}
                        className="w-full bg-black text-white py-8 rounded-[2rem] font-black uppercase tracking-[0.4em] text-[12px] hover:bg-gray-800 transition-all active:scale-95 shadow-3xl shadow-black/20"
                    >
                        New Campaign
                    </button>
                    {results.failedEmails?.length > 0 && (
                        <button
                            onClick={() => {
                                const csv = "Email\n" + results.failedEmails.join("\n");
                                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.href = url;
                                link.download = `failed_${results.subject.replace(/\s+/g,'_')}.csv`;
                                link.click();
                            }}
                            className="text-[11px] font-black uppercase text-red-500 hover:text-red-600 tracking-[0.3em] flex items-center justify-center gap-3 decoration-wavy underline-offset-8"
                        >
                            <Download size={18} /> Export Failure Log
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
