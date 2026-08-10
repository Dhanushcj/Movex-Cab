import React, { useContext } from 'react';
import { User, Mail, Phone, CreditCard, Shield } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const CustomerProfile = () => {
  const { user } = useContext(AuthContext);
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2) : 'U';
  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '24px' }}>Profile & Settings</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* Personal Info */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'white'
            }}>{initials}</div>
            <div>
              <h2 style={{ margin: 0 }}>{user?.name || 'User'}</h2>
              <p style={{ color: 'var(--text-muted)' }}>Customer since {new Date(user?.createdAt || Date.now()).getFullYear()}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Mail color="var(--text-muted)" />
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email Address</p>
                <p>{user?.email || 'N/A'}</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Phone color="var(--text-muted)" />
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Phone Number</p>
                <p>{user?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <button style={{
            width: '100%',
            padding: '12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--glass-border)',
            borderRadius: '8px',
            color: 'white',
            marginTop: '32px',
            transition: '0.2s'
          }}>Edit Profile</button>
        </div>
        
        {/* Wallet & Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <CreditCard color="var(--secondary)" />
              <h3 style={{ margin: 0 }}>Payment Methods</h3>
            </div>
            
            <div style={{ 
              padding: '16px', 
              background: 'rgba(15, 23, 42, 0.5)', 
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '24px', background: '#f8fafc', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontSize: '12px', fontWeight: 'bold' }}>VISA</div>
                <span>•••• 4242</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Primary</span>
            </div>
            
            <button style={{
              padding: '12px',
              color: 'var(--secondary)',
              marginTop: '16px',
              fontWeight: '500'
            }}>+ Add Payment Method</button>
          </div>
          
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Shield color="var(--primary)" />
              <h3 style={{ margin: 0 }}>Security</h3>
            </div>
            
            <button style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              color: 'white',
              transition: '0.2s',
              textAlign: 'left'
            }}>Change Password</button>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default CustomerProfile;
