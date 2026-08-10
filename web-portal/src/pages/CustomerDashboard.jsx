import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Clock, CreditCard, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import styles from './CustomerDashboard.module.css';

const CustomerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

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
          <div className={styles.emptyState}>
            <p>No active passes found.</p>
          </div>
          <button 
            className={`${styles.btnAction} ${styles.btnSecondary}`}
            style={{ marginTop: 'auto' }}
          >
            Buy a Pass
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
