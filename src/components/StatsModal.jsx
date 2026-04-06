import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import API from '../services/api';

function StatsModal({ listing, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!listing) return;
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/host/stats/${listing.id || listing._id}`);
        setStats(res.data);
      } catch (err) {
        console.error("Stats error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [listing]);

  if (!listing) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-white/20 animate-in zoom-in-95 duration-300"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-8 border-b border-gray-100 dark:border-gray-800 z-10 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-1 bg-orange-600 rounded-full" />
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Performance Insights</span>
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic leading-none mb-2">
              Listing Stats
            </h2>
            <p className="text-gray-500 font-bold text-sm">
              {listing.title}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl text-gray-500 transition-all active:scale-90"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Analyzing metrics...</p>
            </div>
          ) : (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: 'Total Views', value: stats?.views || 0, icon: '👁️', color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
                  { label: 'Bookings', value: stats?.total_bookings || 0, icon: '📅', color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
                  { label: 'Revenue', value: `₹${stats?.total_revenue || 0}`, icon: '💰', color: 'bg-orange-50 text-orange-600', border: 'border-orange-100' },
                  { label: 'Avg Rating', value: stats?.avg_rating || 'N/A', icon: '⭐', color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
                ].map(({ label, value, icon, color, border }) => (
                  <div key={label} className={`${color} ${border} border rounded-[1.5rem] p-5 transition-transform hover:scale-[1.02]`}>
                    <div className="text-2xl mb-3">{icon}</div>
                    <div className="text-2xl font-black tracking-tight mb-1">{value}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</div>
                  </div>
                ))}
              </div>

              {/* Booking Breakdown */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] p-6 mb-6 border border-gray-100 dark:border-gray-800">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                    <span className="w-1 h-4 bg-orange-500 rounded-full" />
                    Booking Status Breakdown
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Confirmed', value: stats?.confirmed_bookings || 0, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Pending', value: stats?.pending_bookings || 0, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Approved', value: stats?.approved_bookings || 0, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Rejected', value: stats?.rejected_bookings || 0, color: 'text-red-500', bg: 'bg-red-500/10' },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} className="flex items-center justify-between group">
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{label}</span>
                      <div className="flex items-center gap-3">
                          <div className={`w-24 h-1.5 ${bg} rounded-full overflow-hidden hidden sm:block`}>
                              <div 
                                className={`h-full ${bg.replace('/10', '')} rounded-full`} 
                                style={{ width: `${stats?.total_bookings ? (value / stats.total_bookings) * 100 : 0}%` }} 
                              />
                          </div>
                        <span className={`text-sm font-black ${color}`}>{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[1.5rem] p-6 text-center">
                  <div className="text-3xl font-black text-orange-600 mb-1">{stats?.occupancy_rate || 0}%</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Monthly Occupancy</div>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[1.5rem] p-6 text-center">
                  <div className="text-3xl font-black text-orange-600 mb-1">{stats?.total_reviews || 0}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Reviews</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default StatsModal;
