import React, { useState } from 'react';
import { Check, Sparkles, Calculator, ArrowRight } from 'lucide-react';
import styles from './PassCards.module.css';

const passTiers = [
  {
    id: 'daily',
    name: 'DAILY PASS',
    price: '₹99',
    rawPrice: 99,
    validity: 'Valid for 1 Day',
    badge: null,
    popular: false,
    description: 'Perfect for single-day business trips or occasional urban commuting.',
    features: [
      'Free eligible rides on active corridor',
      'Fixed route access (Central to Tambaram)',
      'Bike · Auto · Cab · Bus included',
      'Zero ride fare charged during validity',
      'Instant route eligibility verification'
    ]
  },
  {
    id: 'weekly',
    name: 'WEEKLY PASS',
    price: '₹499',
    rawPrice: 499,
    validity: 'Valid for 7 Days',
    badge: 'MOST POPULAR',
    popular: false,
    description: 'Ideal for weekly office commuters looking for maximum flexibility.',
    features: [
      'Unlimited free rides for 7 full days',
      'All 4 transportation corridors unlocked',
      'Bike · Auto · Cab · Bus priority matching',
      'Zero ride fare charged during validity',
      'Real-time route eligibility check & live tracking',
      'Save over ₹600 compared to individual rides'
    ]
  },
  {
    id: 'monthly',
    name: 'MONTHLY PASS',
    price: '₹1,499',
    rawPrice: 1499,
    validity: 'Valid for 30 Days',
    badge: 'BEST VALUE (SAVE 65%)',
    popular: true,
    description: 'The ultimate hassle-free monthly commuting pass for smart urban riders.',
    features: [
      'Unlimited free rides for 30 full days',
      'All predefined fixed routes included',
      'Bike · Auto · Cab · Bus unlimited access',
      'No ride fare charged across valid routes',
      'Priority vehicle dispatch & premium support',
      'Pass pause flexibility (Up to 3 days)',
      'Save over ₹3,200 monthly on commute'
    ]
  }
];

const PassCards = () => {
  const [ridesPerWeek, setRidesPerWeek] = useState(10);
  const avgSingleRideFare = 160;

  const monthlySingleCost = ridesPerWeek * 4 * avgSingleRideFare;
  const passCost = 1499;
  const monthlySavings = Math.max(0, monthlySingleCost - passCost);

  return (
    <section id="passes" className={styles.passSection}>
      <div className="container">
        {/* Section Title */}
        <div className={styles.sectionHeader}>
          <div className={styles.badgePill}>
            <Sparkles size={14} className={styles.sparkleIcon} />
            <span>UNLIMITED MOBILITY SUBSCRIPTION</span>
          </div>
          <h2 className={styles.sectionTitle}>
            Your Pass. <span className="forge-yellow-text">Your Daily Ride.</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Buy a mobility pass, select any location on our fixed corridor, and enjoy <strong className="forge-blue-text">₹0 fare rides</strong> across Bike, Auto, Cab, and Bus.
          </p>
        </div>

        {/* Pass Cards Grid */}
        <div className={styles.passGrid}>
          {passTiers.map((pass) => (
            <div
              key={pass.id}
              className={`${styles.passCard} ${pass.popular ? styles.popularCard : ''}`}
            >
              {/* Top Accent Line */}
              <div className={styles.topAccentBar} />

              {/* Badge */}
              {pass.badge && (
                <div className={styles.cardBadge}>
                  <span>{pass.badge}</span>
                </div>
              )}

              {/* Card Header */}
              <div className={styles.cardHeader}>
                <span className={styles.passName}>{pass.name}</span>
                <div className={styles.priceRow}>
                  <span className={styles.priceVal}>{pass.price}</span>
                  <span className={styles.validityLabel}>/ {pass.validity}</span>
                </div>
                <p className={styles.passDesc}>{pass.description}</p>
              </div>

              {/* Modes Included */}
              <div className={styles.modesIncludedRow}>
                <span className={styles.modesLabel}>MODES INCLUDED:</span>
                <div className={styles.modesBadges}>
                  <span className={styles.modeTag}>Bike</span>
                  <span className={styles.modeTag}>Auto</span>
                  <span className={styles.modeTag}>Cab</span>
                  <span className={styles.modeTag}>Bus</span>
                </div>
              </div>

              {/* Features List */}
              <ul className={styles.featuresList}>
                {pass.features.map((feat, idx) => (
                  <li key={idx} className={styles.featureItem}>
                    <div className={styles.checkIconWrapper}>
                      <Check size={14} className={styles.checkIcon} />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {/* Card Footer */}
              <div className={styles.cardFooter}>
                <a
                  href={`/register?pass=${pass.id}`}
                  className="btn btn-yellow"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <span>Buy Pass</span>
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Savings Calculator */}
        <div className={styles.calcCard}>
          <div className={styles.calcLeft}>
            <div className={styles.calcIconBox}>
              <Calculator size={28} className={styles.calcIcon} />
            </div>
            <div>
              <h3 className={styles.calcTitle}>Calculate Your Monthly Commute Savings</h3>
              <p className={styles.calcSub}>Adjust your weekly commute rides to see how much you save with Forge Mobility Pass.</p>
            </div>
          </div>

          <div className={styles.calcRight}>
            <div className={styles.sliderGroup}>
              <div className={styles.sliderHeader}>
                <span className={styles.sliderLabel}>Your Weekly Commute Rides:</span>
                <span className={styles.sliderValue}>{ridesPerWeek} Rides / Week</span>
              </div>
              <input
                type="range"
                min="4"
                max="24"
                step="2"
                value={ridesPerWeek}
                onChange={(e) => setRidesPerWeek(Number(e.target.value))}
                className={styles.rangeSlider}
              />
            </div>

            <div className={styles.savingsResultRow}>
              <div className={styles.savingsBox}>
                <span className={styles.savingsLabel}>Without Pass Cost</span>
                <span className={styles.savingsOld}>₹{monthlySingleCost.toLocaleString('en-IN')}/mo</span>
              </div>
              <div className={styles.savingsBox}>
                <span className={styles.savingsLabel}>With Forge Pass</span>
                <span className={styles.savingsNew}>₹1,499/mo</span>
              </div>
              <div className={styles.savingsBoxHighlight}>
                <span className={styles.savingsLabelHighlight}>YOU SAVE</span>
                <span className={styles.savingsAmount}>₹{monthlySavings.toLocaleString('en-IN')}/mo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PassCards;
