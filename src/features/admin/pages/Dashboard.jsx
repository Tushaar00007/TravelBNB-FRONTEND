import { useEffect, useState } from "react";
import { Users, Home, CalendarCheck, TrendingUp, DollarSign, Activity } from "lucide-react";
import Cookies from "js-cookie";
import API from "../../../services/api";
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";

const STAT_CONFIG = [
    { key: "total_users", label: "Total Users", icon: Users, color: "from-purple-500 to-indigo-600", trend: "up", trendValue: 12 },
    { key: "total_homes", label: "Active Listings", icon: Home, color: "from-orange-400 to-orange-600", trend: "up", trendValue: 8 },
    { key: "total_bookings", label: "Total Bookings", icon: CalendarCheck, color: "from-blue-400 to-blue-600", trend: "down", trendValue: 3 },
    { key: "total_revenue", label: "Total Revenue", icon: DollarSign, color: "from-emerald-400 to-teal-600", trend: "up", trendValue: 24 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">{label}</p>
                <p className="text-sm font-black text-gray-900">
                    {payload[0].name}: <span className="text-orange-600">{payload[0].value.toLocaleString()}</span>
                </p>
            </div>
        );
    }
    return null;
};

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
        <div className="animate-pulse space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <div key={i} className="h-80 bg-white rounded-2xl border border-gray-100" />)}
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {STAT_CONFIG.map((config) => (
                    <StatCard
                        key={config.key}
                        label={config.label}
                        value={config.key === 'total_revenue' ? `₹${stats?.[config.key]?.toLocaleString() ?? '0'}` : stats?.[config.key]?.toLocaleString() ?? '0'}
                        icon={config.icon}
                        color={config.color}
                        trend={config.trend}
                        trendValue={config.trendValue}
                    />
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* User Growth Chart */}
                <ChartCard 
                    title="User Growth" 
                    subtitle="Platform user acquisition per month"
                    icon={Users}
                >
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={stats?.user_monthly ?? []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                            <XAxis 
                                dataKey="month" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 500 }}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 500 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line 
                                type="monotone" 
                                dataKey="users" 
                                name="New Users"
                                stroke="#8B5CF6" 
                                strokeWidth={4} 
                                dot={{ r: 0 }} 
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#8B5CF6' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Bookings Chart */}
                <ChartCard 
                    title="Reservations" 
                    subtitle="Monthly booking volume"
                    icon={CalendarCheck}
                >
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={stats?.booking_monthly ?? []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                            <XAxis 
                                dataKey="month" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 500 }}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 500 }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB' }} />
                            <Bar 
                                dataKey="bookings" 
                                name="Bookings"
                                fill="#F97316" 
                                radius={[6, 6, 0, 0]} 
                                barSize={32}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Revenue Chart */}
                <ChartCard 
                    title="Revenue Stream" 
                    subtitle="Consolidated monthly earnings"
                    icon={DollarSign}
                >
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={stats?.revenue_monthly ?? []}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                            <XAxis 
                                dataKey="month" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 500 }}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 500 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                                type="monotone" 
                                dataKey="revenue" 
                                name="Revenue"
                                stroke="#10B981" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorRev)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Recent Activity Placeholder for depth */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                            <Activity size={18} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">System Vitality</h3>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Activity className="text-gray-300 animate-pulse" size={32} />
                    </div>
                    <p className="text-gray-500 font-medium">Monitoring system performance and real-time logs...</p>
                    <p className="text-xs text-gray-400 mt-1">Last sync: Just now</p>
                </div>
            </div>
        </div>
    );
}
