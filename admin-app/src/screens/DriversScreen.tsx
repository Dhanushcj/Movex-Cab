import React, { useState, useEffect } from 'react';
import { Search, Car, Calendar, CheckCircle, Navigation } from 'lucide-react';
import API from '../api';

export default function DriversScreen() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDrivers = async (searchQuery = '') => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/drivers${searchQuery ? `?search=${searchQuery}` : ''}`);
      if (res.data.success) {
        setDrivers(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDrivers(search);
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Drivers Management</h2>
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

      <div className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-medium uppercase tracking-wider">
                <th className="p-4">Driver Profile</th>
                <th className="p-4">Vehicle Info</th>
                <th className="p-4">Activity Stats</th>
                <th className="p-4">Last Trip Finished</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center"><div className="animate-spin inline-block rounded-full h-8 w-8 border-b-2 border-blue-600"></div></td></tr>
              ) : drivers.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No drivers found.</td></tr>
              ) : (
                drivers.map(d => (
                  <tr key={d._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-lg">
                          {d.name ? d.name.charAt(0).toUpperCase() : 'D'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{d.name}</div>
                          <div className="text-slate-500 text-sm">{d.phone}</div>
                          <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                            <Calendar size={12} /> Joined {new Date(d.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {d.vehicle?.plateNumber ? (
                        <div>
                          <div className="font-semibold text-slate-700 flex items-center gap-2">
                            <Car size={16} className="text-slate-400" />
                            {d.vehicle.make} {d.vehicle.model}
                          </div>
                          <div className="text-slate-500 text-sm bg-slate-100 inline-block px-2 py-0.5 rounded mt-1 border border-slate-200">
                            {d.vehicle.plateNumber}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-sm">No vehicle assigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={18} className="text-emerald-500" />
                        <span className="font-bold text-slate-700">{d.tripsCompleted || 0}</span>
                        <span className="text-slate-500 text-sm">trips completed</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {d.lastTrip ? (
                        <div className="text-sm">
                          <div className="text-slate-700 font-medium">{new Date(d.lastTrip.completedAt).toLocaleString()}</div>
                          <div className="text-slate-500 truncate max-w-xs flex items-center gap-1 mt-1">
                            <Navigation size={12} /> {d.lastTrip.dropoff?.address || 'Unknown destination'}
                          </div>
                          <div className="font-bold text-emerald-600 mt-1">₹{d.lastTrip.fare}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm italic">No trips yet</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2 items-start">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
                          d.approvalStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          d.approvalStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {d.approvalStatus}
                        </span>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 ${
                          d.isOnline ? 'text-blue-600 bg-blue-50 border border-blue-200' : 'text-slate-500 bg-slate-100 border border-slate-200'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${d.isOnline ? 'bg-blue-600' : 'bg-slate-400'}`}></span>
                          {d.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
