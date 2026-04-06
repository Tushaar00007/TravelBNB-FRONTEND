import { useEffect, useState } from "react";
import {
    BarChart, Bar, LineChart, Line, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, Users, Home, CalendarCheck, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Cookies from "js-cookie";
import API from "../../../services/api";

const KpiCard = ({ label, value, sub, icon: Icon, color, trend }) => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}>
                <Icon size={24} />
            </div>
            {trend && (
                <span className={`flex items-center text-xs font-bold ${trend > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(trend)}%
                </span>
            )}
        </div>
        <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</h3>
        <p className="text-3xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">{value}</p>
        <p className="text-gray-400 text-[10px] font-medium leading-none">{sub}</p>
    </div>
);

export default function AdminAnalytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = Cookies.get("token");

    useEffect(() => {
        API.get("/admin/stats", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) return <div className="p-8 text-center text-gray-500 font-bold animate-pulse">Analyzing TravelBNB data...</div>;

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Analytics Dashboard</h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Deep dive into growth, revenue, and user behavior.</p>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard
                    label="Growth"
                    value={data?.total_users ?? 0}
                    sub="Total registered users"
                    icon={Users}
                    color="from-blue-500 to-indigo-600"
                    trend={12}
                />
                <KpiCard
                    label="Inventory"
                    value={data?.total_homes ?? 0}
                    sub="Active listings"
                    icon={Home}
                    color="from-teal-400 to-emerald-500"
                    trend={8}
                />
                <KpiCard
                    label="Volume"
                    value={data?.total_bookings ?? 0}
                    sub="Successful bookings"
                    icon={CalendarCheck}
                    color="from-orange-400 to-rose-500"
                    trend={-2}
                />
                <KpiCard
                    label="Revenue"
                    value={`₹${data?.total_revenue?.toLocaleString()}`}
                    sub="Life-time earnings"
                    icon={DollarSign}
                    color="from-amber-400 to-orange-600"
                    trend={15}
                />
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Revenue & Growth Area Chart */}
                <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">Revenue Performance</h3>
                            <p className="text-xs text-gray-500 font-medium italic">Monthly financial trajectory</p>
                        </div>
                        <TrendingUp className="text-emerald-500" size={24} />
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data?.revenue_monthly ?? []}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* User Acquisition Bar Chart */}
                <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">User Acquisition</h3>
                            <p className="text-xs text-gray-500 font-medium italic">New registrations over time</p>
                        </div>
                        <Users className="text-indigo-500" size={24} />
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data?.user_monthly ?? []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <Tooltip
                                cursor={{ fill: '#f3f4f6' }}
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="users" fill="#6366f1" radius={[10, 10, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bookings Comparison */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white">Booking Volume</h3>
                        <p className="text-xs text-gray-500 font-medium italic">Trend of successful reservations</p>
                    </div>
                    <CalendarCheck className="text-rose-500" size={24} />
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={data?.booking_monthly ?? []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <Tooltip />
                        <Line type="step" dataKey="bookings" stroke="#f43f5e" strokeWidth={4} dot={{ r: 6, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
