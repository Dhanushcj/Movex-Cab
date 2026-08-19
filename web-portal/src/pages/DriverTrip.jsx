import React from 'react';
import { Navigation } from 'lucide-react';
import styles from './DriverActiveRide.module.css';

const DriverTrip = () => {
  return (
    <div className={styles.container}>
      <div style={{
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%', 
        background: 'var(--bg-white)', 
        borderRadius: '20px', 
        border: '1px solid var(--border-light)', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#EFF6FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <Navigation size={40} color="#2563EB" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '12px' }}>No Active Trip</h2>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: '600', maxWidth: '400px', textAlign: 'center', lineHeight: '1.5' }}>
          You currently don't have an active trip. When you accept a ride, the navigation and trip details will appear here.
        </p>
      </div>
    </div>
  );
};

export default DriverTrip;
