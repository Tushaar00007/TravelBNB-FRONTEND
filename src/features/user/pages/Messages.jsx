import React, { useState, useEffect, Component } from "react";
import Cookies from "js-cookie";
import { useNavigate, useLocation, useParams, useSearchParams } from "react-router-dom";
import API from "../../../services/api";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";

// Simple ErrorBoundary Component
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

function Messages() {
    // Get userId from URL params if available, otherwise fallback to logged-in user's cookie
    const { userId: paramUserId } = useParams();
    const rawUserId = paramUserId || Cookies.get("userId");
    const userId = rawUserId ? String(rawUserId).replace(/\s/g, "") : null;
    const navigate = useNavigate();
    const location = useLocation();
    const [activeConv, setActiveConv] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchParams] = useSearchParams();

    // Hide footer on messages page
    useEffect(() => {
        const footer = document.querySelector('footer');
        if (footer) footer.style.display = 'none';
        return () => {
            if (footer) footer.style.display = '';
        };
    }, []);

    const fetchConversations = async () => {
        if (!userId) return;
        try {
            const res = await API.get(`/messages/conversations/${userId}`);
            const apiConvs = Array.isArray(res.data) ? res.data : [];
            setConversations(apiConvs);
        } catch (err) {
            console.error("Failed to fetch conversations in Messages.jsx:", err);
        }
    };

    // Auto-select conversation based on host query param or location state
    useEffect(() => {
        const hostId = searchParams.get('host');
        const requestId = searchParams.get('request');
        const hostName = searchParams.get('hostName') || 'Host';
        const propertyName = searchParams.get('property_name') || 'Property';
        const propertyId = searchParams.get('property_id');
        
        console.log("Messages page params - host:", hostId, "request:", requestId);
        
        if (hostId) {
            // 1. Try to find in existing list
            const cleanHostId = String(hostId).trim();
            const conv = conversations.find(
                c => String(c.other_user_id).trim() === cleanHostId
            );

            if (conv) {
                console.log("Found real conversation, selecting:", conv);
                setActiveConv(conv);
            } else {
                // 2. Create temporary conversation object immediately
                console.log("Creating temp conversation for host:", hostId);
                const tempConv = {
                    other_user_id: hostId,
                    other_user_name: hostName,
                    otherUser: {
                        _id: hostId,
                        name: hostName,
                        avatar: "",
                        profile_image: ""
                    },
                    participants: [
                        { _id: userId, name: "You", avatar: "", profile_image: "" },
                        { _id: hostId, name: hostName, avatar: "", profile_image: "" }
                    ],
                    property_id: propertyId,
                    property_name: propertyName,
                    propertyName: propertyName,
                    booking_request_id: requestId,
                    conversation_id: `temp_${hostId}`,
                    _id: `temp_${hostId}`,
                    last_message: "Booking request sent",
                    lastMessage: "Booking request sent",
                    last_message_time: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isTemp: true,
                    isHost: false,
                    is_host: false,
                    host_id: hostId,
                    guest_id: userId
                };
                setActiveConv(tempConv);

                // 3. IMPORTANT: MANUALLY INJECT INTO SIDEBAR STATE to avoid "No conversations yet"
                setConversations(prev => {
                    const exists = prev.find(c => String(c.other_user_id) === String(hostId));
                    if (!exists) return [tempConv, ...prev];
                    return prev;
                });
            }
            if (window.innerWidth < 768) setIsSidebarOpen(false);
        } else if (location.state?.openConv) {
            setActiveConv(location.state.openConv);
            if (window.innerWidth < 768) setIsSidebarOpen(false);
        }
    }, [searchParams, conversations.length > 0, location.state]);

    // Refetch conversations soon after mount to catch newly sent messages
    useEffect(() => {
        const hostId = searchParams.get('host');
        if (hostId) {
            console.log("Host param detected, scheduling refetches...");
            const t1 = setTimeout(fetchConversations, 1000);
            const t2 = setTimeout(fetchConversations, 3000);
            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
            };
        }
    }, [searchParams]);

    // On small screens, default to sidebar open until a chat is selected
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) setIsSidebarOpen(!activeConv);
            else setIsSidebarOpen(true);
        };
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, [activeConv]);

    const handleSelectConv = (conv) => {
        setActiveConv(conv);
        if (window.innerWidth < 768) setIsSidebarOpen(false);
    };

    if (!userId) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4 text-gray-400">
                <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                    Please log in to view your messages
                </p>
                <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md"
                >
                    Log In
                </button>
            </div>
        );
    }

    return (
        <div style={{ 
            position: 'fixed',
            top: '96px', // Matches ConversationList top
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex', 
            overflow: 'hidden', 
            backgroundColor: 'white',
            zIndex: 10
        }}>
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
                {/* Sidebar */}
                <div style={{ 
                    width: isSidebarOpen ? '380px' : '0px', 
                    flexShrink: 0, 
                    borderRight: '1px solid #F3F4F6', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '100%', 
                    overflow: 'hidden',
                    transition: 'width 0.3s ease',
                    minHeight: 0 // CRITICAL
                }}>
                    <ConversationList
                        userId={userId}
                        activeConv={activeConv}
                        conversations={conversations}
                        setConversations={setConversations}
                        onSelect={handleSelectConv}
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                </div>

                {/* Chat Window */}
                <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '100%', 
                    overflow: 'hidden',
                    backgroundColor: '#FAFAFA',
                    minHeight: 0 // CRITICAL
                }}>
                    <ErrorBoundary 
                        fallback={
                            <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                                <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>⚠️</span>
                                <p style={{ fontWeight: '700', fontSize: '18px', color: '#374151', marginBottom: '8px' }}>
                                    Could not load messages
                                </p>
                                <p style={{ fontSize: '14px', marginBottom: '24px' }}>
                                    We encountered an error rendering the chat.
                                </p>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-2 bg-orange-500 text-white rounded-full shadow-md text-sm font-semibold hover:bg-orange-600 transition-all"
                                >
                                    Refresh Page
                                </button>
                            </div>
                        }
                    >
                        <ChatWindow
                            conv={activeConv}
                            currentUserId={userId}
                            onToggleSidebar={() => setIsSidebarOpen((p) => !p)}
                            onClose={() => setActiveConv(null)}
                        />
                    </ErrorBoundary>
                </div>
            </div>
        </div>
    );
}

export default Messages;
