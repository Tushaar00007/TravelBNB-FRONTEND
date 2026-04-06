import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    TrendingUp, Users, DollarSign, Star, Eye, Calendar, 
    ChevronLeft, ArrowUpRight, ArrowDownRight, RefreshCcw
} from "lucide-react";
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, AreaChart, Area 
} from "recharts";
import API from "../../../services/api";
import { motion } from "framer-motion";

const CrashpadStats = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [graphData, setGraphData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [statsRes, graphRes] = await Promise.all([
                    API.get(`/crashpads/${id}/stats`),
                    API.get(`/crashpads/${id}/views-graph`)
                ]);
                setStats(statsRes.data.stats);
                setGraphData(graphRes.data);
            } catch (err) {
                console.error("Failed to fetch analytics", err);
                setError(err.response?.data?.detail || "Failed to load analytics");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [id]);

    const StatCard = ({ title, value, icon: Icon, trend, prefix = "" }) => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-black text-gray-900">
                    {prefix}{value.toLocaleString()}
                </h3>
            </div>
        </motion.div>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCcw className="text-orange-500 animate-spin" size={40} />
                    <p className="text-gray-500 font-bold animate-pulse">Loading real-time data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md text-center border border-red-100">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ChevronLeft size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight">Access Denied</h2>
                    <p className="text-gray-500 font-medium leading-relaxed mb-8">{error}</p>
                    <button 
                        onClick={() => navigate("/host/dashboard")}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate("/host/dashboard")}
                            className="p-3 hover:bg-gray-50 rounded-2xl transition-colors text-gray-400 hover:text-gray-900"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 tracking-tight">Crashpad Analytics</h1>
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest leading-none mt-0.5">Real-time Performance</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Live tracking active
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard 
                        title="Total Views" 
                        value={stats.total_views} 
                        icon={Eye} 
                        trend={12} 
                    />
                    <StatCard 
                        title="Bookings" 
                        value={stats.total_bookings} 
                        icon={Calendar} 
                        trend={5} 
                    />
                    <StatCard 
                        title="Net Earnings" 
                        value={stats.total_earnings} 
                        icon={DollarSign} 
                        prefix="₹"
                        trend={-2}
                    />
                    <StatCard 
                        title="Avg Rating" 
                        value={stats.avg_rating} 
                        icon={Star} 
                    />
                </div>

                {/* Graph Section */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">View Traffic</h2>
                            <p className="text-gray-500 font-medium text-sm">Visualizing visitor trends for the last 30 days</p>
                        </div>
                        <div className="flex bg-gray-50 p-1.5 rounded-2xl">
                            <button className="px-5 py-2 bg-white text-gray-900 rounded-xl shadow-sm text-xs font-black uppercase tracking-widest">30 Days</button>
                            <button className="px-5 py-2 text-gray-400 hover:text-gray-600 text-xs font-black uppercase tracking-widest transition-colors">90 Days</button>
                        </div>
                    </div>

                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={graphData}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontWeight: 600, fontSize: 10 }}
                                    dy={15}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontWeight: 600, fontSize: 10 }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '16px', 
                                        border: 'none', 
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        fontWeight: '900',
                                        fontSize: '12px',
                                        textTransform: 'uppercase',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ color: '#f97316' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="views" 
                                    stroke="#f97316" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#colorViews)" 
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="bg-gray-900 text-white rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 blur-[100px] -z-0" />
                    <div className="relative z-10 max-w-xl text-center md:text-left">
                        <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                            <div className="p-2 bg-orange-500 rounded-lg">
                                <TrendingUp size={20} className="text-white" />
                            </div>
                            <span className="text-orange-500 font-extrabold uppercase tracking-widest text-[10px]">Host Insights</span>
                        </div>
                        <h2 className="text-3xl font-black mb-4 tracking-tight">Boost your views by 40%</h2>
                        <p className="text-gray-400 font-medium leading-relaxed">
                            Crashpads with high-quality descriptions and at least 3 photos receive significantly more visitor attention. Update your listing today.
                        </p>
                    </div>
                    <button className="relative z-10 bg-white text-gray-900 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-50 transition-all active:scale-95 whitespace-nowrap shadow-xl">
                        Optimize Listing
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CrashpadStats;
