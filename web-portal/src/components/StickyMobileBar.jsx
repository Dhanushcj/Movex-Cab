import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import styles from './StickyMobileBar.module.css';

const StickyMobileBar = () => {
  return (
    <div className={styles.stickyMobileContainer}>
      <div className={styles.infoCol}>
        <div className={styles.passTag}>
          <Zap size={12} />
          <span>Forge Pass</span>
        </div>
        <span className={styles.priceTag}>From ₹99 / Day · Free Rides</span>
      </div>
      <a href="#passes" className="btn btn-yellow" style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
        <span>Get Your Pass</span>
        <ArrowRight size={14} />
      </a>
    </div>
  );
};

export default StickyMobileBar;
