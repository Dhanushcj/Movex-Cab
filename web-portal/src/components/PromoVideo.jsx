import React from 'react';
import styles from './PromoVideo.module.css';
import promoVideo from '../assets/promo-video.mp4';

const PromoVideo = () => {
  return (
    <section className={styles.videoSection}>
      <div className={styles.videoContainer}>
        <video 
          className={styles.promoVideo} 
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src={promoVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Floating UI Badge to cover the watermark elegantly */}
        <div className={styles.floatingBadge}>
          <div className={styles.badgeHeader}>
            <div className={styles.pulsingDot}></div>
            <span className={styles.liveText}>LIVE</span>
          </div>
          <div className={styles.badgeContent}>
            <img src="/logo.png" alt="Forge" className={styles.badgeLogo} />
            <span>Forge Live Connect</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoVideo;
