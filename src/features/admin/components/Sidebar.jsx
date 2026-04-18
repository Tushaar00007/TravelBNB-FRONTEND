import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  X, Menu, ChevronRight, LogOut,
  LayoutDashboard, Users, Home, CalendarCheck, Tag, ScrollText, 
  ShieldCheck, UserPlus, Globe, CreditCard, AlertTriangle, 
  LifeBuoy, Bell, BarChart3, CloudLightning, Upload, Send
} from 'lucide-react';

const Sidebar = ({ isOpen, setOpen, visibleNav, adminRole, admin }) => {
  
  const groups = [
    {
      title: 'Main',
      items: ['Dashboard', 'Analytics']
    },
    {
      title: 'Management',
      items: ['Users', 'Admin Management', 'Listings', 'Crashpads', 'Travel Buddy', 'Bulk Upload']
    },
    {
      title: 'Finance',
      items: ['Bookings', 'Payments', 'Coupons']
    },
    {
      title: 'Communication',
      items: ['Email Campaigns', 'Notifications', 'Support']
    },
    {
      title: 'System',
      items: ['Reports', 'Activity Logs', 'System Setup']
    }
  ];

  const adminName = admin?.name || 'Admin User';
  const adminEmail = admin?.email || 'admin@travelbnb.com';
  const initials = adminName.charAt(0).toUpperCase();

  const groupedNav = groups.map(group => ({
    ...group,
    items: visibleNav.filter(item => group.items.includes(item.label))
  })).filter(group => group.items.length > 0);

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-30
      flex flex-col bg-white border-r border-gray-100 
      transition-all duration-300 ease-in-out
      ${isOpen ? 'w-64' : 'w-20'}
      lg:static lg:translate-x-0
      ${!isOpen && '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Logo Section */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
            T
          </div>
          {isOpen && (
            <span className="text-lg font-bold">
              Travel<span className="text-orange-500">BNB</span>
            </span>
          )}
        </div>
        <button 
          onClick={() => setOpen(!isOpen)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
        {groupedNav.map((group, idx) => (
          <div key={idx} className="space-y-2">
            {isOpen && (
              <h4 className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                {group.title}
              </h4>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/admin"}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-orange-50 text-orange-600 shadow-sm' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <item.Icon size={20} className={`
                        shrink-0 transition-transform group-hover:scale-110 
                        ${isActive ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-900'}
                      `} />
                      {isOpen && (
                        <>
                          <span className="text-sm font-semibold flex-1">{item.label}</span>
                          <ChevronRight size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin Info Section */}
      <div className="p-4 border-t border-gray-50">
        <div className={`
          bg-gray-50 rounded-2xl p-3 flex items-center gap-3 transition-all
          ${!isOpen && 'justify-center'}
        `}>
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold shrink-0">
            {initials}
          </div>
          {isOpen && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{adminName}</p>
              <p className="text-[10px] text-gray-500 font-medium truncate uppercase tracking-tight">
                {adminRole?.replace('_', ' ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
