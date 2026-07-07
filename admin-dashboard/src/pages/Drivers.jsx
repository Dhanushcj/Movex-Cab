import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { ShieldCheck, UserX, AlertTriangle, Image, ExternalLink, X, Check, Activity } from 'lucide-react';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Edit Form State
  const [editForm, setEditForm] = useState({
    employeeId: '',
    vehicle: { make: '', model: '', year: '', plateNumber: '', color: '', type: 'bike' },
    documents: {
      drivingLicense: { expiryDate: '', number: '' },
      vehicleRC: { expiryDate: '', number: '' },
      insurance: { expiryDate: '', number: '' },
      permit: { expiryDate: '', number: '' },
      fitnessCertificate: { expiryDate: '', number: '' }
    }
  });

  const handleEditClick = (driver) => {
    setSelectedDriver(driver);
    setEditForm({
      employeeId: driver.employeeId || '',
      vehicle: { 
        make: driver.vehicle?.make || '', 
        model: driver.vehicle?.model || '', 
        year: driver.vehicle?.year || '', 
        plateNumber: driver.vehicle?.plateNumber || '', 
        color: driver.vehicle?.color || '', 
        type: driver.vehicle?.type || 'bike' 
      },
      documents: {
        drivingLicense: { 
          expiryDate: driver.documents?.drivingLicense?.expiryDate ? new Date(driver.documents.drivingLicense.expiryDate).toISOString().split('T')[0] : '',
          number: driver.documents?.drivingLicense?.number || ''
        },
        vehicleRC: { 
          expiryDate: driver.documents?.vehicleRC?.expiryDate ? new Date(driver.documents.vehicleRC.expiryDate).toISOString().split('T')[0] : '',
          number: driver.documents?.vehicleRC?.number || ''
        },
        insurance: { 
          expiryDate: driver.documents?.insurance?.expiryDate ? new Date(driver.documents.insurance.expiryDate).toISOString().split('T')[0] : '',
          number: driver.documents?.insurance?.number || ''
        },
        permit: { 
          expiryDate: driver.documents?.permit?.expiryDate ? new Date(driver.documents.permit.expiryDate).toISOString().split('T')[0] : '',
          number: driver.documents?.permit?.number || ''
        },
        fitnessCertificate: { 
          expiryDate: driver.documents?.fitnessCertificate?.expiryDate ? new Date(driver.documents.fitnessCertificate.expiryDate).toISOString().split('T')[0] : '',
          number: driver.documents?.fitnessCertificate?.number || ''
        }
      }
    });
  };

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
        approvalStatus: 'approved',
        employeeId: editForm.employeeId,
        vehicle: editForm.vehicle,
        documents: editForm.documents
      });
      setSelectedDriver(null);
      fetchDrivers();
    } catch (err) {
      alert('Failed to approve driver');
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveEdits = async (driverId) => {
    setProcessing(true);
    try {
      await API.put(`/admin/drivers/${driverId}`, {
        employeeId: editForm.employeeId,
        vehicle: editForm.vehicle,
        documents: editForm.documents
      });
      setSelectedDriver(null);
      fetchDrivers();
    } catch (err) {
      alert('Failed to save driver details');
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
    <>
      <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Driver Management</h2>
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
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                      {driver.name[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--text-primary)] text-sm">{driver.name}</h4>
                      <p className="text-xs text-[var(--text-muted)]">
                        {driver.phone} {driver.employeeId && <span className="ml-1 text-indigo-700 font-bold">• {driver.employeeId}</span>}
                      </p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="text-xs font-semibold uppercase px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded">
                    {driver.vehicle?.type}
                  </span>
                  <div className="text-xs text-[var(--text-primary)] mt-1">
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
                <td className="font-semibold text-[var(--text-primary)] text-sm">
                  ₹{driver.earnings?.total || 0}
                </td>
                <td className="text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleEditClick(driver)}
                      className="btn-secondary py-1.5 px-3 text-xs"
                    >
                      Manage & Audit
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

            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Driver Management & Audit</h3>
            
            <div className="flex gap-4 items-center p-4 bg-[var(--bg-tertiary)] rounded-xl mb-6 border border-[var(--border-glass)]">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-lg">
                {selectedDriver.name[0]}
              </div>
              <div>
                <h4 className="font-bold text-[var(--text-primary)]">{selectedDriver.name}</h4>
                <p className="text-sm text-[var(--text-muted)]">{selectedDriver.phone}</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Employee ID */}
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2 block">Employee ID</label>
                <input 
                  type="text" 
                  className="glass-input w-full bg-white/5 opacity-70 cursor-not-allowed"
                  placeholder="Auto-generated upon approval"
                  value={editForm.employeeId}
                  disabled
                />
                <p className="text-[10px] text-[var(--text-muted)] mt-1">This ID is generated automatically upon approval and cannot be changed.</p>
              </div>

              {/* Vehicle Details */}
              <div className="p-4 bg-[var(--bg-tertiary)] border border-[var(--border-glass)] rounded-xl">
                <h5 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Vehicle Details</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1 block">Make</label>
                    <input type="text" className="glass-input w-full" value={editForm.vehicle.make} onChange={(e) => setEditForm({...editForm, vehicle: {...editForm.vehicle, make: e.target.value}})} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1 block">Model</label>
                    <input type="text" className="glass-input w-full" value={editForm.vehicle.model} onChange={(e) => setEditForm({...editForm, vehicle: {...editForm.vehicle, model: e.target.value}})} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1 block">Year</label>
                    <input type="number" className="glass-input w-full" value={editForm.vehicle.year} onChange={(e) => setEditForm({...editForm, vehicle: {...editForm.vehicle, year: e.target.value}})} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1 block">Plate #</label>
                    <input type="text" className="glass-input w-full uppercase" value={editForm.vehicle.plateNumber} onChange={(e) => setEditForm({...editForm, vehicle: {...editForm.vehicle, plateNumber: e.target.value.toUpperCase()}})} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1 block">Color</label>
                    <input type="text" className="glass-input w-full" value={editForm.vehicle.color} onChange={(e) => setEditForm({...editForm, vehicle: {...editForm.vehicle, color: e.target.value}})} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1 block">Type</label>
                    <select className="glass-input w-full" value={editForm.vehicle.type} onChange={(e) => setEditForm({...editForm, vehicle: {...editForm.vehicle, type: e.target.value}})}>
                      <option value="bike">Bike</option>
                      <option value="auto">Auto</option>
                      <option value="mini">Mini</option>
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Documents Expiry & Details */}
              <div className="p-4 bg-[var(--bg-tertiary)] border border-[var(--border-glass)] rounded-xl">
                <h5 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Document Details & Expirations</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Driving License */}
                  <div className="p-3 bg-indigo-100/50 rounded-lg border border-[var(--border-glass)] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">Driving License</span>
                      {selectedDriver.documents?.drivingLicense?.url && (
                        <a href={`https://movex-cab.onrender.com${selectedDriver.documents.drivingLicense.url}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-700 flex items-center hover:underline">
                          <ExternalLink className="w-3 h-3 mr-1" /> View Image
                        </a>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-[var(--text-muted)] block mb-1">Doc Number</label>
                      <input type="text" className="glass-input w-full py-1.5 text-sm" placeholder="License Number" value={editForm.documents.drivingLicense.number} onChange={(e) => setEditForm({...editForm, documents: {...editForm.documents, drivingLicense: { ...editForm.documents.drivingLicense, number: e.target.value }}})} />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-[var(--text-muted)] block mb-1">Expiry Date</label>
                      <input type="date" className="glass-input w-full py-1.5 text-sm" value={editForm.documents.drivingLicense.expiryDate} onChange={(e) => setEditForm({...editForm, documents: {...editForm.documents, drivingLicense: { ...editForm.documents.drivingLicense, expiryDate: e.target.value }}})} />
                    </div>
                  </div>
                  {/* Vehicle RC */}
                  <div className="p-3 bg-indigo-100/50 rounded-lg border border-[var(--border-glass)] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">Vehicle RC</span>
                      {selectedDriver.documents?.vehicleRC?.url && (
                        <a href={`https://movex-cab.onrender.com${selectedDriver.documents.vehicleRC.url}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-700 flex items-center hover:underline">
                          <ExternalLink className="w-3 h-3 mr-1" /> View Image
                        </a>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-[var(--text-muted)] block mb-1">Doc Number</label>
                      <input type="text" className="glass-input w-full py-1.5 text-sm" placeholder="RC Number" value={editForm.documents.vehicleRC.number} onChange={(e) => setEditForm({...editForm, documents: {...editForm.documents, vehicleRC: { ...editForm.documents.vehicleRC, number: e.target.value }}})} />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-[var(--text-muted)] block mb-1">Expiry Date</label>
                      <input type="date" className="glass-input w-full py-1.5 text-sm" value={editForm.documents.vehicleRC.expiryDate} onChange={(e) => setEditForm({...editForm, documents: {...editForm.documents, vehicleRC: { ...editForm.documents.vehicleRC, expiryDate: e.target.value }}})} />
                    </div>
                  </div>
                  {/* Insurance */}
                  <div className="p-3 bg-indigo-100/50 rounded-lg border border-[var(--border-glass)] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">Insurance</span>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-[var(--text-muted)] block mb-1">Doc Number</label>
                      <input type="text" className="glass-input w-full py-1.5 text-sm" placeholder="Policy Number" value={editForm.documents.insurance.number} onChange={(e) => setEditForm({...editForm, documents: {...editForm.documents, insurance: { ...editForm.documents.insurance, number: e.target.value }}})} />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-[var(--text-muted)] block mb-1">Expiry Date</label>
                      <input type="date" className="glass-input w-full py-1.5 text-sm" value={editForm.documents.insurance.expiryDate} onChange={(e) => setEditForm({...editForm, documents: {...editForm.documents, insurance: { ...editForm.documents.insurance, expiryDate: e.target.value }}})} />
                    </div>
                  </div>
                  {/* Permit */}
                  <div className="p-3 bg-indigo-100/50 rounded-lg border border-[var(--border-glass)] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">Permit</span>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-[var(--text-muted)] block mb-1">Doc Number</label>
                      <input type="text" className="glass-input w-full py-1.5 text-sm" placeholder="Permit Number" value={editForm.documents.permit.number} onChange={(e) => setEditForm({...editForm, documents: {...editForm.documents, permit: { ...editForm.documents.permit, number: e.target.value }}})} />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-[var(--text-muted)] block mb-1">Expiry Date</label>
                      <input type="date" className="glass-input w-full py-1.5 text-sm" value={editForm.documents.permit.expiryDate} onChange={(e) => setEditForm({...editForm, documents: {...editForm.documents, permit: { ...editForm.documents.permit, expiryDate: e.target.value }}})} />
                    </div>
                  </div>
                  {/* FC */}
                  <div className="p-3 bg-indigo-100/50 rounded-lg border border-[var(--border-glass)] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">Fitness Certificate (FC)</span>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-[var(--text-muted)] block mb-1">Doc Number</label>
                      <input type="text" className="glass-input w-full py-1.5 text-sm" placeholder="FC Number" value={editForm.documents.fitnessCertificate.number} onChange={(e) => setEditForm({...editForm, documents: {...editForm.documents, fitnessCertificate: { ...editForm.documents.fitnessCertificate, number: e.target.value }}})} />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-[var(--text-muted)] block mb-1">Expiry Date</label>
                      <input type="date" className="glass-input w-full py-1.5 text-sm" value={editForm.documents.fitnessCertificate.expiryDate} onChange={(e) => setEditForm({...editForm, documents: {...editForm.documents, fitnessCertificate: { ...editForm.documents.fitnessCertificate, expiryDate: e.target.value }}})} />
                    </div>
                  </div>
                </div>
              </div>

            {selectedDriver.approvalStatus === 'pending' ? (
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
                    Save & Approve Driver
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-6 border-t border-[var(--border-glass)] flex justify-end">
                <button
                  onClick={() => handleSaveEdits(selectedDriver._id)}
                  disabled={processing}
                  className="btn-primary text-sm"
                >
                  Save Changes
                </button>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Drivers;
