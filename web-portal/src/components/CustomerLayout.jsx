import React, { useContext, useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, MapPin, Clock, CalendarClock, CreditCard, Wallet, Bell, User, Settings, HelpCircle, LogOut, Menu, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import styles from './PortalLayout.module.css';

const CustomerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, logout } = useContext(AuthContext);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (user.role !== 'customer') {
        navigate(`/${user.role}/dashboard`);
      }
    }
  }, [user, loading, navigate]);
  
  const navItems = [
    { type: 'link', name: 'Dashboard', path: '/customer/dashboard', icon: Home },
    { type: 'link', name: 'Book a Ride', path: '/customer/book', icon: MapPin },
    { type: 'link', name: 'My Rides', path: '/customer/history', icon: Clock },
    
    { type: 'header', name: 'SERVICES' },
    { type: 'link', name: 'Passes', path: '/customer/passes', icon: CreditCard },
    { type: 'link', name: 'Notifications', path: '/customer/notifications', icon: Bell },
    
    { type: 'header', name: 'ACCOUNT' },
    { type: 'link', name: 'Settings', path: '/customer/settings', icon: Settings },
    { type: 'link', name: 'Help & Support', path: '/customer/support', icon: HelpCircle },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U';
  const displayName = user?.name || 'User';

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={styles.layoutContainer}>
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div 
          className={styles.backdrop} 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brandPill}>
            <img src="/logo.png" alt="Forge India Connect" className={styles.brandLogo} />
            FORGE INDIA CONNECT
          </div>
        </div>
        
        <nav className={styles.sidebarNav}>
          {navItems.map((item, idx) => {
            if (item.type === 'header') {
              return (
                <div key={`header-${idx}`} className={styles.navSectionHeader}>
                  {item.name}
                </div>
              );
            }
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
        
        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.topHeader}>
          <div className={styles.headerTitleContainer}>
            <button 
              className={styles.mobileMenuBtn}
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className={styles.headerTitle}>
              {location.pathname === '/customer/passes' ? 'Manage Pass' : (navItems.find(i => i.path === location.pathname)?.name || 'Portal')}
            </div>
            {location.pathname === '/customer/passes' && (
              <div className={styles.headerSubtitle} style={{ fontSize: '14px', color: '#6B7280', fontWeight: '400', marginTop: '2px' }}>
                View and manage your mobility pass
              </div>
            )}
          </div>
          <div className={styles.headerProfile}>
            <div className={styles.avatar}>{initials}</div>
            <span>{displayName}</span>
          </div>
        </header>
        
        <div className={styles.contentArea}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CustomerLayout;
