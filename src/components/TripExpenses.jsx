import React, { useState, useEffect } from "react";
import API from "../services/api";
import { toast } from "react-hot-toast";
import { Plus, IndianRupee, ArrowRight, Loader2, Receipt } from "lucide-react";

function ExpenseRow({ exp }) {
    return (
        <div className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 shrink-0">
                <Receipt className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{exp.title}</p>
                <p className="text-xs text-gray-400">Paid by {exp.paid_by_name} · split {exp.split_between?.length || 1} ways</p>
            </div>
            <p className="font-bold text-gray-800 dark:text-gray-100 text-sm shrink-0">₹{exp.amount?.toLocaleString()}</p>
        </div>
    );
}

function SettlementRow({ s }) {
    return (
        <div className="flex items-center gap-2 text-sm py-2.5 px-4 border-b border-gray-50 dark:border-gray-800 last:border-0">
            <span className="font-medium text-red-500 truncate max-w-[35%]">{s.from_name}</span>
            <div className="flex items-center gap-1 text-gray-400 shrink-0">
                <ArrowRight className="w-4 h-4" />
            </div>
            <span className="font-medium text-green-600 truncate max-w-[35%]">{s.to_name}</span>
            <span className="ml-auto font-bold text-gray-800 dark:text-gray-100 shrink-0">₹{s.amount}</span>
        </div>
    );
}

export default function TripExpenses({ tripId, trip, currentUserId }) {
    const [data, setData] = useState({ expenses: [], total: 0, settlements: [] });
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: "", amount: "", split_between: [] });
    const [submitting, setSubmitting] = useState(false);

    const fetch = () =>
        API.get(`/trips/${tripId}/expenses`)
            .then((r) => setData(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));

    useEffect(() => { fetch(); }, [tripId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.amount) return;
        setSubmitting(true);
        try {
            await API.post(`/trips/${tripId}/expenses`, {
                title: form.title,
                amount: parseFloat(form.amount),
                paid_by: currentUserId,
                split_between: form.split_between.length ? form.split_between : (trip.members || []),
            });
            setForm({ title: "", amount: "", split_between: [] });
            setShowForm(false);
            fetch();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to add expense");
        } finally {
            setSubmitting(false);
        }
    };

    const toggleMember = (mid) => {
        setForm((f) => ({
            ...f,
            split_between: f.split_between.includes(mid)
                ? f.split_between.filter((x) => x !== mid)
                : [...f.split_between, mid],
        }));
    };

    return (
        <div className="space-y-5">
            {/* Summary bar */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4">
                    <p className="text-xs text-orange-400 font-semibold uppercase tracking-wide">Total spent</p>
                    <p className="text-2xl font-extrabold text-orange-600 mt-1">₹{data.total.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Expenses</p>
                    <p className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mt-1">{data.expenses.length}</p>
                </div>
            </div>

            {/* Add expense button / form */}
            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-orange-300 text-orange-500 rounded-2xl hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors font-semibold text-sm"
                >
                    <Plus className="w-4 h-4" /> Add Expense
                </button>
            ) : (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm space-y-4">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-orange-500" /> New Expense
                    </h3>

                    <input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="What was this for? (e.g. Dinner)"
                        required
                        className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />

                    <div className="flex gap-2 items-center">
                        <span className="text-gray-400 font-bold">₹</span>
                        <input
                            type="number"
                            min="1"
                            step="0.01"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            placeholder="Amount"
                            required
                            className="flex-1 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                    </div>

                    {/* Split between */}
                    {trip.member_details?.length > 1 && (
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Split between (default: all)</p>
                            <div className="flex flex-wrap gap-2">
                                {trip.member_details.map((m) => {
                                    const sel = form.split_between.includes(m._id);
                                    return (
                                        <button
                                            key={m._id}
                                            type="button"
                                            onClick={() => toggleMember(m._id)}
                                            className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-colors ${sel
                                                ? "bg-orange-500 text-white border-orange-500"
                                                : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-orange-300"
                                                }`}
                                        >
                                            {m.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 pt-1">
                        <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-500 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Add Expense
                        </button>
                    </div>
                </form>
            )}

            {/* Expense list */}
            {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>
            ) : data.expenses.length > 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800 overflow-hidden shadow-sm">
                    {data.expenses.map((e) => <ExpenseRow key={e._id} exp={e} />)}
                </div>
            ) : null}

            {/* Settlements */}
            {data.settlements?.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800 flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-orange-500" />
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Who owes whom</h3>
                    </div>
                    {data.settlements.map((s, i) => <SettlementRow key={i} s={s} />)}
                </div>
            )}
        </div>
    );
}
