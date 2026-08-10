import React, { useState } from 'react';
import { CreditCard, Route, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import styles from './HowItWorks.module.css';

const steps = [
  {
    number: '01',
    title: 'Buy Pass',
    subtitle: 'Select Daily, Weekly or Monthly Pass',
    description: 'Pick the subscription tier that best fits your commute frequency. Instantly unlock unlimited mobility credentials.',
    icon: CreditCard,
    highlight: 'Instant Activation'
  },
  {
    number: '02',
    title: 'Select Route',
    subtitle: 'Select one of our predefined transportation corridors',
    description: 'Explore high-demand city corridors like Chennai Central → Egmore → Guindy → Tambaram.',
    icon: Route,
    highlight: 'Fixed Corridors'
  },
  {
    number: '03',
    title: 'Pick Pickup / Drop',
    subtitle: 'Choose any pickup & drop within the selected corridor',
    description: 'Pick your exact starting location and destination along the route. The system verifies corridor eligibility in real-time.',
    icon: MapPin,
    highlight: 'Flexible Boarding'
  },
  {
    number: '04',
    title: 'Ride FREE',
    subtitle: 'Zero additional ride fare during pass validity',
    description: 'Hop onto Bike, Auto, Cab or Bus. Your active pass covers 100% of the fare with zero surcharge.',
    icon: CheckCircle,
    highlight: '₹0 Fare Charged'
  }
];

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className={styles.howSection}>
      <div className="container">
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>SIMPLE 4-STEP WORKFLOW</span>
          <h2 className={styles.sectionTitle}>
            How Your <span className="forge-yellow-text">Mobility Pass</span> Works
          </h2>
          <p className={styles.sectionSubtitle}>
            Experience seamless urban transit with our streamlined 4-step route pass system.
          </p>
        </div>

        {/* 4-Step Process Timeline */}
        <div className={styles.stepsTimelineGrid}>
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;

            return (
              <div
                key={step.number}
                className={`${styles.stepCard} ${isActive ? styles.stepCardActive : ''}`}
                onMouseEnter={() => setActiveStep(idx)}
              >
                {/* Connector Line */}
                {idx < steps.length - 1 && <div className={styles.connectorLine} />}

                {/* Yellow Circle Step Number Badge */}
                <div className={styles.stepNumBadge}>
                  <span>{step.number}</span>
                </div>

                {/* Icon */}
                <div className={styles.iconWrapper}>
                  <Icon size={24} className={styles.stepIcon} />
                </div>

                {/* Content */}
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <h4 className={styles.stepSub}>{step.subtitle}</h4>
                <p className={styles.stepDesc}>{step.description}</p>

                {/* Bottom Tag */}
                <div className={styles.stepTag}>
                  <span>{step.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Preview Interactive Banner */}
        <div className={styles.showcaseBanner}>
          <div className={styles.showcaseLeft}>
            <span className={styles.showcaseNum}>STEP {steps[activeStep].number} PREVIEW:</span>
            <h3 className={styles.showcaseTitle}>{steps[activeStep].title}</h3>
            <p className={styles.showcaseDesc}>{steps[activeStep].description}</p>
          </div>
          <div className={styles.showcaseRight}>
            <a href="#checker" className="btn btn-yellow">
              <span>Test Route Eligibility Now</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
