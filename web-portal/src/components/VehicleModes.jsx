import React from 'react';
import { ShieldCheck, Clock, Gauge } from 'lucide-react';
import AutoRickshawIcon from './AutoRickshawIcon';
import BikeIcon from './BikeIcon';
import CarIcon from './CarIcon';
import BusIcon from './BusIcon';
import styles from './VehicleModes.module.css';

const modes = [
  {
    id: 'bike',
    name: 'BIKE',
    tagline: 'Fast short-distance mobility',
    description: 'Zip past urban traffic with single-rider electric & motor bikes. Ideal for quick metro connection and last-mile commuting.',
    icon: BikeIcon,
    speed: '35 km/h avg',
    idealFor: '1 - 6 km',
    wait: '1 - 3 mins',
    available: true,
    fleetCount: '1,200+ Active Bikes'
  },
  {
    id: 'auto',
    name: 'AUTO',
    tagline: 'Affordable everyday rides',
    description: 'The iconic city auto-rickshaw upgraded for pass holders. Seamless door-to-door corridor pickups with zero fare negotiations.',
    icon: AutoRickshawIcon,
    speed: '40 km/h avg',
    idealFor: '2 - 12 km',
    wait: '2 - 4 mins',
    available: true,
    fleetCount: '2,400+ Active Autos'
  },
  {
    id: 'cab',
    name: 'CAB',
    tagline: 'Comfortable private rides',
    description: 'Air-conditioned sedan & hatchback cabs for premium comfort. Perfect for long corridor rides, rain protection, and luggage carrying.',
    icon: CarIcon,
    speed: '48 km/h avg',
    idealFor: '5 - 35 km',
    wait: '3 - 5 mins',
    available: true,
    fleetCount: '1,800+ Active Cabs'
  },
  {
    id: 'bus',
    name: 'BUS',
    tagline: 'Reliable high-capacity transit',
    description: 'High-frequency AC shuttle buses running strictly along fixed corridor corridors every 10 minutes. Reserved seat guarantee.',
    icon: BusIcon,
    speed: '32 km/h avg',
    idealFor: '4 - 30 km',
    wait: '5 - 10 mins',
    available: true,
    fleetCount: '350+ Express Buses'
  }
];

const VehicleModes = () => {
  return (
    <section id="vehicles" className={styles.modesSection}>
      <div className="container">
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>MULTIMODAL FLEET INTEGRATION</span>
          <h2 className={styles.sectionTitle}>
            4 Ways to Ride. <span className="forge-blue-text">One Mobility Pass.</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Switch effortlessly between Bike, Auto, Cab, and Bus depending on your speed, group size, and weather preference.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className={styles.modesGrid}>
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <div key={mode.id} className={styles.modeCard}>
                {/* Top Badge */}
                <div className={styles.cardTopRow}>
                  <div className={styles.iconCircle}>
                    <Icon size={28} className={styles.modeIcon} />
                  </div>
                  <div className={styles.statusPill}>
                    <span className={styles.statusDot} />
                    <span>AVAILABLE</span>
                  </div>
                </div>

                {/* Content */}
                <h3 className={styles.modeName}>{mode.name}</h3>
                <span className={styles.modeTagline}>{mode.tagline}</span>
                <p className={styles.modeDesc}>{mode.description}</p>

                {/* Metrics Breakdown */}
                <div className={styles.metricsBox}>
                  <div className={styles.metricItem}>
                    <div className={styles.metricHeader}>
                      <Gauge size={12} />
                      <span>AVG SPEED</span>
                    </div>
                    <span className={styles.metricVal}>{mode.speed}</span>
                  </div>
                  <div className={styles.metricItem}>
                    <div className={styles.metricHeader}>
                      <Clock size={12} />
                      <span>DISPATCH</span>
                    </div>
                    <span className={styles.metricVal}>{mode.wait}</span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className={styles.cardFooter}>
                  <ShieldCheck size={14} className={styles.shieldIcon} />
                  <span className={styles.fleetLabel}>{mode.fleetCount}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default VehicleModes;
