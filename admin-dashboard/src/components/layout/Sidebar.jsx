import React from 'react';
import { NavLink } from 'react-router-dom';
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
  MapPin
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/drivers', name: 'Drivers', icon: ShieldCheck },
    { path: '/vehicles', name: 'Vehicles', icon: Car },
    { path: '/customers', name: 'Customers', icon: Users },
    { path: '/bookings', name: 'Bookings', icon: CalendarDays },
    { path: '/map', name: 'Live Map', icon: MapPin },
    { path: '/payments', name: 'Payments', icon: CreditCard },
    { path: '/payouts', name: 'Driver Payouts', icon: DollarSign },
    { path: '/fares', name: 'Fares & Pricing', icon: Tag },
    { path: '/banners', name: 'Ad Banners', icon: LayoutDashboard },
    { path: '/notifications', name: 'Notifications', icon: AlertTriangle },
    { path: '/complaints', name: 'Complaints', icon: AlertTriangle },
    { path: '/settings', name: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 glass-card h-screen fixed left-0 top-0 rounded-none border-y-0 border-l-0 flex flex-col z-30">
      {/* Brand Logo */}
      <div className="p-6 border-b border-[var(--border-glass)] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent-color)] flex items-center justify-center shadow-lg shadow-[var(--accent-glow)]">
          <Car className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none tracking-tight">MoveX</h1>
          <span className="text-xs text-[var(--text-muted)] font-medium">Control Center</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
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
  );
};

export default Sidebar;
