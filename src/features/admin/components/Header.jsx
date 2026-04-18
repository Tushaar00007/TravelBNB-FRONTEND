import React, { useState } from 'react';
import { Bell, Search, ChevronDown, User, Settings, LogOut } from 'lucide-react';

const Header = ({ title, subtitle, adminRole, onLogout, admin }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const roleLabels = {
    super_admin: 'SUPER ADMIN',
    sub_admin: 'SUB ADMIN',
    admin: 'ADMIN',
  };

  const adminName = admin?.name || 'Admin User';
  const adminEmail = admin?.email || 'admin@travelbnb.com';
  const initials = adminName.charAt(0).toUpperCase();

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl focus-within:ring-2 focus-within:ring-orange-100 transition-all">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search analytics..." 
            className="bg-transparent border-none outline-none text-sm text-gray-600 placeholder:text-gray-400 w-64"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1 pr-3 rounded-2xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white font-bold shadow-md">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-gray-900 leading-none">{adminName}</p>
              <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider">
                {roleLabels[adminRole] || 'ADMIN'}
              </span>
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-gray-50">
                <p className="text-sm font-bold text-gray-900 truncate">{adminName}</p>
                <p className="text-xs font-medium text-gray-400 truncate">{adminEmail}</p>
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <User size={16} />
                Profile Settings
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <Settings size={16} />
                System Preferences
              </button>
              <div className="my-1 border-t border-gray-50"></div>
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
