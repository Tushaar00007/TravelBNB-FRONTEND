import { useState } from "react";
import Cookies from "js-cookie";
import API from "../../../services/api";
import { toast } from "react-hot-toast";
import { Search, ShieldCheck } from "lucide-react";

const ROLE_OPTIONS = [
    { value: "admin", label: "Admin (Support)", color: "bg-orange-100 text-orange-700" },
    { value: "sub_admin", label: "Sub Admin", color: "bg-blue-100 text-blue-700" },
    { value: "super_admin", label: "Super Admin", color: "bg-purple-100 text-purple-700" },
    { value: "host", label: "Host", color: "bg-green-100 text-green-700" },
    { value: "guest", label: "Guest (revoke)", color: "bg-gray-100 text-gray-600" },
];

export default function AdminSetup() {
    const [email, setEmail] = useState("");
    const [selectedRole, setSelectedRole] = useState("admin");
    const [foundUser, setFoundUser] = useState(null);
    const [searching, setSearching] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const token = Cookies.get("token");

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!email.trim()) { toast.error("Enter an email to search"); return; }
        setSearching(true);
        setFoundUser(null);
        try {
            const res = await API.get("/admin/users", {
                headers: { Authorization: `Bearer ${token}` },
                params: { search: email, limit: 1, page: 1 },
            });
            if (res.data.data.length > 0) {
                setFoundUser(res.data.data[0]);
            } else {
                toast.error("No user found with that email");
            }
        } catch { toast.error("Search failed"); }
        finally { setSearching(false); }
    };

    const handleAssign = async () => {
        if (!foundUser) return;
        setAssigning(true);
        try {
            await API.put(`/admin/users/${foundUser._id}/role`, { role: selectedRole }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success(`✅ ${foundUser.name} is now a ${selectedRole.replace("_", " ")}`);
            setFoundUser({ ...foundUser, role: selectedRole });
        } catch { toast.error("Failed to assign role"); }
        finally { setAssigning(false); }
    };

    return (
        <div className="space-y-8 max-w-xl">
            <div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck size={22} className="text-purple-500" /> Admin Setup
                </h2>
                <p className="text-gray-400 text-sm mt-1">Search a user by email and assign them an admin role.</p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">User Email</label>
                <div className="flex gap-3">
                    <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus-within:border-orange-400 transition-colors">
                        <Search size={16} className="text-gray-400 shrink-0" />
                        <input
                            value={email}
                            onChange={e => { setEmail(e.target.value); setFoundUser(null); }}
                            type="email"
                            placeholder="user@example.com"
                            className="bg-transparent outline-none text-sm text-gray-900 dark:text-white w-full"
                        />
                    </div>
                    <button type="submit" disabled={searching} className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm rounded-xl hover:opacity-80 disabled:opacity-40 transition">
                        {searching ? "…" : "Find"}
                    </button>
                </div>

                {/* Found user card */}
                {foundUser && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-4 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white font-black text-sm shrink-0">
                                {foundUser.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{foundUser.name}</p>
                                <p className="text-xs text-gray-400">{foundUser.email}</p>
                            </div>
                            <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">
                                {foundUser.role}
                            </span>
                        </div>

                        {/* Role selector */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Assign Role</label>
                            <div className="flex flex-wrap gap-2">
                                {ROLE_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setSelectedRole(opt.value)}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-all ${selectedRole === opt.value
                                                ? `${opt.color} border-current`
                                                : "bg-transparent text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-400"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleAssign}
                            disabled={assigning}
                            className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-40 transition text-sm"
                        >
                            {assigning ? "Assigning…" : `Assign "${selectedRole.replace("_", " ")}" to ${foundUser.name}`}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
