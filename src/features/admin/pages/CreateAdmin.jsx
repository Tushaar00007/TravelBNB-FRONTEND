import { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import API from "../../../services/api";
import { toast } from "react-hot-toast";
import { UserPlus, ShieldCheck, Mail, Lock, User, Trash2, Shield, Activity } from "lucide-react";
import { useEffect } from "react";

export default function CreateAdmin() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "admin",
    });
    const [loading, setLoading] = useState(false);
    const [admins, setAdmins] = useState([]);
    const [loadingAdmins, setLoadingAdmins] = useState(true);
    
    const navigate = useNavigate();
    const token = Cookies.get("token");
    const currentUserId = Cookies.get("userId");

    const fetchAdmins = async () => {
        try {
            setLoadingAdmins(true);
            const res = await API.get("/admin/admins", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAdmins(res.data);
        } catch (err) {
            console.error("Failed to fetch admins:", err);
            toast.error("Failed to load existing admins");
        } finally {
            setLoadingAdmins(false);
        }
    };

    useEffect(() => {
        if (token) fetchAdmins();
    }, [token]);

    const handleDeleteAdmin = async (adminId, adminName) => {
        if (!window.confirm(`Are you sure you want to delete admin "${adminName}"? This cannot be undone.`)) {
            return;
        }

        try {
            await API.delete(`/admin/admins/${adminId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Admin deleted successfully");
            fetchAdmins();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to delete admin");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await API.post("/admin/create", formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success(res.data.message);
            // Instead of navigating away, refresh the list and reset form
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "admin",
            });
            fetchAdmins();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to create admin");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <UserPlus size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Create New Admin</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Provision a new administrative account with specific roles.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <User size={14} /> Full Name
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter admin name"
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Mail size={14} /> Email Address
                            </label>
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="admin@travelbnb.com"
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Lock size={14} /> Password
                            </label>
                            <input
                                required
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                minLength={6}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <ShieldCheck size={14} /> Administrative Role
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-orange-500 transition-colors cursor-pointer appearance-none"
                            >
                                <option value="admin">Support Admin</option>
                                <option value="sub_admin">Sub Admin</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-50 dark:border-gray-800">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold px-10 py-4 rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98] text-sm"
                        >
                            {loading ? "Creating User..." : "Create Admin Account"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Manage Admins List */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-8 border-b border-gray-50 dark:border-gray-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Existing Admins</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total active administrative accounts: {admins.length}</p>
                </div>
                
                <div className="overflow-x-auto">
                    {loadingAdmins ? (
                        <div className="p-12 text-center text-gray-400">
                            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            Loading admin accounts...
                        </div>
                    ) : admins.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 font-medium">No other admins yet.</div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Admin Details</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Designation</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Provisoned On</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {admins.map((admin) => {
                                    const isSelf = admin._id === currentUserId;
                                    const isSuper = admin.role === "super_admin";
                                    const canDelete = !isSelf && !isSuper;

                                    return (
                                        <tr key={admin._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors uppercase tracking-tight text-sm">
                                                    {admin.name}
                                                </div>
                                                <div className="text-xs text-gray-500 font-medium mt-0.5">{admin.email}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                                    admin.role === "super_admin" 
                                                        ? "bg-orange-50 text-orange-600 border-orange-100" 
                                                        : admin.role === "sub_admin"
                                                        ? "bg-blue-50 text-blue-600 border-blue-100"
                                                        : "bg-gray-50 text-gray-600 border-gray-100"
                                                }`}>
                                                    <Shield size={10} strokeWidth={3} />
                                                    {admin.role.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-xs text-gray-500 font-bold uppercase tracking-wider">
                                                {new Date(admin.created_at).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                {canDelete ? (
                                                    <button 
                                                        onClick={() => handleDeleteAdmin(admin._id, admin.name)}
                                                        className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-2xl transition-all active:scale-95 shadow-sm hover:shadow-rose-100"
                                                        title="Revoke access"
                                                    >
                                                        <Trash2 size={18} strokeWidth={2.5} />
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-2 text-gray-300 dark:text-gray-700">
                                                        <Shield size={14} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest italic">Protected</span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6">
                <h4 className="text-blue-700 dark:text-blue-400 font-bold text-sm mb-1 flex items-center gap-2">
                    <ShieldCheck size={16} /> Security Note
                </h4>
                <p className="text-blue-600 dark:text-blue-500 text-xs leading-relaxed">
                    Newly created admins will have immediate access to their designated sections. Ensure passwords are shared securely. You can manage their status or revoke access from the list above.
                </p>
            </div>
        </div>
    );
}
