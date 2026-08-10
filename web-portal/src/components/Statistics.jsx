import React, { useState, useEffect } from 'react';
import { Users, Route, Layers, CheckCircle } from 'lucide-react';
import styles from './Statistics.module.css';

const statsData = [
  { id: 1, label: 'Active Riders', target: 50, suffix: 'K+', icon: Users, desc: 'Daily city commuters' },
  { id: 2, label: 'Covered Routes', target: 120, suffix: '+', icon: Route, desc: 'Fixed transit corridors' },
  { id: 3, label: 'Transport Modes', target: 4, suffix: ' Modes', icon: Layers, desc: 'Bike · Auto · Cab · Bus' },
  { id: 4, label: 'Rides Completed', target: 1, suffix: 'M+', icon: CheckCircle, desc: 'Zero-fare trips served' }
];

const Statistics = () => {
  const [counts, setCounts] = useState(statsData.map(() => 0));

  useEffect(() => {
    const duration = 2000;
    const steps = 50;
    const intervalTime = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCounts(statsData.map((stat) => Math.min(stat.target, Math.floor((stat.target / steps) * step))));
      if (step >= steps) clearInterval(timer);
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className={styles.statsSection}>
      <div className="container">
        <div className={styles.statsBanner}>
          <div className={styles.grid}>
            {statsData.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={stat.id} className={styles.statCard}>
                  <div className={styles.iconBox}>
                    <Icon size={24} className={styles.icon} />
                  </div>
                  <div className={styles.numRow}>
                    <span className={styles.number}>{counts[idx]}</span>
                    <span className={styles.suffix}>{stat.suffix}</span>
                  </div>
                  <div className={styles.accentLine} />
                  <h3 className={styles.label}>{stat.label}</h3>
                  <span className={styles.desc}>{stat.desc}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Statistics;
