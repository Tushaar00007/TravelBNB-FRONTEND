import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
    LayoutDashboard, Users, Home, CalendarCheck, Tag,
    ScrollText, ShieldCheck, UserPlus, Globe, CreditCard, 
    AlertTriangle, LifeBuoy, Bell, BarChart3, CloudLightning, Upload, Send
} from "lucide-react";
import { Toaster } from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const NAV = [
    { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, roles: ["super_admin", "sub_admin", "admin"] },
    { to: "/admin/analytics", label: "Analytics", Icon: BarChart3, roles: ["super_admin"] },
    { to: "/admin/users", label: "Users", Icon: Users, roles: ["super_admin"] },
    { to: "/admin/create-admin", label: "Admin Management", Icon: UserPlus, roles: ["super_admin"] },
    { to: "/admin/listings", label: "Listings", Icon: Home, roles: ["super_admin", "sub_admin"] },
    { to: "/admin/crashpads", label: "Crashpads", Icon: CloudLightning, roles: ["super_admin", "sub_admin"] },
    { to: "/admin/travel-buddy", label: "Travel Buddy", Icon: Globe, roles: ["super_admin", "sub_admin"] },
    { to: "/admin/bulk-upload", label: "Bulk Upload", Icon: Upload, roles: ["super_admin", "sub_admin"] },
    { to: "/admin/email-campaigns", label: "Email Campaigns", Icon: Send, roles: ["super_admin"] },
    { to: "/admin/bookings", label: "Bookings", Icon: CalendarCheck, roles: ["super_admin", "admin"] },
    { to: "/admin/payments", label: "Payments", Icon: CreditCard, roles: ["super_admin"] },
    { to: "/admin/coupons", label: "Coupons", Icon: Tag, roles: ["super_admin", "sub_admin"] },
    { to: "/admin/reports", label: "Reports", Icon: AlertTriangle, roles: ["super_admin", "admin", "sub_admin"] },
    { to: "/admin/support", label: "Support", Icon: LifeBuoy, roles: ["super_admin", "admin"] },
    { to: "/admin/notifications", label: "Notifications", Icon: Bell, roles: ["super_admin"] },
    { to: "/admin/logs", label: "Activity Logs", Icon: ScrollText, roles: ["super_admin"] },
    { to: "/admin/setup", label: "System Setup", Icon: ShieldCheck, roles: ["super_admin"] },
];

export default function AdminLayout({ adminRole }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [admin, setAdmin] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const storedAdmin = localStorage.getItem("admin");
        if (storedAdmin) {
            try {
                setAdmin(JSON.parse(storedAdmin));
            } catch (e) {
                console.error("Failed to parse admin data", e);
            }
        }
    }, []);

    const visibleNav = NAV.filter(n => n.roles.includes(adminRole));

    const handleLogout = () => {
        Cookies.remove("token");
        Cookies.remove("userId");
        localStorage.removeItem("admin");
        navigate("/login");
    };

    // Get current page title from NAV
    const currentNavItem = NAV.find(item => item.to === location.pathname) || NAV[0];

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            <Toaster position="top-right" toastOptions={{ 
                duration: 3000,
                style: {
                    borderRadius: '16px',
                    background: '#333',
                    color: '#fff',
                }
            }} />

            <Sidebar 
                isOpen={sidebarOpen} 
                setOpen={setSidebarOpen} 
                visibleNav={visibleNav} 
                adminRole={adminRole}
                admin={admin}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header 
                    title={currentNavItem.label} 
                    subtitle="Welcome back to your dashboard"
                    adminRole={adminRole}
                    onLogout={handleLogout}
                    admin={admin}
                />

                <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
