import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { ShieldCheck, UserX, AlertTriangle, Image, ExternalLink, X, Check, Activity, MapPin } from 'lucide-react';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Edit Form State
  const [editForm, setEditForm] = useState({
    employeeId: '',
    assignedRoute: '',
    vehicle: { make: '', model: '', year: '', plateNumber: '', color: '', type: 'bike' },
    documents: {
      profilePhoto: { url: '' },
      drivingLicense: { expiryDate: '', number: '', url: '' },
      vehicleRC: { expiryDate: '', number: '', url: '' },
      insurance: { expiryDate: '', number: '', url: '' },
      permit: { expiryDate: '', number: '', url: '' },
      fitnessCertificate: { expiryDate: '', number: '', url: '' }
    }
  });

  
  const handleFileUpload = async (e, docKey) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingDoc(docKey);
    const formData = new FormData();
    const isImage = file.type.startsWith('image/');
    // Always use /upload/image which accepts all file types
    formData.append('image', file);
    formData.append('folder', 'documents');

    try {
      const res = await API.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        const fileUrl = res.data.imageUrl || res.data.fileUrl;

        // Update local form state
        if (docKey === 'profilePhoto') {
          setEditForm(prev => ({
            ...prev,
            documents: { ...prev.documents, profilePhoto: { url: fileUrl } }
          }));
        } else {
          setEditForm(prev => ({
            ...prev,
            documents: {
              ...prev.documents,
              [docKey]: { ...prev.documents[docKey], url: fileUrl }
            }
          }));
        }

        // ✅ Auto-save URL to database immediately so it persists after refresh
        const docUpdate = docKey === 'profilePhoto'
          ? { documents: { profilePhoto: { url: fileUrl } } }
          : { documents: { [docKey]: { url: fileUrl } } };

        await API.put(`/admin/drivers/${selectedDriver._id}`, docUpdate);

        // Update selectedDriver so the view link renders without needing full refresh
        setSelectedDriver(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [docKey]: { ...(prev.documents?.[docKey] || {}), url: fileUrl }
          }
        }));

        alert(`${docKey === 'profilePhoto' ? 'Photo' : 'Document'} uploaded and saved successfully!`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploadingDoc(null);
    }
  };


  const handleEditClick = (driver) => {
    setSelectedDriver(driver);
    setEditForm({
      employeeId: driver.employeeId || '',
      assignedRoute: driver.assignedRoute || '',
      vehicle: { 
        make: driver.vehicle?.make || '', 
        model: driver.vehicle?.model || '', 
        year: driver.vehicle?.year || '', 
        plateNumber: driver.vehicle?.plateNumber || '', 
        color: driver.vehicle?.color || '', 
        type: driver.vehicle?.type || 'bike' 
      },
      documents: {
        profilePhoto: { url: driver.documents?.profilePhoto?.url || '' },
        drivingLicense: { 
          expiryDate: driver.documents?.drivingLicense?.expiryDate ? new Date(driver.documents.drivingLicense.expiryDate).toISOString().split('T')[0] : '',
          number: driver.documents?.drivingLicense?.number || '',
          url: driver.documents?.drivingLicense?.url || ''
        },
        vehicleRC: { 
          expiryDate: driver.documents?.vehicleRC?.expiryDate ? new Date(driver.documents.vehicleRC.expiryDate).toISOString().split('T')[0] : '',
          number: driver.documents?.vehicleRC?.number || '',
          url: driver.documents?.vehicleRC?.url || ''
        },
        insurance: { 
          expiryDate: driver.documents?.insurance?.expiryDate ? new Date(driver.documents.insurance.expiryDate).toISOString().split('T')[0] : '',
          number: driver.documents?.insurance?.number || '',
          url: driver.documents?.insurance?.url || ''
        },
        permit: { 
          expiryDate: driver.documents?.permit?.expiryDate ? new Date(driver.documents.permit.expiryDate).toISOString().split('T')[0] : '',
          number: driver.documents?.permit?.number || '',
          url: driver.documents?.permit?.url || ''
        },
        fitnessCertificate: { 
          expiryDate: driver.documents?.fitnessCertificate?.expiryDate ? new Date(driver.documents.fitnessCertificate.expiryDate).toISOString().split('T')[0] : '',
          number: driver.documents?.fitnessCertificate?.number || '',
          url: driver.documents?.fitnessCertificate?.url || ''
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


  const fetchRoutes = async () => {
    try {
      const response = await API.get('/route-manager/routes');
      setRoutes(response.data.data || []);
    } catch (err) {
      console.error('Failed to load routes:', err);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleApprove = async (driverId) => {
    setProcessing(true);
    try {
      await API.put(`/admin/drivers/${driverId}`, {
        approvalStatus: 'approved',
        employeeId: editForm.employeeId,
        assignedRoute: editForm.assignedRoute,
        assignedRoute: editForm.assignedRoute,
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
        assignedRoute: editForm.assignedRoute,
        assignedRoute: editForm.assignedRoute,
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

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = 
      (driver.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (driver.phone || '').includes(searchTerm) ||
      (driver.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || driver.approvalStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Driver Management</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Verify documents, approve accounts, and audit taxi vehicles</p>
        </div>
        
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search name, phone, or ID..." 
            className="glass-input w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="glass-input w-full sm:w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Verification</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
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
            {filteredDrivers.map((driver) => (
              <tr key={driver._id}>
                <td>
                  <div className="flex items-center gap-3">
                    {driver.documents?.profilePhoto?.url ? (
                      <img src={driver.documents.profilePhoto.url.startsWith('http') ? driver.documents.profilePhoto.url : `https://movex-cab.onrender.com${driver.documents.profilePhoto.url}`} className="w-10 h-10 rounded-full object-cover border border-indigo-200" alt={driver.name} />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                        {driver.name[0]}
                      </div>
                    )}
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
                  className={`glass-input w-full ${selectedDriver.approvalStatus !== 'pending' && selectedDriver.employeeId ? 'bg-white/5 opacity-70 cursor-not-allowed' : ''}`}
                  placeholder="Leave empty to auto-generate"
                  value={editForm.employeeId}
                  onChange={(e) => setEditForm({...editForm, employeeId: e.target.value})}
                  disabled={selectedDriver.approvalStatus !== 'pending' && !!selectedDriver.employeeId}
                />
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  {selectedDriver.approvalStatus === 'pending' || !selectedDriver.employeeId 
                    ? "Leave empty to auto-generate upon approval."
                    : "Employee ID cannot be changed after assignment."}
                </p>
              </div>

              
              {/* Route Assignment (Visual) */}
              <div className="p-4 bg-[var(--bg-tertiary)] border border-[var(--border-glass)] rounded-xl mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="text-sm font-semibold text-[var(--text-primary)]">Metro Route Assignment</h5>
                  <button 
                    type="button"
                    onClick={() => setEditForm({...editForm, assignedRoute: ''})}
                    className="text-xs text-[var(--danger)] hover:underline"
                  >
                    Clear Assignment
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {routes.length === 0 ? (
                    <div className="col-span-full p-4 text-center text-[var(--text-muted)] text-sm">
                      No routes available. Create them in the Route Manager.
                    </div>
                  ) : (
                    routes.map(r => (
                      <div 
                        key={r._id} 
                        onClick={() => setEditForm({...editForm, assignedRoute: r._id})}
                        className={`cursor-pointer border rounded-xl p-3 transition-all ${
                          editForm.assignedRoute === r._id 
                            ? 'border-[var(--accent)] bg-[var(--accent)]/10 shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)]' 
                            : 'border-[var(--border-glass)] bg-white/5 hover:border-[var(--text-muted)]'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h6 className="font-bold text-[var(--text-primary)] text-sm truncate pr-2">{r.name}</h6>
                          {editForm.assignedRoute === r._id && (
                            <div className="bg-[var(--accent)] rounded-full p-1">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-[var(--text-muted)]">
                          <MapPin className="w-3 h-3 text-[var(--accent)]" />
                          <span>{r.junctions?.length || 0} Junctions</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-3">Select a visual card above to securely assign this driver to a predefined Metro route.</p>
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
                  {/* Passport Size Photo */}
                  {selectedDriver.documents?.profilePhoto?.url && (
                    <div className="p-3 bg-indigo-100/50 rounded-lg border border-[var(--border-glass)] space-y-3 md:col-span-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">Passport Size Photo</span>
                        <div className="flex items-center">
                          <a href={editForm.documents?.profilePhoto?.url || selectedDriver.documents?.profilePhoto?.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-700 flex items-center hover:underline">
                            <ExternalLink className="w-3 h-3 mr-1" /> View Image
                          </a>
                          <label className="cursor-pointer text-xs text-indigo-600 hover:text-indigo-800 flex items-center ml-3 border border-indigo-200 bg-white px-2 py-1 rounded-md shadow-sm">
                            {uploadingDoc === 'profilePhoto' ? '...' : 'Upload'}
                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'profilePhoto')} accept=".jpg,.jpeg,.png,.pdf" disabled={uploadingDoc === 'profilePhoto'} />
                          </label>
                        </div>
                      </div>
                      <img src={(editForm.documents?.profilePhoto?.url || selectedDriver.documents.profilePhoto.url).startsWith('http') ? selectedDriver.documents.profilePhoto.url : ((editForm.documents?.profilePhoto?.url || selectedDriver.documents.profilePhoto.url).startsWith("http") ? (editForm.documents?.profilePhoto?.url || selectedDriver.documents.profilePhoto.url) : `https://movex-cab.onrender.com${editForm.documents?.profilePhoto?.url || selectedDriver.documents.profilePhoto.url}`)} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm" alt="Profile" />
                    </div>
                  )}
                  {/* Driving License */}
                  <div className="p-3 bg-indigo-100/50 rounded-lg border border-[var(--border-glass)] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">Driving License</span>
                      {selectedDriver.documents?.drivingLicense?.url && (
                        <div className="flex items-center">
                          <a href={editForm.documents?.drivingLicense?.url || selectedDriver.documents?.drivingLicense?.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-700 flex items-center hover:underline">
                            <ExternalLink className="w-3 h-3 mr-1" /> View Image
                          </a>
                          <label className="cursor-pointer text-xs text-indigo-600 hover:text-indigo-800 flex items-center ml-3 border border-indigo-200 bg-white px-2 py-1 rounded-md shadow-sm">
                            {uploadingDoc === 'drivingLicense' ? '...' : 'Upload'}
                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'drivingLicense')} accept=".jpg,.jpeg,.png,.pdf" disabled={uploadingDoc === 'drivingLicense'} />
                          </label>
                        </div>
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
                        <div className="flex items-center">
                          <a href={editForm.documents?.vehicleRC?.url || selectedDriver.documents?.vehicleRC?.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-700 flex items-center hover:underline">
                            <ExternalLink className="w-3 h-3 mr-1" /> View Image
                          </a>
                          <label className="cursor-pointer text-xs text-indigo-600 hover:text-indigo-800 flex items-center ml-3 border border-indigo-200 bg-white px-2 py-1 rounded-md shadow-sm">
                            {uploadingDoc === 'vehicleRC' ? '...' : 'Upload'}
                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'vehicleRC')} accept=".jpg,.jpeg,.png,.pdf" disabled={uploadingDoc === 'vehicleRC'} />
                          </label>
                        </div>
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
                      <div className="flex items-center w-full justify-between">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">Insurance</span>
                          {(editForm.documents?.insurance?.url || selectedDriver.documents?.insurance?.url) && (
                            <a href={editForm.documents?.insurance?.url || selectedDriver.documents?.insurance?.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-700 flex items-center hover:underline">
                              <ExternalLink className="w-3 h-3 mr-1" /> View Document
                            </a>
                          )}
                        </div>
                        <label className="cursor-pointer text-xs text-indigo-600 hover:text-indigo-800 flex items-center ml-3 border border-indigo-200 bg-white px-2 py-1 rounded-md shadow-sm">
                            {uploadingDoc === 'insurance' ? '...' : 'Upload'}
                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'insurance')} accept=".jpg,.jpeg,.png,.pdf" disabled={uploadingDoc === 'insurance'} />
                          </label>
                      </div>
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
                      <div className="flex items-center w-full justify-between">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">Permit</span>
                          {(editForm.documents?.permit?.url || selectedDriver.documents?.permit?.url) && (
                            <a href={editForm.documents?.permit?.url || selectedDriver.documents?.permit?.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-700 flex items-center hover:underline">
                              <ExternalLink className="w-3 h-3 mr-1" /> View Document
                            </a>
                          )}
                        </div>
                        <label className="cursor-pointer text-xs text-indigo-600 hover:text-indigo-800 flex items-center ml-3 border border-indigo-200 bg-white px-2 py-1 rounded-md shadow-sm">
                            {uploadingDoc === 'permit' ? '...' : 'Upload'}
                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'permit')} accept=".jpg,.jpeg,.png,.pdf" disabled={uploadingDoc === 'permit'} />
                          </label>
                      </div>
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
                      <div className="flex items-center w-full justify-between">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">Fitness Certificate (FC)</span>
                          {(editForm.documents?.fitnessCertificate?.url || selectedDriver.documents?.fitnessCertificate?.url) && (
                            <a href={editForm.documents?.fitnessCertificate?.url || selectedDriver.documents?.fitnessCertificate?.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-700 flex items-center hover:underline">
                              <ExternalLink className="w-3 h-3 mr-1" /> View Document
                            </a>
                          )}
                        </div>
                        <label className="cursor-pointer text-xs text-indigo-600 hover:text-indigo-800 flex items-center ml-3 border border-indigo-200 bg-white px-2 py-1 rounded-md shadow-sm">
                            {uploadingDoc === 'fitnessCertificate' ? '...' : 'Upload'}
                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'fitnessCertificate')} accept=".jpg,.jpeg,.png,.pdf" disabled={uploadingDoc === 'fitnessCertificate'} />
                          </label>
                      </div>
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
