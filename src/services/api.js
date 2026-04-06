import axios from "axios";
import Cookies from "js-cookie";

const isProd = import.meta.env.MODE === 'production';

const API = axios.create({
    baseURL: isProd
        ? "https://travelbnb-backend.onrender.com/api"
        : "http://localhost:8000/api",
});

API.interceptors.request.use((config) => {
    // 🔍 TRACING 422 ERROR
    if (config.method === 'post' && config.url.includes('bookings')) {
        console.log("!!! POST REQUEST DETECTED TO /bookings/ !!!");
        console.log("URL:", config.url);
        console.log("Data:", config.data);
        console.log("Stack:", new Error().stack);
    }
    
    const token = Cookies.get("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;