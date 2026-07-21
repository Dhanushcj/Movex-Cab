import React from 'react';
import { Bell, Search, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.reload();
  };

  return (
    <header className="h-20 border-b border-[var(--border-glass)] px-8 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-20">
      {/* Search bar */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
        <input
          type="text"
          placeholder="Quick search bookings, users, drivers..."
          className="glass-input !pl-10 pr-4 py-2.5 w-full text-sm"
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-6">
        <button 
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg hover:bg-black/5 transition-colors"
        >
          <div className="relative">
            <Bell className="w-5 h-5 text-[var(--text-muted)]" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white bg-rose-500 rounded-full"></span>
          </div>
        </button>

        {/* User profile */}
        <div className="flex items-center gap-3 border-l border-[var(--border-glass)] pl-6">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent-glow)] border border-[var(--accent-color)]/20 flex items-center justify-center">
            <User className="w-5 h-5 text-[var(--accent-color)]" />
          </div>
          <div className="hidden md:block">
            <h4 className="text-sm font-semibold leading-tight">Admin Console</h4>
            <span className="text-xs text-[var(--accent-color)] font-medium">Root Access</span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 ml-4 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
