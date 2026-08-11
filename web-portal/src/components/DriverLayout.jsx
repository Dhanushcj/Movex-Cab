import React, { useContext, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Navigation, LifeBuoy, FileText, User, LogOut, History, Settings, Bell } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import styles from './PortalLayout.module.css';

const DriverLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, logout } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  const navItems = [
    { name: 'Dashboard', path: '/driver/dashboard', icon: Home },
    { name: 'Active Trip', path: '/driver/trip', icon: Navigation },
    { name: 'Trip History', path: '/driver/history', icon: History },
    { name: 'Support', path: '/driver/support', icon: LifeBuoy },
    { name: 'Documents', path: '/driver/documents', icon: FileText },
    { name: 'Profile', path: '/driver/profile', icon: User },
    { name: 'Settings', path: '/driver/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.layoutContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brandPill}>
            <img src="/forge-logo.png" alt="Logo" className={styles.brandLogo} onError={(e) => e.target.style.display='none'} />
            FORGE INDIA CONNECT
          </div>
        </div>
        
        <nav className={styles.sidebarNav}>
          <div className={styles.navSectionHeader}>DRIVER PORTAL</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
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
          <div className={styles.headerTitle}>
            Driver Dashboard
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
            <button style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'}}>
              <Bell size={20} />
            </button>
            <div className={styles.headerProfile}>
              <div className={styles.avatar}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
              </div>
              <div style={{display: 'flex', flexDirection: 'column', textAlign: 'left', paddingRight: '8px'}}>
                <span style={{fontSize: '13px', lineHeight: '1.2', fontWeight: '700', color: 'var(--text-primary)'}}>{user?.name || 'Driver'}</span>
                <span style={{fontSize: '11px', lineHeight: '1.2', color: 'var(--text-muted)'}}>{user?.vehicle?.number || 'TN 00 XX 0000'}</span>
              </div>
            </div>
          </div>
        </header>
        
        <div className={styles.contentArea}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DriverLayout;
