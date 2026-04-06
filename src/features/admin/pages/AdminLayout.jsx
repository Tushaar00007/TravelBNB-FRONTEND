import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import Cookies from "js-cookie";
import {
    LayoutDashboard, Users, Home, CalendarCheck, Tag,
    ScrollText, ShieldCheck, LogOut, Menu, X, ChevronRight,
    UserPlus, Globe, CreditCard, AlertTriangle, LifeBuoy, Bell, BarChart3, CloudLightning, Upload, Send
} from "lucide-react";
import { Toaster } from "react-hot-toast";

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

const ROLE_COLORS = {
    super_admin: "bg-purple-100 text-purple-700",
    sub_admin: "bg-blue-100 text-blue-700",
    admin: "bg-orange-100 text-orange-700",
    host: "bg-green-100 text-green-700",
    guest: "bg-gray-100 text-gray-600",
};

export default function AdminLayout({ adminRole }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();

    const visibleNav = NAV.filter(n => n.roles.includes(adminRole));

    const handleLogout = () => {
        Cookies.remove("token");
        Cookies.remove("userId");
        navigate("/login");
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 font-sans overflow-hidden">
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

            {/* ── Sidebar ─────────────────────────────────────── */}
            <aside className={`flex flex-col bg-gray-900 text-white transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"} shrink-0`}>
                {/* Logo row */}
                <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
                    {sidebarOpen && (
                        <span className="font-black text-xl">
                            Travel<span className="text-orange-400">BNB</span>
                            <span className="ml-2 text-[10px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full align-middle">ADMIN</span>
                        </span>
                    )}
                    <button onClick={() => setSidebarOpen(o => !o)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors ml-auto">
                        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                {/* Nav links */}
                <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                    {visibleNav.map(({ to, label, Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === "/admin"}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group ${isActive
                                    ? "bg-orange-500 text-white"
                                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                                }`
                            }
                        >
                            <Icon size={18} className="shrink-0" />
                            {sidebarOpen && <span className="font-semibold text-sm">{label}</span>}
                            {sidebarOpen && <ChevronRight size={14} className="ml-auto opacity-30 group-hover:opacity-60" />}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="border-t border-white/10 p-4">
                    {sidebarOpen && (
                        <div className="mb-3 flex items-center gap-2">
                            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">A</div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">Admin Panel</p>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[adminRole] || "bg-gray-700 text-gray-300"}`}>
                                    {adminRole?.replace("_", " ")}
                                </span>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-semibold"
                    >
                        <LogOut size={16} />
                        {sidebarOpen && "Logout"}
                    </button>
                </div>
            </aside>

            {/* ── Main area ───────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-4 flex items-center justify-between shrink-0">
                    <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Admin Panel</h1>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${ROLE_COLORS[adminRole] || ""}`}>
                        {adminRole?.replace("_", " ").toUpperCase()}
                    </span>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
