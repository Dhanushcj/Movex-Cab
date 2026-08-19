import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { DollarSign } from 'lucide-react';

export default function Payouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      const res = await api.get('/admin/payouts');
      if (res.data.success) {
        setPayouts(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching payouts', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Driver Payouts</h1>
        <button className="btn-primary">Generate Payout</button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="table-header">
              <tr>
                <th className="p-4">Driver</th>
                <th className="p-4">Earnings</th>
                <th className="p-4">Cash Collected</th>
                <th className="p-4">Net Payable</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-4 text-center">Loading payouts...</td></tr>
              ) : payouts.map((p) => (
                <tr key={p._id} className="table-row">
                  <td className="p-4 font-medium">{p.driver?.name || 'Unknown'}</td>
                  <td className="p-4 text-emerald-600 font-medium">₹{p.totalEarnings}</td>
                  <td className="p-4 text-rose-600 font-medium">-₹{p.cashCollected}</td>
                  <td className="p-4 font-bold text-[var(--accent-color)]">₹{p.netPayable}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      p.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                      p.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {p.status === 'pending' && (
                      <button className="text-[var(--accent-color)] hover:underline font-medium">Pay Now</button>
                    )}
                  </td>
                </tr>
              ))}
              {payouts.length === 0 && !loading && (
                <tr><td colSpan="6" className="p-4 text-center text-[var(--text-muted)]">No pending payouts</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
