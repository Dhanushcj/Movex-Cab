import React from 'react';
import styles from './ForgeLogo.module.css';

export const ForgeLogo = ({ variant = 'header', className = '' }) => {
  return (
    <div className={`${styles.logoWrapper} ${styles[variant]} ${className}`}>
      <img
        src="/logo.png"
        alt="FORGE INDIA CONNECT PVT. LTD - SHAPING FUTURE"
        className={styles.logoImg}
      />
    </div>
  );
};

export default ForgeLogo;
