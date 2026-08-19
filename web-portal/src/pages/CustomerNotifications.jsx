import React, { useState, useEffect, useContext } from 'react';
import { 
  Bell, 
  Settings, 
  CheckCheck, 
  Car, 
  MapPin, 
  Ticket, 
  CreditCard, 
  Info,
  X,
  BellRing
} from 'lucide-react';
import styles from './CustomerNotifications.module.css';
import API from '../services/api';
import { SocketContext } from '../context/SocketContext';

const TABS = ['All', 'Rides', 'Passes', 'Payments', 'System'];

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.round(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHrs < 24) return `${diffHrs} hours ago`;
  if (diffDays === 1) return `1 day ago`;
  return `${diffDays} days ago`;
};

const getGroup = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return 'Earlier';
};

const CustomerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = React.useContext(SocketContext);

  React.useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await API.get('/public/notifications?targetAudience=customer');
        if (res.data.success) {
          const readNotifs = JSON.parse(localStorage.getItem('read_notifications') || '[]');
          const formatted = res.data.data.map(n => ({
            id: n._id,
            type: 'System', 
            title: n.title,
            desc: n.message,
            time: formatTime(n.createdAt),
            group: getGroup(n.createdAt),
            unread: !readNotifs.includes(n._id)
          }));
          setNotifications(formatted);
        }
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  React.useEffect(() => {
    if (!socket) return;
    const handleNewNotif = (notif) => {
      // Only process if it's for customer or both
      if (notif.targetAudience === 'customer' || notif.targetAudience === 'both') {
        setNotifications(prev => [{
          id: notif._id || Date.now(),
          type: 'System',
          title: notif.title,
          desc: notif.message,
          time: 'Just now',
          group: 'Today',
          unread: true
        }, ...prev]);
      }
    };
    socket.on('notification', handleNewNotif);
    socket.on('new_notification', handleNewNotif); // fallback event name
    return () => {
      socket.off('notification', handleNewNotif);
      socket.off('new_notification', handleNewNotif);
    };
  }, [socket]);

  const filteredNotifications = notifications.filter(
    (n) => activeTab === 'All' || n.type === activeTab
  );

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n.id);
    const existing = JSON.parse(localStorage.getItem('read_notifications') || '[]');
    const combined = Array.from(new Set([...existing, ...allIds]));
    localStorage.setItem('read_notifications', JSON.stringify(combined));
    
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (notif) => {
    // Mark as read when opened and save to local storage
    const existing = JSON.parse(localStorage.getItem('read_notifications') || '[]');
    if (!existing.includes(notif.id)) {
      existing.push(notif.id);
      localStorage.setItem('read_notifications', JSON.stringify(existing));
    }
    
    setNotifications(notifications.map(n => 
      n.id === notif.id ? { ...n, unread: false } : n
    ));
    setSelectedNotification(notif);
  };

  // Grouping logic for rendering
  const groupedNotifications = filteredNotifications.reduce((acc, notif) => {
    if (!acc[notif.group]) acc[notif.group] = [];
    acc[notif.group].push(notif);
    return acc;
  }, {});

  const renderIcon = (type) => {
    switch(type) {
      case 'Rides': return <Car size={24} />;
      case 'Passes': return <Ticket size={24} />;
      case 'Payments': return <CreditCard size={24} />;
      case 'System': return <Info size={24} />;
      default: return <Bell size={24} />;
    }
  };

  const getIconClass = (type) => {
    switch(type) {
      case 'Rides': return styles.iconRides;
      case 'Passes': return styles.iconPasses;
      case 'Payments': return styles.iconPayments;
      case 'System': return styles.iconSystem;
      default: return styles.iconSystem;
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Notifications</h1>
          <p className={styles.subtitle}>Stay updated with your rides, passes and account activity.</p>
        </div>
        <div className={styles.headerControls}>
          <button 
            className={`${styles.btnControl} ${styles.btnMarkRead}`} 
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck size={16} /> Mark all as read
          </button>
          <button className={styles.btnControl}>
            <Settings size={16} /> Settings
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tabBtn} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className={styles.notificationsList}>
          {['Today', 'Yesterday', 'Earlier'].map((group) => {
            if (!groupedNotifications[group] || groupedNotifications[group].length === 0) return null;
            return (
              <div key={group} className={styles.timeGroup}>
                <div className={styles.groupLabel}>{group}</div>
                {groupedNotifications[group].map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`${styles.notificationCard} ${notif.unread ? styles.unread : ''}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    {notif.unread && <div className={styles.unreadIndicator} />}
                    <div className={`${styles.iconWrapper} ${getIconClass(notif.type)}`}>
                      {renderIcon(notif.type)}
                    </div>
                    <div className={styles.contentWrapper}>
                      <div className={styles.cardHeader}>
                        <h3 className={styles.notifTitle}>{notif.title}</h3>
                        <span className={styles.notifTime}>{notif.time}</span>
                      </div>
                      <p className={styles.notifDesc}>{notif.desc}</p>
                    </div>
                    {notif.unread && <div className={styles.unreadDot} />}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrapper}>
            <BellRing size={32} />
          </div>
          <div>
            <h3 className={styles.emptyTitle}>No Notifications</h3>
            <p className={styles.emptyDesc}>You're all caught up! There are no new notifications for this category right now.</p>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedNotification && (
        <div className={styles.modalOverlay} onClick={() => setSelectedNotification(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Notification Details</h3>
              <button className={styles.modalClose} onClick={() => setSelectedNotification(null)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={`${styles.modalTypeBadge} ${styles[selectedNotification.type.toLowerCase()]}`}>
                {renderIcon(selectedNotification.type)} {selectedNotification.type}
              </div>
              <h2 className={styles.modalBodyTitle}>{selectedNotification.title}</h2>
              <p className={styles.modalBodyTime}>{selectedNotification.time} ({selectedNotification.group})</p>
              <div className={styles.modalBodyDesc}>
                {selectedNotification.desc}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerNotifications;
