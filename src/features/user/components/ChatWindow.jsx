import React, { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { 
  BiSend, BiTrash, BiCheck, BiX, BiCheckCircle, 
  BiDotsVerticalRounded, BiSmile, BiMenu, BiUser, BiArrowBack, BiReply, BiGlobe 
} from 'react-icons/bi';
import API from "../../../services/api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import GuestProfileModal from "./GuestProfileModal";
import EmojiPicker from "emoji-picker-react";

const QUICK_EMOJIS = ['❤️', '😂', '👍', '🙏', '🔥', '✅'];

const SARVAM_LANGUAGES = [
    { code: 'en-IN', label: 'English', flag: '🇬🇧' },
    { code: 'hi-IN', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ta-IN', label: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te-IN', label: 'తెలుగు', flag: '🇮🇳' },
    { code: 'kn-IN', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ml-IN', label: 'മലയാളം', flag: '🇮🇳' },
    { code: 'mr-IN', label: 'मराठी', flag: '🇮🇳' },
    { code: 'bn-IN', label: 'বাংলা', flag: '🇮🇳' },
    { code: 'gu-IN', label: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'pa-IN', label: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'od-IN', label: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
];

function ChatWindow({ conv: conversation, currentUserId: propUserId, onToggleSidebar, onClose: onSelectClose }) {
    // Get correct currentUserId and isHost status
    const rawCurrentUserId = propUserId || Cookies.get('userId') 
        || JSON.parse(localStorage.getItem('user') || '{}')?.id 
        || JSON.parse(localStorage.getItem('user') || '{}')?._id;
    const currentUserId = rawCurrentUserId ? String(rawCurrentUserId).replace(/\s/g, "") : null;

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isHost = storedUser?.is_host === true 
        || storedUser?.role === 'host'
        || storedUser?.role === 'super_admin'
        || conversation?.is_host === true;

    const [messages, setMessages] = React.useState([]);
    const [newMessage, setNewMessage] = React.useState("");
    const [sending, setSending] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [hoveredMessage, setHoveredMessage] = React.useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
    const [showGuestProfile, setShowGuestProfile] = React.useState(null);
    const [replyTo, setReplyTo] = React.useState(null);

    const [targetLanguage, setTargetLanguage] = React.useState(() => {
        return localStorage.getItem(`chatLang_${conversation?.other_user_id}`) || 'en-IN';
    });
    const [showLangDropdown, setShowLangDropdown] = React.useState(false);
    const [translatingIds, setTranslatingIds] = React.useState(new Set());
    const [showTranslated, setShowTranslated] = React.useState(new Set()); // message IDs with translation visible

    React.useEffect(() => {
        if (conversation?.other_user_id) {
            localStorage.setItem(`chatLang_${conversation.other_user_id}`, targetLanguage);
        }
    }, [targetLanguage, conversation?.other_user_id]);

    React.useEffect(() => {
        if (!showLangDropdown) return;
        const handleClickOutside = (e) => {
            if (!e.target.closest('[data-lang-dropdown]')) {
                // Will need to wrap dropdown root with data attribute
            }
        };
        // Simpler: close on any document click
        const t = setTimeout(() => {
            document.addEventListener('click', () => setShowLangDropdown(false), { once: true });
        }, 0);
        return () => clearTimeout(t);
    }, [showLangDropdown]);

    const handleTranslateMessage = async (messageId) => {
        // If already translated to current target language, just toggle visibility
        const msg = messages.find(m => (m.id || m._id) === messageId);
        if (msg?.translations?.[targetLanguage]) {
            setShowTranslated(prev => {
                const next = new Set(prev);
                if (next.has(messageId)) next.delete(messageId);
                else next.add(messageId);
                return next;
            });
            return;
        }

        // Otherwise hit the API
        setTranslatingIds(prev => new Set(prev).add(messageId));
        try {
            const res = await API.post(`/messages/${messageId}/translate`, {
                targetLanguage: targetLanguage,
            });
            const translatedText = res.data.translated;

            // Update message in local state with new translation
            setMessages(prev => prev.map(m => {
                if ((m.id || m._id) === messageId) {
                    return {
                        ...m,
                        translations: {
                            ...(m.translations || {}),
                            [targetLanguage]: translatedText,
                        },
                    };
                }
                return m;
            }));

            // Show it
            setShowTranslated(prev => new Set(prev).add(messageId));
        } catch (err) {
            console.error('Translation failed:', err);
            toast.error('Translation failed');
        } finally {
            setTranslatingIds(prev => {
                const next = new Set(prev);
                next.delete(messageId);
                return next;
            });
        }
    };
    
    const messagesEndRef = React.useRef(null);
    const pollRef = React.useRef(null);
    const navigate = useNavigate();

    console.log('ChatWindow Profile:', { isHost, currentUserId, convIsHost: conversation?.is_host });

    // ── Helpers ─────────────────────────────────────────────────────
    const formatMessageTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    const formatDate = (iso) => {
        if (!iso) return "";
        const date = new Date(iso);
        if (isNaN(date.getTime())) return "Invalid Date";
        return date.toLocaleDateString("en-IN", { 
            weekday: "long", day: "numeric", month: "short" 
        });
    };

    // ── Fetch messages ──────────────────────────────────────────────
    const fetchMessages = async () => {
        if (!conversation || !(conversation.otherUser?._id || conversation.other_user_id)) return;
        try {
            const rawOtherId = conversation.otherUser?._id || conversation.other_user_id;
            const otherId = rawOtherId ? String(rawOtherId).replace(/\s/g, "") : null;
            
            if (!otherId || !currentUserId) {
                setLoading(false);
                return;
            }
            const res = await API.get(`/messages/${currentUserId}/${otherId}`);
            setMessages(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        const otherId = conversation?.otherUser?._id || conversation?.other_user_id;
        if (!conversation || !otherId) return;
        setLoading(true);
        fetchMessages();
        pollRef.current = setInterval(fetchMessages, 5000);
        return () => clearInterval(pollRef.current);
    }, [conversation?.otherUser?._id || conversation?.other_user_id]);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    // ── Handlers ────────────────────────────────────────────────────
    const handleSend = async () => {
        if (!newMessage.trim() || !conversation) return;
        
        setSending(true);
        const msgText = newMessage;
        setNewMessage("");
        
        try {
            const rawOtherId = conversation.otherUser?._id || conversation.other_user_id;
            const otherId = rawOtherId ? String(rawOtherId).replace(/\s/g, "") : null;

            await API.post("/messages/send", {
                sender_id: currentUserId,
                recipient_id: otherId,
                property_id: conversation.property_id,
                message: msgText,
                booking_request_id: conversation.booking_request_id,
                property_name: conversation.property_name || conversation.propertyName,
                reply_to: replyTo?._id || replyTo?.id || null,
            });
            setReplyTo(null);
            fetchMessages();
        } catch (err) {
            toast.error("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await API.delete(`/messages/${messageId}`);
            setMessages(prev => prev.filter(m => (m.id || m._id) !== messageId));
            toast.success('Message deleted');
        } catch (err) {
            toast.error('Failed to delete message');
        }
    };

    const handleReactToMessage = async (messageId, emoji) => {
        try {
            await API.post(`/messages/${messageId}/react`, { emoji, user_id: currentUserId });
            fetchMessages();
        } catch (err) {
            console.error('React error:', err);
        }
    };

    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (showEmojiPicker && !e.target.closest(".emoji-container") && !e.target.closest(".emoji-btn")) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [showEmojiPicker]);

    const extractAmountFromMessage = (text) => {
        if (!text) return 0;
        const match = text.match(/Total:\s*₹?([\d,]+)/);
        return match ? parseInt(match[1].replace(/,/g, '')) : 0;
    };

    const handlePayNow = (msg) => {
        console.log('=== PAY NOW CLICKED ===');
        console.log('Clicked message:', msg);
        console.log('Booking request ID:', msg.booking_request_id);
        console.log('Total messages in chat:', messages.length);
        
        // Log all messages to see what we have
        messages.forEach((m, i) => {
            console.log(`Message ${i}:`, m.message?.substring(0, 100));
        });

        // SEARCH ALL MESSAGES for the one containing date information
        // The original booking request contains "from ... to ... for X guest"
        let requestMsgText = '';
        let foundMessage = null;
        
        for (const m of messages) {
            const text = m.message || '';
            // Check if this message contains the booking details pattern
            if (text.includes('from') && text.includes('to') && text.includes('guest')) {
                requestMsgText = text;
                foundMessage = m;
                console.log('✅ FOUND booking request message:', text);
                break;
            }
        }
        
        // If still not found, try a more relaxed search
        if (!requestMsgText) {
            for (const m of messages) {
                const text = m.message || '';
                if (text.includes('Apr') && text.includes('guest')) {
                    requestMsgText = text;
                    foundMessage = m;
                    console.log('✅ FOUND booking request message (relaxed):', text);
                    break;
                }
            }
        }

        if (!requestMsgText) {
            console.log('❌ Could not find booking request message with dates');
            console.log('All messages:', messages.map(m => m.message));
        }
        
        // Extract dates using regex
        // Pattern matches: "from Apr 9 to Apr 11"
        const dateRegex = /from\s+([A-Za-z]+\s+\d{1,2})\s+to\s+([A-Za-z]+\s+\d{1,2})/i;
        const dateMatch = requestMsgText.match(dateRegex);
        
        console.log('Date regex result:', dateMatch);
        
        // Extract guest count: "for 1 guest(s)"
        const guestRegex = /for\s+(\d+)\s+guest/i;
        const guestMatch = requestMsgText.match(guestRegex);
        
        console.log('Guest regex result:', guestMatch);
        
        // Extract amount: "Total: ₹15,340"
        const amountRegex = /Total:\s*₹?([\d,]+)/i;
        const amountMatch = requestMsgText.match(amountRegex);
        
        console.log('Amount regex result:', amountMatch);

        // Build final values with fallbacks
        const checkIn = dateMatch ? dateMatch[1].trim() : null;
        const checkOut = dateMatch ? dateMatch[2].trim() : null;
        const guests = guestMatch ? parseInt(guestMatch[1]) : 1;
        const amount = amountMatch 
            ? parseInt(amountMatch[1].replace(/,/g, '')) 
            : (msg.total_price || msg.totalPrice || foundMessage?.total_price || 15340);

        const paymentData = {
            bookingRequestId: msg.booking_request_id,
            amount: amount,
            propertyName: conversation.property_name || 'Property',
            propertyImage: conversation.property_image || null,
            propertyId: conversation.property_id,
            hostName: conversation.other_user_name || 'Host',
            hostId: conversation.other_user_id,
            checkIn: checkIn,
            checkOut: checkOut,
            guests: guests
        };

        console.log('=== FINAL PAYMENT DATA ===');
        console.log('checkIn:', paymentData.checkIn);
        console.log('checkOut:', paymentData.checkOut);  
        console.log('guests:', paymentData.guests);
        console.log('amount:', paymentData.amount);

        navigate('/checkout', { state: paymentData });
    };

    const handleDeleteConversation = async () => {
        if (!window.confirm('Delete this entire conversation? This cannot be undone.')) return;
        try {
            await API.delete(`/messages/conversation/${currentUserId}/${conversation.other_user_id}`);
            toast.success('Conversation deleted');
            onSelectClose && onSelectClose();
        } catch (err) {
            toast.error('Failed to delete conversation');
        }
    };

    const handleApproveBooking = async (bookingRequestId, totalPrice) => {
        try {
            console.log('Approving booking:', bookingRequestId);
            await API.patch(`/bookings/${bookingRequestId}/approve`);
            
            await API.post('/messages/send', {
                sender_id: currentUserId,
                recipient_id: conversation.other_user_id,
                message: '🎉 Great news! Your booking request has been APPROVED! You can now complete the payment to confirm your stay.',
                booking_request_id: bookingRequestId,
                booking_status: 'approved',
                total_price: totalPrice,
            });
            
            // Update message status locally
            setMessages(prev => prev.map(m => 
                m.booking_request_id === bookingRequestId
                    ? { ...m, booking_status: 'approved' }
                    : m
            ));
            
            toast.success('Booking approved! Guest has been notified.');
            fetchMessages(); 
        } catch (err) {
            console.error('Approve error:', err.response?.data || err);
            toast.error('Failed to approve booking');
        }
    };

    const handleDeclineBooking = async (bookingRequestId) => {
        try {
            console.log('Declining booking:', bookingRequestId);
            await API.patch(`/bookings/${bookingRequestId}/decline`);
            
            await API.post('/messages/send', {
                sender_id: currentUserId,
                recipient_id: conversation.other_user_id,
                message: 'Thank you for your interest. Unfortunately I am unable to accommodate your request for these dates. Please feel free to check other available dates!',
                booking_request_id: bookingRequestId,
                booking_status: 'rejected',
            });
            
            setMessages(prev => prev.map(m =>
                m.booking_request_id === bookingRequestId
                    ? { ...m, booking_status: 'rejected' }
                    : m
            ));
            
            toast.success('Booking declined. Guest has been notified.');
            fetchMessages();
        } catch (err) {
            console.error('Decline error:', err.response?.data || err);
            toast.error('Failed to decline booking');
        }
    };

    if (!conversation) {
        return (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', gap: '16px', backgroundColor: '#FAFAFA' }}>
                <span style={{ fontSize: '48px' }}>💬</span>
                <p style={{ fontWeight: '700', fontSize: '18px', color: '#374151' }}>Your Messages</p>
                <p style={{ fontSize: '14px' }}>Select a conversation to start chatting</p>
                <button onClick={onToggleSidebar} className="md:hidden mt-4 bg-orange-500 text-white px-6 py-2 rounded-full shadow-lg text-sm font-semibold hover:bg-orange-600 transition-all">View Chats</button>
            </div>
        );
    }

    const grouped = (messages || []).reduce((acc, msg) => {
        if (!msg) return acc;
        const date = formatDate(msg.created_at || msg.createdAt);
        if (!acc[date]) acc[date] = [];
        acc[date].push(msg);
        return acc;
    }, {});

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden', backgroundColor: 'white' }}>
            {/* Chat Header */}
            <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid #F3F4F6',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'white', flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={onToggleSidebar} className="md:hidden text-gray-600 mr-2"><BiMenu size={24}/></button>
                    {/* Avatar */}
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #EA580C, #F97316)',
                        color: 'white', fontWeight: '800', fontSize: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {(conversation?.otherUser?.profile_image || conversation?.otherUser?.avatar || conversation?.other_user_avatar)
                            ? <img src={conversation?.otherUser?.profile_image || conversation?.otherUser?.avatar || conversation?.other_user_avatar}
                                style={{ width: '100%', height: '100%', borderRadius: '50%',
                                  objectFit: 'cover' }} />
                            : (conversation?.otherUser?.name || conversation?.other_user_name || 'U')[0]?.toUpperCase()
                        }
                    </div>
                    <div>
                        <p style={{ fontWeight: '700', fontSize: '15px',
                            color: '#111827', margin: 0 }}>
                            {conversation?.otherUser?.name || conversation?.other_user_name || 'Unknown User'}
                        </p>
                        {(conversation?.propertyName || conversation?.property_name) && (
                            <p style={{ fontSize: '12px', color: '#EA580C',
                                fontWeight: '600', margin: 0 }}>
                                {conversation.propertyName || conversation.property_name}
                            </p>
                        )}
                    </div>
                </div>

                {/* Header actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Language dropdown */}
                    <div style={{ position: 'relative' }} data-lang-dropdown>
                        <button
                            onClick={() => setShowLangDropdown(!showLangDropdown)}
                            title="Translate messages"
                            style={{
                                height: '36px', padding: '0 12px', borderRadius: '10px',
                                border: '1px solid #E5E7EB', backgroundColor: 'white',
                                color: '#374151', cursor: 'pointer', fontWeight: '600', fontSize: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            }}
                        >
                            <BiGlobe size={16} color="#EA580C" />
                            {SARVAM_LANGUAGES.find(l => l.code === targetLanguage)?.label || 'English'}
                        </button>
                        {showLangDropdown && (
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                                backgroundColor: 'white', borderRadius: '12px',
                                border: '1px solid #E5E7EB', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                zIndex: 100, minWidth: '180px', overflow: 'hidden', padding: '6px',
                                maxHeight: '320px', overflowY: 'auto',
                            }}>
                                {SARVAM_LANGUAGES.map(lang => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setTargetLanguage(lang.code);
                                            setShowLangDropdown(false);
                                        }}
                                        style={{
                                            width: '100%', padding: '9px 12px',
                                            borderRadius: '8px', border: 'none',
                                            backgroundColor: targetLanguage === lang.code ? '#FFF7ED' : 'transparent',
                                            color: targetLanguage === lang.code ? '#EA580C' : '#374151',
                                            fontWeight: targetLanguage === lang.code ? '700' : '500',
                                            fontSize: '13px', cursor: 'pointer',
                                            textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px',
                                        }}
                                    >
                                        <span>{lang.flag}</span> {lang.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleDeleteConversation}
                        title="Delete conversation"
                        style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            border: '1px solid #FEE2E2', backgroundColor: '#FEF2F2',
                            color: '#DC2626', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <BiTrash size={20} />
                    </button>
                    <button onClick={onSelectClose} className="text-gray-400 hover:text-gray-600">
                        <BiX size={24} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#FAFAFA' }}>
                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm italic">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    Object.entries(grouped).map(([date, msgs]) => (
                        <div key={date} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ textAlign: 'center', margin: '20px 0' }}>
                                <span style={{ fontSize: '12px', color: '#9CA3AF', backgroundColor: '#F3F4F6', padding: '4px 12px', borderRadius: '999px' }}>{date}</span>
                            </div>

                            {msgs && msgs.filter(m => m && (m.id || m._id)).map((msg) => {
                                const msgId = msg.id || msg._id;
                                const isSentByMe = String(msg.sender_id) === String(currentUserId);
                                
                                const hasBookingRequest = msg.booking_request_id 
                                    && msg.booking_request_id !== 'null'
                                    && msg.booking_request_id !== '';

                                return (
                                    <div key={msgId} style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: isSentByMe ? 'flex-end' : 'flex-start',
                                                marginBottom: '4px',
                                                position: 'relative',
                                            }}
                                            onMouseEnter={() => setHoveredMessage(msgId)}
                                            onMouseLeave={() => setHoveredMessage(null)}
                                        >
                                            {/* Message actions (show on hover) */}
                                            {hoveredMessage === msgId && (
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', gap: '4px',
                                                    marginRight: isSentByMe ? '8px' : 0,
                                                    marginLeft: !isSentByMe ? '8px' : 0,
                                                    order: isSentByMe ? -1 : 1,
                                                }}>
                                                    {/* Reply button */}
                                                    <button
                                                        onClick={() => setReplyTo(msg)}
                                                        style={{
                                                            width: '28px', height: '28px', borderRadius: '50%',
                                                            border: '1px solid #E5E7EB', backgroundColor: 'white',
                                                            cursor: 'pointer', color: '#EA580C',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                                                        }}
                                                        title="Reply"
                                                        className="reply-btn"
                                                    >
                                                        <BiReply size={18} />
                                                    </button>

                                                    {/* Translate button */}
                                                    <button
                                                        onClick={() => handleTranslateMessage(msgId)}
                                                        disabled={translatingIds.has(msgId)}
                                                        style={{
                                                            width: '28px', height: '28px', borderRadius: '50%',
                                                            border: '1px solid #E5E7EB', backgroundColor: 'white',
                                                            cursor: translatingIds.has(msgId) ? 'wait' : 'pointer',
                                                            color: '#EA580C',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                                                        }}
                                                        title={`Translate to ${SARVAM_LANGUAGES.find(l => l.code === targetLanguage)?.label}`}
                                                    >
                                                        {translatingIds.has(msgId) ? (
                                                            <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <BiGlobe size={16} />
                                                        )}
                                                    </button>

                                                    {/* Emoji reaction button */}
                                                    <div style={{ position: 'relative' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShowEmojiPicker(showEmojiPicker === msgId ? null : msgId);
                                                            }}
                                                            style={{
                                                                width: '28px', height: '28px', borderRadius: '50%',
                                                                border: '1px solid #E5E7EB', backgroundColor: 'white',
                                                                cursor: 'pointer', fontSize: '14px',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                                                            }}
                                                            title="React"
                                                        >
                                                            <BiSmile size={18} className="text-gray-500" />
                                                        </button>
                                                        
                                                        {showEmojiPicker === msgId && (
                                                            <div style={{
                                                                position: 'absolute', zIndex: 100,
                                                                backgroundColor: 'white', borderRadius: '12px',
                                                                padding: '8px', border: '1px solid #E5E7EB',
                                                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                                                display: 'flex', gap: '4px',
                                                                bottom: '100%', [isSentByMe ? 'right' : 'left']: 0,
                                                                marginBottom: '8px'
                                                            }}>
                                                                {QUICK_EMOJIS.map(emoji => (
                                                                    <button key={emoji}
                                                                        onClick={() => {
                                                                            handleReactToMessage(msgId, emoji);
                                                                            setShowEmojiPicker(null);
                                                                        }}
                                                                        style={{
                                                                            width: '36px', height: '36px', borderRadius: '8px',
                                                                            border: 'none', backgroundColor: 'transparent',
                                                                            cursor: 'pointer', fontSize: '20px',
                                                                            transition: 'background 0.15s',
                                                                        }}
                                                                        onMouseEnter={e => e.target.style.backgroundColor = '#F3F4F6'}
                                                                        onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                                                                    >
                                                                        {emoji}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Delete message (only for own messages) */}
                                                    {isSentByMe && (
                                                        <button
                                                            onClick={() => handleDeleteMessage(msgId)}
                                                            style={{
                                                                width: '28px', height: '28px', borderRadius: '50%',
                                                                border: '1px solid #FEE2E2', backgroundColor: '#FEF2F2',
                                                                cursor: 'pointer', color: '#DC2626',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                                                            }}
                                                            title="Delete message"
                                                        >
                                                            <BiTrash size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Message bubble */}
                                            <div style={{
                                                maxWidth: '70%',
                                                padding: '10px 14px',
                                                borderRadius: isSentByMe
                                                    ? '18px 18px 4px 18px'
                                                    : '18px 18px 18px 4px',
                                                backgroundColor: isSentByMe
                                                    ? '#EA580C' : 'white',
                                                color: isSentByMe ? 'white' : '#111827',
                                                fontSize: '14px', lineHeight: '1.5',
                                                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                                position: 'relative',
                                            }}>
                                                {/* Reply context */}
                                                {msg.reply_to && msg.reply_to_text && (
                                                    <div style={{
                                                        backgroundColor: isSentByMe ? 'rgba(255,255,255,0.2)' : '#F3F4F6',
                                                        padding: '6px 10px', borderRadius: '8px',
                                                        fontSize: '12px', borderLeft: '3px solid #EA580C',
                                                        marginBottom: '8px', color: isSentByMe ? 'white' : '#4B5563',
                                                        opacity: 0.9, fontStyle: 'italic'
                                                    }}>
                                                        {msg.reply_to_text}
                                                    </div>
                                                )}
                                                {/* Original message */}
                                                <div>{msg.message || msg.messageOriginal || ""}</div>

                                                {/* Translated message — shown if translation exists for current target language AND user has toggled it on */}
                                                {showTranslated.has(msgId) && msg.translations?.[targetLanguage] && (
                                                    <div style={{
                                                        marginTop: '8px',
                                                        paddingTop: '8px',
                                                        borderTop: `1px dashed ${isSentByMe ? 'rgba(255,255,255,0.3)' : '#E5E7EB'}`,
                                                        fontSize: '13px',
                                                        opacity: 0.95,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '4px',
                                                    }}>
                                                        <div style={{
                                                            fontSize: '9px',
                                                            fontWeight: '700',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em',
                                                            opacity: 0.7,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                        }}>
                                                            <BiGlobe size={10} /> {SARVAM_LANGUAGES.find(l => l.code === targetLanguage)?.label}
                                                        </div>
                                                        <div style={{ fontStyle: 'italic' }}>
                                                            {msg.translations[targetLanguage]}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Time + read receipt */}
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', gap: '4px',
                                                    justifyContent: 'flex-end', marginTop: '4px',
                                                }}>
                                                    <span style={{
                                                        fontSize: '10px',
                                                        opacity: 0.7,
                                                        color: isSentByMe ? 'white' : '#9CA3AF',
                                                    }}>
                                                        {formatMessageTime(msg.created_at || msg.createdAt)}
                                                    </span>
                                                    {isSentByMe && (
                                                        <span style={{ fontSize: '12px', opacity: 0.8 }}>
                                                            {msg.is_read ? '✓✓' : '✓'}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Reactions display */}
                                                {msg.reactions && msg.reactions.length > 0 && (
                                                    <div style={{
                                                        position: 'absolute', bottom: '-12px',
                                                        right: isSentByMe ? '8px' : 'auto',
                                                        left: !isSentByMe ? '8px' : 'auto',
                                                        display: 'flex', gap: '2px',
                                                        backgroundColor: 'white', borderRadius: '999px',
                                                        padding: '2px 6px', border: '1px solid #F3F4F6',
                                                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                                                        fontSize: '13px',
                                                    }}>
                                                        {msg.reactions.map((r, i) => (
                                                            <span key={i} title={`Reacted by user ${r.user_id}`}>{r.emoji}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* BOOKING ACTION BUTTONS */}
                                        {hasBookingRequest && (
                                            <div style={{ display: 'flex', justifyContent: isSentByMe ? 'flex-end' : 'flex-start', marginBottom: '16px' }}>
                                                <div style={{ maxWidth: '70%', width: '100%' }}>
                                                    
                                                    {/* RECIPIENT (Host) sees Approve/Decline when status is pending */}
                                                    {!isSentByMe && msg.booking_status === 'pending' && (
                                                    <div style={{ 
                                                        display: 'flex', gap: '8px', marginTop: '4px' 
                                                    }}>
                                                        <button
                                                        onClick={() => handleApproveBooking(msg.booking_request_id, msg.total_price || msg.totalPrice)}
                                                        style={{
                                                            flex: 1, padding: '10px 16px',
                                                            borderRadius: '10px', border: 'none',
                                                            backgroundColor: '#22C55E', color: 'white',
                                                            fontWeight: '700', fontSize: '13px',
                                                            cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center',
                                                            justifyContent: 'center', gap: '6px',
                                                            boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
                                                        }}
                                                        >
                                                        ✅ Approve Booking
                                                        </button>
                                                        <button
                                                        onClick={() => handleDeclineBooking(msg.booking_request_id)}
                                                        style={{
                                                            flex: 1, padding: '10px 16px',
                                                            borderRadius: '10px',
                                                            border: '1px solid #FEE2E2',
                                                            backgroundColor: '#FEF2F2', color: '#DC2626',
                                                            fontWeight: '700', fontSize: '13px',
                                                            cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center',
                                                            justifyContent: 'center', gap: '6px',
                                                        }}
                                                        >
                                                        ❌ Decline
                                                        </button>
                                                    </div>
                                                    )}

                                                    {/* RECIPIENT (Host) sees VIEW GUEST INFO on the requested message */}
                                                    {!isSentByMe && msg.booking_status === 'pending' && (conversation?.isHost || conversation?.is_host) && (
                                                        <button
                                                            onClick={() => setShowGuestProfile(conversation?.otherUser?._id || conversation?.other_user_id)}
                                                            style={{
                                                                width: '100%', padding: '10px 16px',
                                                                borderRadius: '10px',
                                                                border: '1.5px solid #E5E7EB',
                                                                backgroundColor: 'white', color: '#374151',
                                                                fontWeight: '700', fontSize: '13px',
                                                                cursor: 'pointer', display: 'flex',
                                                                alignItems: 'center', justifyContent: 'center',
                                                                gap: '8px', marginTop: '8px',
                                                                transition: 'all 0.15s',
                                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                                                        >
                                                            <BiUser size={18} />
                                                            View Guest Info & Trust Score
                                                        </button>
                                                    )}

                                                    {/* RECIPIENT (Guest) sees Pay Now when message status is approved */}
                                                    {!isSentByMe && msg.booking_status === 'approved' && (
                                                    <button
                                                        onClick={() => handlePayNow(msg)}
                                                        style={{
                                                            width: '100%', marginTop: '4px',
                                                            padding: '12px 16px', borderRadius: '12px',
                                                            background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                                                            color: 'white', border: 'none',
                                                            fontWeight: '800', fontSize: '14px',
                                                            cursor: 'pointer', display: 'flex',
                                                            alignItems: 'center', justifyContent: 'center',
                                                            gap: '10px', boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
                                                            transition: 'all 0.2s',
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                                                    >
                                                        💳 Pay Now - ₹{(
                                                            msg.total_price || 
                                                            msg.totalPrice || 
                                                            extractAmountFromMessage(msg.message) ||
                                                            messages.find(m => m.booking_request_id === msg.booking_request_id && (m.total_price || m.totalPrice))?.total_price ||
                                                            messages.find(m => m.booking_request_id === msg.booking_request_id && (m.total_price || m.totalPrice))?.totalPrice ||
                                                            extractAmountFromMessage(messages.find(m => m.booking_request_id === msg.booking_request_id && m.booking_status === 'pending')?.message) ||
                                                            0
                                                        ).toLocaleString('en-IN')}
                                                    </button>
                                                    )}

                                                    {/* CONFIRMED status badge */}
                                                    {msg.booking_status === 'confirmed' && (
                                                    <div style={{
                                                        marginTop: '4px', padding: '10px 16px',
                                                        borderRadius: '10px', backgroundColor: '#F0FDF4',
                                                        border: '1px solid #BBF7D0',
                                                        display: 'flex', alignItems: 'center', gap: '8px',
                                                        color: '#16A34A', fontWeight: '700', fontSize: '13px',
                                                    }}>
                                                        🎉 Booking Confirmed!
                                                    </div>
                                                    )}

                                                    {/* REJECTED status badge */}
                                                    {(msg.booking_status === 'rejected' || msg.booking_status === 'declined') && (
                                                    <div style={{
                                                        marginTop: '4px', padding: '10px 16px',
                                                        borderRadius: '10px', backgroundColor: '#FEF2F2',
                                                        border: '1px solid #FEE2E2',
                                                        display: 'flex', alignItems: 'center', gap: '8px',
                                                        color: '#DC2626', fontWeight: '700', fontSize: '13px',
                                                    }}>
                                                        ❌ Booking Request Declined
                                                    </div>
                                                    )}

                                                    {/* SENDER (Guest) sees PENDING badge on their own sent request */}
                                                    {isSentByMe && msg.booking_status === 'pending' && (
                                                    <div style={{
                                                        marginTop: '4px', padding: '8px 14px',
                                                        borderRadius: '10px', backgroundColor: '#FFFBEB',
                                                        border: '1px solid #FDE68A',
                                                        display: 'flex', alignItems: 'center', gap: '6px',
                                                        color: '#D97706', fontWeight: '600', fontSize: '12px',
                                                    }}>
                                                        ⏳ Awaiting host approval...
                                                    </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
                padding: '12px 16px',
                borderTop: '1px solid #F3F4F6',
                display: 'flex', gap: '10px', alignItems: 'flex-end',
                position: 'relative',
                backgroundColor: 'white', flexShrink: 0,
            }}>
                {/* Reply Preview */}
                {replyTo && (
                    <div style={{
                        position: 'absolute', bottom: '100%', left: 0, right: 0,
                        backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB',
                        padding: '10px 16px', display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', borderLeft: '4px solid #EA580C',
                        zIndex: 10
                    }}>
                        <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: '10px', fontBlack: '900', color: '#EA580C', textTransform: 'uppercase', margin: 0 }}>Replying to</p>
                            <p style={{ fontSize: '12px', color: '#4B5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                                {replyTo.message || replyTo.messageOriginal}
                            </p>
                        </div>
                        <button onClick={() => setReplyTo(null)} style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer' }}><BiX size={20}/></button>
                    </div>
                )}

                {/* Emoji button */}
                <button 
                  className="emoji-btn"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    border: '1px solid #E5E7EB', backgroundColor: 'white',
                    cursor: 'pointer', fontSize: '18px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                    <BiSmile size={24} className="text-gray-500" />
                </button>
                
                {showEmojiPicker && (
                    <div className="emoji-container" style={{
                        position: 'absolute', zIndex: 999,
                        bottom: '80px', left: '16px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    }}>
                        <EmojiPicker
                          onEmojiClick={(emojiData) => {
                            setNewMessage(prev => prev + emojiData.emoji);
                          }}
                          theme="light"
                        />
                    </div>
                )}

                {/* Input */}
                <div style={{ flex: 1, position: 'relative' }}>
                    <textarea
                        value={newMessage}
                        onChange={e => {
                            setNewMessage(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Type a message... (Enter to send)"
                        rows={1}
                        style={{
                            width: '100%', padding: '10px 14px',
                            borderRadius: '14px', border: '1.5px solid #E5E7EB',
                            fontSize: '14px', outline: 'none', resize: 'none',
                            backgroundColor: '#F9FAFB', lineHeight: '1.4',
                            boxSizing: 'border-box', maxHeight: '120px',
                            fontFamily: 'inherit',
                            transition: 'border-color 0.15s',
                        }}
                        onFocus={e => e.target.style.borderColor = '#EA580C'}
                        onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                    />
                </div>

                {/* Send button */}
                <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    style={{
                        width: '42px', height: '42px', borderRadius: '12px',
                        background: newMessage.trim() 
                            ? 'linear-gradient(135deg, #EA580C, #F97316)' 
                            : '#F3F4F6',
                        border: 'none', cursor: newMessage.trim() ? 'pointer' : 'default',
                        color: newMessage.trim() ? 'white' : '#9CA3AF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: newMessage.trim() 
                            ? '0 2px 8px rgba(234,88,12,0.35)' : 'none',
                        flexShrink: 0, transition: 'all 0.2s',
                    }}
                >
                    {sending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <BiSend size={20} />
                    )}
                </button>
            </div>
        </div>
    );
}

export default ChatWindow;
