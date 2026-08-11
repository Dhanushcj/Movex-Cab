import React, { useState } from 'react';
import { QrCode, ArrowRight, MoreVertical, CheckCircle2, ChevronRight, Navigation } from 'lucide-react';
import BikeIcon from '../components/BikeIcon';
import AutoRickshawIcon from '../components/AutoRickshawIcon';
import CarIcon from '../components/CarIcon';
import BusIcon from '../components/BusIcon';
import styles from './CustomerPass.module.css';

const CustomerPass = () => {
  const [showUsage, setShowUsage] = useState(false);
  const passId = "FG-MP-849201";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <QrCode size={24} />
        </div>
        <h1 className={styles.title}>Your Mobility Pass</h1>
      </div>

      <div className={styles.premiumPassCard}>
        {/* Decorative Grid Overlay */}
        <div className={styles.decorativeGrid}></div>
        
        {/* Top Section */}
        <div className={styles.cardTop}>
          <div className={styles.branding}>
            <span className={styles.brandName}>FORGE INDIA CONNECT</span>
            <span className={styles.tierName}>GOLD</span>
          </div>
          <div className={styles.statusBadge}>
            <div className={styles.statusDot}></div>
            ACTIVE
          </div>
        </div>

        {/* Info Blocks */}
        <div className={styles.infoBlocks}>
          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>VALID UNTIL</span>
            <span className={styles.infoValue}>4 SEP 2026</span>
          </div>
          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>REMAINING</span>
            <span className={styles.infoValue}>UNLIMITED</span>
          </div>
          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>COVERAGE</span>
            <span className={styles.infoValue}>KRISHNAGIRI &rarr; HOSUR</span>
          </div>
        </div>



        {/* Bottom Section */}
        <div className={styles.cardBottom}>
          <div className={styles.vehiclesSection}>
            <span className={styles.infoLabel}>COVERED VEHICLES</span>
            <div className={styles.vehicleIcons}>
              <div className={styles.vIcon}><BikeIcon size={20} color="#fff" /></div>
              <div className={styles.vIcon}><AutoRickshawIcon size={20} color="#fff" /></div>
              <div className={styles.vIcon}><CarIcon size={20} color="#fff" /></div>
              <div className={styles.vIcon}><BusIcon size={20} color="#fff" /></div>
            </div>
            <div className={styles.benefitHighlight}>
              ₹0 FARE <span className={styles.benefitSub}>ON COVERED RIDES</span>
            </div>
          </div>
          
          <div className={styles.qrSection}>
            <span className={styles.infoLabel}>PASS ID: {passId}</span>
            <div className={styles.qrBox}>
              <QrCode size={40} color="var(--forge-blue)" />
            </div>
            <span className={styles.qrLabel}>SCAN TO VERIFY</span>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className={styles.actionRow}>
        <button className={styles.btnPrimary}>
          Manage Pass <ArrowRight size={18} />
        </button>
        <button 
          className={styles.btnSecondary}
          onClick={() => setShowUsage(!showUsage)}
        >
          {showUsage ? 'Hide Usage' : 'View Usage'}
        </button>
        <button className={styles.btnIcon}>
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Usage & Benefits Grid */}
      <div className={styles.detailsGrid}>
        
        {/* Pass Usage Section */}
        <div className={styles.usageSection}>
          <h3 className={styles.sectionTitle}>PASS USAGE</h3>
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>RIDES USED</span>
              <span className={styles.statValue}>24</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>RIDES REMAINING</span>
              <span className={styles.statValue}>UNLIMITED</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>DAYS REMAINING</span>
              <span className={styles.statValue}>21</span>
            </div>
          </div>
          <div className={styles.routeCoverageCard}>
            <span className={styles.statLabel}>COVERED ROUTES</span>
            <div className={styles.routeHeader}>
              <h4>KRISHNAGIRI</h4>
              <Navigation size={16} className={styles.routeIcon} />
              <h4>HOSUR</h4>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className={styles.benefitsSection}>
          <h3 className={styles.sectionTitle}>WHAT'S INCLUDED</h3>
          <ul className={styles.benefitsList}>
            <li><CheckCircle2 size={18} className={styles.checkIcon}/> Unlimited covered rides</li>
            <li><CheckCircle2 size={18} className={styles.checkIcon}/> Multiple vehicle types</li>
            <li><CheckCircle2 size={18} className={styles.checkIcon}/> Fixed corridor access</li>
            <li><CheckCircle2 size={18} className={styles.checkIcon}/> Priority booking</li>
            <li><CheckCircle2 size={18} className={styles.checkIcon}/> Digital pass verification</li>
          </ul>
        </div>
      </div>

      {/* Pass History */}
      <div className={styles.historySection}>
        <h3 className={styles.sectionTitle}>PASS ACTIVITY</h3>
        <div className={styles.timeline}>
          <div className={styles.timelineItem}>
            <div className={styles.timelineDate}>11 Aug</div>
            <div className={styles.timelineDot}></div>
            <div className={styles.timelineContent}>
              <h4>Ride used</h4>
              <p>Krishnagiri &rarr; Hosur</p>
            </div>
          </div>
          <div className={styles.timelineItem}>
            <div className={styles.timelineDate}>10 Aug</div>
            <div className={styles.timelineDot}></div>
            <div className={styles.timelineContent}>
              <h4>Ride used</h4>
              <p>Hosur &rarr; Krishnagiri</p>
            </div>
          </div>
          <div className={styles.timelineItem}>
            <div className={styles.timelineDate}>08 Aug</div>
            <div className={styles.timelineDotActive}></div>
            <div className={styles.timelineContent}>
              <h4>Pass activated</h4>
              <p>Gold Tier</p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default CustomerPass;
