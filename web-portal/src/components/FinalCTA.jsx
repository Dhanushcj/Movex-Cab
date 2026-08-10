import React from 'react';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import styles from './FinalCTA.module.css';

const FinalCTA = () => {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <div className={styles.ctaBox}>
          {/* Top Badge */}
          <div className={styles.badgePill}>
            <Zap size={14} className={styles.zapIcon} />
            <span>START RIDING TODAY</span>
          </div>

          <h2 className={styles.title}>
            Your Daily Commute <br />
            <span className={styles.yellowText}>Just Got Simpler.</span>
          </h2>

          <p className={styles.subtitle}>
            One pass. One route. Multiple ways to move across Bike, Auto, Cab and Bus.
          </p>

          <div className={styles.buttonGroup}>
            <a href="#passes" className="btn btn-yellow">
              <span>Get Your Pass</span>
              <ArrowRight size={18} />
            </a>
            <a href="#routes" className={styles.secondaryWhiteBtn}>
              <span>View Route Corridors</span>
            </a>
          </div>

          <div className={styles.guaranteeRow}>
            <ShieldCheck size={16} className={styles.shieldIcon} />
            <span>Instant Activation · 100% Fixed Route Guarantee · Cancel Anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
