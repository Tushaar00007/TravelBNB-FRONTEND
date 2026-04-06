import { useEffect, useState } from "react";
import { Users, Home, CalendarCheck, TrendingUp, DollarSign } from "lucide-react";
import Cookies from "js-cookie";
import API from "../../../services/api";
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const STAT_CARDS = [
    { key: "total_users", label: "Total Users", Icon: Users, color: "from-violet-500 to-purple-600" },
    { key: "total_homes", label: "Listings", Icon: Home, color: "from-teal-400 to-cyan-600" },
    { key: "total_bookings", label: "Bookings", Icon: CalendarCheck, color: "from-orange-400 to-rose-500" },
    { key: "total_revenue", label: "Revenue (₹)", Icon: DollarSign, color: "from-emerald-400 to-green-600" },
];

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = Cookies.get("token");

    useEffect(() => {
        API.get("/admin/stats", { headers: { Authorization: `Bearer ${token}` } })
            .then(r => setStats(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) return (
        <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl" />)}
            </div>
            <div className="grid grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl" />)}
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Dashboard</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Real-time overview of TravelBNB activity</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
                {STAT_CARDS.map(({ key, label, Icon, color }) => (
                    <div key={key} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
                            <Icon size={22} className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">
                                {stats?.[key]?.toLocaleString() ?? "—"}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Users */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={16} className="text-violet-500" />
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">New Users / Month</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={stats?.user_monthly ?? []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Bookings */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <CalendarCheck size={16} className="text-orange-500" />
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Bookings / Month</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={stats?.booking_monthly ?? []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="bookings" fill="#f97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <DollarSign size={16} className="text-emerald-500" />
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Revenue / Month (₹)</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={stats?.revenue_monthly ?? []}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
