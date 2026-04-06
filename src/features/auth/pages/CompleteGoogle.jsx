import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import API from "../../../services/api";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Phone, Loader2, ChevronRight } from "lucide-react";

export default function CompleteGoogleSignup() {
    const location = useLocation();
    const navigate = useNavigate();
    const token = location.state?.token;

    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4 p-8">
                <h1 className="text-2xl font-bold text-gray-800">Invalid session</h1>
                <p className="text-gray-500 text-center">We couldn't find your Google login session. Please try again.</p>
                <Link to="/login" className="bg-orange-500 text-white px-6 py-2 rounded-xl font-semibold">Go to Login</Link>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const digits = phone.replace(/\D/g, "");
        if (digits.length < 10) {
            setError("Please enter a valid 10-digit phone number");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const res = await API.post("/auth/google-login", {
                token: token,
                phone: digits
            });

            const newToken = res.data.access_token;
            const decoded = jwtDecode(newToken);
            const userId = decoded.user_id || decoded.sub || decoded.id;

            Cookies.set("token", newToken);
            Cookies.set("userId", userId);

            navigate("/");
        } catch (err) {
            setError("Failed to save phone number. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white px-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-orange-100/50 p-8 md:p-12 border border-orange-50">
                <div className="text-center mb-8">
                    <div className="text-4xl mb-4">📱</div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Final Step!</h1>
                    <p className="text-gray-500">To secure your account and allow hosts to reach you, please provide your phone number.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Phone Number</label>
                        <div className="relative">
                            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="tel"
                                placeholder="9876543210"
                                value={phone}
                                onChange={(e) => {
                                    setPhone(e.target.value);
                                    if (error) setError("");
                                }}
                                className={`w-full border ${error ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"} focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100 rounded-2xl pl-12 pr-4 py-4 text-lg text-gray-800 placeholder-gray-400 outline-none transition-all duration-200`}
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm mt-2 ml-1">❌ {error}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-60 shadow-lg shadow-orange-500/25"
                    >
                        {loading ? <Loader2 size={24} className="animate-spin" /> : "Complete My Profile"}
                        {!loading && <ChevronRight size={20} />}
                    </button>
                </form>

                <p className="text-center text-gray-400 text-xs mt-8">
                    We use your phone number for important booking updates only.
                </p>
            </div>
        </div>
    );
}
