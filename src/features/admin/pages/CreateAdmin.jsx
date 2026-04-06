import { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import API from "../../../services/api";
import { toast } from "react-hot-toast";
import { UserPlus, ShieldCheck, Mail, Lock, User } from "lucide-react";

export default function CreateAdmin() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "admin",
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const token = Cookies.get("token");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await API.post("/admin/create", formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success(res.data.message);
            navigate("/admin/users");
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

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6">
                <h4 className="text-blue-700 dark:text-blue-400 font-bold text-sm mb-1 flex items-center gap-2">
                    <ShieldCheck size={16} /> Security Note
                </h4>
                <p className="text-blue-600 dark:text-blue-500 text-xs leading-relaxed">
                    Newly created admins will have immediate access to their designated sections. Ensure passwords are shared securely. You can manage their status anytime from the Users table.
                </p>
            </div>
        </div>
    );
}
