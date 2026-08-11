import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styles from './CustomerDashboard.module.css';
import API from '../services/api';
import { 
  MapPin, 
  Navigation, 
  ArrowRight, 
  History,
  CreditCard,
  CheckCircle2,
  CarFront,
  Bike,
  Car,
  BusFront
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activePass, setActivePass] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('auto');
  
  // Hardcoded for demo/premium look
  const recentRides = [
    { id: 1, route: 'Chennai Central → Anna Nagar', vehicle: 'Auto', date: 'Today, 09:42 AM', status: 'Completed', fare: '₹0 (Pass)' },
    { id: 2, route: 'Anna Nagar → Guindy', vehicle: 'Mini Cab', date: 'Yesterday, 06:15 PM', status: 'Completed', fare: '₹0 (Pass)' },
  ];

  const vehicles = [
    { id: 'bike', name: 'Bike', Icon: Bike },
    { id: 'auto', name: 'Auto', Icon: CarFront },
    { id: 'mini', name: 'Mini Cab', Icon: Car },
    { id: 'bus', name: 'Shuttle', Icon: BusFront },
  ];

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

  const handleBookNow = () => {
    navigate('/customer/book');
  };

  return (
    <div className={styles.dashboardContainer}>
      
      {/* Header & Quick Stats */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
          <p className={styles.subtitle}>Where would you like to go today?</p>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statBadge}>
            <span className={styles.statLabel}>Total Rides</span>
            <span className={styles.statValue}>124</span>
          </div>
          <div className={styles.statBadge}>
            <span className={styles.statLabel}>Saved Amount</span>
            <span className={styles.statValue}>₹4,250</span>
          </div>
        </div>
      </div>
      
      <div className={styles.mainGrid}>
        
        {/* Left Column: Quick Booking */}
        <div className={styles.bookingPanel}>
          <div className={styles.sectionTitle}>
            <div className={styles.sectionIcon}>
              <Navigation size={20} />
            </div>
            Book a Ride
          </div>
          
          <div className={styles.locationInputs}>
            <div className={styles.locationTimeline}></div>
            <div className={styles.inputGroup}>
              <div className={`${styles.locIcon} ${styles.pickup}`}></div>
              <input type="text" className={styles.locInput} placeholder="Enter Pickup Location" readOnly onClick={handleBookNow} />
            </div>
            <div className={styles.inputGroup}>
              <div className={`${styles.locIcon} ${styles.drop}`}></div>
              <input type="text" className={styles.locInput} placeholder="Enter Drop Location" readOnly onClick={handleBookNow} />
            </div>
          </div>

          <div className={styles.vehicleGrid}>
            {vehicles.map(v => (
              <div 
                key={v.id} 
                className={`${styles.vehicleOption} ${selectedVehicle === v.id ? styles.active : ''}`}
                onClick={() => setSelectedVehicle(v.id)}
              >
                {/* Dynamic lucide icon */}
                <v.Icon size={24} color={selectedVehicle === v.id ? "var(--forge-blue)" : "var(--text-muted)"} />
                <span className={styles.vehicleName}>{v.name}</span>
              </div>
            ))}
          </div>

          <button className={styles.btnBook} onClick={handleBookNow}>
            Book Now <ArrowRight size={20} />
          </button>
        </div>

        {/* Right Column: Pass & Recent */}
        <div className={styles.rightCol}>
          
          {/* Premium Pass Card */}
          <div className={styles.passCard}>
            <div className={styles.passHeader}>
              <div>
                <div className={styles.passSub}>FORGE MOBILITY</div>
                <div className={styles.passType}>{activePass?.pass?.name || 'GOLD PASS'}</div>
              </div>
              <div className={styles.passBadge}>
                ACTIVE
              </div>
            </div>

            <div className={styles.passStats}>
              <div>
                <div className={styles.pStatLabel}>VALID UNTIL</div>
                <div className={styles.pStatValue}>
                  {activePass ? new Date(activePass.validUntil).toLocaleDateString() : 'Dec 31, 2026'}
                </div>
              </div>
              <div>
                <div className={styles.pStatLabel}>REMAINING</div>
                <div className={styles.pStatValue}>
                  {activePass?.ridesRemaining || 'Unlimited'} Rides
                </div>
              </div>
            </div>

            <button className={styles.btnPass} onClick={() => navigate('/customer/passes')}>
              <CreditCard size={16} /> Manage Subscription
            </button>
          </div>

          {/* Recent Rides */}
          <div className={styles.recentRides}>
            <div className={styles.sectionTitle} style={{ marginBottom: '16px' }}>
              <div className={styles.sectionIcon} style={{ background: 'var(--forge-yellow-soft)', padding: '8px' }}>
                <History size={18} />
              </div>
              Recent Activity
            </div>

            <div className={styles.rideList}>
              {recentRides.map(ride => (
                <div key={ride.id} className={styles.rideItem}>
                  <div className={styles.rideIcon}>
                    <CheckCircle2 size={20} color="var(--status-success)" />
                  </div>
                  <div className={styles.rideInfo}>
                    <div className={styles.rideRoute}>{ride.route}</div>
                    <div className={styles.rideDate}>{ride.date} • {ride.vehicle}</div>
                  </div>
                  <div className={styles.rideStatus}>
                    <div className={`${styles.statusBadge} ${styles.statusCompleted}`}>{ride.status}</div>
                    <div className={styles.rideFare}>{ride.fare}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
