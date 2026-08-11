import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ChevronRight, Check } from 'lucide-react';
import styles from './CustomerPass.module.css';

const passes = [
  {
    id: 'daily',
    name: 'Daily Pass',
    price: 99,
    validity: '24 Hours',
    features: ['Unlimited Metro Route rides', 'Priority support', 'Valid for 1 day'],
    recommended: false
  },
  {
    id: 'weekly',
    name: 'Weekly Pass',
    price: 499,
    validity: '7 Days',
    features: ['Unlimited Metro Route rides', '10% off custom rides', 'Priority driver matching', 'Valid for 7 days'],
    recommended: true
  },
  {
    id: 'monthly',
    name: 'Monthly Pass',
    price: 1899,
    validity: '30 Days',
    features: ['Unlimited Metro Route rides', '20% off custom rides', 'Top tier support', 'Valid for 30 days'],
    recommended: false
  }
];

const CustomerPass = () => {
  const [selectedPass, setSelectedPass] = useState(null);
  const [purchased, setPurchased] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePurchase = () => {
    if (!selectedPass) return;
    setLoading(true);
    // Mock purchase flow
    setTimeout(() => {
      setPurchased(true);
      setLoading(false);
    }, 1500);
  };

  if (purchased) {
    return (
      <div className={styles.passContainer}>
        <div className={styles.successCard}>
          <CheckCircle2 size={64} color="#10B981" />
          <h2>Pass Purchased Successfully!</h2>
          <p>Your {passes.find(p => p.id === selectedPass)?.name} is now active.</p>
          <button className={styles.btnPrimary} onClick={() => { setPurchased(false); setSelectedPass(null); }}>
            View My Passes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.passContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Forge Mobility Passes</h1>
        <p className={styles.subtitle}>Get unlimited rides on Metro Routes with our premium passes.</p>
      </div>

      <div className={styles.passGrid}>
        {passes.map(p => (
          <div 
            key={p.id} 
            className={`${styles.passCard} ${p.recommended ? styles.recommended : ''} ${selectedPass === p.id ? styles.selected : ''}`}
            onClick={() => setSelectedPass(p.id)}
          >
            {p.recommended && <div className={styles.badge}>Most Popular</div>}
            <h3>{p.name}</h3>
            <div className={styles.price}>
              <span className={styles.currency}>₹</span>
              <span className={styles.amount}>{p.price}</span>
            </div>
            <p className={styles.validity}>Valid for {p.validity}</p>
            
            <ul className={styles.features}>
              {p.features.map((f, i) => (
                <li key={i}><Check size={16} color="var(--forge-blue)" /> {f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {selectedPass && (
        <div className={styles.checkoutFooter}>
          <div className={styles.checkoutInfo}>
            <h4>Selected: {passes.find(p => p.id === selectedPass)?.name}</h4>
            <p>Total: ₹{passes.find(p => p.id === selectedPass)?.price}</p>
          </div>
          <button 
            className={styles.btnPrimary} 
            onClick={handlePurchase}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Proceed to Pay'} <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerPass;
