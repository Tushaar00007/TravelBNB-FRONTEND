import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../services/api";
import Cookies from "js-cookie";

const HostContext = createContext();

export const HostProvider = ({ children }) => {
    const [isHost, setIsHost] = useState(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const role = storedUser?.role;
        return storedUser?.is_host === true || 
               role === 'host' || 
               role === 'super_admin' || 
               role === 'admin';
    });
    const [hostingMode, setHostingMode] = useState(() => {
        const saved = localStorage.getItem("hostingMode");
        return saved === "true";
    });
    const [loading, setLoading] = useState(false); // Default to false as we load from localStorage
    const token = Cookies.get("token");

    const refreshHostStatus = useCallback(async () => {
        const userId = Cookies.get("userId");
        if (!token || !userId) {
            setIsHost(false);
            setLoading(false);
            return;
        }

        try {
            // Fetch fresh status from the backend
            const res = await API.get(`/auth/user/${userId}`);
            // Use the new inclusive logic from the backend response
            const role = res.data.role;
            const freshIsHost = res.data.is_host === true || 
                                role === 'host' || 
                                role === 'super_admin' || 
                                role === 'admin';
            setIsHost(freshIsHost);
            
            // Sync with localStorage user object for consistency
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (storedUser.id || storedUser._id) {
                localStorage.setItem('user', JSON.stringify({
                    ...storedUser,
                    is_host: freshIsHost,
                    role: res.data.role || storedUser.role
                }));
            }
        } catch (err) {
            console.error("Host check failed", err);
            // Don't reset if we have a valid role in localStorage
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        refreshHostStatus();
    }, [refreshHostStatus, token]);

    useEffect(() => {
        localStorage.setItem("hostingMode", hostingMode);
    }, [hostingMode]);

    const toggleHostingMode = () => {
        setHostingMode(prev => !prev);
    };

    return (
        <HostContext.Provider value={{ 
            isHost, 
            hostingMode, 
            setHostingMode, 
            toggleHostingMode, 
            loading, 
            refreshHostStatus 
        }}>
            {children}
        </HostContext.Provider>
    );
};

export const useHost = () => {
    const context = useContext(HostContext);
    if (!context) {
        throw new Error("useHost must be used within a HostProvider");
    }
    return context;
};
