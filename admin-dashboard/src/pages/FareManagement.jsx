import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { DollarSign, Tag, Save, Edit3, Activity } from 'lucide-react';

const FareManagement = () => {
  const [fares, setFares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFare, setEditingFare] = useState(null);
  const [editForm, setEditForm] = useState({
    baseFare: '',
    perKmCharge: '',
    perMinCharge: '',
    minFare: '',
    surgeMultiplier: ''
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
      surgeMultiplier: fare.surgeMultiplier
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/admin/fares/${editingFare._id}`, editForm);
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
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Fare Management</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">Configure base bookings, distance charges, and active surge pricing multipliers</p>
      </div>

      {/* Fare Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fares.map((fare) => (
          <div key={fare._id} className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded">
                  {fare.vehicleType}
                </span>
                <button
                  onClick={() => handleEdit(fare)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-white transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-[var(--text-muted)] mb-6 h-10 overflow-hidden">{fare.description}</p>

              {/* pricing indicators */}
              <div className="space-y-3.5 border-t border-[var(--border-glass)] pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Base Flagoff Rate:</span>
                  <span className="font-semibold text-white">₹{fare.baseFare}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Distance Rate (per km):</span>
                  <span className="font-semibold text-white">₹{fare.perKmCharge}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Duration Rate (per min):</span>
                  <span className="font-semibold text-white">₹{fare.perMinCharge}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Minimum Ride Fare:</span>
                  <span className="font-semibold text-white">₹{fare.minFare}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Surge Multiplier:</span>
                  <span className={`font-semibold ${fare.surgeMultiplier > 1 ? 'text-amber-400' : 'text-emerald-400'}`}>
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
              className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-white transition-colors"
            >
              Cancel
            </button>

            <h3 className="text-lg font-bold text-white mb-6">
              Update {editingFare.vehicleType.toUpperCase()} Pricing Config
            </h3>

            <div className="space-y-4">
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
