import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Clock, CreditCard, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import styles from './CustomerDashboard.module.css';
import API from '../services/api';

const CustomerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activePass, setActivePass] = useState(null);

  useEffect(() => {
    const fetchMyPass = async () => {
      try {
        const res = await API.get('/subscriptions/my-pass');
        if (res.data.success && res.data.data) {
          setActivePass(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch pass', err);
      }
    };
    fetchMyPass();
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
        <p className={styles.subtitle}>Where would you like to go today?</p>
      </div>
      
      <div className={styles.grid}>
        {/* Quick Book Card */}
        <div className={`white-card ${styles.card}`}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper} style={{ background: 'var(--bg-soft-blue)', color: 'var(--forge-blue)' }}>
              <Map size={24} />
            </div>
            <h3 className={styles.cardTitle}>Book a Ride</h3>
          </div>
          <p className={styles.cardDesc}>
            Access premium mobility across our fixed metro corridors. Bike, Auto, Cab, or Bus.
          </p>
          <button 
            className={styles.btnAction}
            onClick={() => navigate('/customer/book')}
          >
            Start Booking <ArrowRight size={18} />
          </button>
        </div>

        {/* Passes Card - landing page styled */}
        <div className={`white-card ${styles.card}`}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper} style={{ background: 'var(--forge-yellow-soft)', color: 'var(--forge-blue)' }}>
              <CreditCard size={24} />
            </div>
            <h3 className={styles.cardTitle}>Your Mobility Pass</h3>
          </div>
          
          {activePass ? (
            <div style={{ marginBottom: '24px', background: 'var(--bg-white)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>FORGE MOBILITY PASS</div>
                  <span style={{ fontWeight: '800', fontSize: '20px', color: 'var(--text-primary)' }}>{activePass.pass?.name || 'Gold Pass'}</span>
                </div>
                <div style={{ background: 'var(--status-success-bg)', color: 'var(--status-success)', padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', background: 'var(--status-success)', borderRadius: '50%' }}></span> ACTIVE
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>VALID UNTIL</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '600' }}>{new Date(activePass.validUntil).toLocaleDateString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>REMAINING</div>
                  <div style={{ fontSize: '14px', color: 'var(--forge-blue)', fontWeight: '700' }}>{activePass.ridesRemaining || 'Unlimited'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState} style={{ marginBottom: '24px', background: 'var(--bg-section-alt)', border: '1px dashed var(--border-light)' }}>
              <p>No active passes found. Subscribe to ride zero-fare.</p>
            </div>
          )}

          <button 
            className={`${styles.btnAction} ${styles.btnSecondary}`}
            style={{ marginTop: 'auto' }}
            onClick={() => navigate('/customer/passes')}
          >
            {activePass ? 'Manage Pass' : 'Explore Passes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
