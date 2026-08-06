import React from 'react';
import { User, Car, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const DriverProfile = () => {
  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '24px' }}>Driver Profile & Documents</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* Profile Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
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
              }}>MK</div>
              <div>
                <h2 style={{ margin: 0 }}>Mike Knight</h2>
                <p style={{ color: 'var(--text-muted)' }}>Pro Driver • 4.9 ★</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <User color="var(--text-muted)" />
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Driver ID</p>
                  <p>DRV-84920</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Car color="var(--secondary)" />
              <h3 style={{ margin: 0 }}>Vehicle Details</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Make / Model</span>
                <span>Toyota Camry (2023)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Color</span>
                <span>Midnight Black</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>License Plate</span>
                <span style={{ fontWeight: 'bold' }}>ABC-1234</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Documents */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <FileText color="var(--primary)" />
            <h3 style={{ margin: 0 }}>Required Documents</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ padding: '16px', background: 'rgba(15,23,42,0.5)', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: '500' }}>Driver's License</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Expires: Dec 2028</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
                <CheckCircle size={20} /> <span style={{ fontSize: '14px', fontWeight: '500' }}>Verified</span>
              </div>
            </div>
            
            <div style={{ padding: '16px', background: 'rgba(15,23,42,0.5)', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: '500' }}>Vehicle Registration</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Expires: Oct 2027</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
                <CheckCircle size={20} /> <span style={{ fontSize: '14px', fontWeight: '500' }}>Verified</span>
              </div>
            </div>
            
            <div style={{ padding: '16px', background: 'rgba(245,158,11,0.1)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: '500' }}>Vehicle Insurance</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Expires: Sep 2026 (Expiring soon)</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)' }}>
                <AlertCircle size={20} /> <span style={{ fontSize: '14px', fontWeight: '500' }}>Update Needed</span>
              </div>
            </div>
            
            <button style={{
              width: '100%',
              padding: '12px',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '8px',
              marginTop: '16px'
            }}>Upload New Document</button>
            
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default DriverProfile;
