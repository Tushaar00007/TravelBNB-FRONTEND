import { useState, useEffect, useMemo } from "react";
import {
    Mail, Users, Eye, CheckCircle2, AlertCircle,
    ChevronLeft, ChevronRight, Loader2, Send,
    Download, Trash2, Layout, AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../../../services/api";

const BATCH_SIZE = 50;

export default function SendPromotions() {
    const [users, setUsers] = useState([]);
    const [selectedEmails, setSelectedEmails] = useState([]);
    const [allUsersSelected, setAllUsersSelected] = useState(false);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [ctaLink, setCtaLink] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [results, setResults] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // ─── Fetch Users for Selection ─────────────────────────────────
    useEffect(() => {
        const fetchCompactUsers = async () => {
            try {
                const res = await API.get("/admin/users-compact");
                setUsers(res.data || []);
            } catch (err) {
                toast.error("Failed to fetch user list");
            } finally {
                setLoading(false);
            }
        };
        fetchCompactUsers();
    }, []);

    // ─── Filtering & Selection ────────────────────────────────────
    const filteredUsers = useMemo(() => {
        if (!searchQuery) return users;
        return users.filter(u =>
            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery]);

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

    // ─── Live Preview Logic ─────────────────────────────────────────
    const previewHtml = useMemo(() => {
        const formattedMsg = message.replace(/\n/g, "<br>");
        const ctaBtn = ctaLink ? `
            <div style="text-align: center; margin: 30px 0;">
                <a href="${ctaLink}" style="background-color: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                    Explore Now
                </a>
            </div>
        ` : "";

        return `
            <div style="font-family: sans-serif; background-color: #f8fafc; padding: 20px;">
                <div style="max-width: 500px; margin: auto; background-color: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
                    <div style="padding: 20px; border-bottom: 1px solid #f1f5f9; text-align: center;">
                        <b style="font-size: 20px; color: #0f172a;">Travel<span style="color: #f97316;">BNB</span></b>
                    </div>
                    <div style="padding: 30px; font-size: 14px; color: #334155; line-height: 1.6;">
                        ${formattedMsg || "<p style='color: #94a3b8; font-style: italic;'>Your promo message will appear here...</p>"}
                        ${ctaBtn}
                    </div>
                </div>
            </div>
        `;
    }, [message, ctaLink]);

    // ─── Sending Process (Handling Progress Updates) ────────────────
    const handleSendCampaign = async () => {
        if (!subject || !message || selectedEmails.length === 0) {
            toast.error("Subject, Message, and at least one User are required.");
            return;
        }

        setShowConfirm(false);
        setIsSending(true);
        setProgress({ current: 0, total: selectedEmails.length });

        try {
            // Mapping emails back to the structure the backend expects [{email: '...'}]
            const recipients = selectedEmails.map(e => ({ email: e }));
            
            const res = await API.post("/admin/send-promotions", {
                subject,
                message,
                users: recipients,
                ctaLink
            });

            setResults(res.data);
            toast.success("Campaign dispatched successfully!");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Bulk send failed");
        } finally {
            setIsSending(false);
        }
    };

    if (results) {
        return <CampaignReport results={results} onReset={() => setResults(null)} />;
    }

    return (
        <div className="space-y-8 animate-fade-in relative">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Mail size={120} />
                </div>
                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
                        <Send size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Send Promotions</h2>
                        <p className="text-gray-500 font-medium">Broadcast email campaigns to your user base via Resend.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <button
                        onClick={() => setShowConfirm(true)}
                        disabled={selectedEmails.length === 0 || !subject || !message}
                        className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-30"
                    >
                        {isSending ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                        {isSending ? "Processing..." : "Validate & Send"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ── Audience Selection (Col 4) ───────────────────────── */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col h-[700px]">
                        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50">
                            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-[10px] flex items-center gap-2">
                                <Users size={14} className="text-blue-500" />
                                Recipients ({selectedEmails.length})
                            </h3>
                            <button
                                onClick={toggleAll}
                                className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700"
                            >
                                {allUsersSelected ? "Deselect All" : "Select All"}
                            </button>
                        </div>

                        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 flex items-center gap-2">
                                <Users size={16} className="text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="bg-transparent outline-none text-sm font-semibold w-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                            {loading ? (
                                <div className="p-12 text-center text-gray-400 font-bold italic animate-pulse">Scanning users...</div>
                            ) : filteredUsers.map(u => (
                                <label
                                    key={u.email}
                                    className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-all hover:bg-blue-50/30 ${selectedEmails.includes(u.email) ? "bg-blue-50/50" : ""}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedEmails.includes(u.email)}
                                        onChange={() => toggleUser(u.email)}
                                        className="w-5 h-5 accent-black rounded cursor-pointer"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-gray-900 dark:text-white truncate">{u.name || "User"}</p>
                                        <p className="text-[10px] font-bold text-gray-400 truncate uppercase mt-0.5">{u.email}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Editor (Col 8) ──────────────────────────────────── */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl p-10 flex flex-col min-h-[700px]">
                        <div className="flex items-center gap-2 mb-8">
                            <Layout size={20} className="text-orange-500" />
                            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-[10px]">Campaign Content</h3>
                        </div>

                        <div className="space-y-6 flex-1 flex flex-col">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2 px-1">Email Subject</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 🎁 Get 20% off your next summer stay!"
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>

                            <div className="flex-1 flex flex-col">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2 px-1">Message Body</label>
                                <textarea
                                    placeholder="Write your email message here... (HTML supported)"
                                    className="w-full flex-1 bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl px-6 py-6 text-sm font-semibold leading-relaxed focus:ring-2 focus:ring-blue-500/20 resize-none"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2 px-1">Call to Action Link (Optional)</label>
                                <input
                                    type="url"
                                    placeholder="e.g. https://travelbnb.com/discount"
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20"
                                    value={ctaLink}
                                    onChange={(e) => setCtaLink(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* ── Live Preview Modal Toggle ───────────────── */}
                        <div className="mt-10 pt-10 border-t border-gray-100 dark:border-gray-800">
                             <p className="text-[10px] font-black uppercase text-orange-500 tracking-widest flex items-center gap-2 mb-4">
                                <Eye size={12} /> Live Preview
                             </p>
                             <div 
                                className="w-full bg-gray-50 dark:bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
                                dangerouslySetInnerHTML={{ __html: previewHtml }}
                             />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Confirmation Modal ─────────────────────────────────── */}
            {showConfirm && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] p-10 text-center shadow-2xl animate-scale-in">
                        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse shadow-xl shadow-orange-500/10">
                            <AlertTriangle size={36} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Are you sure?</h3>
                        <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                            You're about to send this promotion to <span className="text-black font-black">{selectedEmails.length} users</span>. 
                            This action cannot be undone.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleSendCampaign}
                                className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-gray-800 transition-all active:scale-95 shadow-xl"
                            >
                                Confirm & Send Now
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="w-full bg-white text-gray-400 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:text-red-500 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Progress Overlay ────────────────────────────────────── */}
            {isSending && (
                <div className="fixed inset-0 z-[101] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] p-10 text-center shadow-2xl">
                        <Loader2 className="animate-spin text-blue-500 mx-auto mb-8" size={60} />
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2 italic">Dispatching...</h3>
                        <p className="text-gray-500 font-medium mb-10 tracking-tight">Broadcasting your promotional campaign. Please don't close this tab.</p>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">
                                <span>Batch Status</span>
                                <span>{selectedEmails.length} recipients</span>
                            </div>
                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-1 border border-gray-100 dark:border-gray-800">
                                <div 
                                    className="h-full bg-blue-500 rounded-full transition-all duration-700 w-full animate-pulse"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function CampaignReport({ results, onReset }) {
    return (
        <div className="max-w-3xl mx-auto py-12 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-16 text-center shadow-2xl border border-gray-100 dark:border-gray-800">
                <div className="w-28 h-28 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-xl shadow-green-500/10">
                    <CheckCircle2 size={56} strokeWidth={2.5} />
                </div>
                <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2">Campaign Dispatched</h3>
                <p className="text-gray-500 font-medium mb-12 text-lg">Report Summary</p>
                
                <div className="grid grid-cols-2 gap-6 mb-12">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
                        <p className="text-5xl font-black text-blue-600">{results.sent}</p>
                        <p className="text-[11px] font-black uppercase text-gray-400 tracking-widest mt-3">Emails Sent</p>
                    </div>
                    <div className={results.failed > 0 ? "bg-red-50 p-10 rounded-[2.5rem] border border-red-100" : "bg-gray-50 dark:bg-gray-800/50 p-10 rounded-[2.5rem]"}>
                        <p className={`text-5xl font-black ${results.failed > 0 ? "text-red-600" : "text-gray-400"}`}>{results.failed}</p>
                        <p className="text-[11px] font-black uppercase text-gray-400 tracking-widest mt-3">Failures</p>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={onReset}
                        className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] hover:bg-gray-800 transition-all active:scale-95 shadow-xl"
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
                                link.download = "failed_promos.csv";
                                link.click();
                            }}
                            className="text-[11px] font-black uppercase text-red-600 hover:text-red-700 tracking-widest flex items-center justify-center gap-2"
                        >
                            <Download size={14} /> Download Failed Emails
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, bg }) {
    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-[2rem] shadow-sm flex items-center gap-5">
            <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center`}>
                <Icon size={24} />
            </div>
            <div>
                <h4 className="text-2xl font-black text-gray-900 dark:text-white">{value}</h4>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-0.5">{label}</p>
            </div>
        </div>
    );
}
