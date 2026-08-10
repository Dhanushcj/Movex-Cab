import React from 'react';
import { Map, Navigation, Phone, MessageSquare } from 'lucide-react';
import styles from './DriverTrip.module.css';

const DriverTrip = () => {
  return (
    <div className={styles.tripContainer}>
      
      {/* Active Trip Info Panel */}
      <div className={styles.tripInfoPanel}>
        <div className={styles.card}>
          
          <div className={styles.headerRow}>
            <h3 className={styles.statusText}>
              <div className={styles.pulseDot}></div> On Trip
            </h3>
            <span className={styles.eta}>Est. 12 mins</span>
          </div>
          
          <div className={styles.timeline}>
            <div className={styles.timelineGraphics}>
              <div className={styles.dotPickup}></div>
              <div className={styles.line}></div>
              <div className={styles.dotDrop}></div>
            </div>
            
            <div className={styles.timelineContent}>
              <div>
                <p className={styles.locationLabel}>Pickup</p>
                <p className={styles.locationValue}>123 Main St, City Center</p>
              </div>
              <div>
                <p className={styles.locationLabel}>Dropoff</p>
                <p className={styles.locationValue}>Airport Terminal 2</p>
              </div>
            </div>
          </div>
          
          <div className={styles.passengerCard}>
            <div className={styles.passengerInfo}>
              <div className={styles.avatar}>S</div>
              <div>
                <p className={styles.passengerName}>Sarah Smith</p>
                <p className={styles.passengerRating}>
                  <span className={styles.star}>★</span> 4.9 Rating
                </p>
              </div>
            </div>
            
            <div className={styles.actionBtns}>
              <button className={styles.iconBtn}>
                <MessageSquare size={18} strokeWidth={2.5} />
              </button>
              <button className={styles.iconBtn}>
                <Phone size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          
          <button className={styles.btnComplete}>Complete Trip</button>
          
        </div>
      </div>

      {/* Navigation Map Panel */}
      <div className={styles.mapPanel}>
        <div className={styles.placeholderMap}>
          <Navigation size={64} style={{ marginBottom: '16px', color: 'var(--forge-blue)', opacity: 0.5 }} />
          <h3>Navigation View</h3>
          <p>Turn-by-turn navigation map integration goes here.</p>
        </div>
        
        {/* Navigation overlay floating card */}
        <div className={styles.navOverlay}>
          <div className={styles.navIconWrapper}>
            <Navigation size={24} strokeWidth={2.5} fill="currentColor" />
          </div>
          <div>
            <h2>In 500ft, turn left</h2>
            <p>onto Airport Blvd</p>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default DriverTrip;
