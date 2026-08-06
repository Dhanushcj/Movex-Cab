import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CarFront, ShieldCheck, Map, CreditCard, ChevronRight } from 'lucide-react';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.landingContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>MoveX</div>
        <div className={styles.navLinks}>
          <button onClick={() => navigate('/login')} className={styles.btnGhost}>Log In</button>
          <button onClick={() => navigate('/register')} className={styles.btnPrimary}>Sign Up</button>
        </div>
      </nav>

      <main className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Premium Mobility <br />
            <span className={styles.highlight}>Reimagined.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Experience seamless rides and exceptional earning opportunities. Whether you're moving around the city or driving with us, MoveX is your ultimate partner on the road.
          </p>
          <div className={styles.heroActions}>
            <button onClick={() => navigate('/register?type=customer')} className={styles.btnPrimaryLarge}>
              Ride with MoveX <ChevronRight size={20} />
            </button>
            <button onClick={() => navigate('/register?type=driver')} className={styles.btnSecondaryLarge}>
              Drive with MoveX
            </button>
          </div>
        </div>
        
        <div className={styles.heroGraphic}>
          <div className={`${styles.glassCard} ${styles.floatingCard1}`}>
            <CarFront size={32} color="var(--primary)" />
            <div>
              <h3>Fast Pickups</h3>
              <p>Under 3 minutes</p>
            </div>
          </div>
          <div className={`${styles.glassCard} ${styles.floatingCard2}`}>
            <ShieldCheck size={32} color="var(--secondary)" />
            <div>
              <h3>Safe & Secure</h3>
              <p>Verified drivers</p>
            </div>
          </div>
        </div>
      </main>

      <section className={styles.featuresSection}>
        <div className={styles.featureCard}>
          <Map className={styles.featureIcon} />
          <h3>Real-time Tracking</h3>
          <p>Know exactly where your ride is and share your status with loved ones.</p>
        </div>
        <div className={styles.featureCard}>
          <CreditCard className={styles.featureIcon} />
          <h3>Seamless Payments</h3>
          <p>Cashless and hassle-free payments directly from your wallet or card.</p>
        </div>
        <div className={styles.featureCard}>
          <CarFront className={styles.featureIcon} />
          <h3>Premium Fleet</h3>
          <p>Travel in style and comfort with our top-tier vehicle selection.</p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
