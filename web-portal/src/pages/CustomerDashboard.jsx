import React from 'react';

const CustomerDashboard = () => {
  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '24px' }}>Welcome back, John!</h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3>Quick Book</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Where to?</p>
          <button style={{
            background: 'var(--primary)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            marginTop: '16px',
            width: '100%'
          }}>Book a Ride</button>
        </div>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3>Recent Rides</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>You have no recent rides.</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
