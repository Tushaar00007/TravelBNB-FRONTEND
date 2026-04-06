import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import API from "../../../services/api";
import { toast } from "react-hot-toast";
import { Plus, Trash2, Tag } from "lucide-react";

export default function CouponsManager() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ code: "", discount: "", expires_at: "" });
    const [submitting, setSubmitting] = useState(false);
    const token = Cookies.get("token");

    const fetchCoupons = () => {
        setLoading(true);
        API.get("/admin/coupons", { headers: { Authorization: `Bearer ${token}` } })
            .then(r => setCoupons(r.data))
            .catch(() => toast.error("Failed to load coupons"))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchCoupons(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.code || !form.discount) { toast.error("Code and discount are required"); return; }
        setSubmitting(true);
        try {
            await API.post("/admin/coupons", {
                code: form.code.toUpperCase(),
                discount: Number(form.discount),
                expires_at: form.expires_at || null,
            }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(`Coupon ${form.code.toUpperCase()} created! 🎉`);
            setForm({ code: "", discount: "", expires_at: "" });
            fetchCoupons();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to create coupon");
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (code) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <p className="font-bold text-gray-900 dark:text-white text-sm">Delete coupon "{code}"?</p>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await doDeleteCoupon(code);
                        }}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const doDeleteCoupon = async (code) => {
        const loadingToast = toast.loading("Deleting coupon...");
        try {
            await API.delete(`/admin/coupons/${code}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(`Coupon ${code} deleted`, { id: loadingToast });
            fetchCoupons();
        } catch { toast.error("Failed to delete coupon", { id: loadingToast }); }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Coupons & Promotions</h2>

            {/* Create form */}
            <form onSubmit={handleCreate} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2"><Plus size={16} /> Create New Coupon</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Code *</label>
                        <input
                            value={form.code}
                            onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                            placeholder="e.g. SAVE10"
                            maxLength={20}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-orange-400 transition-colors font-mono"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Discount % *</label>
                        <input
                            type="number"
                            min={1}
                            max={100}
                            value={form.discount}
                            onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
                            placeholder="e.g. 15"
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-orange-400 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Expiry (optional)</label>
                        <input
                            type="date"
                            value={form.expires_at}
                            onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-orange-400 transition-colors"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold px-6 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity text-sm active:scale-95"
                >
                    {submitting ? "Creating…" : "Create Coupon"}
                </button>
            </form>

            {/* List */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2"><Tag size={14} /> Active Coupons ({coupons.length})</h3>
                </div>
                {loading ? (
                    <div className="p-6 animate-pulse space-y-3">
                        {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl" />)}
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 font-semibold">No coupons yet. Create one above!</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                                <tr>{["Code", "Discount", "By", "Created", "Expires", "Action"].map(h => <th key={h} className="px-5 py-3.5 text-left">{h}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {coupons.map(c => (
                                    <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-5 py-4 font-mono font-black text-orange-600 dark:text-orange-400">{c.code}</td>
                                        <td className="px-5 py-4">
                                            <span className="bg-lime-100 dark:bg-lime-900/20 text-lime-700 dark:text-lime-400 font-bold text-xs px-2.5 py-1 rounded-full">{c.discount}% OFF</span>
                                        </td>
                                        <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{c.created_by || "—"}</td>
                                        <td className="px-5 py-4 text-gray-400 text-xs">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td>
                                        <td className="px-5 py-4 text-gray-400 text-xs">{c.expires_at || "Never"}</td>
                                        <td className="px-5 py-4">
                                            <button onClick={() => handleDelete(c.code)} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                                                <Trash2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
