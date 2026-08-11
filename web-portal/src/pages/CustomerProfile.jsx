import React, { useContext } from 'react';
import { User, Mail, Phone, CreditCard, Shield } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const CustomerProfile = () => {
  const { user } = useContext(AuthContext);
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2) : 'U';
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 0' }}>
      <h1 style={{ fontSize: '42px', fontWeight: '700', color: 'var(--forge-blue)', marginBottom: '24px', fontFamily: `'Poppins', sans-serif`, lineHeight: '1.15' }}>Profile & Settings</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* Personal Info */}
        <div className="white-card" style={{ padding: '32px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: 'var(--forge-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'white'
            }}>{initials}</div>
            <div>
              <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>{user?.name || 'User'}</h2>
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
          
          <button className="btn btn-outline-blue" style={{ width: '100%', marginTop: '32px', padding: '12px' }}>Edit Profile</button>
        </div>
        
        {/* Wallet & Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="white-card" style={{ padding: '32px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <CreditCard color="var(--forge-blue)" />
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Payment Methods</h3>
            </div>
            
            <div style={{ 
              padding: '16px', 
              background: 'var(--bg-section-alt)', 
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '24px', background: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontSize: '12px', fontWeight: 'bold' }}>VISA</div>
                <span style={{ color: 'var(--text-primary)' }}>•••• 4242</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Primary</span>
            </div>
            
            <button style={{
              background: 'none',
              border: 'none',
              padding: '12px 0 0 0',
              color: 'var(--forge-blue)',
              marginTop: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>+ Add Payment Method</button>
          </div>
          
          <div className="white-card" style={{ padding: '32px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Shield color="var(--forge-blue)" />
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Security</h3>
            </div>
            
            <button className="btn btn-outline-blue" style={{ width: '100%', padding: '12px' }}>Change Password</button>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default CustomerProfile;
