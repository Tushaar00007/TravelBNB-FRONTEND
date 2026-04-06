import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Trash2, Bot, User, Loader2 } from 'lucide-react';

const TravelChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'ai', text: 'Hi! I am your AI Travel Assistant. How can I help you with your trip planning today?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [chatHistory, isOpen]);

    const handleSend = async () => {
        if (!message.trim()) return;

        const userMsg = { role: 'user', text: message };
        setChatHistory(prev => [...prev, userMsg]);
        setMessage('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8000/api/ml/chat', {
                message: userMsg.text
            });

            if (response.data && response.data.reply) {
                setChatHistory(prev => [...prev, { role: 'ai', text: response.data.reply }]);
            }
        } catch (error) {
            console.error("Chatbot Error:", error);
            setChatHistory(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting to my brain. Please make sure the backend is running." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setChatHistory([{ role: 'ai', text: 'Chat cleared. How else can I help?' }]);
    };

    return (
        <div className="fixed bottom-5 right-5 z-[100] font-sans">
            {/* Chat Bubble Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-full shadow-2xl transition-all transform hover:scale-105 group"
                >
                    <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
                    <span className="font-bold tracking-wide">Ask Travel AI</span>
                </button>
            )}

            {/* Expandable Chat Window */}
            {isOpen && (
                <div className="bg-white dark:bg-gray-900 w-[350px] md:w-[400px] h-[500px] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold">Travel Assistant</h3>
                                <p className="text-[10px] opacity-80 uppercase tracking-widest font-semibold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={clearChat} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Clear Chat">
                                <Trash2 size={16} />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-950/20">
                        {chatHistory.map((chat, idx) => (
                            <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-3 max-w-[85%] ${chat.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${chat.role === 'ai' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                                        {chat.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
                                    </div>
                                    <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${chat.role === 'ai' ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none' : 'bg-orange-600 text-white rounded-tr-none'}`}>
                                        {chat.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center animate-pulse">
                                        <Bot size={16} />
                                    </div>
                                    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none shadow-sm flex items-center">
                                        <Loader2 size={18} className="animate-spin text-orange-500" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about places, food, transport..."
                                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-500 transition-all dark:text-white"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!message.trim() || isLoading}
                                className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-lg shadow-orange-600/20 transition-all active:scale-95"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TravelChatbot;
