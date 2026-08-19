import React from 'react';
import { ArrowRight } from 'lucide-react';
import ForgeLogo from './ForgeLogo';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* Thin Yellow Separator Bar */}
      <div className={styles.yellowSeparatorBar} />

      <div className="container">
        <div className={styles.footerGrid}>
          {/* Brand Info */}
          <div className={styles.brandCol}>
            <a href="#hero" className={styles.logoGroup}>
              <ForgeLogo variant="footer" />
            </a>
            <p className={styles.brandDesc}>
              India's premier fixed-corridor urban mobility subscription platform. One pass for Bike, Auto, Cab, and Bus.
            </p>
            <div className={styles.corridorTagPill}>
              <span>Active Corridors: Chennai Central · Egmore · Guindy · Tambaram</span>
            </div>
          </div>

          {/* Quick Links: Company & Routes */}
          <div className={styles.linkCol}>
            <h4 className={styles.colTitle}>Company</h4>
            <ul className={styles.linkList}>
              <li><a href="#hero">Home</a></li>
              <li><a href="#routes">Routes Corridor</a></li>
              <li><a href="#passes">Mobility Passes</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#vehicles">Vehicles</a></li>
            </ul>
          </div>

          {/* Passes & Applications */}
          <div className={styles.linkCol}>
            <h4 className={styles.colTitle}>Mobility Passes</h4>
            <ul className={styles.linkList}>
              <li><a href="#passes">Daily Pass (₹99)</a></li>
              <li><a href="#passes">Weekly Pass (₹499)</a></li>
              <li><a href="#passes">Monthly Pass (₹1,499)</a></li>
              <li><a href="/login">Rider Portal Login</a></li>
              <li><a href="/driver">Partner Driver App</a></li>
            </ul>
          </div>

          {/* Contact & Safety */}
          <div className={styles.linkCol}>
            <h4 className={styles.colTitle}>Support & Safety</h4>
            <p className={styles.supportText}>
              24/7 Live GPS Telemetry and Emergency Rider Support available across all active pass corridors.
            </p>
            <a href="#checker" className={styles.verifyLink}>
              <span>Verify Route Eligibility</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className={styles.bottomBar}>
          <p>© 2026 FORGE INDIA CONNECT PVT. LTD. All rights reserved.</p>
          <div className={styles.bottomLinks}>
            <a href="#">Privacy Policy</a>
            <span>•</span>
            <a href="#">Terms of Service</a>
            <span>•</span>
            <a href="#">Corridor Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
