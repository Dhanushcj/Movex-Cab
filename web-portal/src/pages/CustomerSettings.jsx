import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import styles from './CustomerSettings.module.css';
import { 
  User, 
  Settings2, 
  Bell, 
  ShieldCheck, 
  CreditCard, 
  Car, 
  Palette, 
  AlertTriangle 
} from 'lucide-react';

const CustomerSettings = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');

  // Dummy state handlers for interactive feel
  const [notifications, setNotifications] = useState({
    rideUpdates: true,
    bookingConfirm: true,
    driverArrival: true,
    promo: false,
    email: true,
    sms: false
  });

  const [preferences, setPreferences] = useState({
    language: 'English',
    currency: 'INR',
    defaultVehicle: 'Auto',
    theme: 'system'
  });

  const categories = [
    { id: 'profile', name: 'Profile & Account', icon: User },
    { id: 'preferences', name: 'Preferences', icon: Settings2 },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy & Security', icon: ShieldCheck },
    { id: 'payments', name: 'Payment Settings', icon: CreditCard },
    { id: 'ride', name: 'Ride Preferences', icon: Car },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'danger', name: 'Danger Zone', icon: AlertTriangle },
  ];

  const handleToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const scrollToSection = (id) => {
    setActiveTab(id);
    const element = document.getElementById(`section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your account preferences and configurations.</p>
      </div>

      <div className={styles.layoutGrid}>
        
        {/* Left Sidebar */}
        <div className={styles.sidebar}>
          {categories.map(cat => (
            <button 
              key={cat.id}
              className={`${styles.navItem} ${activeTab === cat.id ? styles.active : ''}`}
              onClick={() => scrollToSection(cat.id)}
            >
              <cat.icon size={18} />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Right Content Area */}
        <div className={styles.contentArea}>
          
          {/* 1. Profile & Account */}
          <section id="section-profile" className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Profile & Account</h2>
              <p className={styles.cardDesc}>Update your personal information and contact details.</p>
            </div>
            
            <div className={styles.profileHeader}>
              <div className={styles.avatar}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className={styles.profileInfo}>
                <h3>{user?.name || 'User'}</h3>
                <p>{user?.email || 'user@example.com'}</p>
                <p style={{marginTop: '4px'}}>{user?.phone || '+91 9876543210'}</p>
              </div>
              <div style={{marginLeft: 'auto'}}>
                <button className={styles.btnEdit}>Edit Profile</button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Display Name</label>
              <input type="text" className={styles.input} defaultValue={user?.name || 'User'} />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <input type="email" className={styles.input} defaultValue={user?.email || 'user@example.com'} />
            </div>

            <div className={styles.cardActions}>
              <button className={styles.btnSave}>Save Changes</button>
            </div>
          </section>

          {/* 2. Preferences */}
          <section id="section-preferences" className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Preferences</h2>
              <p className={styles.cardDesc}>Customize your regional and default application settings.</p>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Language</label>
              <select className={styles.select} value={preferences.language} onChange={e => setPreferences({...preferences, language: e.target.value})}>
                <option>English</option>
                <option>Tamil</option>
                <option>Hindi</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Currency</label>
              <select className={styles.select} value={preferences.currency} onChange={e => setPreferences({...preferences, currency: e.target.value})}>
                <option>INR (₹)</option>
                <option>USD ($)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Saved Pickup Location</label>
              <input type="text" className={styles.input} placeholder="e.g. Home, Work" defaultValue="Chennai Central" />
            </div>

            <div className={styles.cardActions}>
              <button className={styles.btnSave}>Save Changes</button>
            </div>
          </section>

          {/* 3. Notifications */}
          <section id="section-notifications" className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Notifications</h2>
              <p className={styles.cardDesc}>Manage how and when you receive updates.</p>
            </div>

            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <div className={styles.toggleTitle}>Ride Updates</div>
                <div className={styles.toggleDesc}>Receive real-time tracking updates during a trip.</div>
              </div>
              <label className={styles.switch}>
                <input type="checkbox" checked={notifications.rideUpdates} onChange={() => handleToggle('rideUpdates')} />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <div className={styles.toggleTitle}>Booking Confirmations</div>
                <div className={styles.toggleDesc}>Get notified immediately when a ride is confirmed.</div>
              </div>
              <label className={styles.switch}>
                <input type="checkbox" checked={notifications.bookingConfirm} onChange={() => handleToggle('bookingConfirm')} />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <div className={styles.toggleTitle}>Promotional Offers</div>
                <div className={styles.toggleDesc}>Occasional offers, discounts, and pass upgrades.</div>
              </div>
              <label className={styles.switch}>
                <input type="checkbox" checked={notifications.promo} onChange={() => handleToggle('promo')} />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <div className={styles.toggleTitle}>SMS Notifications</div>
                <div className={styles.toggleDesc}>Receive critical alerts via text message.</div>
              </div>
              <label className={styles.switch}>
                <input type="checkbox" checked={notifications.sms} onChange={() => handleToggle('sms')} />
                <span className={styles.slider}></span>
              </label>
            </div>
          </section>

          {/* 4. Privacy & Security */}
          <section id="section-privacy" className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Privacy & Security</h2>
              <p className={styles.cardDesc}>Keep your account secure and manage active sessions.</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Current Password</label>
              <input type="password" className={styles.input} placeholder="Enter current password" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>New Password</label>
              <input type="password" className={styles.input} placeholder="Create new password" />
            </div>

            <div className={styles.toggleRow} style={{marginTop: '24px'}}>
              <div className={styles.toggleInfo}>
                <div className={styles.toggleTitle}>Two-Factor Authentication</div>
                <div className={styles.toggleDesc}>Require an OTP alongside your password.</div>
              </div>
              <label className={styles.switch}>
                <input type="checkbox" defaultChecked={false} />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.cardActions}>
              <button className={styles.btnSave}>Update Security</button>
            </div>
          </section>

          {/* 5. Payment Settings */}
          <section id="section-payments" className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Payment Settings</h2>
              <p className={styles.cardDesc}>Manage saved cards, UPI IDs, and default billing.</p>
            </div>

            <div className={styles.paymentMethod}>
              <div className={styles.paymentInfo}>
                <div className={styles.paymentIcon}>VISA</div>
                <div>
                  <div className={styles.paymentDetails}>•••• •••• •••• 4242 <span className={styles.paymentBadge}>Default</span></div>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>Expires 12/28</div>
                </div>
              </div>
              <button className={styles.btnEdit}>Edit</button>
            </div>

            <div className={styles.paymentMethod}>
              <div className={styles.paymentInfo}>
                <div className={styles.paymentIcon} style={{background: '#E8F5E9', color: '#2E7D32', borderColor: '#C8E6C9'}}>UPI</div>
                <div>
                  <div className={styles.paymentDetails}>user@okhdfcbank</div>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>Verified</div>
                </div>
              </div>
              <button className={styles.btnEdit}>Edit</button>
            </div>

            <button className={styles.btnEdit} style={{marginTop: '16px'}}>+ Add Payment Method</button>
          </section>

          {/* 6. Ride Preferences */}
          <section id="section-ride" className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Ride Preferences</h2>
              <p className={styles.cardDesc}>Configure how we match you with vehicles.</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Preferred Vehicle Type</label>
              <select className={styles.select} value={preferences.defaultVehicle} onChange={e => setPreferences({...preferences, defaultVehicle: e.target.value})}>
                <option>Auto</option>
                <option>Bike</option>
                <option>Mini Cab</option>
                <option>Shuttle (Bus)</option>
              </select>
            </div>

            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <div className={styles.toggleTitle}>Auto-select Available Vehicle</div>
                <div className={styles.toggleDesc}>Automatically select the fastest available vehicle type if preferred is busy.</div>
              </div>
              <label className={styles.switch}>
                <input type="checkbox" defaultChecked={true} />
                <span className={styles.slider}></span>
              </label>
            </div>
            
            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <div className={styles.toggleTitle}>Wheelchair Accessibility</div>
                <div className={styles.toggleDesc}>Only match with vehicles that support accessibility needs.</div>
              </div>
              <label className={styles.switch}>
                <input type="checkbox" defaultChecked={false} />
                <span className={styles.slider}></span>
              </label>
            </div>
          </section>

          {/* 7. Appearance */}
          <section id="section-appearance" className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Appearance</h2>
              <p className={styles.cardDesc}>Customize how the application looks on this device.</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Application Theme</label>
              <select className={styles.select} value={preferences.theme} onChange={e => setPreferences({...preferences, theme: e.target.value})}>
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
                <option value="system">Sync with System</option>
              </select>
            </div>
          </section>

          {/* 8. Danger Zone */}
          <section id="section-danger" className={`${styles.settingsCard} ${styles.dangerCard}`}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle} style={{color: 'var(--status-error)'}}>Danger Zone</h2>
              <p className={styles.cardDesc}>Irreversible and destructive actions.</p>
            </div>

            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <div>
                <div style={{fontWeight: '600', color: 'var(--text-primary)'}}>Deactivate Account</div>
                <div style={{fontSize: '13px', color: 'var(--text-muted)'}}>Temporarily disable your account and hide your profile.</div>
              </div>
              <button className={styles.btnDanger}>Deactivate</button>
            </div>

            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-light)'}}>
              <div>
                <div style={{fontWeight: '600', color: 'var(--text-primary)'}}>Delete Account</div>
                <div style={{fontSize: '13px', color: 'var(--text-muted)'}}>Permanently delete your account and all associated data.</div>
              </div>
              <button className={styles.btnDanger}>Delete Account</button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default CustomerSettings;
