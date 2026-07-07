import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Users, UserMinus, UserCheck, Activity, Search } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      const response = await API.get('/admin/customers');
      setCustomers(response.data.data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleBlock = async (userId, currentBlocked) => {
    try {
      await API.put(`/admin/customers/${userId}`, {
        isBlocked: !currentBlocked
      });
      fetchCustomers();
    } catch (err) {
      alert('Failed to update block status');
    }
  };

  // Filter customers by search term
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="animate-spin text-indigo-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Riders / Customers</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage user profiles, transaction wallets, and suspension list</p>
        </div>
        
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 text-[var(--text-muted)] w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Search name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input pl-10 w-full py-2"
          />
        </div>
      </div>

      {/* Table grid */}
      <div className="glass-card overflow-hidden">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Rider</th>
              <th>Email</th>
              <th>Wallet Balance</th>
              <th>Trips Completed</th>
              <th>Joined Date</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer._id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400">
                      {customer.name[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--text-primary)] text-sm">{customer.name}</h4>
                      <p className="text-xs text-[var(--text-muted)]">{customer.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="text-sm text-[var(--text-primary)]">
                  {customer.email || <span className="text-[var(--text-muted)] italic">No email</span>}
                </td>
                <td className="text-sm font-semibold text-[var(--text-primary)]">
                  ₹{customer.wallet?.balance || 0}
                </td>
                <td className="text-sm text-[var(--text-primary)]">
                  {customer.totalRides || 0}
                </td>
                <td className="text-xs text-[var(--text-muted)]">
                  {new Date(customer.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td>
                  <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded border ${
                    customer.isBlocked 
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>
                    {customer.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="text-right">
                  <button
                    onClick={() => handleToggleBlock(customer._id, customer.isBlocked)}
                    className={`py-1.5 px-3 rounded-lg font-medium text-xs border transition-colors inline-flex items-center gap-1.5 ${
                      customer.isBlocked 
                        ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25' 
                        : 'bg-rose-500/15 border-rose-500/20 text-rose-400 hover:bg-rose-500/25'
                    }`}
                  >
                    {customer.isBlocked ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" /> Activate
                      </>
                    ) : (
                      <>
                        <UserMinus className="w-3.5 h-3.5" /> Suspend
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-8 text-[var(--text-muted)]">
                  No matching customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
