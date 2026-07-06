import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import API from '../api';

export default function VehiclesScreen() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async (searchQuery = '') => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/vehicles${searchQuery ? `?search=${searchQuery}` : ''}`);
      if (res.data.success) {
        setVehicles(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVehicles(search);
  };

  const getExpiryStatus = (dateStr: string) => {
    if (!dateStr) return { status: 'missing', label: 'Missing', color: 'bg-slate-100 text-slate-500', icon: AlertTriangle };
    const expiry = new Date(dateStr);
    const now = new Date();
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (daysLeft < 0) {
      return { status: 'expired', label: `Expired by ${Math.abs(daysLeft)} days`, color: 'bg-red-100 text-red-700 border-red-200', icon: ShieldAlert };
    } else if (daysLeft <= 30) {
      return { status: 'expiring', label: `Expiring in ${daysLeft} days`, color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle };
    } else {
      return { status: 'valid', label: `Valid until ${expiry.toLocaleDateString()}`, color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: ShieldCheck };
    }
  };

  const DocumentBadge = ({ title, date }: { title: string, date: string }) => {
    const status = getExpiryStatus(date);
    const Icon = status.icon;
    
    return (
      <div className={`p-3 rounded-lg border ${status.color} flex flex-col gap-1 w-48`}>
        <div className="font-semibold text-sm flex items-center gap-1.5 opacity-90">
          <Icon size={14} /> {title}
        </div>
        <div className="text-xs font-medium bg-white/50 px-2 py-1 rounded inline-block">
          {status.label}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Vehicles Management</h2>
          <p className="text-slate-500 mt-1">Monitor registered vehicles and their document expirations.</p>
        </div>
        <form onSubmit={handleSearch} className="flex relative">
          <input
            type="text"
            placeholder="Search by plate number..."
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

      <div className="flex-1 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-2">
        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : vehicles.length === 0 ? (
          <div className="text-center p-12 text-slate-500">No vehicles found.</div>
        ) : (
          <div className="space-y-3">
            {vehicles.map((v, i) => (
              <div key={i} className="flex flex-col xl:flex-row xl:items-center justify-between p-5 border border-slate-100 rounded-xl hover:border-slate-300 transition bg-slate-50/50">
                
                <div className="flex items-center gap-6 mb-4 xl:mb-0 xl:w-1/3">
                  <div className="bg-yellow-400 border-2 border-slate-800 rounded px-4 py-2 font-mono font-bold text-lg text-slate-900 shadow-sm whitespace-nowrap">
                    {v.plateNumber || 'UNKNOWN'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{v.make} {v.model}</h3>
                    <p className="text-slate-500 text-sm">Color: <span className="font-medium text-slate-700">{v.color}</span> | Type: <span className="capitalize font-medium text-slate-700">{v.type}</span></p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">Driver: {v.driverName} ({v.driverPhone})</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 xl:w-2/3 xl:justify-end">
                  <DocumentBadge title="Insurance" date={v.insuranceExpiry} />
                  <DocumentBadge title="Fitness Cert." date={v.fcExpiry} />
                  <DocumentBadge title="Permit" date={v.permitExpiry} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
