// ⚠️ DEV-ONLY PAGE — DELETE THIS FILE + ROUTE BEFORE GOING LIVE ⚠️
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import API from "../../../services/api";
import { toast } from "react-hot-toast";

export default function DevAdmin() {
    const [mode, setMode] = useState("create"); // create | promote
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [status, setStatus] = useState("idle");
    const [msg, setMsg] = useState("");
    const navigate = useNavigate();
    const token = Cookies.get("token");

    const handleCreateNewAdmin = async (e) => {
        e.preventDefault();
        setStatus("loading");
        try {
            const res = await API.post("/admin/dev/create-super-admin", formData);
            toast.success(res.data.message);
            setStatus("done");
            // Redirect to login after success
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setStatus("error");
            toast.error(err.response?.data?.detail || "Failed to create admin");
        }
    };

    const handlePromoteMe = async () => {
        if (!token) {
            toast.error("You must be logged in first to promote your own account.");
            return;
        }
        toast((t) => (
            <div className="flex flex-col gap-3 p-1 text-left">
                <p className="font-bold text-gray-900 dark:text-white text-sm">Promote your account?</p>
                <p className="text-[10px] text-gray-500 font-semibold italic">You'll be logged out to apply the change.</p>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await doPromote();
                        }}
                        className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                        Promote
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

    const doPromote = async () => {
        setStatus("loading");
        try {
            const res = await API.post(
                "/admin/dev/make-super-admin",
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message);
            setStatus("done");
            setTimeout(() => {
                Cookies.remove("token");
                Cookies.remove("userId");
                navigate("/login");
            }, 2500);
        } catch (err) {
            setStatus("error");
            toast.error(err.response?.data?.detail || "Failed to promote account");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
            <div className="max-w-md w-full bg-gray-900 border border-yellow-500/30 rounded-3xl p-10 shadow-2xl space-y-8">

                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold px-4 py-2 rounded-full">
                        ⚠️ DEV-ONLY · Remove before production
                    </div>
                    <h1 className="text-3xl font-black text-white">Dev Admin Shortcut</h1>
                </div>

                {/* Status display */}
                {status === "done" && (
                    <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl px-5 py-4 text-sm font-semibold text-center">
                        ✅ {msg}
                    </div>
                )}
                {status === "error" && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl px-5 py-4 text-sm font-semibold text-center">
                        ❌ {msg}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex bg-gray-800 p-1 rounded-2xl">
                    <button
                        onClick={() => { setMode("create"); setStatus("idle"); }}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === "create" ? "bg-purple-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                    >
                        Create New
                    </button>
                    <button
                        onClick={() => { setMode("promote"); setStatus("idle"); }}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === "promote" ? "bg-purple-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                    >
                        Promote Current
                    </button>
                </div>

                {mode === "create" ? (
                    <form onSubmit={handleCreateNewAdmin} className="space-y-4">
                        <input
                            required
                            type="text"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 text-white outline-none focus:border-purple-500 transition-colors"
                        />
                        <input
                            required
                            type="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 text-white outline-none focus:border-purple-500 transition-colors"
                        />
                        <input
                            required
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 text-white outline-none focus:border-purple-500 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={status === "loading" || status === "done"}
                            className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 disabled:opacity-40 text-white font-black py-4 rounded-2xl transition-all shadow-lg"
                        >
                            {status === "loading" ? "Creating..." : "Create New Super Admin"}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Promotes your currently logged-in account to <span className="font-bold text-purple-400">super_admin</span>.
                        </p>
                        <button
                            onClick={handlePromoteMe}
                            disabled={status === "loading" || status === "done"}
                            className="w-full bg-gray-800 border border-gray-700 hover:border-purple-500 text-white font-black py-4 rounded-2xl transition-all"
                        >
                            {status === "loading" ? "Promoting..." : "Make Me Super Admin"}
                        </button>
                    </div>
                )}

                <p className="text-xs text-center text-gray-600">
                    Requires <code className="bg-gray-800 px-1 rounded">DEBUG=true</code> in backend <code className="bg-gray-800 px-1 rounded">.env</code>
                </p>
            </div>
        </div>
    );
}

