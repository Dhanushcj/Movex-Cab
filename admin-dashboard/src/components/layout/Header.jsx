import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, LogOut, User, UserPlus, AlertCircle, FileWarning } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const Header = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await API.get('/admin/alerts');
        if (res.data && res.data.success) {
          setAlerts(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch alerts', err);
      }
    };
    fetchAlerts();
    // Refresh alerts every minute
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.reload();
  };

  const getAlertIcon = (iconName, color) => {
    const props = { className: `w-4 h-4 text-${color}-400` };
    if (iconName === 'UserPlus') return <UserPlus {...props} />;
    if (iconName === 'AlertCircle') return <AlertCircle {...props} />;
    if (iconName === 'FileWarning') return <FileWarning {...props} />;
    return <Bell {...props} />;
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
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 rounded-lg hover:bg-black/5 transition-colors"
          >
            <div className="relative">
              <Bell className="w-5 h-5 text-[var(--text-muted)]" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 border-2 border-white bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm z-10">
                  {alerts.length}
                </span>
              )}
            </div>
          </button>

          {/* Dropdown Panel */}
          {showDropdown && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-[var(--border-glass)] overflow-hidden z-50">
              <div className="p-4 border-b border-[var(--border-glass)] bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">System Alerts</h3>
                <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">{alerts.length} New</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500">
                    No new alerts at this time.
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div 
                      key={alert.id}
                      onClick={() => {
                        setShowDropdown(false);
                        navigate(alert.link);
                      }}
                      className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3"
                    >
                      <div className={`mt-1 p-2 bg-${alert.color}-50 rounded-full h-fit`}>
                        {getAlertIcon(alert.icon, alert.color)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800">{alert.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{alert.description}</p>
                        <span className="text-[10px] text-gray-400 mt-1 block font-medium">
                          {new Date(alert.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
