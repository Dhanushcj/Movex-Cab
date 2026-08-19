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
  BusFront,
  Crown
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activePass, setActivePass] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('auto');
  
  // Hardcoded for demo/premium look
  const recentRides = [];

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
    if (!activePass) {
      alert("You must have an active pass to book a ride.");
      navigate('/customer/passes');
      return;
    }
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

          <button className={styles.btnBookSolid} onClick={handleBookNow}>
            Start Booking <ArrowRight size={20} />
          </button>
        </div>

        {/* Right Column: Pass & Recent */}
        <div className={styles.rightCol}>
          
          {/* Active Pass Card OR Promo Card */}
          {activePass ? (
            <div className={styles.activePassCardDashboard}>
              <div className={styles.passHeaderActive}>
                <div className={styles.passTitleGroup}>
                  <div className={styles.passIconWrapActive}>
                    <Crown size={24} color="#EAB308" />
                  </div>
                  <div>
                    <h3 className={styles.passTitleActive}>{activePass.pass?.name || 'Mobility Pass'}</h3>
                    <div className={styles.passSubActive}>Valid until {new Date(activePass.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                </div>
                <div className={styles.passBadgeActive}>
                  <span className={styles.statusDotGreen}></span>
                  ACTIVE
                </div>
              </div>
              
              <div className={styles.passBodyActive}>
                <div className={styles.passStatBlock}>
                  <div className={styles.passStatLabel}>Rides Used</div>
                  <div className={styles.passStatValue}>{activePass.ridesUsed || 0}</div>
                </div>
                <div className={styles.passStatBlock}>
                  <div className={styles.passStatLabel}>Pass Status</div>
                  <div className={styles.passStatValue}>Unlimited</div>
                </div>
              </div>
              
              <button className={styles.btnViewPass} onClick={() => navigate('/customer/passes')}>
                Manage Pass <ArrowRight size={16} style={{marginLeft: 8}} />
              </button>
            </div>
          ) : (
            <div className={styles.promoCard}>
              <div className={styles.promoHeader}>
                <div className={styles.promoTitleGroup}>
                  <div className={styles.promoIconWrap}>
                    <Crown size={24} color="#FFF" />
                  </div>
                  <div>
                    <h3 className={styles.promoTitle}>Ride More. Pay Less.</h3>
                    <div className={styles.promoSub}>Get Your Mobility Pass</div>
                  </div>
                </div>
                <div className={styles.noPassBadge}>
                  <span className={styles.statusDotRed}></span>
                  No active pass
                </div>
              </div>

              <p className={styles.promoText}>
                Get unlimited covered rides across eligible FORGE INDIA CONNECT routes with a mobility pass.
              </p>

              <div className={styles.promoBenefits}>
                <div className={styles.benefitItem}><CheckCircle2 size={14} className={styles.benefitIcon} /> Unlimited rides</div>
                <div className={styles.benefitItem}><CheckCircle2 size={14} className={styles.benefitIcon} /> Multiple vehicle types</div>
                <div className={styles.benefitItem}><CheckCircle2 size={14} className={styles.benefitIcon} /> Fixed corridor access</div>
                <div className={styles.benefitItem}><CheckCircle2 size={14} className={styles.benefitIcon} /> Priority booking</div>
              </div>

              <div className={styles.promoFooter}>
                <div className={styles.promoPrice}>
                  Starting from <span>₹499</span> / month
                </div>
                <div className={styles.promoActions}>
                  <button className={styles.btnExplore} onClick={() => navigate('/customer/passes')}>Explore Passes</button>
                  <button className={styles.btnGetPass} onClick={() => navigate('/customer/passes')}>Get Your Pass <ArrowRight size={16} /></button>
                </div>
              </div>
            </div>
          )}

          {/* Recent Rides */}
          <div className={styles.recentRides}>
            <div className={styles.sectionTitle} style={{ marginBottom: '16px' }}>
              <div className={styles.sectionIcon} style={{ background: 'var(--forge-yellow-soft)', padding: '8px' }}>
                <History size={18} />
              </div>
              Recent Activity
            </div>

            {recentRides.length > 0 ? (
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
            ) : (
              <div className={styles.emptyRides}>
                <div className={styles.emptyIconWrap}>
                  <Navigation size={32} color="#9CA3AF" />
                </div>
                <h4>No rides yet</h4>
                <p>Your completed rides will appear here.</p>
                <button className={styles.btnEmptyBook} onClick={handleBookNow}>Book Your First Ride <ArrowRight size={16} /></button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Available Routes Full Width */}
      <div className={styles.availableRoutesSection}>
        <div className={styles.sectionTitle}>
          <div className={styles.sectionIcon}>
            <MapPin size={20} />
          </div>
          Available Routes
        </div>
        <div className={styles.routeCardsGrid}>
          <div className={styles.routeCard}>
            <div className={styles.rcTop}>
              <div className={styles.rcLocations}>
                <span className={styles.rcLoc}>Krishnagiri</span>
                <ArrowRight size={14} className={styles.rcArrow} />
                <span className={styles.rcLoc}>Hosur</span>
              </div>
              <div className={styles.rcDistance}>45 km</div>
            </div>
            <div className={styles.rcBottom}>
              <div className={styles.rcVehicles}>
                <CarFront size={16} />
                <BusFront size={16} />
                <span>+ Cab & Auto</span>
              </div>
              <button className={styles.btnViewRoute}>View Route</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
