import React from 'react';
import { CreditCard, Route, MapPin, CheckCircle, ShieldCheck, Navigation, Sparkles } from 'lucide-react';
import styles from './UserJourney.module.css';

const journeyNodes = [
  { step: '01', title: 'BUY PASS', desc: 'Select 1, 7, or 30 Day Plan', icon: CreditCard },
  { step: '02', title: 'SELECT ROUTE', desc: 'Pick Fixed Corridor Line', icon: Route },
  { step: '03', title: 'CHOOSE PICKUP', desc: 'Board at Any Station', icon: MapPin },
  { step: '04', title: 'CHOOSE DROP', desc: 'Exit at Any Station', icon: Navigation },
  { step: '05', title: 'CHECK ELIGIBILITY', desc: 'Instant System Verification', icon: ShieldCheck },
  { step: '06', title: 'BOOK RIDE', desc: 'Bike, Auto, Cab or Bus', icon: Sparkles },
  { step: '07', title: 'RIDE FREE', desc: '₹0 Fare Charged Always', icon: CheckCircle, highlight: true }
];

const UserJourney = () => {
  return (
    <section className={styles.journeySection}>
      <div className="container">
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>METRO CORRIDOR COMMUTE JOURNEY</span>
          <h2 className={styles.sectionTitle}>
            From Pass Purchase to <span className="forge-yellow-text">Free Ride</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            A seamless transportation journey designed to eliminate daily fare calculations.
          </p>
        </div>

        {/* Metro Track Journey Concept */}
        <div className={styles.journeyTrackWrapper}>
          <div className={styles.trackLine} />
          
          <div className={styles.nodesRow}>
            {journeyNodes.map((node) => {
              const Icon = node.icon;
              return (
                <div key={node.step} className={`${styles.nodeItem} ${node.highlight ? styles.nodeHighlight : ''}`}>
                  <div className={styles.nodeIconCircle}>
                    <Icon size={20} />
                  </div>
                  <span className={styles.stepNum}>{node.step}</span>
                  <h4 className={styles.nodeTitle}>{node.title}</h4>
                  <span className={styles.nodeDesc}>{node.desc}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserJourney;
