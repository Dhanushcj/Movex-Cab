import React from 'react';
import { DollarSign, TrendingUp, ArrowDownToLine, Clock } from 'lucide-react';
import styles from './DriverWallet.module.css';

const DriverWallet = () => {
  return (
    <div className={styles.walletContainer}>
      <h1 className={styles.pageTitle}>Earnings & Wallet</h1>
      
      <div className={styles.metricsGrid}>
        <div className={`${styles.card} ${styles.primaryCard}`}>
          <p className={styles.cardLabel}>Available Balance</p>
          <h2 className={styles.cardValue}>$485.50</h2>
          <button className={styles.btnWithdraw}>
            <ArrowDownToLine size={18} strokeWidth={2.5} /> Withdraw Funds
          </button>
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={`${styles.iconWrapper} ${styles.iconSuccess}`}>
              <TrendingUp size={20} strokeWidth={2.5} />
            </div>
            <h3>This Week</h3>
          </div>
          <h2 className={styles.cardValueSecondary}>$842.20</h2>
          <p className={`${styles.trendText} ${styles.trendSuccess}`}>+15% from last week</p>
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={`${styles.iconWrapper} ${styles.iconInfo}`}>
              <DollarSign size={20} strokeWidth={2.5} />
            </div>
            <h3>Today</h3>
          </div>
          <h2 className={styles.cardValueSecondary}>$124.50</h2>
          <p className={`${styles.trendText} ${styles.trendNeutral}`}>8 trips completed</p>
        </div>
      </div>
      
      <h2 className={styles.sectionTitle}>Recent Transactions</h2>
      
      <div className={styles.tableContainer}>
        <table className={styles.transactionsTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Aug 06, 2026</td>
              <td>Trip Payment (TRP-10523)</td>
              <td className={styles.amountPositive}>+$18.50</td>
              <td><span className={`${styles.statusBadge} ${styles.statusCompleted}`}>Completed</span></td>
            </tr>
            <tr>
              <td>Aug 05, 2026</td>
              <td>Trip Payment (TRP-10499)</td>
              <td className={styles.amountPositive}>+$24.00</td>
              <td><span className={`${styles.statusBadge} ${styles.statusCompleted}`}>Completed</span></td>
            </tr>
            <tr>
              <td>Aug 01, 2026</td>
              <td>Bank Withdrawal</td>
              <td className={styles.amountNegative}>-$500.00</td>
              <td><span className={`${styles.statusBadge} ${styles.statusCompleted}`}>Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriverWallet;
