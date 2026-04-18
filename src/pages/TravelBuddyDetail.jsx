import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import { 
  ArrowLeft, Heart, Share2, MapPin, Calendar, 
  Users, IndianRupee, CheckCircle2, Star, 
  Shield, Clock, MessageSquare, ShieldCheck,
  ChevronRight, Info, AlertCircle, Loader2,
  Sparkles, Zap, Phone, Send, LayoutDashboard
} from "lucide-react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

// ─── UTILITIES ───────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return "TBD";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Flexible";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const calculateDuration = (start, end) => {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1;
  const diffTime = Math.abs(e - s);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

const Tag = ({ children, icon: Icon }) => (
  <motion.span 
    whileHover={{ y: -2 }}
    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider border border-transparent hover:border-orange-500/30 transition-all cursor-default"
  >
    {Icon && <Icon size={14} className="text-orange-500" />}
    {children}
  </motion.span>
);

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-8 relative">
    <div className="flex items-center gap-3 mb-1">
      <div className="w-1.5 h-8 bg-orange-500 rounded-full" />
      <h2 className="text-3xl font-black text-[#1a1a2e] dark:text-white uppercase tracking-tighter italic">
        {title}
      </h2>
    </div>
    {subtitle && <p className="text-gray-500 font-medium ml-4 tracking-tight">{subtitle}</p>}
  </div>
);

const StatCard = ({ icon: Icon, label, value, color = "orange" }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-gray-50 dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 transition-all group"
  >
    <div className="bg-white dark:bg-black w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform">
      <Icon className={`text-${color}-500`} size={24} />
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-black text-[#1a1a2e] dark:text-white italic tracking-tighter">{value}</p>
    </div>
  </motion.div>
);

const GalleryGrid = ({ images }) => {
  if (!images || images.length === 0) return null;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-black/5">
      <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden">
        <img 
          src={images[0]} 
          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" 
          alt="Adventure" 
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all" />
      </div>
      {images.slice(1, 5).map((img, i) => (
        <div key={i} className="relative group overflow-hidden h-40 md:h-auto">
          <img 
            src={img} 
            className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" 
            alt={`Highlight ${i}`} 
          />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all" />
        </div>
      ))}
    </div>
  );
};

const HostCard = ({ host }) => {
  const getInitials = (name) => {
    if (!name) return "TB";
    return name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
      <SectionHeader title="Trusted Host" />
      <div className="flex items-center gap-6 mb-8">
        <div className="relative w-20 h-20 shrink-0">
          {host?.avatar ? (
            <img src={host.avatar} className="w-full h-full rounded-2xl object-cover shadow-xl" alt={host.name} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#2d3a5c] rounded-2xl flex items-center justify-center text-2xl font-black text-white italic">
              {getInitials(host?.name)}
            </div>
          )}
          {host?.user_verified && (
            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full border-4 border-white dark:border-gray-900 shadow-lg">
              <ShieldCheck size={16} strokeWidth={3} />
            </div>
          )}
        </div>
        <div>
          <h3 className="text-2xl font-black text-[#1a1a2e] dark:text-white italic tracking-tighter leading-none mb-2">
            {host?.name || "Explorer"}
          </h3>
          <div className="flex items-center gap-4 text-gray-500 font-bold">
            <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded-lg">
               <Star size={12} className="text-orange-500 fill-orange-500" />
               <span className="text-xs text-orange-600">4.9 Rating</span>
            </div>
            <span className="text-xs uppercase tracking-widest">{host?.trips || 12} TRIPS</span>
          </div>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-6">
        "{host?.bio || "I'm a passionate traveler who loves discovering hidden gems. Join me for an unforgettable experience!"}"
      </p>
      <div className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-[0.2em] border-t border-gray-50 dark:border-gray-800 pt-6">
        <Clock size={16} className="text-orange-500" />
        Responds within a few hours
      </div>
    </div>
  );
};

