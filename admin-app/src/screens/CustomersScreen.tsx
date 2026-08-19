import React, { useState, useEffect } from 'react';
import { Search, History, ChevronRight } from 'lucide-react';
import API from '../api';

export default function CustomersScreen() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchCustomers = async (searchQuery = '') => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/customers${searchQuery ? `?search=${searchQuery}` : ''}`);
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  const loadHistory = async (customer: any) => {
    setSelectedCustomer(customer);
    setLoadingHistory(true);
    try {
      const res = await API.get(`/admin/customers/${customer._id}/history`);
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Customers Management</h2>
        <form onSubmit={handleSearch} className="flex relative">
          <input
            type="text"
            placeholder="Search by phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <button type="submit" className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            Search
          </button>
        </form>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Customers List */}
        <div className="w-1/2 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden">
          <div className="bg-slate-50 p-4 border-b border-slate-200 font-semibold text-slate-700 flex justify-between">
            <span>Customer Details</span>
            <span>Joined</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            ) : customers.length === 0 ? (
              <div className="text-center p-8 text-slate-500">No customers found.</div>
            ) : (
              customers.map(c => (
                <div 
                  key={c._id} 
                  onClick={() => loadHistory(c)}
                  className={`flex justify-between items-center p-4 mb-2 rounded-xl border cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50/50 ${selectedCustomer?._id === c._id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-100 bg-white'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                      {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{c.name || 'Unknown'}</h4>
                      <p className="text-slate-500 text-sm">{c.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    <ChevronRight size={18} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Travel History */}
        <div className="w-1/2 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden">
          {selectedCustomer ? (
            <>
              <div className="bg-blue-600 p-6 text-white">
                <h3 className="font-bold text-xl">{selectedCustomer.name}'s Travel History</h3>
                <p className="opacity-80 mt-1">{history.length} trips taken</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                {loadingHistory ? (
                  <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                ) : history.length === 0 ? (
                  <div className="text-center p-12 text-slate-500 flex flex-col items-center">
                    <History size={48} className="mb-4 opacity-30" />
                    <p>This customer hasn't taken any trips yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map(booking => (
                      <div key={booking._id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-3">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
                            booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {booking.status}
                          </span>
                          <span className="text-slate-500 text-sm">{new Date(booking.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="space-y-2 mb-3">
                          <div className="flex gap-2">
                            <span className="text-emerald-500 font-bold">●</span>
                            <span className="text-slate-700 text-sm truncate">{booking.pickup?.address || 'Unknown pickup'}</span>
                          </div>
                          <div className="border-l-2 border-dashed border-slate-200 ml-1.5 h-3"></div>
                          <div className="flex gap-2">
                            <span className="text-red-500 font-bold">■</span>
                            <span className="text-slate-700 text-sm truncate">{booking.dropoff?.address || 'Unknown dropoff'}</span>
                          </div>
                        </div>
                        {booking.driver && (
                          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                            <div className="text-sm">
                              <span className="text-slate-400">Driver: </span>
                              <span className="font-semibold text-slate-700">{booking.driver.name}</span>
                            </div>
                            <div className="font-bold text-emerald-600">₹{booking.fare}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 bg-slate-50">
              <History size={64} className="mb-4 opacity-20" />
              <p className="text-lg">Select a customer to view their travel history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
