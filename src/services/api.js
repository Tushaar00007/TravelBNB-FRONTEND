import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
});

API.interceptors.request.use((config) => {
    const token = Cookies.get("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        let message = "An unexpected error occurred";
        const detail = error.response?.data?.detail;
        
        if (typeof detail === "string") {
            message = detail;
        } else if (Array.isArray(detail)) {
            // Handle Pydantic validation errors: [{msg: "..."}, ...]
            message = detail.map(err => err.msg || JSON.stringify(err)).join(", ");
        } else if (detail && typeof detail === "object") {
            message = detail.message || JSON.stringify(detail);
        } else {
            message = error.message || message;
        }
        
        // Don't toast for 401s as they are often handled by redirect logic
        if (error.response?.status !== 401) {
            toast.error(message, {
                id: 'global-api-error', // Prevent duplicate toasts
                duration: 4000
            });
        }
        
        return Promise.reject(error);
    }
);

export default API;