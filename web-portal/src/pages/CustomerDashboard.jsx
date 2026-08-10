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
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}>
              <Map size={24} />
            </div>
            <h3 className={styles.cardTitle}>Book a Ride</h3>
          </div>
          <p className={styles.cardDesc}>
            Access premium mobility across our fixed metro corridors.
          </p>
          <button 
            className={styles.btnAction}
            onClick={() => navigate('/customer/book')}
          >
            Start Booking <ArrowRight size={18} />
          </button>
        </div>

        {/* Recent Rides Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}>
              <Clock size={24} />
            </div>
            <h3 className={styles.cardTitle}>Recent Rides</h3>
          </div>
          <div className={styles.emptyState}>
            <p>You have no recent rides.</p>
          </div>
          <button 
            className={`${styles.btnAction} ${styles.btnSecondary}`}
            style={{ marginTop: 'auto' }}
            onClick={() => navigate('/customer/history')}
          >
            View History
          </button>
        </div>

        {/* Passes Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}>
              <CreditCard size={24} />
            </div>
            <h3 className={styles.cardTitle}>Active Passes</h3>
          </div>
          
          {activePass ? (
            <div style={{ marginBottom: '16px', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--forge-blue)' }}>{activePass.pass?.name || 'Gold Pass'}</span>
                <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 'bold' }}>Active</span>
              </div>
              <p style={{ margin: '4px 0', fontSize: '14px', color: 'var(--text-muted)' }}>
                Valid until: {new Date(activePass.validUntil).toLocaleDateString()}
              </p>
              <p style={{ margin: '4px 0', fontSize: '14px', color: 'var(--text-muted)' }}>
                Rides remaining: {activePass.ridesRemaining || 'Unlimited'}
              </p>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No active passes found.</p>
            </div>
          )}

          <button 
            className={`${styles.btnAction} ${styles.btnSecondary}`}
            style={{ marginTop: 'auto' }}
            onClick={() => navigate('/customer/passes')}
          >
            {activePass ? 'Manage Pass' : 'Buy a Pass'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
