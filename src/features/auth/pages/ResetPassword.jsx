import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import API from "../../../services/api";
import PasswordInput from "../components/PasswordInput";
import { Loader2, ArrowLeft, CheckCircle2, Lock } from "lucide-react";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [apiError, setApiError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "password") setPassword(value);
        else setConfirmPassword(value);
        setErrors((p) => { const n = { ...p }; delete n[name]; return n; });
        setApiError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = {};
        if (password.length < 8) errs.password = "Password must be at least 8 characters";
        if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match";
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setLoading(true);
        try {
            await API.post("/auth/reset-password", { token, new_password: password });
            setDone(true);
        } catch (err) {
            setApiError(err.response?.data?.detail || "Reset failed. This link may have expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10">
                <Link to="/login" className="text-2xl font-extrabold text-orange-500 block mb-8">TravelBNB</Link>

                {!done ? (
                    <>
                        <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                            <Lock size={28} className="text-orange-500" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Set new password</h1>
                        <p className="text-gray-400 text-sm mb-8">Choose a strong password that you haven't used before.</p>

                        {!token && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm mb-6">
                                ⚠ No reset token found. Please use the link from your email.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <PasswordInput
                                    name="password"
                                    value={password}
                                    onChange={handleChange}
                                    placeholder="New password"
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                            </div>

                            <div>
                                <PasswordInput
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm new password"
                                />
                                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</p>}
                            </div>

                            {/* Password strength hint */}
                            {password.length > 0 && (
                                <div className="space-y-1">
                                    {[
                                        { label: "At least 8 characters", ok: password.length >= 8 },
                                        { label: "Contains a number", ok: /\d/.test(password) },
                                        { label: "Contains a special character", ok: /[!@#$%^&*]/.test(password) },
                                    ].map((r) => (
                                        <div key={r.label} className={`flex items-center gap-1.5 text-xs ${r.ok ? "text-green-500" : "text-gray-400"}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${r.ok ? "bg-green-500" : "bg-gray-300"}`} />
                                            {r.label}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {apiError && (
                                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                                    ❌ {apiError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !token}
                                className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-60"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <CheckCircle2 size={36} className="text-green-500" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Password reset!</h2>
                        <p className="text-gray-400 text-sm mb-8">Your password has been successfully updated. You can now log in with your new password.</p>
                        <button
                            onClick={() => navigate("/login")}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-sm"
                        >
                            Back to Login
                        </button>
                    </div>
                )}

                {!done && (
                    <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 mt-8 transition-colors">
                        <ArrowLeft size={14} /> Back to Login
                    </Link>
                )}
            </div>
        </div>
    );
}
