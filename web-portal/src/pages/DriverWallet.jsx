import React from 'react';
import { DollarSign, TrendingUp, ArrowDownToLine, Clock } from 'lucide-react';

const DriverWallet = () => {
  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '24px' }}>Earnings & Wallet</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.2), rgba(15, 23, 42, 0.8))' }}>
          <p style={{ color: 'var(--text-muted)' }}>Available Balance</p>
          <h2 style={{ fontSize: '48px', margin: '8px 0' }}>$485.50</h2>
          <button style={{ background: 'var(--primary)', color: 'white', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
            <ArrowDownToLine size={18} /> Withdraw Funds
          </button>
        </div>
        
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: 'var(--success)' }}>
              <TrendingUp size={24} />
            </div>
            <h3 style={{ margin: 0 }}>This Week</h3>
          </div>
          <h2 style={{ fontSize: '36px', margin: 0 }}>$842.20</h2>
          <p style={{ color: 'var(--success)', fontSize: '14px', marginTop: '8px' }}>+15% from last week</p>
        </div>
        
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '10px', background: 'rgba(0, 206, 201, 0.1)', borderRadius: '8px', color: 'var(--secondary)' }}>
              <DollarSign size={24} />
            </div>
            <h3 style={{ margin: 0 }}>Today</h3>
          </div>
          <h2 style={{ fontSize: '36px', margin: 0 }}>$124.50</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>8 trips completed</p>
        </div>
      </div>
      
      <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Recent Transactions</h2>
      
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(15, 23, 42, 0.5)', borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '16px 24px', fontWeight: '500', color: 'var(--text-muted)' }}>Date</th>
              <th style={{ padding: '16px 24px', fontWeight: '500', color: 'var(--text-muted)' }}>Description</th>
              <th style={{ padding: '16px 24px', fontWeight: '500', color: 'var(--text-muted)' }}>Amount</th>
              <th style={{ padding: '16px 24px', fontWeight: '500', color: 'var(--text-muted)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <td style={{ padding: '16px 24px' }}>Aug 06, 2026</td>
              <td style={{ padding: '16px 24px' }}>Trip Payment (TRP-10523)</td>
              <td style={{ padding: '16px 24px', color: 'var(--success)' }}>+$18.50</td>
              <td style={{ padding: '16px 24px' }}><span style={{ padding: '4px 8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '12px', fontSize: '12px' }}>Completed</span></td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <td style={{ padding: '16px 24px' }}>Aug 05, 2026</td>
              <td style={{ padding: '16px 24px' }}>Trip Payment (TRP-10499)</td>
              <td style={{ padding: '16px 24px', color: 'var(--success)' }}>+$24.00</td>
              <td style={{ padding: '16px 24px' }}><span style={{ padding: '4px 8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '12px', fontSize: '12px' }}>Completed</span></td>
            </tr>
            <tr>
              <td style={{ padding: '16px 24px' }}>Aug 01, 2026</td>
              <td style={{ padding: '16px 24px' }}>Bank Withdrawal</td>
              <td style={{ padding: '16px 24px', color: 'var(--error)' }}>-$500.00</td>
              <td style={{ padding: '16px 24px' }}><span style={{ padding: '4px 8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '12px', fontSize: '12px' }}>Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriverWallet;
