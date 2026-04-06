import React, { useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import API from '../../../services/api';
import { User, Mail, Phone, Calendar, LogOut, ShieldCheck, MapPin, Edit3, Settings, CreditCard, Camera, Star, Award, ShieldAlert, Send, Loader2, FileCheck, UserCheck, Globe, DollarSign, Moon, Sun, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { CurrencyContext } from '../../../context/CurrencyContext';
import CustomDropdown from '../../../components/ui/CustomDropdown';

const languageOptions = [
    { value: "en", label: "English (UK)" },
    { value: "hi", label: "Hindi (हिन्दी)" },
    { value: "mr", label: "Marathi (मराठी)" },
    { value: "bn", label: "Bengali (বাংলা)" },
    { value: "ta", label: "Tamil (தமிழ்)" },
    { value: "ml", label: "Malayalam (മലയാളം)" },
    { value: "kn", label: "Kannada (ಕನ್ನಡ)" },
    { value: "pa", label: "Punjabi (ਪੰਜਾਬੀ)" },
    { value: "gu", label: "Gujarati (ગુજરાਤੀ)" },
];

const currencyOptions = [
    { value: "INR", label: "INR - Indian Rupee (₹)" },
    { value: "USD", label: "USD - United States Dollar ($)" },
    { value: "EUR", label: "EUR - Euro (€)" },
    { value: "GBP", label: "GBP - British Pound (£)" },
];

function Profile() {
    const { i18n } = useTranslation();
    const { setCurrency, currency } = useContext(CurrencyContext);

    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: "", phone: "", address: "", language: "English", currency: "USD", theme: "Light" });
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [activeView, setActiveView] = useState("menu");
    const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [passwordMsg, setPasswordMsg] = useState("");
    const [sendingVerification, setSendingVerification] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isUploadingID, setIsUploadingID] = useState(false);
    const [isUploadingSelfie, setIsUploadingSelfie] = useState(false);

    const navigate = useNavigate();
    const userId = Cookies.get("userId");

    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }

        const fetchUserProfile = async () => {
            console.log("🛠️ Starting profile fetch for ID:", userId);
            try {
                const res = await API.get(`/auth/user/${userId}`);
                console.log("✅ Profile data received:", res.data);
                setUserData(res.data);
                const langMap = { "English": "en", "Spanish": "en", "French": "en", "Hindi": "hi" };
                let dbLang = res.data.preferences?.language;
                if (dbLang && langMap[dbLang]) dbLang = langMap[dbLang];

                const currentLang = dbLang || Cookies.get("i18nextLng") || i18n.language || "en";
                const currentCurr = res.data.preferences?.currency || Cookies.get("currency") || currency || "USD";

                setEditData({
                    name: res.data.name || "",
                    phone: res.data.phone || "",
                    address: res.data.address || "",
                    language: currentLang,
                    currency: currentCurr,
                    theme: res.data.preferences?.theme || "Light"
                });
                Cookies.set("theme", res.data.preferences?.theme || "Light", { expires: 365 });
            } catch (err) {
                console.error("Failed to fetch user profile", err);
                setError("Unable to load profile data. Please try again later.");
            } finally {
                console.log("🏁 Profile fetch completed (isLoading set to false)");
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, [userId, navigate]);

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleLogout = () => {
        Cookies.remove("userId");
        navigate('/');
        window.location.reload();
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .trim()
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const payload = {
                ...editData,
                preferences: { language: editData.language, currency: editData.currency, theme: editData.theme }
            };
            const res = await API.put(`/auth/user/${userId}`, payload);
            setUserData(res.data.user);
            Cookies.set("theme", editData.theme, { expires: 365 });
            Cookies.set("currency", editData.currency, { expires: 365 });
            Cookies.set("i18nextLng", editData.language, { expires: 365 });

            setCurrency(editData.currency);
            i18n.changeLanguage(editData.language);
            toast.success("Preferences updated successfully!");

            if (editData.theme === "Dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }

            setIsEditing(false);
            if (activeView !== "menu") setActiveView("menu");
        } catch (err) {
            console.error("Failed to update profile", err);
            setError("Failed to update profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size should not exceed 5MB.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setIsUploadingImage(true);
        setError(null);

        try {
            const token = Cookies.get("token");
            const res = await API.post("/upload/profile", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            });
            const newImageUrl = res.data.url;

            const updateRes = await API.put(`/auth/user/${userId}`, {
                ...userData,
                profile_picture: newImageUrl
            });

            setUserData(updateRes.data.user);
        } catch (err) {
            console.error("Image upload failed", err);
            setError(err.response?.data?.detail || "Failed to upload image. Please try again.");
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setPasswordMsg("");
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMsg("New passwords do not match.");
            return;
        }
        setIsSaving(true);
        try {
            await API.put(`/auth/user/${userId}/password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setPasswordMsg("Password successfully updated!");
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setTimeout(() => setActiveView("menu"), 2000);
        } catch (err) {
            setPasswordMsg(err.response?.data?.detail || "Failed to update password.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleResendEmail = async () => {
        if (resendCooldown > 0) return;
        setSendingVerification(true);
        try {
            await API.post("/auth/resend-verification");
            toast.success("Verification email sent! Check your inbox.");
            setResendCooldown(30);
        } catch (err) {
            toast.error("Failed to resend verification email.");
        } finally {
            setSendingVerification(false);
        }
    };

    const handleIdentityUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError(`${type === "id_document" ? "ID" : "Selfie"} size should not exceed 5MB.`);
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        if (type === "id_document") setIsUploadingID(true);
        else setIsUploadingSelfie(true);

        setError(null);

        try {
            const token = Cookies.get("token");
            const res = await API.post("/upload/identity", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            });
            const fileUrl = res.data.url;

            // Update user profile with the new file URL
            const updateRes = await API.put(`/auth/user/${userId}`, {
                [type]: fileUrl
            });

            setUserData(updateRes.data.user);
        } catch (err) {
            console.error(`${type} upload failed`, err);
            setError(err.response?.data?.detail || `Failed to upload ${type === "id_document" ? "ID" : "selfie"}.`);
        } finally {
            if (type === "id_document") setIsUploadingID(false);
            else setIsUploadingSelfie(false);
        }
    };

    const renderContent = () => {
        switch (activeView) {
            case "personal-info":
                return (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full animate-fade-in transition-colors">
                        <div className="flex items-center mb-6">
                            <button onClick={() => setActiveView("menu")} className="mr-4 p-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-orange-50 dark:hover:bg-gray-600 hover:text-orange-600 dark:hover:text-white transition">
                                ← Back
                            </button>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Personal Info</h3>
                        </div>
                        <div className="space-y-5 flex-1">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-orange-500 outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                <input type="text" value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-orange-500 outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Mailing Address</label>
                                <textarea rows="3" value={editData.address} onChange={(e) => setEditData({ ...editData, address: e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-orange-500 outline-none transition" placeholder="Your full address..."></textarea>
                            </div>
                            <button onClick={handleSave} disabled={isSaving} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-md transition disabled:opacity-70 mt-4">
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                );
            case "security":
                return (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full animate-fade-in transition-colors">
                        <div className="flex items-center mb-6">
                            <button onClick={() => setActiveView("menu")} className="mr-4 p-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-orange-50 dark:hover:bg-gray-600 hover:text-orange-600 dark:hover:text-white transition">
                                ← Back
                            </button>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Login & Security</h3>
                        </div>
                        <form onSubmit={handlePasswordUpdate} className="space-y-5 flex-1">
                            {passwordMsg && <div className={`p-4 rounded-xl ${passwordMsg.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>{passwordMsg}</div>}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                                <input type="password" required value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-orange-500 outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                                <input type="password" required value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-orange-500 outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                                <input type="password" required value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-orange-500 outline-none transition" />
                            </div>
                            <button type="submit" disabled={isSaving} className="w-full bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-gray-900 font-bold py-4 rounded-xl shadow-md transition disabled:opacity-70 mt-4">
                                {isSaving ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    </div>
                );
            case "payments":
                return (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full animate-fade-in transition-colors">
                        <div className="flex items-center mb-6">
                            <button onClick={() => setActiveView("menu")} className="mr-4 p-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-orange-50 dark:hover:bg-gray-600 hover:text-orange-600 dark:hover:text-white transition">
                                ← Back
                            </button>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Payments & Payouts</h3>
                        </div>
                        <div className="flex-1 flex flex-col gap-4">
                            <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-600">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 p-2 rounded text-xs font-bold">VISA</div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">•••• 4242</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Expires 12/26</p>
                                    </div>
                                </div>
                                <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-3 py-1 rounded-full font-bold">Default</span>
                            </div>
                            <button className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-300 transition flex items-center justify-center gap-2">
                                <span>+</span> Add Payment Method
                            </button>
                        </div>
                    </div>
                );
            case "verification":
                const hasUploadedBoth = userData?.id_document && userData?.selfie_image;
                const isUnderReview = hasUploadedBoth && !userData?.is_verified;

                return (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full animate-fade-in transition-colors">
                        <div className="flex items-center mb-6">
                            <button onClick={() => setActiveView("menu")} className="mr-4 p-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-orange-50 dark:hover:bg-gray-600 hover:text-orange-600 dark:hover:text-white transition">
                                ← Back
                            </button>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Identity Verification</h3>
                        </div>

                        <div className="flex-1 space-y-8">
                            {userData?.is_verified ? (
                                <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-3xl border border-green-100 dark:border-green-800 text-center">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You're Verified!</h4>
                                    <p className="text-gray-600 dark:text-gray-400">Your identity has been confirmed. You now have full access to all features and a higher trust score.</p>
                                </div>
                            ) : isUnderReview ? (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-3xl border border-blue-100 dark:border-blue-800 text-center">
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Loader2 size={32} className="animate-spin" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verification Under Review</h4>
                                    <p className="text-gray-600 dark:text-gray-400">We've received your documents and are currently reviewing them. This usually takes 24-48 hours. We'll notify you once complete.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* ID Document */}
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-bold text-gray-900 dark:text-white">Government ID</h4>
                                                {userData?.id_document && <ShieldCheck size={20} className="text-green-500" />}
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Upload a clear photo of your passport, driver's license, or national ID.</p>

                                            <div className="relative">
                                                <label className={`w-full flex flex-col items-center justify-center gap-3 py-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${userData?.id_document ? 'border-green-200 bg-green-50/30' : 'border-gray-200 dark:border-gray-600 hover:border-orange-400'}`}>
                                                    {isUploadingID ? (
                                                        <Loader2 className="animate-spin text-orange-500" />
                                                    ) : userData?.id_document ? (
                                                        <>
                                                            <div className="w-12 h-12 bg-green-100 dark:bg-green-800 text-green-600 rounded-full flex items-center justify-center">
                                                                <FileCheck size={24} />
                                                            </div>
                                                            <p className="text-xs font-bold text-green-600">ID Uploaded</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-400">
                                                                <Camera size={24} />
                                                            </div>
                                                            <p className="text-xs font-bold text-gray-500">Tap to upload ID</p>
                                                        </>
                                                    )}
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleIdentityUpload(e, "id_document")} disabled={isUploadingID} />
                                                </label>
                                            </div>
                                        </div>

                                        {/* Selfie Image */}
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-bold text-gray-900 dark:text-white">Live Selfie</h4>
                                                {userData?.selfie_image && <ShieldCheck size={20} className="text-green-500" />}
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Take a clear photo of yourself to match against your government ID.</p>

                                            <div className="relative">
                                                <label className={`w-full flex flex-col items-center justify-center gap-3 py-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${userData?.selfie_image ? 'border-green-200 bg-green-50/30' : 'border-gray-200 dark:border-gray-600 hover:border-orange-400'}`}>
                                                    {isUploadingSelfie ? (
                                                        <Loader2 className="animate-spin text-orange-500" />
                                                    ) : userData?.selfie_image ? (
                                                        <>
                                                            <div className="w-12 h-12 bg-green-100 dark:bg-green-800 text-green-600 rounded-full flex items-center justify-center">
                                                                <UserCheck size={24} />
                                                            </div>
                                                            <p className="text-xs font-bold text-green-600">Selfie Uploaded</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-400">
                                                                <Camera size={24} />
                                                            </div>
                                                            <p className="text-xs font-bold text-gray-500">Tap to take selfie</p>
                                                        </>
                                                    )}
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleIdentityUpload(e, "selfie_image")} disabled={isUploadingSelfie} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-2xl border border-orange-100 dark:border-orange-800 flex gap-4">
                                        <div className="text-orange-600 dark:text-orange-400"><ShieldAlert size={20} /></div>
                                        <div className="text-xs text-orange-800 dark:text-orange-300 leading-relaxed font-medium">
                                            <p className="font-bold mb-1">Why verify your ID?</p>
                                            Identity verification helps build trust in the community. Verified users get priority support, higher trust scores (+40 points), and access to exclusive safety features like Travel Buddy matches.
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                );
            case "preferences":
                return (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full animate-fade-in transition-colors">
                        <div className="flex items-center mb-6">
                            <button onClick={() => setActiveView("menu")} className="mr-4 p-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-orange-50 dark:hover:bg-gray-600 hover:text-orange-600 dark:hover:text-white transition">
                                ← Back
                            </button>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Global Preferences</h3>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-orange-600">
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">Preferred Language</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Choose your language for the interface</p>
                                    </div>
                                </div>
                                <CustomDropdown
                                    options={languageOptions}
                                    selected={editData.language}
                                    onChange={(val) => setEditData({ ...editData, language: val })}
                                />
                            </div>

                            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-blue-600">
                                        <DollarSign size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">Preferred Currency</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">How you'll see prices across the platform</p>
                                    </div>
                                </div>
                                <CustomDropdown
                                    options={currencyOptions}
                                    selected={editData.currency}
                                    onChange={(val) => setEditData({ ...editData, currency: val })}
                                />
                            </div>

                            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-amber-500">
                                        {editData.theme === "Dark" ? <Moon size={20} /> : <Sun size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">Appearance</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Choose your visual style</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => setEditData({ ...editData, theme: "Light" })}
                                        className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-bold text-sm ${editData.theme === "Light" ? "border-orange-500 bg-orange-50 text-orange-600" : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500"}`}
                                    >
                                        <Sun size={18} /> Light
                                    </button>
                                    <button 
                                        onClick={() => setEditData({ ...editData, theme: "Dark" })}
                                        className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-bold text-sm ${editData.theme === "Dark" ? "border-orange-500 bg-orange-900/20 text-orange-400" : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500"}`}
                                    >
                                        <Moon size={18} /> Dark
                                    </button>
                                </div>
                            </div>

                            <button 
                                onClick={handleSave} 
                                disabled={isSaving} 
                                className="w-full bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-gray-900 font-bold py-4 rounded-xl shadow-md transition disabled:opacity-70 mt-4"
                            >
                                {isSaving ? <div className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} /> Saving...</div> : "Save Preferences"}
                            </button>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col h-full animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                            <div onClick={() => setActiveView("personal-info")} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group flex flex-col justify-center cursor-pointer">
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl w-max group-hover:bg-orange-50 dark:group-hover:bg-gray-600 group-hover:text-orange-600 dark:group-hover:text-white transition-colors mb-4">
                                    <User size={28} className="text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Personal info</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors">Provide personal details and how we can reach you</p>
                            </div>

                            <div onClick={() => setActiveView("security")} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group flex flex-col justify-center cursor-pointer">
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl w-max group-hover:bg-orange-50 dark:group-hover:bg-gray-600 group-hover:text-orange-600 dark:group-hover:text-white transition-colors mb-4">
                                    <ShieldCheck size={28} className="text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Login & security</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors">Update your password and secure your account</p>
                            </div>

                            <div onClick={() => setActiveView("payments")} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group flex flex-col justify-center cursor-pointer">
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl w-max group-hover:bg-orange-50 dark:group-hover:bg-gray-600 group-hover:text-orange-600 dark:group-hover:text-white transition-colors mb-4">
                                    <CreditCard size={28} className="text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Payments & payouts</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors">Review payments, payouts, coupons, and gift cards</p>
                            </div>

                            <div onClick={() => setActiveView("verification")} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group flex flex-col justify-center cursor-pointer">
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl w-max group-hover:bg-orange-50 dark:group-hover:bg-gray-600 group-hover:text-orange-600 dark:group-hover:text-white transition-colors mb-4">
                                    <Award size={28} className="text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Identity Verification</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors">Get verified to build trust and unlock advanced features</p>
                            </div>

                            <div onClick={() => setActiveView("preferences")} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group flex flex-col justify-center cursor-pointer">
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl w-max group-hover:bg-orange-50 dark:group-hover:bg-gray-600 group-hover:text-orange-600 dark:group-hover:text-white transition-colors mb-4">
                                    <Settings size={28} className="text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Global preferences</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors">Set your default language, currency, and timezone</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="mt-6 w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 font-bold px-8 py-4 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/40 hover:scale-[1.01] shadow-sm border border-red-100 dark:border-red-900 transition-all duration-300"
                        >
                            <LogOut size={20} /> Log out from TravelBNB
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 transition-colors duration-300 font-sans">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-colors">Account settings</h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 transition-colors">Manage your personal information, security and preferences</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading your profile...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-2xl flex items-center gap-4 shadow-sm">
                        <span className="text-3xl">⚠️</span>
                        <div>
                            <p className="font-bold text-lg">Error loading profile</p>
                            <p className="opacity-80">{error}</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Profile Card Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center relative overflow-hidden transition-colors">
                                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-orange-400 to-amber-600"></div>

                                <div className="relative mt-12 mb-6">
                                    <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-full p-2 shadow-xl transition-colors relative group">
                                        <div className="w-full h-full bg-gradient-to-br from-orange-600 to-amber-800 text-white rounded-full flex items-center justify-center font-bold text-5xl shadow-inner overflow-hidden relative">
                                            {isUploadingImage ? (
                                                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : userData?.profile_picture ? (
                                                <img src={userData.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                getInitials(userData?.name)
                                            )}
                                        </div>
                                        <label className="absolute inset-2 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                            <Camera size={24} />
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                                        </label>
                                    </div>
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="absolute bottom-2 right-2 p-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 rounded-full shadow-lg border border-gray-100 dark:border-gray-600 transition-all hover:scale-110"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                </div>

                                {isEditing ? (
                                    <div className="w-full space-y-3 mb-6">
                                        <input
                                            type="text"
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            className="w-full text-center text-xl font-bold border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                                            placeholder="Your Name"
                                        />
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-70"
                                        >
                                            {isSaving ? "Saving..." : "Save Changes"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditData({ name: userData.name || "", phone: userData.phone || "", address: userData.address || "", language: userData.preferences?.language || "English", currency: userData.preferences?.currency || "USD", theme: userData.preferences?.theme || "Light" });
                                            }}
                                            className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold py-2 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 transition-colors">{userData?.name || "Traveler"}</h2>
                                        <div className="flex flex-wrap justify-center gap-2 mb-6">
                                            {userData?.is_email_verified ? (
                                                <p className="px-3 py-1 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 border border-green-100 dark:border-green-900/50">
                                                    <ShieldCheck size={12} /> Email Verified
                                                </p>
                                            ) : userData?.auth_provider === 'email' ? (
                                                <button
                                                    onClick={handleResendEmail}
                                                    disabled={sendingVerification || resendCooldown > 0}
                                                    className="px-3 py-1 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 border border-orange-100 dark:border-orange-900/50 hover:bg-orange-100 transition-colors disabled:opacity-50"
                                                >
                                                    {sendingVerification ? <Loader2 size={12} className="animate-spin" /> : <ShieldAlert size={12} />}
                                                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Verify Email"}
                                                </button>
                                            ) : null}
                                            {userData?.is_verified && (
                                                <p className="px-3 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 border border-blue-100 dark:border-blue-900/50">
                                                    <Award size={12} /> ID Verified
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* Trust Score Bar */}
                                <div className="w-full mb-8">
                                    <div className="flex justify-between items-end mb-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Trust Score</p>
                                        <p className="text-xl font-black text-gray-900 dark:text-white">{userData?.trust_score || 0}<span className="text-gray-400 text-xs font-bold">/100</span></p>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-1000"
                                            style={{ width: `${userData?.trust_score || 0}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[9px] text-gray-400 mt-2 font-bold uppercase tracking-tighter">Increase score by verifying ID or hosting guests</p>
                                </div>

                                <div className="w-full border-t border-gray-100 dark:border-gray-700 pt-6 space-y-4 transition-colors">
                                    <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
                                        <div className="bg-orange-50 dark:bg-orange-900/30 p-2.5 rounded-xl text-orange-600 dark:text-orange-500"><Mail size={20} /></div>
                                        <div className="text-left overflow-hidden">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</p>
                                            <p className="font-medium text-gray-900 dark:text-white truncate transition-colors">{userData?.email || "No email provided"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
                                        <div className="bg-orange-50 dark:bg-orange-900/30 p-2.5 rounded-xl text-orange-600 dark:text-orange-500"><Phone size={20} /></div>
                                        <div className="text-left w-full">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</p>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editData.phone}
                                                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                                    className="w-full font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 mt-1 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                                                    placeholder="Phone number"
                                                />
                                            ) : (
                                                <p className="font-medium text-gray-900 dark:text-white transition-colors">{userData?.phone || "Add a number"}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
                                        <div className="bg-orange-50 dark:bg-orange-900/30 p-2.5 rounded-xl text-orange-600 dark:text-orange-500"><Calendar size={20} /></div>
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</p>
                                            <p className="font-medium text-gray-900 dark:text-white transition-colors">{userData?.createdAt ? new Date(userData.createdAt).getFullYear() : "2024"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Right Side Content */}
                        <div className="lg:col-span-2">
                            {renderContent()}
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;
