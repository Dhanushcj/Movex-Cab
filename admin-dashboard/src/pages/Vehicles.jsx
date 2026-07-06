import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Car, CheckCircle, XCircle } from 'lucide-react';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/admin/vehicles');
      setVehicles(res.data.data);
    } catch (error) {
      console.error('Error fetching vehicles', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vehicle Management</h1>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="table-header">
              <tr>
                <th className="p-4">Driver Name</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Vehicle Details</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-4 text-center">Loading vehicles...</td></tr>
              ) : vehicles.map((v) => (
                <tr key={v.driverId} className="table-row">
                  <td className="p-4 font-medium">{v.driverName}</td>
                  <td className="p-4">{v.driverPhone}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-[var(--accent-color)]" />
                      <span>{v.vehicle?.make} {v.vehicle?.model} ({v.vehicle?.plateNumber})</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${v.approvalStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {v.approvalStatus}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button className="text-[var(--accent-color)] hover:underline font-medium">View Docs</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
