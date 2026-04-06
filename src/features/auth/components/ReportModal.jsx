import React, { useState } from "react";
import { AlertTriangle, Send, X, Loader2, ShieldAlert } from "lucide-react";
import API from "../../../services/api";
import { toast } from "react-hot-toast";

export default function ReportModal({ isOpen, onClose, targetId, targetName }) {
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const reasons = [
        "Inaccurate listing or profile",
        "Fraudulent activity or scam",
        "Harassment or offensive behavior",
        "Safety concerns",
        "Other"
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason) return toast.error("Please select a reason");

        setLoading(true);
        try {
            await API.post("/trust/report", {
                target_id: targetId,
                reason,
                description
            });
            toast.success("Report submitted. Thank you for helping keep our community safe.");
            onClose();
            setReason("");
            setDescription("");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to submit report");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-up border border-gray-100 dark:border-gray-800">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center text-red-600">
                                <ShieldAlert size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Report User</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Target: {targetName}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Reason for report</label>
                            <div className="space-y-2">
                                {reasons.map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setReason(r)}
                                        className={`w-full text-left px-5 py-3 rounded-2xl border text-sm font-bold transition-all
                                            ${reason === r
                                                ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900"
                                                : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-400"
                                            }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Description (Optional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                rows="3"
                                placeholder="Provide more details to help our team investigate..."
                            ></textarea>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || !reason}
                                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-gray-100 transition-all disabled:opacity-50 shadow-xl shadow-gray-200 dark:shadow-none"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                SUBMIT REPORT
                            </button>
                        </div>
                    </form>

                    <p className="text-[10px] text-gray-400 text-center mt-6 font-bold uppercase tracking-tighter italic">
                        All reports are confidential and reviewed within 24 hours.
                    </p>
                </div>
            </div>
        </div>
    );
}
