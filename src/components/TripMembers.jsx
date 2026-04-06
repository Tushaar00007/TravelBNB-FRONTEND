import React, { useState } from "react";
import API from "../services/api";
import { toast } from "react-hot-toast";
import { UserPlus, Trash2, Crown, Loader2 } from "lucide-react";

function Avatar({ member, size = "md" }) {
    const s = size === "md" ? "w-12 h-12 text-base" : "w-8 h-8 text-xs";
    return (
        <div className={`${s} rounded-full bg-orange-100 border-2 border-white dark:border-gray-900 overflow-hidden flex items-center justify-center font-bold text-orange-600 shrink-0`}>
            {member.profile_image
                ? <img src={member.profile_image} alt={member.name} className="w-full h-full object-cover" />
                : (member.name?.[0] || "?")}
        </div>
    );
}

export default function TripMembers({ trip, currentUserId, onRefresh }) {
    const [inviteEmail, setInviteEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const isOwner = trip.owner_id === currentUserId;

    const handleInvite = async (e) => {
        e.preventDefault();
        setError("");
        if (!inviteEmail.trim()) return;
        setLoading(true);
        try {
            // Find user by email using our NEW search endpoint
            const userRes = await API.get(`/users/search?email=${encodeURIComponent(inviteEmail.trim())}`);
            const user = userRes.data;
            if (!user || (!user.id && !user._id)) throw new Error("User not found with that email");

            const userIdToAdd = user.id || user._id;
            await API.post(`/trips/${trip._id}/add-member`, { user_id: userIdToAdd });
            setInviteEmail("");
            onRefresh();
            toast.success("Member added!");
        } catch (err) {
            setError(err.response?.data?.detail || err.message || "Could not add member");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (memberId) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <p className="font-bold text-gray-900 dark:text-white text-sm">Remove member from trip?</p>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await doRemove(memberId);
                        }}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                        Remove
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const doRemove = async (memberId) => {
        const loadingToast = toast.loading("Removing member...");
        try {
            await API.delete(`/trips/${trip._id}/remove-member`, { data: { user_id: memberId } });
            toast.success("Member removed", { id: loadingToast });
            onRefresh();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to remove member", { id: loadingToast });
        }
    };

    return (
        <div className="space-y-6">
            {/* Member list */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800 overflow-hidden shadow-sm">
                {(trip.member_details || []).map((m) => (
                    <div key={m._id} className="flex items-center gap-3 p-4">
                        <Avatar member={m} />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{m.name}</p>
                                {m._id === trip.owner_id && (
                                    <span className="flex items-center gap-0.5 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-semibold">
                                        <Crown className="w-3 h-3" /> Owner
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 truncate">{m.email}</p>
                        </div>
                        {isOwner && m._id !== trip.owner_id && m._id !== currentUserId && (
                            <button
                                onClick={() => handleRemove(m._id)}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Invite */}
            {isOwner && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-orange-500" /> Invite co-traveller
                    </h3>
                    <p className="text-xs text-gray-400 mb-4">Enter the email of a registered TravelBNB user</p>
                    <form onSubmit={handleInvite} className="flex gap-2">
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="Email address..."
                            className="flex-1 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2 transition-colors"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                            Invite
                        </button>
                    </form>
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                </div>
            )}
        </div>
    );
}
