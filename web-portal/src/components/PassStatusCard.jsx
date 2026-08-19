import React, { useState } from 'react';
import { ShieldCheck, Calendar, Route, Sparkles, CheckCircle2, Clock, CreditCard } from 'lucide-react';
import AutoRickshawIcon from './AutoRickshawIcon';
import BikeIcon from './BikeIcon';
import CarIcon from './CarIcon';
import BusIcon from './BusIcon';
import styles from './PassStatusCard.module.css';

const PassStatusCard = () => {
  const [passActive, setPassActive] = useState(true);

  return (
    <section className={styles.statusSection}>
      <div className="container">
        <div className={styles.gridContainer}>
          {/* Left Text Explanation */}
          <div className={styles.leftText}>
            <div className={styles.badgePill}>
              <CreditCard size={14} />
              <span>DIGITAL PASS DASHBOARD</span>
            </div>
            <h2 className={styles.title}>
              Manage Your Active Pass <br />
              <span className="forge-blue-text">In Real-Time</span>
            </h2>
            <p className={styles.description}>
              Every Forge mobility subscriber gets a sleek digital dashboard. View your active pass status, remaining validity days, covered route corridors, and zero-fare ride counter instantly.
            </p>

            <div className={styles.featuresList}>
              <div className={styles.featureItem}>
                <CheckCircle2 size={18} className={styles.checkIcon} />
                <span>Instant QR scanning at all corridor junctions</span>
              </div>
              <div className={styles.featureItem}>
                <CheckCircle2 size={18} className={styles.checkIcon} />
                <span>Seamless zero-fare booking across Bike, Auto, Cab & Bus</span>
              </div>
              <div className={styles.featureItem}>
                <CheckCircle2 size={18} className={styles.checkIcon} />
                <span>Auto-renewal & pass pause flexibility</span>
              </div>
            </div>

            <div className={styles.toggleSimulatorRow}>
              <span className={styles.toggleLabel}>SIMULATE PASS STATE:</span>
              <button
                className={`${styles.toggleBtn} ${passActive ? styles.toggleBtnActive : ''}`}
                onClick={() => setPassActive(true)}
              >
                ● Active Pass State
              </button>
              <button
                className={`${styles.toggleBtn} ${!passActive ? styles.toggleBtnExpired : ''}`}
                onClick={() => setPassActive(false)}
              >
                ○ Expired State
              </button>
            </div>
          </div>

          {/* Right Dashboard Card */}
          <div className={styles.rightCardWrapper}>
            <div className={`${styles.dashboardCard} ${passActive ? styles.cardActiveGlow : ''}`}>
              {/* Card Top Brand Line */}
              <div className={styles.cardTopHeader}>
                <div className={styles.cardBrand}>
                  <div className={styles.brandLogoBox}>
                    <Route size={16} />
                  </div>
                  <div>
                    <span className={styles.brandTitle}>FORGE MOBILITY PASS</span>
                    <span className={styles.brandSub}>SUBSCRIPTION CREDENTIAL</span>
                  </div>
                </div>
                <div className={passActive ? styles.statusBadgeActive : styles.statusBadgeExpired}>
                  <span className={styles.statusDot} />
                  <span>{passActive ? 'ACTIVE' : 'EXPIRED'}</span>
                </div>
              </div>

              {/* Pass Main Name & Holder */}
              <div className={styles.passMainInfo}>
                <h3 className={styles.passNameTitle}>Monthly Mobility Pass</h3>
                <span className={styles.passHolder}>Rider ID: #FGC-889204 · Chennai Line</span>
              </div>

              {/* Metrics Grid */}
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricLabelGroup}>
                    <Calendar size={13} />
                    <span>VALID UNTIL</span>
                  </div>
                  <span className={styles.metricVal}>28 Sept 2026</span>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricLabelGroup}>
                    <Clock size={13} />
                    <span>REMAINING</span>
                  </div>
                  <span className={styles.metricValHighlight}>{passActive ? '21 Days' : '0 Days'}</span>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricLabelGroup}>
                    <Route size={13} />
                    <span>ROUTES</span>
                  </div>
                  <span className={styles.metricVal}>4 Corridors</span>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricLabelGroup}>
                    <Sparkles size={13} />
                    <span>TODAY'S RIDES</span>
                  </div>
                  <span className={styles.metricVal}>3 Free Rides</span>
                </div>
              </div>

              {/* Modes Pill */}
              <div className={styles.availableModesRow}>
                <span className={styles.modesTitle}>AVAILABLE MODES:</span>
                <div className={styles.modesIconsRow}>
                  <div className={styles.modeIconChip}><BikeIcon size={14} /> <span>Bike</span></div>
                  <div className={styles.modeIconChip}><AutoRickshawIcon size={14} /> <span>Auto</span></div>
                  <div className={styles.modeIconChip}><CarIcon size={14} /> <span>Cab</span></div>
                  <div className={styles.modeIconChip}><BusIcon size={14} /> <span>Bus</span></div>
                </div>
              </div>

              {/* Primary CTA */}
              <div className={styles.cardActionArea}>
                {passActive ? (
                  <a href="/customer/book" className="btn btn-yellow" style={{ width: '100%', justifyContent: 'center' }}>
                    <ShieldCheck size={16} />
                    <span>Book a Zero-Fare Ride</span>
                  </a>
                ) : (
                  <a href="#passes" className="btn btn-yellow" style={{ width: '100%', justifyContent: 'center' }}>
                    <span>Renew Pass Now</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PassStatusCard;
