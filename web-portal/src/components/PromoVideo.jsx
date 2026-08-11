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
        {/* Cover for the Gemini watermark */}
        <div className={styles.watermarkCover}></div>
      </div>
    </section>
  );
};

export default PromoVideo;
