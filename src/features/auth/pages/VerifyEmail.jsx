import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ShieldCheck, ShieldAlert, Loader2, Home, LogIn } from "lucide-react";
import API from "../../../services/api";
import { toast } from "react-hot-toast";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState("verifying"); // verifying | success | error
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid verification link. No token found.");
            return;
        }

        const verify = async () => {
            try {
                const res = await API.get(`/auth/verify-email?token=${token}`);
                setStatus("success");
                setMessage(res.data.message || "Email verified successfully!");
                toast.success("Identity Verified! +10 Trust points earned.");
            } catch (err) {
                setStatus("error");
                setMessage(err.response?.data?.detail || "Verification failed. The link may be expired or invalid.");
                toast.error("Verification failed");
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl p-10 text-center border border-gray-100 animate-fade-in">

                {status === "verifying" && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center">
                                <Loader2 size={40} className="text-orange-500 animate-spin" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Verifying Email</h1>
                        <p className="text-gray-500 font-bold">Please wait while we secure your account...</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center animate-bounce">
                                <ShieldCheck size={40} className="text-green-500" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Welcome Aboard!</h1>
                        <p className="text-gray-600 font-bold leading-relaxed">{message}</p>
                        <div className="pt-6 space-y-3">
                            <button
                                onClick={() => navigate("/")}
                                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                            >
                                <Home size={18} />
                                GO TO HOME
                            </button>
                        </div>
                    </div>
                )}

                {status === "error" && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                                <ShieldAlert size={40} className="text-red-500" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Verification Failed</h1>
                        <p className="text-gray-600 font-bold leading-relaxed">{message}</p>
                        <div className="pt-6 space-y-3">
                            <button
                                onClick={() => navigate("/login")}
                                className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white font-black py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-200"
                            >
                                <LogIn size={18} />
                                BACK TO LOGIN
                            </button>
                            <button
                                onClick={() => navigate("/")}
                                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-900 font-black py-4 rounded-2xl hover:bg-gray-200 transition-all"
                            >
                                <Home size={18} />
                                HOME
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-10 pt-8 border-t border-gray-50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">TravelBNB Trust & Safety System</p>
                </div>
            </div>
        </div>
    );
}
