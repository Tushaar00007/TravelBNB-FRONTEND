import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useHost } from "../context/HostContext";
import Cookies from "js-cookie";
import API from "../services/api";
import { Home, Sparkles, ConciergeBell, Menu, Globe, MessageSquare, Heart, Briefcase, User, Settings, HelpCircle, LogOut, LayoutDashboard, Plane, Tent, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import VerificationBanner from "../features/auth/components/VerificationBanner";

function Navbar() {
    const { t } = useTranslation();
    const [openMenu, setOpenMenu] = useState(false);
    const [initials, setInitials] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isEmailVerified, setIsEmailVerified] = useState(true);
    const [userEmail, setUserEmail] = useState("");
    const userId = Cookies.get("userId");
    const location = useLocation();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const { isHost: contextIsHost, hostingMode, toggleHostingMode, refreshHostStatus } = useHost();
    const [currentUser, setCurrentUser] = useState(null);

    const isHost = currentUser?.is_host === true || 
                   currentUser?.role === 'host' || 
                   currentUser?.role === 'super_admin' || 
                   currentUser?.role === 'admin' || 
                   contextIsHost;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const storedUser = JSON.parse(
                    localStorage.getItem('user') || 
                    sessionStorage.getItem('user') || 
                    '{}'
                );
                
                const currentUserId = userId || storedUser?.id || storedUser?._id;
                
                if (!currentUserId) {
                    console.warn("No userId found in storage");
                    return;
                }
                
                console.log("Fetching user:", currentUserId);
                const res = await API.get(`/auth/user/${currentUserId}`);
                
                const resUser = res.data;
                const name = resUser.name || "";
                const letters = name
                    .trim()
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                setInitials(letters);
                setProfilePicture(resUser.avatar || resUser.profile_image || resUser.profile_picture || null);
                setUserRole(resUser.role || "guest");
                setIsEmailVerified(resUser.is_email_verified ?? true);
                setUserEmail(resUser.email || "");

                // Update is_host in stored user and state
                const updatedUser = { ...storedUser, ...resUser };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setCurrentUser(updatedUser);

                // Sync with HostContext if needed
                if (refreshHostStatus) refreshHostStatus();
                
            } catch (err) {
                console.error("fetchUser error:", err.response?.data || err.message);
                setInitials("U");
                setProfilePicture(null);
                setUserRole("guest");
            }
        };

        fetchUser();
    }, [userId]); // Removed refreshHostStatus to prevent dependency loop if it's not stable

    return (
        <header className="sticky top-0 z-[60] w-full transition-all duration-300">
            {userId && !isEmailVerified && (
                <VerificationBanner userEmail={userEmail} />
            )}
            <div className={`flex justify-between items-center px-10 py-2.5 transition-all duration-300
                ${scrolled 
                    ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm py-2" 
                    : "bg-[#FAFDF9] dark:bg-gray-900"
                }`}>
                {/* LEFT LOGO */}
                <Link to="/" className="text-3xl font-black text-orange-600 tracking-tighter flex items-center hover:opacity-90 transition-opacity">
                    <span className="text-gray-900 dark:text-white">Travel</span>BNB
                </Link>

                {/* CENTER MENU */}
                <div className="flex gap-8 text-gray-500 font-medium transition-colors">
                    <Link to="/" className={`flex items-center gap-1.5 transition-all duration-200 py-2 border-b-2 ${location.pathname === '/' ? 'text-gray-900 border-[#FF5A5F] font-bold' : 'border-transparent hover:text-orange-600'}`}>
                        {t("home")}
                    </Link>
                    <Link to="/ai-planner" className={`flex items-center gap-1.5 transition-all duration-200 py-2 border-b-2 ${location.pathname === '/ai-planner' ? 'text-gray-900 border-[#FF5A5F] font-bold' : 'border-transparent hover:text-orange-600'}`}>
                        <Sparkles size={16} /> {t("ai_planner")}
                    </Link>
                    <Link to="/crashpads" className={`flex items-center gap-1.5 transition-all duration-200 py-2 border-b-2 ${location.pathname === '/crashpads' ? 'text-gray-900 border-[#FF5A5F] font-bold' : 'border-transparent hover:text-orange-600'}`}>
                        <Tent size={16} /> Crashpads
                    </Link>
                    <Link to="/travel-buddy" className={`flex items-center gap-1.5 transition-all duration-200 py-2 border-b-2 ${location.pathname === '/travel-buddy' ? 'text-gray-900 border-[#FF5A5F] font-bold' : 'border-transparent hover:text-orange-600'}`}>
                        <Users size={16} /> Travel Buddy
                    </Link>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex items-center gap-6 relative">
                    <div className="flex border border-gray-300 dark:border-gray-600 rounded-full p-1 items-center gap-2 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-gray-800">
                        {userId && isHost && (
                            <div 
                                onClick={(e) => { e.stopPropagation(); toggleHostingMode(); navigate(hostingMode ? "/" : "/host/dashboard"); }}
                                className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-full relative w-32 h-8 group overflow-hidden border border-gray-200 dark:border-gray-700"
                            >
                                <div className={`absolute top-1 bottom-1 w-1/2 bg-orange-600 rounded-full transition-all duration-500 shadow-lg ${hostingMode ? 'left-[46%]' : 'left-1'}`} />
                                <span className={`flex-1 text-[8px] font-black uppercase tracking-widest text-center relative z-10 transition-colors duration-500 ${!hostingMode ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`}>Explore</span>
                                <span className={`flex-1 text-[8px] font-black uppercase tracking-widest text-center relative z-10 transition-colors duration-500 ${hostingMode ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`}>Host</span>
                            </div>
                        )}

                        <button onClick={() => setOpenMenu(!openMenu)} className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <Menu size={18} className="text-gray-600 dark:text-gray-300 ml-1" />
                            {userId ? (
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-amber-800 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden">
                                    {profilePicture ? <img src={profilePicture} alt="User Avatar" className="w-full h-full object-cover" /> : initials || "U"}
                                </div>
                            ) : (
                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                                    <User size={16} />
                                </div>
                            )}
                        </button>
                    </div>

                    {openMenu && (
                        <div className="absolute right-0 top-14 bg-white dark:bg-gray-900 shadow-2xl rounded-2xl w-72 py-2 text-sm z-[100] border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 overflow-hidden">
                            {!userId ? (
                                <>
                                    <Link to="/signup" onClick={() => setOpenMenu(false)} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-colors">
                                        <User size={18} className="text-gray-400 shrink-0" /> {t("signup")}
                                    </Link>
                                    <Link to="/login" onClick={() => setOpenMenu(false)} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <LogOut size={18} className="text-gray-400 shrink-0" /> {t("login")}
                                    </Link>
                                    <hr className="my-1.5 border-gray-100 dark:border-gray-700" />
                                    <Link to="/become-a-host" onClick={() => setOpenMenu(false)} className="flex items-start justify-between gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <div>
                                            <p className="font-semibold">{t("become_host")}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">It's easy to start hosting and earn extra income.</p>
                                        </div>
                                        <ConciergeBell size={20} className="text-orange-500 shrink-0 mt-0.5" />
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/bookings" onClick={() => setOpenMenu(false)} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <Briefcase size={18} className="text-gray-400 shrink-0" /> {t("my_bookings")}
                                    </Link>
                                    <Link to="/trips" onClick={() => setOpenMenu(false)} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <Plane size={18} className="text-gray-400 shrink-0" /> My Trips
                                    </Link>
                                    <Link to="/messages" onClick={() => setOpenMenu(false)} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <MessageSquare size={18} className="text-gray-400 shrink-0" /> Messages
                                    </Link>
                                    <Link to="/crashpads" onClick={() => setOpenMenu(false)} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <Tent size={18} className="text-gray-400 shrink-0" /> Crashpads
                                    </Link>
                                    <Link to="/travel-buddy" onClick={() => setOpenMenu(false)} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <Users size={18} className="text-gray-400 shrink-0" /> Travel Buddy
                                    </Link>
                                    <Link to="/profile" onClick={() => setOpenMenu(false)} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <User size={18} className="text-gray-400 shrink-0" /> {t("profile")}
                                    </Link>
                                    <hr className="my-1.5 border-gray-100 dark:border-gray-700" />
                                    {isHost && (
                                        <button 
                                            onClick={() => { toggleHostingMode(); navigate(hostingMode ? "/" : "/host/dashboard"); setOpenMenu(false); }} 
                                            className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors group"
                                        >
                                            <LayoutDashboard size={18} className="text-orange-500 shrink-0 group-hover:scale-110 transition-transform" />
                                            <span className="font-bold text-orange-600">
                                                {hostingMode ? "Switch to Explorer Mode" : "Switch to Hosting Mode"}
                                            </span>
                                        </button>
                                    )}
                                    <Link to="/profile" onClick={() => setOpenMenu(false)} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <Settings size={18} className="text-gray-400 shrink-0" /> Account settings
                                    </Link>
                                    <Link to="/profile" onClick={() => setOpenMenu(false)} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <Globe size={18} className="text-gray-400 shrink-0" /> Languages &amp; currency
                                    </Link>
                                    <hr className="my-1.5 border-gray-100 dark:border-gray-700" />
                                    <Link to="/become-a-host" onClick={() => setOpenMenu(false)} className="flex items-start justify-between gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <div>
                                            <p className="font-semibold">{t("become_host")}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">It's easy to start hosting and earn extra income.</p>
                                        </div>
                                        <ConciergeBell size={20} className="text-orange-500 shrink-0 mt-0.5" />
                                    </Link>
                                    <hr className="my-1.5 border-gray-100 dark:border-gray-700" />
                                    <p onClick={() => { Cookies.remove("userId"); window.location.reload(); }} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors text-red-600 font-bold">
                                        <LogOut size={18} /> {t("logout")}
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;