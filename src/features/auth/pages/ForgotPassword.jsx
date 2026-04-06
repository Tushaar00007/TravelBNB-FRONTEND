import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../../../services/api";
import { Mail, Loader2, ArrowLeft, CheckCircle2, Key, Copy, Check } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [resetLink, setResetLink] = useState(null);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Enter a valid email address");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await API.post("/auth/forgot-password", { email });
            if (res.data.reset_link) {
                setResetLink(res.data.reset_link);
            }
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to generate reset link");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(resetLink);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10">
                <Link to="/login" className="text-2xl font-extrabold text-orange-500 block mb-8">TravelBNB</Link>

                {!sent ? (
                    <>
                        <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                            <Mail size={28} className="text-orange-500" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Forgot password?</h1>
                        <p className="text-gray-400 text-sm mb-8">Enter your email and we'll generate a reset link for you.</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        placeholder="Your email address"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                        className={`w-full border ${error ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"} focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl pl-9 pr-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all`}
                                    />
                                </div>
                                {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-60"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                                {loading ? "Generating..." : "Generate Reset Link"}
                            </button>
                        </form>
                    </>
                ) : resetLink ? (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Key size={32} className="text-orange-500" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Reset Link Ready!</h2>
                        <p className="text-gray-400 text-sm mb-8">
                            Email is not configured in dev mode. Use the link below to reset your password.
                        </p>

                        <div className="space-y-3">
                            <a 
                                href={resetLink}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-100"
                            >
                                🔐 Reset My Password
                            </a>

                            <button
                                onClick={handleCopy}
                                className="w-full bg-white border border-gray-200 hover:border-orange-200 hover:bg-orange-50 text-gray-700 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                            >
                                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                {copied ? "Copied!" : "Copy Reset Link"}
                            </button>
                        </div>

                        <div className="mt-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-mono break-all text-left line-clamp-2">
                                {resetLink}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <CheckCircle2 size={36} className="text-red-500" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">No account found</h2>
                        <p className="text-gray-400 text-sm mb-8">
                            No account exists for <span className="font-semibold text-gray-600">{email}</span>. Please check the email or sign up.
                        </p>
                        <button 
                            onClick={() => setSent(false)}
                            className="text-orange-500 font-bold text-sm hover:underline"
                        >
                            Try another email
                        </button>
                    </div>
                )}

                <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 mt-8 transition-colors">
                    <ArrowLeft size={14} /> Back to Login
                </Link>
            </div>
        </div>
    );
}
