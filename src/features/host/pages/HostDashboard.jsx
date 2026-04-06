import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../../services/api';
import {
  LayoutDashboard, Home, Calendar as CalendarIcon, MessageCircle,
  DollarSign, Star, Bell, Plus, Edit, Trash2,
  ToggleLeft, ToggleRight, TrendingUp, Users,
  ChevronRight, ChevronLeft, Eye, Check, X, Download,
  Clock, MapPin, Wifi, Wind, Utensils, Tv,
  AlertCircle, CheckCircle, XCircle, Filter,
  BarChart2, ArrowUpRight, ArrowDownRight,
  Loader2, Settings, Shield, User as UserIcon, IndianRupee,
  Globe, ChevronDown
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ConversationList from '../../user/components/ConversationList';
import ChatWindow from '../../user/components/ChatWindow';

const NAV_ITEMS = [
  { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
  { id: 'listings', icon: Home, label: 'Listings' },
  { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
  { id: 'messages', icon: MessageCircle, label: 'Messages' },
  { id: 'earnings', icon: DollarSign, label: 'Earnings' },
  { id: 'reviews', icon: Star, label: 'Reviews' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
];

export default function HostDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  
  // Data States
  const [overviewData, setOverviewData] = useState(null);
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [earningsData, setEarningsData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Interaction States
  const [filter, setFilter] = useState('All');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedConv, setSelectedConv] = useState(null);
  const [earningsPeriod, setEarningsPeriod] = useState('month');
  const [selectedListingFilter, setSelectedListingFilter] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [conversations, setConversations] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);
  
  const fetchData = useCallback(async (section) => {
    try {
      setLoading(true);
      if (section === 'overview') {
        const res = await API.get('/host/overview');
        setOverviewData(res.data);
      } else if (section === 'listings') {
        const res = await API.get('/host/dashboard/me');
        setListings([
          ...(res.data.homes || []).map(h => ({...h, type: 'home'})),
          ...(res.data.crashpads || []).map(c => ({...c, type: 'crashpad'})),
          ...(res.data.travel_buddies || []).map(b => ({...b, type: 'buddy'}))
        ]);
      } else if (section === 'earnings') {
        const res = await API.get(`/host/earnings?period=${earningsPeriod}`);
        setEarningsData(res.data);
      } else if (section === 'reviews') {
        const res = await API.get('/host/reviews');
        setReviews(res.data.reviews || []);
        setRatingStats(res.data.stats || {});
      } else if (section === 'notifications') {
        const res = await API.get('/host/notifications');
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unread_count || 0);
      } else if (section === 'calendar') {
        const res = await API.get('/host/bookings');
        setBookings(res.data.bookings || []);
        setBlockedDates(res.data.blocked_dates || []);
      }
    } catch (err) {
      console.error(`Error fetching ${section}:`, err);
      toast.error(`Failed to load ${section} data`);
    } finally {
      setLoading(false);
    }
  }, [earningsPeriod]);

  useEffect(() => {
    // Suppress global body scrolling for app-like dashboard experience
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    fetchData(activeSection);
  }, [activeSection, fetchData]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleListing = async (id) => {
    try {
       await API.patch(`/host/listings/${id}/toggle`);
       setListings(prev => prev.map(l => (l.id || l._id) === id ? {...l, is_active: !l.is_active} : l));
       toast.success("Listing status updated");
    } catch (err) {
       toast.error("Failed to toggle listing");
    }
  };

  const handleBookingAction = async (id, action) => {
    try {
      await API.patch(`/host/bookings/${id}/${action}`);
      toast.success(`Booking ${action}ed successfully`);
      fetchData('calendar');
    } catch (err) {
      toast.error(`Failed to ${action} booking`);
    }
  };

  const handleBlockDate = async (dateStr) => {
    try {
      await API.post('/host/calendar/block', { 
        dates: [dateStr],
        listing_id: selectedListingFilter !== 'all' ? selectedListingFilter : null
      });
      setBlockedDates(prev => [...prev, dateStr]);
      toast.success(`${dateStr} blocked successfully`);
    } catch (err) {
      toast.error("Failed to block date");
    }
  };

  const handleUnblockDate = async (dateStr) => {
    try {
      await API.delete('/host/calendar/block', {
        data: { dates: [dateStr] }
      });
      setBlockedDates(prev => prev.filter(d => (typeof d === 'string' ? d.split('T')[0] : d) !== dateStr));
      toast.success(`${dateStr} unblocked`);
    } catch (err) {
      toast.error("Failed to unblock date");
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      await API.patch(`/host/bookings/${bookingId}/approve`);
      setBookings(prev => prev.map(b => b.id === bookingId ? {...b, status: 'confirmed'} : b));
      toast.success('Booking approved!');
    } catch (err) {
      toast.error('Failed to approve booking');
    }
  };

  const handleDeclineBooking = async (bookingId) => {
    try {
      await API.patch(`/host/bookings/${bookingId}/decline`);
      setBookings(prev => prev.map(b => b.id === bookingId ? {...b, status: 'rejected'} : b));
      toast.success('Booking declined');
    } catch (err) {
      toast.error('Failed to decline booking');
    }
  };

  const exportCSV = () => {
    if (!earningsData?.earnings_table) return;
    const headers = ['Date','Guest','Property','Nights','Amount','Fee','Net','Status'];
    const rows = earningsData.earnings_table.map(e => [
      e.date, e.guest, e.property, e.nights,
      e.amount, e.fee, e.net, e.status
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings_${earningsPeriod}.csv`;
    a.click();
  };

  // Calendar Helpers
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysCount = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    
    const days = [];
    // Prev month padding
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, date: null });
    }
    // Current month days
    for (let i = 1; i <= daysCount; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, date: dateStr });
    }
    return days;
  }, [currentMonth]);

  const filteredBookings = useMemo(() => {
    return selectedListingFilter === 'all'
      ? bookings
      : bookings.filter(b => b.property_id === selectedListingFilter);
  }, [bookings, selectedListingFilter]);

  const getBookingsByDate = (dateStr) => {
    return filteredBookings.filter(b => {
      const start = b.check_in;
      const end = b.check_out;
      return dateStr >= start && dateStr < end;
    });
  };

  const isDateBlocked = (dateStr) => blockedDates.includes(dateStr);

  // Render Helpers
  const renderSidebar = () => {
    const avgRating = overviewData?.avg_rating || 4.8;
    
    return (
      <aside style={{
        width: '260px',
        flexShrink: 0,
        height: '100%',
        overflowY: 'auto',
        backgroundColor: 'white',
        borderRight: '1px solid #EAECF0',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 12px',
      }}>
        {/* Host Profile Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          marginBottom: '8px',
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
          borderRadius: '16px',
          border: '1px solid #FED7AA',
        }}>
          <div style={{
            width: '48px', height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #EA580C, #F97316)',
            color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '800', fontSize: '20px',
            boxShadow: '0 0 0 3px white, 0 0 0 5px #EA580C',
            flexShrink: 0,
          }}>
            {user.firstName?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || 'H'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ 
              fontWeight: '800', fontSize: '14px',
              color: '#111827', margin: '0 0 2px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' 
            }}>
              {user.firstName || user.name || 'Host'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ display: 'flex' }}>
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={10} 
                    fill={s <= Math.round(avgRating) ? '#F59E0B' : '#E5E7EB'}
                    color={s <= Math.round(avgRating) ? '#F59E0B' : '#E5E7EB'}
                  />
                ))}
              </div>
              <span style={{ fontSize: '11px', color: '#EA580C', fontWeight: '700' }}>
                Superhost
              </span>
            </div>
          </div>
        </div>

        <p style={{ 
          fontSize: '10px', fontWeight: '700', color: '#9CA3AF',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          padding: '8px 12px 4px', marginTop: '8px' 
        }}>
          MAIN MENU
        </p>

        <nav style={{ flex: 1 }}>
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
            const isActive = activeSection === id;
            const badge = id === 'notifications' ? unreadCount : 0;
            
            return (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  backgroundColor: isActive ? '#FFF7ED' : 'transparent',
                  color: isActive ? '#EA580C' : '#6B7280',
                  fontWeight: isActive ? '700' : '500',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  fontSize: '14px',
                  marginBottom: '2px',
                  transition: 'all 0.15s ease',
                  borderLeft: isActive ? '3px solid #EA580C' : '3px solid transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px',
                    borderRadius: '8px',
                    backgroundColor: isActive ? '#FFF7ED' : '#F9FAFB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={16} color={isActive ? '#EA580C' : '#9CA3AF'} />
                  </div>
                  {label}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {badge > 0 && (
                    <span style={{
                      backgroundColor: '#EA580C', color: 'white',
                      borderRadius: '999px', padding: '1px 7px',
                      fontSize: '11px', fontWeight: '800',
                      minWidth: '20px', textAlign: 'center',
                    }}>
                      {badge}
                    </span>
                  )}
                  {isActive && <ChevronRight size={14} color="#EA580C" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
          <div style={{ height: '1px', backgroundColor: '#F3F4F6', margin: '12px 0' }} />
          <button
            onClick={() => navigate('/become-a-host')}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '13px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
              transition: 'all 0.2s',
            }}
          >
            <Plus size={16} />
            Add New Listing
          </button>
        </div>
      </aside>
    );
  };

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight italic">Good morning, {user.firstName || 'Host'} 👋</h1>
        <p className="text-gray-500 font-medium">Here's what's happening with your listings today.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Earnings', value: `₹${overviewData?.total_earnings?.toLocaleString() || 0}`, period: 'This month', icon: DollarSign, color: 'bg-orange-50 text-orange-600' },
          { label: 'Upcoming Bookings', value: overviewData?.upcoming_count || 0, period: 'Next arrivals', icon: Clock, color: 'bg-blue-50 text-blue-600' },
          { label: 'Occupancy Rate', value: `${overviewData?.occupancy_rate || 0}%`, period: 'Last 30 days', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Avg Rating', value: overviewData?.avg_rating || 0, period: `${overviewData?.total_reviews || 0} reviews`, icon: Star, color: 'bg-amber-50 text-amber-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
            <div className="text-xs font-black uppercase tracking-widest text-gray-400">{stat.label}</div>
            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-[10px] font-bold text-emerald-600">
               <span>{stat.period}</span>
               <ArrowUpRight size={14} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-orange-600">
                   <BarChart2 size={20} />
                </div>
                <h3 className="font-black text-xl italic tracking-tight">Monthly Earnings Trend</h3>
             </div>
             <button onClick={() => setActiveSection('earnings')} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-orange-600 transition-colors">View Report</button>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewData?.monthly_earnings || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 700}} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#F9FAFB'}}
                  formatter={(v) => `₹${v.toLocaleString()}`}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="earnings" fill="#EA580C" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
           <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-blue-600">
                   <Bell size={20} />
                </div>
                <h3 className="font-black text-xl italic tracking-tight">Recent Alerts</h3>
           </div>
           <div className="space-y-6">
              {(notifications.slice(0, 5)).map((notif, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                   <div className="w-10 h-10 bg-orange-50 rounded-xl flex-shrink-0 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                      <Bell size={18} />
                   </div>
                   <div className="flex-1 border-b border-gray-50 pb-4">
                      <div className="font-bold text-sm text-gray-900 mb-1">{notif.title}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{notif.created_at}</div>
                   </div>
                   {!notif.is_read && <div className="w-2 h-2 bg-orange-600 rounded-full mt-2" />}
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-gray-400 text-sm font-medium text-center py-10 italic">No recent alerts</p>
              )}
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
         <div className="p-8 border-b border-gray-50 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-emerald-600">
                   <CalendarIcon size={20} />
                </div>
                <h3 className="font-black text-xl italic tracking-tight">Upcoming Arrivals</h3>
             </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-gray-50/50">
                     <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Guest</th>
                     <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Listing ID</th>
                     <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Check-in / Out</th>
                     <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Payout</th>
                     <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {(overviewData?.upcoming_bookings_list || []).map((booking, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors text-sm">
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-black text-xs">
                                {booking.guest_name?.[0] || 'G'}
                             </div>
                             <div className="font-bold text-gray-900">{booking.guest_name || 'Guest'}</div>
                          </div>
                       </td>
                       <td className="px-8 py-5 text-gray-500 font-bold uppercase text-[11px] truncate max-w-[120px]">{booking.property_id}</td>
                       <td className="px-8 py-5">
                          <div className="font-bold text-gray-900">{booking.check_in}</div>
                          <div className="text-[10px] font-black text-gray-400 uppercase">{booking.check_out}</div>
                       </td>
                       <td className="px-8 py-5 font-black text-gray-900">₹{booking.total_price?.toLocaleString()}</td>
                       <td className="px-8 py-5 text-right">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                             {booking.status === 'confirmed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                             {booking.status}
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );

  const renderListings = () => (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ 
          fontSize: '28px', fontWeight: '800',
          color: '#111827', margin: '0 0 4px',
          fontStyle: 'italic' 
        }}>
          My Listings
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: '14px', margin: 0 }}>
          {listings.length} live unit{listings.length !== 1 ? 's' : ''} being managed.
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        backgroundColor: '#F3F4F6',
        padding: '4px',
        borderRadius: '12px',
        width: 'fit-content',
        marginBottom: '24px'
      }}>
        {['All', 'Approved', 'Pending'].map(f => (
          <button key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '7px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: filter === f ? 'white' : 'transparent',
              color: filter === f ? '#EA580C' : '#6B7280',
              fontWeight: filter === f ? '700' : '500',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: filter === f ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {(listings || []).filter(l => filter === 'All' || l.status === filter.toLowerCase()).map((listing, i) => (
          <div key={listing.id || listing._id} style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            border: '1px solid #F3F4F6',
            overflow: 'hidden',
            display: 'flex',
            marginBottom: '16px',
            boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
            transition: 'box-shadow 0.2s, transform 0.2s',
            cursor: 'pointer',
          }}>
            {/* Image */}
            <div style={{ width: '220px', flexShrink: 0, position: 'relative', height: '160px' }}>
              <img 
                src={listing.images?.[0] || listing.image || '/placeholder.jpg'}
                alt={listing.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600&h=400&text=${encodeURIComponent(listing.title || 'Property')}`;
                }}
              />
              <span style={{
                position: 'absolute', top: '12px', left: '12px',
                padding: '5px 12px', borderRadius: '999px',
                fontSize: '11px', fontWeight: '800',
                display: 'flex', alignItems: 'center', gap: '5px',
                backgroundColor: listing.status === 'approved' ? '#DCFCE7' : '#FEF9C3',
                color: listing.status === 'approved' ? '#16A34A' : '#B45309',
                backdropFilter: 'blur(4px)',
              }}>
                {listing.status === 'approved' ? <CheckCircle size={12} /> : <Clock size={12} />}
                {listing.status?.toUpperCase()}
              </span>
              {listing.type && (
                <span style={{
                  position: 'absolute', top: '12px', right: '12px',
                  padding: '5px 12px', borderRadius: '999px',
                  fontSize: '9px', fontWeight: '900',
                  backgroundColor: 'rgba(0,0,0,0.6)', color: 'white',
                  backdropFilter: 'blur(4px)', textTransform: 'uppercase'
                }}>
                  {listing.type}
                </span>
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ fontWeight: '800', fontSize: '18px', color: '#111827', margin: '0 0 4px' }}>
                    {listing.title || (listing.type === 'buddy' ? `Travel Buddy: ${listing.city}` : 'Untitled Listing')}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#EA580C', fontSize: '13px', fontWeight: '600' }}>
                    <MapPin size={13} />
                    {listing.city}{listing.state ? `, ${listing.state}` : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '22px', fontWeight: '800', color: '#EA580C', margin: '0 0 2px' }}>
                    ₹{(listing.price_per_night || listing.daily_rate || listing.price || 0).toLocaleString()}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>per {listing.type === 'buddy' ? 'day' : 'night'}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
                {[
                  { icon: Eye, value: listing.views || 0, label: 'Views' },
                  { icon: Star, value: listing.rating || '4.8', label: 'Rating', color: '#F59E0B' },
                ].map(({ icon: Icon, value, label, color }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon size={15} color={color || '#9CA3AF'} fill={color ? color : 'none'} />
                    <span style={{ fontWeight: '700', fontSize: '14px', color: color || '#374151' }}>{value}</span>
                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{label}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    navigate(`/host/listings/${listing.id || listing._id}/edit`); 
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '9px 18px', borderRadius: '10px',
                    border: '1.5px solid #E5E7EB',
                    backgroundColor: 'white', color: '#374151',
                    fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                  }}>
                  <Edit size={14} /> Edit
                </button>

                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    handleToggleListing(listing.id || listing._id); 
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '9px 18px', borderRadius: '10px',
                    border: `1.5px solid ${listing.is_active ? '#BBF7D0' : '#E5E7EB'}`,
                    backgroundColor: listing.is_active ? '#F0FDF4' : '#F9FAFB',
                    color: listing.is_active ? '#16A34A' : '#6B7280',
                    fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                  }}>
                  {listing.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  {listing.is_active ? 'Active' : 'Inactive'}
                </button>

                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    // handleDelete(listing.id || listing._id); 
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '9px 14px', borderRadius: '10px',
                    border: '1.5px solid #FEE2E2',
                    backgroundColor: '#FEF2F2', color: '#DC2626',
                    fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                    marginLeft: 'auto',
                  }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCalendar = () => {
    const currentMonthStr = currentMonth.toLocaleString('default', { month: 'long' });
    const currentYear = currentMonth.getFullYear();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', paddingBottom: '80px' }}>
        <div>
          {/* Calendar Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px',
            backgroundColor: 'white', padding: '16px 20px', borderRadius: '16px',
            border: '1px solid #F3F4F6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: 0, fontStyle: 'italic', minWidth: '160px' }}>
              {currentMonthStr} {currentYear}
            </h2>
            
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => setCurrentMonth(new Date(currentYear, currentMonth.getMonth() - 1, 1))} style={{
                width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #E5E7EB', backgroundColor: 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setCurrentMonth(new Date())} style={{
                padding: '8px 16px', borderRadius: '999px', border: '1px solid #E5E7EB', backgroundColor: 'white',
                cursor: 'pointer', fontWeight: '600', fontSize: '13px', color: '#374151',
              }}>
                Today
              </button>
              <button onClick={() => setCurrentMonth(new Date(currentYear, currentMonth.getMonth() + 1, 1))} style={{
                width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #E5E7EB', backgroundColor: 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ChevronRight size={16} />
              </button>
            </div>

            <div style={{ marginLeft: 'auto', position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '9px 16px', borderRadius: '12px',
                  border: '1.5px solid #E5E7EB',
                  backgroundColor: 'white', cursor: 'pointer',
                  fontWeight: '600', fontSize: '13px', color: '#374151',
                  minWidth: '200px', justifyContent: 'space-between',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={15} color="#EA580C" />
                  {selectedListingFilter === 'all' 
                    ? 'All Listings' 
                    : listings.find(l => (l.id || l._id) === selectedListingFilter)?.title 
                      || 'All Listings'}
                </div>
                <ChevronDown size={15} color="#9CA3AF"
                  style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s' }} />
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                  backgroundColor: 'white', borderRadius: '14px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  zIndex: 100, minWidth: '220px',
                  overflow: 'hidden', padding: '6px',
                }}>
                  <button
                    onClick={() => { setSelectedListingFilter('all'); setDropdownOpen(false); }}
                    style={{
                      width: '100%', padding: '10px 14px',
                      borderRadius: '8px', border: 'none',
                      backgroundColor: selectedListingFilter === 'all' ? '#FFF7ED' : 'transparent',
                      color: selectedListingFilter === 'all' ? '#EA580C' : '#374151',
                      fontWeight: selectedListingFilter === 'all' ? '700' : '500',
                      fontSize: '13px', cursor: 'pointer',
                      textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px',
                    }}
                  >
                    {selectedListingFilter === 'all' && <Check size={14} />}
                    🌐 All Listings
                  </button>

                  {listings.map(listing => (
                    <button
                      key={listing.id || listing._id}
                      onClick={() => { setSelectedListingFilter(listing.id || listing._id); setDropdownOpen(false); }}
                      style={{
                        width: '100%', padding: '10px 14px',
                        borderRadius: '8px', border: 'none',
                        backgroundColor: selectedListingFilter === (listing.id || listing._id) ? '#FFF7ED' : 'transparent',
                        color: selectedListingFilter === (listing.id || listing._id) ? '#EA580C' : '#374151',
                        fontWeight: selectedListingFilter === (listing.id || listing._id) ? '700' : '500',
                        fontSize: '13px', cursor: 'pointer',
                        textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}
                    >
                      {selectedListingFilter === (listing.id || listing._id) && <Check size={14} />}
                      🏠 {listing.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {[
              { color: '#16A34A', bg: '#DCFCE7', label: 'Confirmed' },
              { color: '#CA8A04', bg: '#FEF9C3', label: 'Pending' },
              { color: '#9CA3AF', bg: '#F3F4F6', label: 'Blocked' },
            ].map(({ color, bg, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: bg, borderLeft: `3px solid ${color}` }} />
                <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div style={{ backgroundColor: 'white', borderRadius: '20px', border: '1px solid #F3F4F6', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {weekDays.map(day => (
                <div key={day} style={{
                  textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#9CA3AF',
                  textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 0', borderBottom: '1px solid #F3F4F6',
                }}>
                  {day}
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {calendarDays.map((item, idx) => {
                const dateStr = item.date;
                const isCurrentMonth = item.day !== null;
                const dateBookings = isCurrentMonth ? getBookingsByDate(dateStr) : [];
                const blocked = isCurrentMonth ? isDateBlocked(dateStr) : false;
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                const isSelected = dateStr === selectedDate.toISOString().split('T')[0];

                return (
                  <div key={idx} 
                    onClick={() => dateStr && setSelectedDate(new Date(dateStr))}
                    style={{
                      minHeight: '110px', borderRight: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6',
                      padding: '8px', backgroundColor: isToday ? '#FFF7ED' : isSelected ? '#FFFBF5' : 'white',
                      cursor: dateStr ? 'pointer' : 'default', transition: 'background-color 0.15s',
                      verticalAlign: 'top', position: 'relative',
                    }}
                  >
                    {isCurrentMonth && (
                      <>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: '28px', height: '28px', borderRadius: '50%',
                          backgroundColor: isToday ? '#EA580C' : 'transparent',
                          color: isToday ? 'white' : isCurrentMonth ? '#111827' : '#D1D5DB',
                          fontWeight: isToday ? '800' : '500', fontSize: '13px', marginBottom: '8px',
                        }}>
                          {item.day}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          {dateBookings.map((b, i) => (
                            <div key={i} style={{
                              backgroundColor: b.status === 'confirmed' ? '#DCFCE7' : '#FEF9C3',
                              color: b.status === 'confirmed' ? '#15803D' : '#854D0E',
                              padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600',
                              marginBottom: '2px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap', borderLeft: `3px solid ${b.status === 'confirmed' ? '#16A34A' : '#CA8A04'}`,
                            }}>
                              {b.guest_name}
                            </div>
                          ))}
                          {blocked && (
                            <div style={{
                              backgroundColor: '#F3F4F6', color: '#6B7280', borderLeft: '3px solid #9CA3AF',
                              padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600',
                              display: 'block',
                            }}>
                              Blocked
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div>
          <div style={{
            backgroundColor: 'white', borderRadius: '20px', border: '1px solid #F3F4F6',
            padding: '24px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', position: 'sticky', top: '20px',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px',
              paddingBottom: '16px', borderBottom: '1px solid #F9FAFB'
            }}>
              <div style={{ backgroundColor: '#FFF7ED', borderRadius: '10px', padding: '8px' }}>
                <CalendarIcon size={18} color="#EA580C" />
              </div>
              <h3 style={{ fontWeight: '800', fontSize: '17px', color: '#111827', margin: 0 }}>
                {selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
              </h3>
            </div>

            <div style={{ gap: '12px', display: 'flex', flexDirection: 'column' }}>
               {(() => {
                 const selectedDateStr = selectedDate.toISOString().split('T')[0];
                 const dateBookings = filteredBookings.filter(b => {
                   const checkIn = b.check_in?.split('T')[0];
                   const checkOut = b.check_out?.split('T')[0];
                   return selectedDateStr >= checkIn && selectedDateStr < checkOut;
                 });
                 const isBlocked = blockedDates.some(d => {
                   const blockedStr = typeof d === 'string' ? d.split('T')[0] : d;
                   return blockedStr === selectedDateStr;
                 });

                 return (
                   <>
                     {/* Case 1: Has confirmed bookings */}
                     {dateBookings.filter(b => b.status === 'confirmed').map(b => (
                       <div key={b.id} style={{
                         backgroundColor: '#F0FDF4', borderRadius: '12px',
                         padding: '14px', border: '1px solid #BBF7D0',
                       }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                           <CheckCircle size={16} color="#16A34A" />
                           <span style={{ fontWeight: '700', color: '#16A34A', fontSize: '13px' }}>Confirmed Booking</span>
                         </div>
                         <p style={{ fontWeight: '600', fontSize: '14px', margin: '0 0 4px', color: '#111827' }}>{b.guest_name}</p>
                         <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 4px' }}>📅 {b.check_in} → {b.check_out}</p>
                         <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>💰 ₹{b.total_price?.toLocaleString()}</p>
                       </div>
                     ))}

                     {/* Case 2: Has pending bookings */}
                     {dateBookings.filter(b => b.status === 'pending').map(b => (
                       <div key={b.id} style={{
                         backgroundColor: '#FFFBEB', borderRadius: '12px',
                         padding: '14px', border: '1px solid #FDE68A',
                       }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                           <Clock size={16} color="#D97706" />
                           <span style={{ fontWeight: '700', color: '#D97706', fontSize: '13px' }}>Pending Approval</span>
                         </div>
                         <p style={{ fontWeight: '600', fontSize: '14px', margin: '0 0 8px', color: '#111827' }}>{b.guest_name}</p>
                         <div style={{ display: 'flex', gap: '8px' }}>
                           <button onClick={() => handleApproveBooking(b.id)}
                             style={{
                               flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                               backgroundColor: '#22C55E', color: 'white', fontWeight: '700', fontSize: '12px',
                               cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                             }}>
                             <Check size={13} /> Approve
                           </button>
                           <button onClick={() => handleDeclineBooking(b.id)}
                             style={{
                               flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                               backgroundColor: '#EF4444', color: 'white', fontWeight: '700', fontSize: '12px',
                               cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                             }}>
                             <X size={13} /> Decline
                           </button>
                         </div>
                       </div>
                     ))}

                     {/* Case 3: Blocked date */}
                     {isBlocked && dateBookings.length === 0 && (
                       <div style={{
                         backgroundColor: '#F3F4F6', borderRadius: '12px',
                         padding: '20px', textAlign: 'center', border: '1px solid #E5E7EB',
                       }}>
                         <Shield size={32} color="#9CA3AF" style={{ marginBottom: '8px' }} />
                         <p style={{ fontWeight: '700', color: '#374151', margin: '0 0 4px', fontSize: '15px' }}>Date is Blocked</p>
                         <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 16px' }}>This date is unavailable for bookings</p>
                         <button onClick={() => handleUnblockDate(selectedDateStr)}
                           style={{
                             width: '100%', padding: '10px', borderRadius: '10px',
                             border: '1.5px solid #E5E7EB', backgroundColor: 'white',
                             color: '#374151', fontWeight: '700', fontSize: '13px',
                             cursor: 'pointer', display: 'flex', alignItems: 'center',
                             justifyContent: 'center', gap: '6px',
                           }}>
                           <X size={14} /> Unblock Date
                         </button>
                       </div>
                     )}

                     {/* Case 4: Available date */}
                     {!isBlocked && dateBookings.length === 0 && (
                       <div style={{ textAlign: 'center', padding: '12px 0' }}>
                         <div style={{
                           width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#F0FDF4',
                           display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                         }}>
                           <CheckCircle size={28} color="#22C55E" />
                         </div>
                         <p style={{ fontWeight: '700', color: '#111827', margin: '0 0 4px', fontSize: '15px' }}>Available Date</p>
                         <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 20px' }}>Open for new bookings</p>
                         <button onClick={() => handleBlockDate(selectedDateStr)}
                           style={{
                             width: '100%', padding: '11px', borderRadius: '10px',
                             border: '1.5px solid #E5E7EB', backgroundColor: 'white',
                             color: '#374151', fontWeight: '700', fontSize: '13px',
                             cursor: 'pointer', display: 'flex', alignItems: 'center',
                             justifyContent: 'center', gap: '6px', transition: 'all 0.15s',
                           }}>
                           <Shield size={14} /> Block This Date
                         </button>
                       </div>
                     )}
                   </>
                 );
               })()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMessages = () => (
    <div className="h-[calc(100vh-160px)] bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden flex animate-in fade-in duration-500">
       <div className="w-[350px] border-r border-gray-100">
          <ConversationList 
            userId={user.id || user._id}
            conversations={conversations}
            setConversations={setConversations}
            onSelect={setSelectedConv}
            selectedId={selectedConv?.conversation_id}
          />
       </div>
       <div className="flex-1 bg-gray-50/30">
          {selectedConv ? (
            <ChatWindow conv={selectedConv} currentUserId={user.id || user._id} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
               <div className="w-24 h-24 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-center text-gray-300 mb-6">
                  <MessageCircle size={48} />
               </div>
               <h3 className="text-2xl font-black italic tracking-tight text-gray-900 mb-2">Select a Conversation</h3>
               <p className="text-gray-500 font-medium max-w-xs">Connecting with your guests is the first step to a great hosting experience.</p>
            </div>
          )}
       </div>
    </div>
  );

  const renderEarnings = () => {
    const gross = earningsData?.gross || 0;
    const fee = earningsData?.fee || 0;
    const net = earningsData?.net || 0;
    const pending = earningsData?.pending || 0;

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight italic mb-2">Revenue & Growth</h2>
            <p className="text-gray-500 font-medium">Track your financial performance and global scale.</p>
          </div>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-500 hover:text-orange-600 transition-all shadow-sm"
          >
            <Download size={18} /> Export CSV
          </button>
        </header>

        <div className="flex gap-4 p-2 bg-white border border-gray-100 rounded-[2rem] w-fit shadow-sm">
           {['Day', 'Week', 'Month', 'Year'].map(p => (
             <button
               key={p}
               onClick={() => setEarningsPeriod(p.toLowerCase())}
               className={`px-8 py-2.5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${
                 earningsPeriod === p.toLowerCase() ? "bg-orange-50 text-orange-600 shadow-sm" : "text-gray-400 hover:text-gray-600 font-bold"
               }`}
             >
               {p}
             </button>
           ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Gross Payouts</div>
              <div className="text-3xl font-black text-gray-900">₹{gross.toLocaleString()}</div>
           </div>
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">TravelBNB Fee (10%)</div>
              <div className="text-3xl font-black text-red-500">-₹{fee.toLocaleString()}</div>
           </div>
           <div className="bg-orange-600 p-8 rounded-[2.5rem] shadow-xl shadow-orange-500/20 text-white">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Net Revenue</div>
              <div className="text-3xl font-black">₹{net.toLocaleString()}</div>
           </div>
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Pending Escrow</div>
              <div className="text-3xl font-black text-emerald-600">₹{pending.toLocaleString()}</div>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-sm">
           <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-orange-600">
                 <TrendingUp size={20} />
              </div>
              <h3 className="font-black text-xl italic tracking-tight">Financial Timeline</h3>
           </div>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={earningsData?.monthly_trend || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 700}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 700}} tickFormatter={(v) => `₹${v/1000}k`} />
                    <Tooltip cursor={{stroke: '#EA580C', strokeWidth: 2}} formatter={(v) => `₹${v.toLocaleString()}`} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Line type="monotone" dataKey="earnings" stroke="#EA580C" strokeWidth={4} dot={{r: 6, fill: '#EA580C', strokeWidth: 3, stroke: '#fff'}} activeDot={{r: 8}} />
                 </LineChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden pb-10">
           <div className="p-8 border-b border-gray-50">
               <h3 className="font-black text-xl italic tracking-tight">Detailed Transactions</h3>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50/50">
                       <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                       <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Guest / Unit</th>
                       <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Gross</th>
                       <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Fee</th>
                       <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Net</th>
                       <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {(earningsData?.earnings_table || []).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors text-sm">
                         <td className="px-8 py-5 text-gray-500 font-bold">{row.date}</td>
                         <td className="px-8 py-5">
                            <div className="font-black text-gray-900">{row.guest}</div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[100px]">{row.property}</div>
                         </td>
                         <td className="px-8 py-5 font-bold text-gray-900">₹{row.amount?.toLocaleString()}</td>
                         <td className="px-8 py-5 text-red-500 font-bold">-₹{row.fee?.toLocaleString()}</td>
                         <td className="px-8 py-5 font-black text-emerald-600">₹{row.net?.toLocaleString()}</td>
                         <td className="px-8 py-5 text-right">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-200 shadow-sm">
                               {row.status}
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    );
  };

  const renderReviews = () => {
    const avg = ratingStats?.avg_rating || '0.0';
    const total = ratingStats?.total_reviews || 0;
    const distribution = ratingStats?.distribution || {5:0, 4:0, 3:0, 2:0, 1:0};

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight italic">Global Feedback</h2>
          <p className="text-gray-500 font-medium">Monitoring your reputation and guest experiences.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex items-center gap-12">
              <div className="text-center">
                 <div className="text-7xl font-black text-orange-600 mb-2 italic">{avg}</div>
                 <div className="flex justify-center text-orange-400 mb-2">
                    {[1,2,3,4,5].map(s => <Star key={s} size={20} fill={s <= Math.floor(avg) ? "currentColor" : "none"} strokeWidth={3} />)}
                 </div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">{total} Verified Reviews</div>
              </div>
              <div className="flex-1 space-y-3">
                 {[5, 4, 3, 2, 1].map(s => (
                   <div key={s} className="flex items-center gap-4">
                      <span className="text-xs font-black text-gray-400 w-6 italic">{s}★</span>
                      <div className="flex-1 h-2 bg-gray-50 rounded-full overflow-hidden">
                         <div className="h-full bg-orange-600 rounded-full" style={{ width: `${distribution[s]}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-gray-400 w-8">{distribution[s]}%</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm grid grid-cols-2 gap-8">
              {[
                { label: 'Cleanliness', val: ratingStats.cleanliness || 4.8 }, { label: 'Location', val: ratingStats.location || 4.8 },
                { label: 'Communication', val: ratingStats.communication || 4.8 }, { label: 'Value', val: ratingStats.value || 4.8 }
              ].map((c, i) => (
                <div key={i}>
                   <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{c.label}</span>
                      <span className="text-sm font-black text-gray-900">{c.val}</span>
                   </div>
                   <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(c.val/5)*100}%` }} />
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-6">
           {reviews.map((review, i) => (
             <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:translate-y-[-4px] transition-all">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-black text-gray-600 text-lg uppercase">
                         {review.reviewer_name?.[0] || 'G'}
                      </div>
                      <div>
                         <h4 className="font-black text-gray-900">{review.reviewer_name || 'Anonymous Guest'}</h4>
                         <div className="flex text-orange-400">
                             {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= review.rating ? "currentColor" : "none"} strokeWidth={3} />)}
                         </div>
                      </div>
                   </div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic font-bold">{review.created_at}</div>
                </div>
                <p className="text-gray-600 font-medium leading-relaxed mb-6 italic text-lg pr-12">"{review.comment}"</p>
                
                {review.host_reply ? (
                   <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 shadow-inner">
                      <div className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-2 font-bold">Your Response:</div>
                      <p className="text-orange-900 font-bold leading-relaxed">{review.host_reply}</p>
                   </div>
                ) : (
                   <div className="flex items-center gap-4">
                      <input 
                        id={`reply-${review.id}`}
                        placeholder="Type your official response..." 
                        className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-orange-500/20 shadow-inner outline-none"
                      />
                      <button 
                        onClick={async () => {
                          const reply = document.getElementById(`reply-${review.id}`).value;
                          if (!reply) return toast.error("Please enter a reply");
                          try {
                            await API.post(`/host/reviews/${review.id}/reply`, { reply });
                            toast.success("Reply submitted");
                            fetchData('reviews');
                          } catch (err) {
                            toast.error("Failed to submit reply");
                          }
                        }}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                      >
                         Publish
                      </button>
                   </div>
                )}
             </div>
           ))}
           {reviews.length === 0 && (
             <div className="p-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                <Star size={48} className="mx-auto text-gray-200 mb-4" />
                <h3 className="text-xl font-black italic text-gray-900">No feedback yet</h3>
                <p className="text-gray-400 font-medium">Ratings will appear here once guests complete their stays.</p>
             </div>
           )}
        </div>
      </div>
    );
  };

  const renderNotifications = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
       <header className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight italic">Operations Log</h2>
            <p className="text-gray-500 font-medium">Monitoring your latest hosting events.</p>
          </div>
          <button className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 px-6 py-3 rounded-xl transition-all shadow-sm">
             <Check size={18} /> Mark all as read
          </button>
       </header>

       <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
             {notifications.length === 0 ? (
               <div className="p-32 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300 mx-auto mb-6">
                     <Bell size={36} />
                  </div>
                  <h3 className="text-xl font-black italic text-gray-900">No events found</h3>
                  <p className="text-gray-400 font-medium">We'll alert you here when new actions are required.</p>
               </div>
             ) : (
               notifications.map((n, i) => (
                 <div key={i} className={`p-8 hover:bg-gray-50/50 cursor-pointer transition-colors flex items-center gap-6 ${!n.is_read ? 'bg-orange-50/30' : ''}`}>
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                       <MessageCircle size={24} />
                    </div>
                    <div className="flex-1">
                       <h4 className={`text-base font-black italic mb-1 ${!n.is_read ? 'text-gray-900' : 'text-gray-500 font-bold'}`}>{n.title}</h4>
                       <p className="text-sm font-medium text-gray-400">{n.description}</p>
                       <div className="text-[10px] font-black uppercase text-gray-300 mt-2 tracking-widest font-bold">{n.created_at}</div>
                    </div>
                    {!n.is_read && <div className="w-2.5 h-2.5 bg-orange-600 rounded-full shadow-lg shadow-orange-600/30" />}
                 </div>
               ))
             )}
          </div>
       </div>
    </div>
  );

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      backgroundColor: '#F8F9FA',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 50,
      paddingTop: '64px',
    }}>
      {renderSidebar()}
      
      <main style={{
        flex: 1,
        height: '100%',
        overflowY: 'auto',
        padding: '32px 40px',
        scrollBehavior: 'smooth',
      }}>
         <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeSection === 'overview' && renderOverview()}
              {activeSection === 'listings' && renderListings()}
              {activeSection === 'calendar' && renderCalendar()}
              {activeSection === 'messages' && renderMessages()}
              {activeSection === 'earnings' && renderEarnings()}
              {activeSection === 'reviews' && renderReviews()}
              {activeSection === 'notifications' && renderNotifications()}
            </motion.div>
         </AnimatePresence>
      </main>
    </div>
  );
}
