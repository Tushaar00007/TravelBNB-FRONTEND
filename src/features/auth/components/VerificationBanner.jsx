import React, { useState, useEffect } from "react";
import { Mail, Send, CheckCircle, X, Loader2, Timer } from "lucide-react";
import API from "../../../services/api";
import { toast } from "react-hot-toast";

export default function VerificationBanner({ userEmail }) {
    const [sending, setSending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [show, setShow] = useState(true);

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => setCooldown(c => c - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleResend = async () => {
        if (cooldown > 0 || sending) return;

        setSending(true);
        try {
            await API.post("/auth/resend-verification");
            toast.success("Verification email sent! Check your inbox.");
            setCooldown(60); // 60 seconds cooldown
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to resend email");
        } finally {
            setSending(false);
        }
    };

    if (!show) return null;

    return (
        <div className="bg-[#FFF8F1] dark:bg-orange-950/20 border-b border-orange-100 dark:border-orange-900/30 px-6 py-3 animate-slide-down sticky top-0 z-[70]">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 shadow-sm">
                        <Mail size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-orange-900 dark:text-orange-100 tracking-tight">
                            Please verify your email address <span className="hidden lg:inline text-orange-600/60 dark:text-orange-400/60 font-bold ml-1">({userEmail})</span>
                        </p>
                        <p className="text-[10px] sm:text-xs text-orange-700/70 dark:text-orange-400/70 font-bold uppercase tracking-widest mt-0.5">
                            Unlock full access to Travel Buddy and premium listings
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleResend}
                        disabled={cooldown > 0 || sending}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 shadow-lg active:scale-95
                            ${cooldown > 0 || sending
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                : "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-orange-500/30"
                            }`}
                    >
                        {sending ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : cooldown > 0 ? (
                            <Timer size={14} />
                        ) : (
                            <Send size={14} strokeWidth={3} />
                        )}
                        {cooldown > 0 ? `Retry in ${cooldown}s` : sending ? "Sending..." : "Resend Email"}
                    </button>

                    <button
                        onClick={() => setShow(false)}
                        className="p-2 hover:bg-white dark:hover:bg-orange-900/50 rounded-full text-orange-400 transition-all hover:text-orange-600 hover:shadow-sm"
                    >
                        <X size={18} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
}
