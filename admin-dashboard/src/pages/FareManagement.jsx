import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { DollarSign, Tag, Save, Edit3, Activity, Plus, Trash2 } from 'lucide-react';

const FareManagement = () => {
  const [fares, setFares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFare, setEditingFare] = useState(null);
  const [editForm, setEditForm] = useState({
    baseFare: '',
    perKmCharge: '',
    perMinCharge: '',
    minFare: '',
    surgeMultiplier: '',
    vehicleType: 'bike',
    description: ''
  });

  const fetchFares = async () => {
    try {
      const response = await API.get('/admin/fares');
      setFares(response.data.data);
    } catch (err) {
      console.error('Failed to load fares configs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFares();
  }, []);

  const handleEdit = (fare) => {
    setEditingFare(fare);
    setEditForm({
      baseFare: fare.baseFare,
      perKmCharge: fare.perKmCharge,
      perMinCharge: fare.perMinCharge,
      minFare: fare.minFare,
      surgeMultiplier: fare.surgeMultiplier,
      vehicleType: fare.vehicleType,
      description: fare.description || ''
    });
  };

  const handleCreateNew = () => {
    setEditingFare({ isNew: true });
    setEditForm({
      baseFare: '',
      perKmCharge: '',
      perMinCharge: '',
      minFare: '',
      surgeMultiplier: '1',
      vehicleType: 'bike',
      description: ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fare configuration?')) return;
    try {
      await API.delete(`/admin/fares/${id}`);
      fetchFares();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete fare config');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editingFare.isNew) {
        await API.post(`/admin/fares`, editForm);
      } else {
        await API.put(`/admin/fares/${editingFare._id}`, editForm);
      }
      setEditingFare(null);
      fetchFares();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update fare settings');
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
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Fare Management</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Configure base bookings, distance charges, and active surge pricing multipliers</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Fare
        </button>
      </div>

      {fares.length === 0 && !loading && (
        <div className="text-center text-[var(--text-muted)] py-12 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-glass)]">
          <p>No fare configurations found. Add one to get started.</p>
        </div>
      )}

      {/* Fare Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fares.map((fare) => (
          <div key={fare._id} className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase px-2.5 py-0.5 bg-indigo-100 border border-indigo-200 text-indigo-700 rounded">
                  {fare.vehicleType}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(fare)}
                    className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(fare._id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-[var(--text-muted)] mb-6 h-10 overflow-hidden">{fare.description}</p>

              {/* pricing indicators */}
              <div className="space-y-3.5 border-t border-[var(--border-glass)] pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Base Flagoff Rate:</span>
                  <span className="font-semibold text-[var(--text-primary)]">₹{fare.baseFare}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Distance Rate (per km):</span>
                  <span className="font-semibold text-[var(--text-primary)]">₹{fare.perKmCharge}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Duration Rate (per min):</span>
                  <span className="font-semibold text-[var(--text-primary)]">₹{fare.perMinCharge}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Minimum Ride Fare:</span>
                  <span className="font-semibold text-[var(--text-primary)]">₹{fare.minFare}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Surge Multiplier:</span>
                  <span className={`font-semibold ${fare.surgeMultiplier > 1 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {fare.surgeMultiplier}x
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal sheet */}
      {editingFare && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUpdate} className="glass-card w-full max-w-md p-8 relative">
            <button
              type="button"
              onClick={() => setEditingFare(null)}
              className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>

            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">
              {editingFare.isNew ? 'Create New Pricing Config' : `Update ${editingFare.vehicleType?.toUpperCase() || ''} Pricing Config`}
            </h3>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {editingFare.isNew && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Vehicle Type</label>
                    <select
                      value={editForm.vehicleType}
                      onChange={(e) => setEditForm({ ...editForm, vehicleType: e.target.value })}
                      className="glass-input"
                      required
                    >
                      <option value="bike">Bike</option>
                      <option value="auto">Auto</option>
                      <option value="mini">Mini</option>
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Description</label>
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="glass-input"
                      placeholder="e.g. Standard 4-seater"
                    />
                  </div>
                </>
              )}
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Base Rate (₹)</label>
                <input
                  type="number"
                  value={editForm.baseFare}
                  onChange={(e) => setEditForm({ ...editForm, baseFare: parseFloat(e.target.value) })}
                  className="glass-input"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Per Km Charge (₹)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editForm.perKmCharge}
                  onChange={(e) => setEditForm({ ...editForm, perKmCharge: parseFloat(e.target.value) })}
                  className="glass-input"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Per Min Charge (₹)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editForm.perMinCharge}
                  onChange={(e) => setEditForm({ ...editForm, perMinCharge: parseFloat(e.target.value) })}
                  className="glass-input"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Minimum Ride Fare (₹)</label>
                <input
                  type="number"
                  value={editForm.minFare}
                  onChange={(e) => setEditForm({ ...editForm, minFare: parseFloat(e.target.value) })}
                  className="glass-input"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Surge Pricing Multiplier</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={editForm.surgeMultiplier}
                  onChange={(e) => setEditForm({ ...editForm, surgeMultiplier: parseFloat(e.target.value) })}
                  className="glass-input"
                  required
                />
              </div>

              <button type="submit" className="btn-primary w-full justify-center mt-4">
                <Save className="w-4 h-4" /> Save Pricing Config
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FareManagement;
