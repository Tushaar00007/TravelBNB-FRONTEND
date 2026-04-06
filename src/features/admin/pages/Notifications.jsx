import { useState } from "react";
import Cookies from "js-cookie";
import API from "../../../services/api";
import { toast } from "react-hot-toast";
import { Bell, Send, Users, ShieldCheck, Mail, Info } from "lucide-react";

export default function Notifications() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [target, setTarget] = useState("all");
    const [sending, setSending] = useState(false);
    const token = Cookies.get("token");

    const sendNotif = async (e) => {
        e.preventDefault();
        if (!title || !message) return toast.error("Title and message are required");

        setSending(true);
        const loadingToast = toast.loading("Broadcasting notification...");
        try {
            await API.post("/admin/notify", { title, message, target }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Notification sent to all targets", { id: loadingToast });
            setTitle("");
            setMessage("");
        } catch {
            toast.error("Failed to send notification", { id: loadingToast });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                    <Bell className="text-orange-500" size={32} />
                    System Notifications
                </h2>
                <p className="text-sm text-gray-500 font-medium italic">Send global or targeted alerts to the entire TravelBNB community</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="md:col-span-2 space-y-6">
                    <form onSubmit={sendNotif} className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Notification Title</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g., Scheduled Maintenance"
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 text-sm font-semibold focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-400"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Message Content</label>
                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                rows={5}
                                placeholder="Describe the notification in detail..."
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 text-sm font-semibold focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-400 resize-none"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Target Audience</label>
                            <div className="flex flex-wrap gap-4">
                                {[
                                    { id: "all", label: "Everyone", icon: Users },
                                    { id: "host", label: "Only Hosts", icon: ShieldCheck },
                                    { id: "user", label: "Only Travelers", icon: Mail },
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setTarget(t.id)}
                                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all ${target === t.id
                                                ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10 text-orange-600"
                                                : "border-transparent bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                                            }`}
                                    >
                                        <t.icon size={18} />
                                        <span className="text-xs font-black uppercase">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            disabled={sending}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-orange-200 dark:shadow-none transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                        >
                            <Send size={20} />
                            BROADCAST NOTIFICATION
                        </button>
                    </form>
                </div>

                {/* Info Section */}
                <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-6 rounded-3xl">
                        <div className="flex items-center gap-3 mb-4">
                            <Info className="text-blue-500" size={24} />
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Best Practices</h3>
                        </div>
                        <ul className="space-y-3 text-xs text-blue-800 dark:text-blue-300 font-medium list-disc ml-4">
                            <li>Keep titles short and urgent.</li>
                            <li>Use clear, concise instructions.</li>
                            <li>Target the right group to avoid spamming.</li>
                            <li>Critical alerts should be sent in off-peak hours.</li>
                        </ul>
                    </div>

                    <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl shadow-gray-200 dark:shadow-none">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4 leading-none">Live Preview</p>
                        <div className="border border-white/10 rounded-2xl p-4 bg-white/5 space-y-2">
                            <h4 className="text-sm font-bold text-orange-400">{title || "Your Title Here"}</h4>
                            <p className="text-xs text-gray-300 leading-relaxed">{message || "Your message content will appear here for the users to see..."}</p>
                            <div className="pt-2 flex justify-between items-center text-[9px] font-bold text-white/30 uppercase">
                                <span>Sent to: {target}</span>
                                <span>Just now</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
