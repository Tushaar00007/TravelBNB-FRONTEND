import React, { useState, useEffect } from "react";
import { X, Check, XCircle, MapPin, Users, ShieldCheck, Clock, CheckCircle2, Loader2, User, Globe, Heart, Info, Coffee, Moon } from "lucide-react";
import Cookies from "js-cookie";
import API from "../../../services/api";
import { toast } from "react-hot-toast";

const STATUS_COLORS = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
    approved: "bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    rejected: "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
};

export default function CrashpadDetailsModal({ padId, onClose, onUpdate }) {
    const [pad, setPad] = useState(null);
    const [host, setHost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const token = Cookies.get("token");

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await API.get(`/crashpads/${padId}`);
            setPad(res.data);
            
            // Try to fetch host details if host_id exists
            if (res.data.host_id) {
                try {
                    const hostRes = await API.get(`/users/${res.data.host_id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setHost(hostRes.data);
                } catch (e) {
                    console.error("Failed to fetch host details");
                }
            }
        } catch (err) {
            toast.error("Failed to load crashpad details");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (padId) fetchData();
    }, [padId]);

    const handleModerate = async (action) => {
        const confirmMsg = action === 'approve' 
            ? "Approve this community crashpad?" 
            : "Reject this community crashpad?";
        if (!window.confirm(confirmMsg)) return;

        setActionLoading(action);
        try {
            await API.post(`/admin/crashpads/${padId}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Crashpad ${action}d successfully`);
            fetchData();
            onUpdate();
        } catch (err) {
            toast.error(err.response?.data?.detail || `Failed to ${action}`);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-gray-950 w-full max-w-4xl h-[80vh] rounded-3xl flex items-center justify-center">
                    <Loader2 className="animate-spin text-pink-500" size={40} />
                </div>
            </div>
        );
    }

    const {
        title, description, stay_type, location,
        host_bio, interests = [], languages = [],
        max_guests, max_nights, house_rules,
        preferences, is_free, price_per_night, status = "pending"
    } = pad;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-950 w-full max-w-5xl h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative animate-scale-up">
                
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-all active:scale-95"
                >
                    <X size={20} />
                </button>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Header Section */}
                    <div className="p-8 lg:p-12 border-b border-gray-100 dark:border-gray-900 bg-gradient-to-br from-pink-50/30 to-transparent dark:from-pink-900/5">
                        <div className="flex flex-wrap items-start justify-between gap-6">
                            <div className="space-y-4 max-w-2xl">
                                <div className="flex items-center gap-3">
                                    <span className="bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
                                        Community Stay
                                    </span>
                                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_COLORS[status]}`}>
                                        {status}
                                    </span>
                                </div>
                                <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none">{title}</h2>
                                <p className="flex items-center gap-2 text-gray-500 font-bold">
                                    <MapPin size={18} className="text-pink-500" />
                                    {location.address_line}, {location.city}, {location.state} {location.pincode}
                                </p>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-pink-500/5 min-w-[200px]">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pricing Model</p>
                                <p className="text-3xl font-black text-gray-900 dark:text-white">
                                    {is_free ? "FREE" : `₹${price_per_night}`}
                                    {!is_free && <span className="text-xs font-bold text-gray-500 ml-1">/ night</span>}
                                </p>
                                <p className="text-[10px] text-pink-500 font-black uppercase mt-2">Verified community host</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { icon: Users, label: `${max_guests} Guests Max`, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/10" },
                                    { icon: Moon, label: `${max_nights} Nights Max`, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/10" },
                                    { icon: Coffee, label: stay_type, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-900/10" },
                                    { icon: Globe, label: languages[0] || "English", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/10" },
                                ].map((item, i) => (
                                    <div key={i} className={`flex flex-col items-center p-5 ${item.bg} rounded-3xl border border-transparent hover:border-gray-100 dark:hover:border-gray-800 transition-all`}>
                                        <item.icon size={22} className={`${item.color} mb-3`} />
                                        <span className="text-[11px] font-black text-gray-800 dark:text-gray-200 text-center uppercase tracking-tighter">{item.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Description */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                                    <Info size={18} className="text-pink-500" /> Description
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium whitespace-pre-wrap">{description}</p>
                            </div>

                            {/* Host details */}
                            <div className="space-y-6 pt-10 border-t border-gray-50 dark:border-gray-900">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">The Host</h3>
                                <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-8">
                                    <div className="w-24 h-24 rounded-3xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center shrink-0">
                                        {host?.profile_image ? (
                                            <img src={host.profile_image} className="w-full h-full object-cover rounded-3xl" alt="Host" />
                                        ) : (
                                            <User size={40} className="text-pink-500" />
                                        )}
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        <div>
                                            <h4 className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-1">{host?.name || "Community Host"}</h4>
                                            <p className="text-sm text-gray-400 font-bold italic">User ID: ...{pad.host_id?.slice(-8)}</p>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 font-medium italic">"{host_bio || "No host bio provided."}"</p>
                                        
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {interests.map(interest => (
                                                <span key={interest} className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-xl text-[10px] font-black text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-1.5 uppercase">
                                                    <Heart size={10} className="text-rose-500 fill-rose-500" /> {interest}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Rules & Prefs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-gray-50 dark:border-gray-900">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-rose-500" /> House Rules
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-pre-wrap">{house_rules || "No specific rules provided."}</p>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-emerald-500" /> Preferences
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-pre-wrap">{preferences || "No host preferences listed."}</p>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar: Admin Controls */}
                        <div className="space-y-6">
                            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 sticky top-8 space-y-8">
                                <div className="text-center">
                                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-3">Moderation Actions</p>
                                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-8">
                                        <div className={`h-full transition-all duration-700 ${status === 'approved' ? 'w-full bg-emerald-500' : status === 'rejected' ? 'w-full bg-rose-500' : 'w-1/2 bg-amber-500'}`} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => handleModerate("approve")}
                                        disabled={actionLoading || status === 'approved'}
                                        className="w-full flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                                    >
                                        {actionLoading === 'approve' ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={22} />}
                                        {status === 'approved' ? "ALREADY APPROVED" : "APPROVE CRASHPAD"}
                                    </button>

                                    <button
                                        onClick={() => handleModerate("reject")}
                                        disabled={actionLoading || status === 'rejected'}
                                        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-rose-300 dark:hover:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-900/10 text-gray-700 dark:text-gray-300 hover:text-rose-600 transition-all py-4 rounded-2xl font-black text-sm active:scale-95"
                                    >
                                        {actionLoading === 'reject' ? <Loader2 className="animate-spin" /> : <XCircle size={20} />}
                                        REJECT LISTING
                                    </button>
                                </div>

                                <div className="pt-8 border-t border-gray-200 dark:border-gray-800 space-y-4">
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <Clock size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Last Updated: {new Date(pad.updated_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold italic leading-relaxed">
                                        Approving this crashpad will make it instantly visible to all users looking for stays in {location.city}.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
