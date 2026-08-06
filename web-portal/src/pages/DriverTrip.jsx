import React from 'react';
import { Map, Navigation, Phone, MessageSquare } from 'lucide-react';

const DriverTrip = () => {
  return (
    <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 160px)' }}>
      {/* Active Trip Info Panel */}
      <div style={{ flex: '1', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, color: 'var(--success)' }}>On Trip</h3>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Est. 12 mins</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)' }}></div>
                <div style={{ width: '2px', height: '24px', background: 'var(--glass-border)' }}></div>
                <div style={{ width: '12px', height: '12px', background: 'var(--error)' }}></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pickup</p>
                  <p style={{ fontWeight: '500' }}>123 Main St, City Center</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Dropoff</p>
                  <p style={{ fontWeight: '500' }}>Airport Terminal 2</p>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ padding: '16px', background: 'rgba(15,23,42,0.5)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>S</div>
              <div>
                <p style={{ fontWeight: '500' }}>Sarah Smith</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>★ 4.9 Rating</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }}>
                <MessageSquare size={18} />
              </button>
              <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }}>
                <Phone size={18} />
              </button>
            </div>
          </div>
          
          <button style={{
            width: '100%',
            padding: '16px',
            background: 'var(--error)',
            color: 'white',
            fontWeight: '600',
            borderRadius: '12px',
            marginTop: '24px'
          }}>Complete Trip</button>
        </div>
      </div>

      {/* Navigation Map Panel */}
      <div style={{ flex: '2', position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)', background: 'var(--bg-darker)' }}>
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <Navigation size={64} style={{ marginBottom: '16px', color: 'var(--primary)' }} />
          <h3>Navigation View</h3>
          <p>Turn-by-turn navigation map integration goes here.</p>
        </div>
        
        {/* Navigation overlay floating card */}
        <div className="glass-panel" style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Navigation size={24} color="var(--primary)" />
          <div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>In 500ft, turn left</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>onto Airport Blvd</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverTrip;
