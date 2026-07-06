import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get('/admin/payments');
      if (res.data.success) {
        setPayments(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching payments', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payments</h1>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="table-header">
              <tr>
                <th className="p-4">Txn ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-4 text-center">Loading payments...</td></tr>
              ) : payments.map((p) => (
                <tr key={p._id} className="table-row">
                  <td className="p-4 font-mono text-xs">{p._id.slice(-8)}</td>
                  <td className="p-4 font-medium">{p.user?.name || 'Unknown'}</td>
                  <td className="p-4 font-bold text-[var(--accent-color)]">₹{p.amount}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      p.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      p.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-[var(--text-muted)]">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && !loading && (
                <tr><td colSpan="5" className="p-4 text-center text-[var(--text-muted)]">No payments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