const JoinCard = ({ trip, spotsLeft, isJoined, onJoin, joining, navigate }) => {
  const [phone, setPhone] = useState("");
  const targetBuddies = trip.group_size || 1;
  const progress = targetBuddies > 0 ? ((targetBuddies - spotsLeft) / targetBuddies) * 100 : 0;

  return (
    <div className="sticky top-32 space-y-6">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 p-10 shadow-2xl shadow-orange-500/5 overflow-hidden relative group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -z-0" />
        
        <div className="relative z-10">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 underline decoration-orange-500/30 underline-offset-4">Estimated Budget</p>
              <h2 className="text-5xl font-black text-[#1a1a2e] dark:text-white italic tracking-tighter leading-none">
                ₹{Number(trip.budget || 0).toLocaleString('en-IN')}
              </h2>
            </div>
          </div>

          <div className="space-y-6 mb-10">
            <div className="p-6 bg-gray-50 dark:bg-gray-950 rounded-3xl border border-gray-50 dark:border-gray-800 group-hover:bg-orange-50/20 transition-all">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={14} className="text-orange-500" /> Squad Spots Left
                </span>
                <span className="text-xl font-black text-orange-500 italic leading-none">{spotsLeft} Open</span>
              </div>
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                />
              </div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-4 text-center">🔥 ONLY {spotsLeft} SPOTS LEFT - JOIN THE ADVENTURE!</p>
            </div>

            {spotsLeft === 0 ? (
              <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-[2rem] text-center border border-gray-200 dark:border-gray-700">
                <div className="w-14 h-14 bg-gray-400 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users size={28} strokeWidth={3} />
                </div>
                <h4 className="text-xl font-black text-gray-700 dark:text-gray-300 italic mb-2">Squad Full</h4>
                <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-relaxed">
                  All spots have been claimed for this adventure. Try messaging the host directly or explore other trips!
                </p>
              </div>
            ) : !isJoined ? (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-950 px-6 py-4 rounded-2xl border border-transparent focus-within:border-orange-500 focus-within:bg-white dark:focus-within:bg-gray-800 transition-all">
                    <Phone size={18} className="text-gray-400" />
                    <span className="text-sm font-black text-gray-500">+91</span>
                    <input 
                      type="tel" 
                      placeholder="10-digit Mobile" 
                      value={phone}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(digitsOnly);
                      }}
                      maxLength={10}
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      className="bg-transparent outline-none font-bold text-gray-900 dark:text-white w-full"
                    />
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onJoin(phone)}
                    disabled={joining}
                    className="w-full bg-orange-500 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.25em] text-xs shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
                  >
                    {joining ? <Loader2 className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                    {joining ? "Sending Request..." : "Join This Trip"}
                  </motion.button>
                  <div className="flex items-center gap-4 px-4">
                     <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                     <span className="text-[10px] font-black text-gray-300 uppercase italic">OR</span>
                     <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    onClick={async () => {
                      const currentUserId = Cookies.get("userId");
                      if (!currentUserId) {
                        toast.error("Please login to message the host");
                        navigate("/login");
                        return;
                      }

                      const tripId = trip?._id || trip?.id;
                      const hostId = trip?.user_id || trip?.host?._id || trip?.host?.id;
                      const hostName = trip?.name || trip?.host?.name || "Host";

                      if (!hostId) {
                        toast.error("Could not identify the host of this trip");
                        return;
                      }

                      if (String(hostId) === String(currentUserId)) {
                        toast.error("You cannot message yourself");
                        return;
                      }

                      try {
                        const messageText = `Hi! I'm interested in joining your trip to ${trip.destination} from ${formatDate(trip.start_date)} to ${formatDate(trip.end_date)}. Looks like an amazing adventure! 🌍`;

                        await API.post('/messages/send', {
                          sender_id: String(currentUserId),
                          recipient_id: String(hostId),
                          message: messageText,
                          property_id: String(tripId),
                          property_name: `Trip to ${trip.destination}`,
                        });

                        toast.success("Message sent! Redirecting...");
                        setTimeout(() => {
                          navigate(`/messages?host=${hostId}&property_id=${tripId}&property_name=${encodeURIComponent(`Trip to ${trip.destination}`)}&hostName=${encodeURIComponent(hostName)}`);
                        }, 800);
                      } catch (err) {
                        console.error("Failed to send message", err);
                        toast.error(err.response?.data?.detail || "Failed to send message");
                      }
                    }}
                    className="w-full bg-[#1a1a2e] dark:bg-white text-white dark:text-gray-900 py-5 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 shadow-lg transition-all"
                  >
                    <MessageSquare size={18} /> Message {(trip.host?.name || trip.name || "Host").split(" ")[0].toUpperCase()}
                  </motion.button>
                </div>
              </>
            ) : (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-green-50 dark:bg-green-900/30 p-8 rounded-[3rem] text-center border border-green-100 dark:border-green-800"
              >
                <div className="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle2 size={32} strokeWidth={3} />
                </div>
                <h4 className="text-xl font-black text-green-700 dark:text-green-400 italic mb-2">Request Sent!</h4>
                <p className="text-[10px] font-black text-green-600 dark:text-green-500 uppercase tracking-widest leading-relaxed">The host will review your squad request shortly. Stay tuned!</p>
              </motion.div>
            )}
          </div>

          <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-950 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800">
            <Shield size={20} className="text-green-500 shrink-0 mt-1" />
            <div>
              <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tight mb-0.5 italic">Community Trust Protected</p>
              <p className="text-[9px] text-gray-500 font-medium leading-relaxed uppercase tracking-tighter">Never send money outside of TravelBNB. Verified squads ensure member safety.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const HeroSection = ({ trip }) => {
  const navigate = useNavigate();
  return (
    <div className="relative h-[65vh] md:h-[75vh] w-full overflow-hidden">
      <div className="absolute inset-0 bg-black/40 z-10" />
      <div className="absolute inset-0 z-0">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src={trip.cover_image || trip.images?.[0] || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"} 
          className="w-full h-full object-cover" 
          alt={trip.destination} 
        />
      </div>
      
      <div className="absolute top-0 left-0 right-0 z-50 p-8 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)} 
            className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white shadow-2xl"
          >
            <ArrowLeft size={24} strokeWidth={3} />
          </motion.button>
          
          {useLocation().state?.fromDashboard && (
            <motion.button 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              onClick={() => navigate("/host/dashboard")}
              className="hidden md:flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-all shadow-2xl"
            >
              <LayoutDashboard size={18} /> Back to Dashboard
            </motion.button>
          )}
        </div>
        <div className="flex gap-4">
           <button className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white shadow-2xl hover:bg-orange-500 transition-all"><Heart size={24} /></button>
           <button className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white shadow-2xl hover:bg-orange-500 transition-all"><Share2 size={24} /></button>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 p-8 md:p-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="max-w-7xl mx-auto flex flex-col items-start gap-4">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-2 px-6 py-2 bg-orange-500 rounded-full text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-orange-500/20"
          >
            <Sparkles size={14} className="animate-pulse" />
            {trip.travel_style || "ADVENTURE"} TRIP
          </motion.div>
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-7xl md:text-9xl font-black text-white uppercase italic tracking-tighter leading-[0.85] drop-shadow-2xl"
          >
            {trip.destination}
          </motion.h1>
          <motion.div 
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="flex items-center gap-6 mt-4"
          >
             <div className="flex items-center gap-2 text-white/90 font-black italic md:text-2xl tracking-tight">
                <MapPin size={24} className="text-orange-500" /> {trip.state || "Explore India"}
             </div>
             <div className="flex items-center gap-2 text-white/90 font-black italic md:text-2xl tracking-tight">
                <Calendar size={24} className="text-orange-500" /> {formatDate(trip.start_date)}
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

const TravelBuddyDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  const [data, setData] = useState(location.state?.trip || null);
  const [loading, setLoading] = useState(!location.state?.trip);
  const [isJoined, setIsJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  // Data Normalization (Mapping Fixes)
  const trip = useMemo(() => {
    if (!data) return null;
    return {
      ...data,
      gender_preference: data.gender_preference || data.gender || "Any",
      group_size: data.group_size || data.looking_for || 1,
      activities: data.interests || data.activities || [],
      duration: calculateDuration(data.start_date, data.end_date)
    };
  }, [data]);

  useEffect(() => {
    if (!id) return;

    const fetchTrip = async () => {
      // Only show loading spinner if we have no data at all
      if (!data) setLoading(true);
      try {
        const res = await API.get(`/travel-buddies/${id}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch trip", err);
        if (!data) toast.error("Could not load trip details.");
        // If we already had stale data from location.state, keep showing it silently
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);  // Removed `data` from deps — we want this to fire ONCE on mount, not loop

  const handleJoin = async (phone) => {
    if (!phone || phone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    setJoining(true);
    try {
      await API.post(`/travel-buddies/${trip?._id || trip?.id}/request`, { phone });
      setIsJoined(true);
      toast.success("Squad request sent!");
    } catch (err) {
      console.error("Join failed", err);
      toast.error(err.response?.data?.detail || "Failed to send join request.");
    } finally {
      setJoining(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
      <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic animate-pulse">Syncing Tribe Data...</p>
    </div>
  );

  if (!trip) return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 bg-orange-100 rounded-[2rem] flex items-center justify-center text-orange-500 mb-8"><AlertCircle size={40} /></div>
      <h2 className="text-4xl font-black text-[#1a1a2e] uppercase italic tracking-tighter mb-4">Adventure Not Found</h2>
      <p className="text-gray-500 font-bold mb-10 max-w-sm">This trip might have been archived or filled up already.</p>
      <button onClick={() => navigate("/travel-buddy")} className="bg-[#1a1a2e] text-white px-10 py-5 rounded-full font-black uppercase text-xs tracking-widest shadow-xl">Back to Discovery</button>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] dark:bg-gray-950 min-h-screen font-sans">
      <HeroSection trip={trip} />

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-24">
            
            {/* Quick Stats */}
            <section>
              <SectionHeader title="Quick Stats" subtitle="Trip fundamentals at a glance" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatCard icon={Clock} label="Duration" value={`${trip.duration} Days`} />
                <StatCard icon={Users} label="Group Size" value={`${trip.group_size} Peers`} />
                <StatCard icon={IndianRupee} label="Avg Budget" value={`₹${Number(trip.budget).toLocaleString('en-IN')}`} />
                <StatCard icon={Shield} label="Gender Preferred" value={trip.gender_preference} />
              </div>
            </section>

            {/* Dates & Story */}
            <section className="bg-white dark:bg-gray-900 p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 border-b border-gray-50 dark:border-gray-800 pb-12">
                   <div>
                      <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4">Departure</p>
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400"><Calendar size={28} /></div>
                         <p className="text-3xl font-black text-[#1a1a2e] dark:text-white italic tracking-tighter uppercase leading-none">{formatDate(trip.start_date)}</p>
                      </div>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4">Final Return</p>
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400"><Calendar size={28} /></div>
                         <p className="text-3xl font-black text-[#1a1a2e] dark:text-white italic tracking-tighter uppercase leading-none">{formatDate(trip.end_date)}</p>
                      </div>
                   </div>
               </div>
               
               <SectionHeader title="What's The Plan?" />
               <p className="text-2xl text-gray-700 dark:text-gray-300 font-bold leading-relaxed italic tracking-tight whitespace-pre-wrap mb-10">
                 {trip.description}
               </p>

               <div className="flex items-center gap-4 p-6 bg-orange-50/50 dark:bg-orange-950/20 rounded-3xl border border-orange-100 dark:border-orange-900/30">
                  <div className="p-3 bg-orange-500 text-white rounded-2xl"><MapPin size={24} strokeWidth={3} /></div>
                  <div>
                    <h4 className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">Meeting Strategy</h4>
                    <p className="text-lg font-black text-[#1a1a2e] dark:text-white italic tracking-tighter">{trip.meeting_point || "To be shared via secure chat"}</p>
                  </div>
               </div>
            </section>

            {/* Visual Highlights */}
            {trip.images?.length > 0 && (
              <section>
                <SectionHeader title="Visual Story" subtitle="Glimpses into the destination and plan" />
                <GalleryGrid images={trip.images} />
              </section>
            )}

            {/* Activities/Interests */}
            <section>
              <SectionHeader title="Trip Vibe" subtitle="Activities and interests for this journey" />
              <div className="flex flex-wrap gap-3">
                {trip.activities.length > 0 ? (
                  trip.activities.map((tag, i) => (
                    <Tag key={i} icon={Sparkles}>{tag}</Tag>
                  ))
                ) : (
                  <p className="text-gray-400 italic">No specific activities listed yet.</p>
                )}
              </div>
            </section>

            {/* Profile */}
            <section className="pb-12">
               <HostCard host={trip.host || trip} />
            </section>

          </div>

          <div className="lg:col-span-1">
             <JoinCard 
               trip={trip} 
               spotsLeft={typeof trip.spots_left === 'number' ? trip.spots_left : (trip.group_size || 3)} 
               isJoined={isJoined} 
               onJoin={handleJoin} 
               joining={joining}
               navigate={navigate}
             />
          </div>
        </div>
      </main>

      {/* Floating Action Bar (Mobile only) */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 inset-x-0 z-[100] bg-white/80 dark:bg-[#1a1a2e]/80 backdrop-blur-2xl border-t border-gray-100 dark:border-gray-800 p-6 md:hidden flex items-center justify-between shadow-[0_-20px_40px_rgba(0,0,0,0.1)]"
        >
          <div className="flex flex-col">
             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Est. Budget</span>
             <span className="text-2xl font-black text-orange-600 italic leading-none">₹{Number(trip.budget || 0).toLocaleString('en-IN')}</span>
          </div>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-500/30"
          >
            Join This Trip
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TravelBuddyDetail;
