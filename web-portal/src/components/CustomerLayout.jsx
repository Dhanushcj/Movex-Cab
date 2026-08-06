import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, MapPin, Clock, User, LogOut } from 'lucide-react';
import styles from './PortalLayout.module.css';

const CustomerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/customer/dashboard', icon: Home },
    { name: 'Book a Ride', path: '/customer/book', icon: MapPin },
    { name: 'My Rides', path: '/customer/history', icon: Clock },
    { name: 'Profile', path: '/customer/profile', icon: User },
  ];

  const handleLogout = () => {
    // Perform logout logic here
    navigate('/');
  };

  return (
    <div className={styles.layoutContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>MoveX Customer</h2>
        </div>
        
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
        
        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.topHeader}>
          <div className={styles.headerTitle}>
            {navItems.find(i => i.path === location.pathname)?.name || 'Portal'}
          </div>
          <div className={styles.headerProfile}>
            <div className={styles.avatar}>JD</div>
            <span>John Doe</span>
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
