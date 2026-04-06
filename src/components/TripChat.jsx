import { useState, useEffect, useRef } from "react";
import API from "../services/api";
import { Send, Loader2, Smile, Paperclip, X, CornerUpLeft, MessageSquare, Image as ImageIcon, FileText, Check, CheckCheck } from "lucide-react";
import EmojiPicker from "./EmojiPicker";
import { motion, AnimatePresence } from "framer-motion";

function ReactionSelector({ onSelect, onClose }) {
    const emojis = ["👍", "❤️", "😂", "😮", "😢", "🔥"];
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute -top-12 left-0 bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 rounded-full px-2 py-1.5 flex gap-2 z-50"
        >
            {emojis.map(e => (
                <button 
                    key={e} 
                    onClick={() => { onSelect(e); onClose(); }}
                    className="hover:scale-125 transition-transform text-lg p-1"
                >
                    {e}
                </button>
            ))}
        </motion.div>
    );
}

function Bubble({ msg, currentUserId, onReply, onReact }) {
    const isSelf = msg.sender_id === currentUserId;
    const [showReactions, setShowReactions] = useState(false);
    const time = msg.created_at
        ? new Date(msg.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
        : "";

    // Group reactions by emoji
    const reactionCounts = (msg.reactions || []).reduce((acc, r) => {
        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className={`flex ${isSelf ? "justify-end" : "justify-start"} mb-4 group relative`}>
            {!isSelf && (
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600 mr-2 shrink-0 overflow-hidden mt-auto">
                    {msg.sender_pic
                        ? <img src={msg.sender_pic} alt={msg.sender_name} className="w-full h-full object-cover" />
                        : msg.sender_name?.[0] || "?"}
                </div>
            )}
            
            <div className={`max-w-[75%] ${isSelf ? "items-end" : "items-start"} flex flex-col`}>
                {!isSelf && <p className="text-[10px] font-bold text-gray-400 mb-1 ml-2 uppercase tracking-widest">{msg.sender_name}</p>}
                
                {/* Message Container */}
                <div className="relative group/content">
                    {/* Hover Actions */}
                    <div className={`absolute top-0 ${isSelf ? "-left-14" : "-right-14"} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 items-center h-full`}>
                        <button 
                            onClick={() => onReply(msg)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 transition-colors"
                            title="Reply"
                        >
                            <CornerUpLeft size={14} />
                        </button>
                        <div className="relative">
                            <button 
                                onClick={() => setShowReactions(!showReactions)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 transition-colors"
                                title="React"
                            >
                                <Smile size={14} />
                            </button>
                            <AnimatePresence>
                                {showReactions && (
                                    <ReactionSelector 
                                        onSelect={(emoji) => onReact(msg._id, emoji)} 
                                        onClose={() => setShowReactions(false)} 
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm relative ${isSelf
                            ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-br-none"
                            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-700"
                        }`}>
                        
                        {/* Reply Reference */}
                        {msg.reply_to_text && (
                            <div className={`mb-2 p-2 rounded-lg text-xs border-l-4 ${isSelf ? "bg-white/10 border-white/30" : "bg-gray-50 dark:bg-gray-900 border-orange-500"} opacity-80 italic line-clamp-1`}>
                                {msg.reply_to_text}
                            </div>
                        )}

                        {/* Image/File Content */}
                        {msg.type === "image" && (
                            <div className="mb-2 rounded-lg overflow-hidden border border-black/5 max-w-xs">
                                <img src={msg.file_url} alt="Attachment" className="w-full h-auto max-h-64 object-cover cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => window.open(msg.file_url, '_blank')} />
                            </div>
                        )}
                        {msg.type === "file" && (
                            <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-3 rounded-xl mb-2 hover:opacity-80 transition-opacity ${isSelf ? "bg-white/20" : "bg-gray-50 dark:bg-gray-900"}`}>
                                <FileText size={20} className={isSelf ? "text-white" : "text-orange-500"} />
                                <div className="min-w-0">
                                    <p className="text-xs font-bold truncate">Document</p>
                                    <p className="text-[10px] opacity-60">Click to view</p>
                                </div>
                            </a>
                        )}

                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                        
                        <div className="flex items-center justify-end gap-1 mt-1">
                            <span className={`text-[10px] ${isSelf ? "text-white/70" : "text-gray-400"}`}>{time}</span>
                            {isSelf && <CheckCheck size={12} className="text-white/70" />}
                        </div>

                        {/* Reactions Bar */}
                        {Object.keys(reactionCounts).length > 0 && (
                            <div className={`absolute -bottom-3 ${isSelf ? "right-2" : "left-2"} flex gap-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-full px-1.5 py-0.5 shadow-sm`}>
                                {Object.entries(reactionCounts).map(([emoji, count]) => (
                                    <span key={emoji} className="text-[11px] flex items-center gap-0.5">
                                        {emoji} <span className="text-[9px] font-bold text-gray-500">{count > 1 ? count : ""}</span>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TripChat({ tripId, currentUserId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [replyTo, setReplyTo] = useState(null);
    const [uploading, setUploading] = useState(false);
    
    const bottomRef = useRef(null);
    const pollRef = useRef(null);
    const fileInputRef = useRef(null);

    const fetchMessages = () =>
        API.get(`/trips/${tripId}/messages`)
            .then((r) => setMessages(r.data.messages || []))
            .catch(console.error);

    useEffect(() => {
        fetchMessages();
        pollRef.current = setInterval(fetchMessages, 3000);
        return () => clearInterval(pollRef.current);
    }, [tripId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    const handleSend = async (payloadOverride = null) => {
        if (!input.trim() && !payloadOverride) return;
        setSending(true);
        
        const payload = payloadOverride || {
            sender_id: currentUserId,
            message: input,
            reply_to: replyTo?._id || null,
        };
        
        setInput("");
        setReplyTo(null);
        
        try {
            await API.post(`/trips/${tripId}/messages`, payload);
            await fetchMessages();
        } catch (err) {
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await API.post(`/trips/${tripId}/chat/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // Immediate send after upload
            await handleSend({
                sender_id: currentUserId,
                message: "",
                type: res.data.type,
                file_url: res.data.file_url,
                reply_to: replyTo?._id || null
            });
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setUploading(false);
        }
    };

    const handleReact = async (messageId, emoji) => {
        try {
            await API.post(`/trips/${tripId}/chat/react`, { message_id: messageId, emoji });
            fetchMessages();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden" style={{ height: "70vh" }}>
            {/* Header placeholder - could show trip name */}
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#f0f2f5] dark:bg-gray-950 space-y-1">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                        <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-inner">
                            <MessageSquare className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest opacity-40">Chat with your crew</p>
                    </div>
                ) : (
                    messages.map((m) => (
                        <Bubble 
                            key={m._id} 
                            msg={m} 
                            currentUserId={currentUserId} 
                            onReply={setReplyTo}
                            onReact={handleReact}
                        />
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Dashboard */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                {/* Reply Preview */}
                <AnimatePresence>
                    {replyTo && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mb-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border-l-4 border-orange-500 flex items-center justify-between"
                        >
                            <div className="min-w-0 pr-4">
                                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Replying to {replyTo.sender_name}</p>
                                <p className="text-xs text-gray-500 truncate italic">{replyTo.message || "File attachment"}</p>
                            </div>
                            <button onClick={() => setReplyTo(null)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                                <X size={14} className="text-gray-400" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-end gap-3">
                    <div className="flex gap-1 mb-1">
                        <div className="relative">
                            <button 
                                onClick={() => setShowEmoji(!showEmoji)}
                                className="p-2.5 text-gray-400 hover:text-orange-500 transition-colors"
                            >
                                <Smile size={22} />
                            </button>
                            {showEmoji && (
                                <EmojiPicker 
                                    onEmojiClick={(emoji) => setInput(prev => prev + emoji)}
                                    onClose={() => setShowEmoji(false)}
                                />
                            )}
                        </div>
                        
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="p-2.5 text-gray-400 hover:text-orange-500 transition-colors disabled:opacity-30"
                        >
                            {uploading ? <Loader2 size={22} className="animate-spin" /> : <Paperclip size={22} />}
                        </button>
                        <input 
                            type="file" 
                            hidden 
                            ref={fileInputRef} 
                            onChange={handleFileUpload}
                            accept="image/*,.pdf,.doc,.docx"
                        />
                    </div>

                    <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl px-2 py-1.5 border border-gray-200 dark:border-gray-700">
                        <textarea
                            rows={1}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Type something..."
                            className="flex-1 bg-transparent border-none px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:ring-0 resize-none max-h-32"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={(!input.trim() && !uploading) || sending}
                            className="w-10 h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-orange-500/20 active:scale-95 disabled:grayscale"
                        >
                            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
