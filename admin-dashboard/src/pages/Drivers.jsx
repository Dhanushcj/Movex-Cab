import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { ShieldCheck, UserX, AlertTriangle, Image, ExternalLink, X, Check, Activity } from 'lucide-react';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchDrivers = async () => {
    try {
      const response = await API.get('/admin/drivers');
      setDrivers(response.data.data);
    } catch (err) {
      console.error('Failed to load drivers registry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleApprove = async (driverId) => {
    setProcessing(true);
    try {
      await API.put(`/admin/drivers/${driverId}`, {
        approvalStatus: 'approved'
      });
      setSelectedDriver(null);
      fetchDrivers();
    } catch (err) {
      alert('Failed to approve driver');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (driverId) => {
    if (!rejectReason) return alert('Rejection reason is required');
    setProcessing(true);
    try {
      await API.put(`/admin/drivers/${driverId}`, {
        approvalStatus: 'rejected',
        rejectionReason: rejectReason
      });
      setSelectedDriver(null);
      setRejectReason('');
      fetchDrivers();
    } catch (err) {
      alert('Failed to reject driver');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleBlock = async (driverId, currentBlocked) => {
    try {
      await API.put(`/admin/drivers/${driverId}`, {
        isBlocked: !currentBlocked
      });
      fetchDrivers();
    } catch (err) {
      alert('Failed to update block status');
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Driver Management</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Verify documents, approve accounts, and audit taxi vehicles</p>
        </div>
      </div>

      {/* Driver Grid/Table */}
      <div className="glass-card overflow-hidden">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Driver Info</th>
              <th>Vehicle Details</th>
              <th>Registration status</th>
              <th>Current online</th>
              <th>Earnings (total)</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver._id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400">
                      {driver.name[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{driver.name}</h4>
                      <p className="text-xs text-[var(--text-muted)]">{driver.phone}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="text-xs font-semibold uppercase px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded">
                    {driver.vehicle?.type}
                  </span>
                  <div className="text-xs text-white mt-1">
                    {driver.vehicle?.make} {driver.vehicle?.model} • <span className="text-[var(--text-muted)]">{driver.vehicle?.plateNumber}</span>
                  </div>
                </td>
                <td>
                  <span className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-full border ${
                    driver.approvalStatus === 'approved' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : driver.approvalStatus === 'pending'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}>
                    {driver.approvalStatus}
                  </span>
                </td>
                <td>
                  <span className={`w-2.5 h-2.5 rounded-full inline-block mr-2 ${driver.isOnline ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-slate-700'}`} />
                  <span className="text-sm">{driver.isOnline ? 'Online' : 'Offline'}</span>
                </td>
                <td className="font-semibold text-white text-sm">
                  ₹{driver.earnings?.total || 0}
                </td>
                <td className="text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setSelectedDriver(driver)}
                      className="btn-secondary py-1.5 px-3 text-xs"
                    >
                      Inspect Docs
                    </button>
                    <button
                      onClick={() => handleToggleBlock(driver._id, driver.isBlocked)}
                      className={`py-1.5 px-3 rounded-lg font-medium text-xs border transition-colors ${
                        driver.isBlocked 
                          ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25' 
                          : 'bg-rose-500/15 border-rose-500/20 text-rose-400 hover:bg-rose-500/25'
                      }`}
                    >
                      {driver.isBlocked ? 'Activate' : 'Suspend'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inspection Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative">
            <button 
              onClick={() => setSelectedDriver(null)}
              className="absolute top-6 right-6 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5 text-[var(--text-muted)]" />
            </button>

            <h3 className="text-xl font-bold text-white mb-6">Driver Document Audit</h3>
            
            <div className="flex gap-4 items-center p-4 bg-slate-900/50 rounded-xl mb-6 border border-[var(--border-glass)]">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400 text-lg">
                {selectedDriver.name[0]}
              </div>
              <div>
                <h4 className="font-bold text-white">{selectedDriver.name}</h4>
                <p className="text-sm text-[var(--text-muted)]">{selectedDriver.phone} • Vehicle Type: {selectedDriver.vehicle?.type.toUpperCase()}</p>
              </div>
            </div>

            {/* Documents preview grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Driving License */}
              <div className="p-4 bg-slate-900/40 border border-[var(--border-glass)] rounded-xl">
                <h5 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">Driving License</h5>
                <div className="text-sm font-semibold text-white mb-1">No: {selectedDriver.documents?.drivingLicense?.number || 'N/A'}</div>
                <a 
                  href={`http://localhost:5000${selectedDriver.documents?.drivingLicense?.url}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-indigo-400 flex items-center gap-1 hover:underline mt-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View document image
                </a>
              </div>

              {/* Vehicle RC */}
              <div className="p-4 bg-slate-900/40 border border-[var(--border-glass)] rounded-xl">
                <h5 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">Registration Certificate (RC)</h5>
                <div className="text-sm font-semibold text-white mb-1">No: {selectedDriver.documents?.vehicleRC?.number || 'N/A'}</div>
                <a 
                  href={`http://localhost:5000${selectedDriver.documents?.vehicleRC?.url}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-indigo-400 flex items-center gap-1 hover:underline mt-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View document image
                </a>
              </div>
            </div>

            {selectedDriver.approvalStatus === 'pending' && (
              <div className="space-y-6 pt-6 border-t border-[var(--border-glass)]">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Rejection Reason (If rejecting)</label>
                  <input
                    type="text"
                    placeholder="Enter reason details (e.g. Blurry photo)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="glass-input w-full"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleReject(selectedDriver._id)}
                    disabled={processing}
                    className="py-3 px-6 rounded-xl bg-rose-500/15 border border-rose-500/20 text-rose-400 hover:bg-rose-500/25 transition-colors text-sm font-semibold"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleApprove(selectedDriver._id)}
                    disabled={processing}
                    className="btn-primary text-sm"
                  >
                    Approve Driver
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;
