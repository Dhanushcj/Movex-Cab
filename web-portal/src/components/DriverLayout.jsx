import React, { useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Navigation, LifeBuoy, FileText, User, LogOut } from 'lucide-react';
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
    { name: 'Support', path: '/driver/support', icon: LifeBuoy },
    { name: 'Documents', path: '/driver/documents', icon: FileText },
    { name: 'Profile', path: '/driver/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.layoutContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>MoveX Driver</h2>
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
            <div className={styles.statusDot}></div>
            <span>Online</span>
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
