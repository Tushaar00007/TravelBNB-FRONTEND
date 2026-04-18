import React, { useState } from 'react';
import { X } from 'lucide-react';
import Cookies from 'js-cookie';
import API from '../../../services/api';

function RequestModal({ pad, onClose, onSend }) {
    const [form, setForm] = useState({ dates: "", message: "" });
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const submit = async () => {
        if (!form.dates || !form.message) {
            setError("Dates and message are required.");
            return;
        }
        setSending(true);
        try {
            const token = Cookies.get("token");
            await API.post("/crashpads/requests", {
                crashpad_id: pad.id,
                ...form
            }, { headers: { Authorization: `Bearer ${token}` } });
            onSend();
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to send request.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="p-10">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">STAY <span className="text-orange-500">REQUEST</span></h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors"><X size={24} strokeWidth={3} className="text-gray-400" /></button>
                    </div>

                    <div className="space-y-6">
                        {error && <div className="text-red-500 text-xs font-bold bg-red-50 p-4 rounded-xl uppercase tracking-widest">{error}</div>}

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Duration</label>
                            <input value={form.dates} onChange={(e) => setForm({ ...form, dates: e.target.value })}
                                placeholder="e.g. Oct 12 - Oct 15"
                                className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl px-6 py-4 font-bold text-gray-900 dark:text-white outline-none border-2 border-transparent focus:border-orange-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Introduction</label>
                            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                                rows={4} placeholder="Tell the host about your trip vibe..."
                                className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl px-6 py-4 font-bold text-gray-900 dark:text-white outline-none border-2 border-transparent focus:border-orange-500 transition-all resize-none"
                            />
                        </div>

                        <button onClick={submit} disabled={sending}
                            className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                        >
                            {sending ? "Sending..." : "Submit Request"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RequestModal;
