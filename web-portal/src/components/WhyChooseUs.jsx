import React from 'react';
import { Layers, ShieldCheck, MapPin, Sliders, Eye, Lock } from 'lucide-react';
import styles from './WhyChooseUs.module.css';

const features = [
  {
    icon: Layers,
    title: 'One Pass, Multiple Vehicles',
    description: 'Seamlessly switch between Bike, Auto, Cab, and Bus using a single digital subscription pass.'
  },
  {
    icon: ShieldCheck,
    title: 'Free Eligible Rides',
    description: 'Enjoy ₹0 additional ride fare for every commute within your valid pass duration and corridor.'
  },
  {
    icon: MapPin,
    title: 'Fixed Route Coverage',
    description: 'High-frequency transportation corridors connecting major city hubs, metro lines, and business parks.'
  },
  {
    icon: Sliders,
    title: 'Flexible Pickup & Drop',
    description: 'Choose any pickup point and any drop point as long as both fall within the predefined corridor.'
  },
  {
    icon: Eye,
    title: 'Transparent Eligibility',
    description: 'Instant live route checker tells you exactly whether your trip is covered before booking.'
  },
  {
    icon: Lock,
    title: 'Safe & Reliable Mobility',
    description: 'Vetted partner drivers, live GPS corridor telemetry, and 24/7 emergency rider safety response.'
  }
];

const WhyChooseUs = () => {
  return (
    <section id="features" className={styles.featuresSection}>
      <div className="container">
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>THE FORGE ADVANTAGE</span>
          <h2 className={styles.sectionTitle}>
            Why Urban Commuters <span className="forge-yellow-text">Choose Us</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Built specifically to solve daily city commute friction with transparent fixed-corridor pass technology.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className={styles.grid}>
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className={styles.featureCard}>
                <div className={styles.iconBox}>
                  <Icon size={24} className={styles.icon} />
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
