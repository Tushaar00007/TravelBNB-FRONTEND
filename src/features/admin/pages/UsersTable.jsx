import { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import API from "../../../services/api";
import { toast } from "react-hot-toast";
import { Search, Trash2, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";

const ROLES = ["", "guest", "admin", "sub_admin", "super_admin", "host"];

export default function UsersTable() {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [verifiedFilter, setVerifiedFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const token = Cookies.get("token");
    const LIMIT = 10;

    const fetchUsers = useCallback(() => {
        setLoading(true);
        API.get("/admin/users", {
            headers: { Authorization: `Bearer ${token}` },
            params: { page, limit: LIMIT, search, role, verified: verifiedFilter },
        })
            .then(r => { setUsers(r.data.data); setTotal(r.data.total); })
            .catch(() => toast.error("Failed to load users"))
            .finally(() => setLoading(false));
    }, [token, page, search, role, verifiedFilter]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);
    useEffect(() => { setPage(1); }, [search, role, verifiedFilter]);

    const changeRole = async (userId, newRole) => {
        try {
            await API.put(`/admin/users/${userId}/role`, { role: newRole }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success(`Role updated to ${newRole}`);
            fetchUsers();
        } catch { toast.error("Failed to update role"); }
    };

    const deleteUser = async (userId, name) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <p className="font-bold text-gray-900 dark:text-white text-sm">Delete user "{name}"?</p>
                <p className="text-xs text-red-500 font-semibold italic">This cannot be undone.</p>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await doDeleteUser(userId);
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
        ), { duration: 6000 });
    };

    const doDeleteUser = async (userId) => {
        const loadingToast = toast.loading("Deleting user...");
        try {
            await API.delete(`/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("User deleted", { id: loadingToast });
            fetchUsers();
        } catch { toast.error("Failed to delete user", { id: loadingToast }); }
    };

    const pages = Math.ceil(total / LIMIT);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Users</h2>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 flex-1 min-w-[200px]">
                    <Search size={16} className="text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search name or email…"
                        className="bg-transparent outline-none text-sm text-gray-900 dark:text-white w-full"
                    />
                </div>
                <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 outline-none"
                >
                    {ROLES.map(r => <option key={r} value={r}>{r || "All roles"}</option>)}
                </select>
                <select
                    value={verifiedFilter}
                    onChange={e => setVerifiedFilter(e.target.value)}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 outline-none"
                >
                    <option value="">All Verification</option>
                    <option value="true">Verified Only</option>
                    <option value="false">Unverified Only</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                {["Name", "Email", "Status", "Role", "Joined", "Actions"].map(h => (
                                    <th key={h} className="px-5 py-3.5 text-left">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {loading ? (
                                [...Array(6)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {[...Array(5)].map((_, j) => (
                                            <td key={j} className="px-5 py-4">
                                                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-3/4" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-12 text-gray-400 font-semibold">No users found</td></tr>
                            ) : users.map(u => (
                                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">{u.name}</td>
                                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                                    <td className="px-5 py-4">
                                        {u.is_email_verified ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-full">
                                                <ShieldCheck size={12} /> Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">
                                                Unverified
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        <select
                                            value={u.role}
                                            onChange={e => changeRole(u._id, e.target.value)}
                                            className="bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-2 py-1 text-xs font-bold text-gray-800 dark:text-gray-200 outline-none cursor-pointer"
                                        >
                                            {ROLES.filter(Boolean).map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-5 py-4 text-gray-400 text-xs">
                                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="px-5 py-4">
                                        <button onClick={() => deleteUser(u._id, u.name)} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50 dark:border-gray-800">
                        <span className="text-xs text-gray-400">{total} total users</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <ChevronLeft size={16} />
                            </button>
                            {[...Array(pages)].map((_, i) => (
                                <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${page === i + 1 ? "bg-orange-500 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
                                    {i + 1}
                                </button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
