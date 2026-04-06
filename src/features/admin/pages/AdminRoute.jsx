import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import API from "../../../services/api";
import AdminLayout from "./AdminLayout";

const ADMIN_ROLES = ["super_admin", "sub_admin", "admin"];

export default function AdminRoute() {
    const [state, setState] = useState("loading"); // loading | allowed | denied | unauth
    const [adminRole, setAdminRole] = useState(null);
    const token = Cookies.get("token");
    const userId = Cookies.get("userId");

    useEffect(() => {
        if (!token || !userId) { setState("unauth"); return; }

        API.get(`/auth/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                const role = res.data.role;
                if (ADMIN_ROLES.includes(role) || role === "super_admin") {
                    setAdminRole(role);
                    setState("allowed");
                } else {
                    setState("denied");
                }
            })
            .catch(() => setState("unauth"));
    }, [token, userId]);

    if (state === "loading") {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white font-bold text-lg animate-pulse">
                Loading Admin Panel…
            </div>
        );
    }
    if (state === "unauth") return <Navigate to="/login" replace />;
    if (state === "denied") return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white gap-4">
            <span className="text-6xl">🚫</span>
            <h1 className="text-3xl font-black">Access Denied</h1>
            <p className="text-gray-400">You do not have permission to access the Admin Panel.</p>
        </div>
    );

    return <AdminLayout adminRole={adminRole}><Outlet /></AdminLayout>;
}
