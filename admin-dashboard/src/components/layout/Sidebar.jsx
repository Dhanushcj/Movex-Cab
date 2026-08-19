import React from 'react';
import { NavLink } from 'react-router-dom';
import logoImage from '../../assets/Group 1686559028.png';
import {
  LayoutDashboard,
  Users,
  Car,
  CalendarDays,
  CreditCard,
  DollarSign,
  Tag,
  AlertTriangle,
  Settings,
  ShieldCheck,
  MapPin,
  Bell,
  Star,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
const menuItems = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/route-manager', name: 'Route Manager', icon: MapPin },
    { path: '/drivers', name: 'Driver Management', icon: ShieldCheck },
    { path: '/customers', name: 'Customers', icon: Users },
    { path: '/bookings', name: 'Bookings', icon: CalendarDays },
    { path: '/map', name: 'Live Map', icon: MapPin },
    { path: '/fares', name: 'Fares & Pricing', icon: Tag },
    { path: '/passes', name: 'Premium Passes', icon: Star },
    { path: '/reviews', name: 'Reviews', icon: Star },
    { path: '/banners', name: 'Ad Banners', icon: LayoutDashboard },
    { path: '/notifications', name: 'Notifications', icon: Bell },
    { path: '/complaints', name: 'Complaints', icon: AlertTriangle },
    { path: '/settings', name: 'Settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`w-64 glass-card h-screen fixed left-0 top-0 rounded-none border-y-0 border-l-0 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo */}
        <div className="p-6 border-b border-[var(--border-glass)] flex justify-between items-center lg:justify-center">
          <div className="flex items-center gap-2 bg-[var(--bg-soft-blue)] border-2 border-[var(--accent-color)] rounded-full px-3 py-1.5 font-bold text-[10.5px] text-[var(--accent-color)] tracking-wide whitespace-nowrap overflow-hidden">
            <img src={logoImage} alt="Logo" className="h-4 w-auto object-contain shrink-0" />
            <span className="truncate">FORGE INDIA CONNECT</span>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-soft-blue)] hover:text-[var(--accent-color)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => 
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-[var(--border-glass)] text-xs text-[var(--text-muted)] text-center font-medium">
          © 2026 MoveX. Version 1.0.0
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
