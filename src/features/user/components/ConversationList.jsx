//Conversationlist.jsx
import { useState, useEffect, useRef } from "react";
import { BiSearch, BiX } from "react-icons/bi";
import Cookies from "js-cookie";
import API from "../../../services/api";

function ConversationList({ userId, activeConv, conversations = [], setConversations, onSelect, isOpen, onClose }) {
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const pollingRef = useRef(null);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                // Explicitly use userId from cookie to ensure ID format consistency
                const rawUserId = Cookies.get("userId");
                const currentUserId = rawUserId ? String(rawUserId).replace(/\s/g, "") : null;
                if (!currentUserId) {
                    console.warn("No userId in cookie, stopping conversation fetch");
                    setLoading(false);
                    return;
                }

                console.log("DEBUG: Fetching conversations for userId:", currentUserId);
                const res = await API.get(`/messages/conversations/${currentUserId}`);

                const apiConvs = Array.isArray(res.data) ? res.data : [];
                setConversations(apiConvs);
            } catch (err) {
                console.error("Failed to fetch conversations:", err);
                if (err.response?.status === 404) {
                    if (pollingRef.current) clearInterval(pollingRef.current);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
        pollingRef.current = setInterval(fetchConversations, 5000);
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    const filtered = conversations.filter(
        (c) =>
            (c.otherUser?.name || c.other_user_name)?.toLowerCase().includes(search.toLowerCase()) ||
            (c.property_name || c.propertyName)?.toLowerCase().includes(search.toLowerCase())
    );

    const getInitials = (name) =>
        name?.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

    const formatMessageTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return formatMessageTime(dateStr);
        if (days === 1) return 'Yesterday';
        if (days < 7) return date.toLocaleDateString('en-IN', { weekday: 'short' });
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const isActive = (conv) =>
        activeConv &&
        activeConv.other_user_id === conv.other_user_id;

    return (
        <div
            className={`
        fixed inset-y-0 left-0 z-40 w-full md:relative md:w-full
        bg-white border-r border-gray-200 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        top-[96px] md:top-0
        h-[calc(100vh-96px)] md:h-full
      `}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                <button onClick={onClose} className="md:hidden text-2xl text-gray-500 hover:text-red-500">
                    <BiX />
                </button>
            </div>

            {/* Search */}
            <div className="px-4 pb-3 pt-3 bg-gray-50 border-b border-gray-100">
                <div className="relative">
                    <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white transition-colors"
                    />
                </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex flex-col gap-3 p-4 animate-pulse">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-3">
                                <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0" />
                                <div className="flex-1 space-y-2 pt-1">
                                    <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                                    <div className="h-3 bg-gray-100 rounded w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        No conversations yet.
                    </div>
                ) : (
                    filtered.map((conv) => (
                        <div
                            key={`${conv.other_user_id}`}
                            onClick={() => { onSelect(conv); onClose(); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '14px 16px', cursor: 'pointer',
                                backgroundColor: isActive(conv) ? '#FFF7ED' : 'white',
                                borderLeft: `3px solid ${isActive(conv) ? '#EA580C' : 'transparent'}`,
                                borderBottom: '1px solid #F9FAFB',
                                transition: 'all 0.15s',
                                position: 'relative',
                            }}
                            onMouseEnter={e => !isActive(conv) && (e.currentTarget.style.backgroundColor = '#FAFAFA')}
                            onMouseLeave={e => !isActive(conv) && (e.currentTarget.style.backgroundColor = 'white')}
                        >
                            {/* Avatar */}
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <div style={{
                                    width: '46px', height: '46px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #EA580C, #F97316)',
                                    color: 'white', fontWeight: '800', fontSize: '18px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {(conv.otherUser?.profile_image || conv.otherUser?.avatar || conv.other_user_avatar)
                                        ? <img src={conv.otherUser?.profile_image || conv.otherUser?.avatar || conv.other_user_avatar}
                                            style={{
                                                width: '100%', height: '100%',
                                                borderRadius: '50%', objectFit: 'cover'
                                            }}
                                            onError={e => e.target.style.display = 'none'}
                                        />
                                        : (conv.otherUser?.name || conv.other_user_name || 'U')[0]?.toUpperCase()
                                    }
                                </div>
                                {/* Online dot */}
                                <div style={{
                                    position: 'absolute', bottom: 1, right: 1,
                                    width: '12px', height: '12px', borderRadius: '50%',
                                    backgroundColor: '#22C55E',
                                    border: '2px solid white',
                                }} />
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'center', marginBottom: '2px'
                                }}>
                                    <p style={{
                                        fontWeight: '700', fontSize: '14px',
                                        color: '#111827', margin: 0
                                    }}>
                                        {conv.otherUser?.name || conv.other_user_name || 'Unknown User'}
                                    </p>
                                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                                        {formatTime(conv.last_message_time)}
                                    </span>
                                </div>
                                {conv.property_name && (
                                    <p style={{
                                        fontSize: '11px', color: '#EA580C',
                                        fontWeight: '600', margin: '0 0 2px'
                                    }}>
                                        {conv.property_name}
                                    </p>
                                )}
                                <p style={{
                                    fontSize: '12px', color: '#9CA3AF', margin: 0,
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                    {conv.lastMessage || conv.last_message || 'No messages yet'}
                                </p>
                            </div>

                            {/* Unread badge */}
                            {conv.unread_count > 0 && (
                                <span style={{
                                    backgroundColor: '#EA580C', color: 'white',
                                    borderRadius: '999px', padding: '2px 7px',
                                    fontSize: '11px', fontWeight: '800', flexShrink: 0,
                                }}>
                                    {conv.unread_count}
                                </span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ConversationList;
