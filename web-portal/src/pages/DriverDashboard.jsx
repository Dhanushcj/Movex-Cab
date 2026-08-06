import React from 'react';

const DriverDashboard = () => {
  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '24px' }}>Driver Dashboard</h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px'
      }}>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>Today's Earnings</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '8px', color: 'var(--success)' }}>$124.50</p>
        </div>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>Trips Completed</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '8px' }}>8</p>
        </div>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>Online Time</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '8px' }}>4h 20m</p>
        </div>
      </div>
      
      <div className="glass-panel" style={{ padding: '24px', marginTop: '32px' }}>
        <h3>Active Requests</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Searching for nearby riders...</p>
      </div>
    </div>
  );
};

export default DriverDashboard;
