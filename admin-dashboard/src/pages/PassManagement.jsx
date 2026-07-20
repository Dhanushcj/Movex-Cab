import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pencil, Save, X, Check } from 'lucide-react';


const PassManagement = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchPasses();
  }, []);

  const fetchPasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://movex-cab.onrender.com/api/admin/passes', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.data.success) {
        setPasses(res.data.data);
      }
    } catch (err) {
      alert('Failed to load passes');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (pass) => {
    setEditingId(pass._id);
    setEditForm({
      price: pass.price,
      discountPercentage: pass.discountPercentage,
      isActive: pass.isActive
    });
  };

  const handleSave = async (id) => {
    try {
      const res = await axios.put(
        `https://movex-cab.onrender.com/api/admin/passes/${id}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        }
      );
      if (res.data.success) {
        alert('Pass updated successfully');
        setEditingId(null);
        fetchPasses();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update pass');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Passes...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Premium Passes</h1>
          <p className="text-gray-500 text-sm mt-1">Manage Silver, Gold, and Diamond tier pricing and discounts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {passes.map(pass => {
          const isEditing = editingId === pass._id;
          let color = 'bg-blue-100 text-blue-800';
          if (pass.name.toLowerCase() === 'gold') color = 'bg-yellow-100 text-yellow-800';
          if (pass.name.toLowerCase() === 'diamond') color = 'bg-purple-100 text-purple-800';

          return (
            <div key={pass._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
                  {pass.name.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">{pass.validityDays} Days</span>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount (%)</label>
                    <input
                      type="number"
                      value={editForm.discountPercentage}
                      onChange={e => setEditForm({ ...editForm, discountPercentage: Number(e.target.value) })}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={e => setEditForm({ ...editForm, isActive: e.target.checked })}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={() => handleSave(pass._id)}
                      className="flex-1 bg-blue-600 text-white rounded-lg py-2 flex items-center justify-center space-x-2"
                    >
                      <Save /> <span>Save</span>
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg py-2 flex items-center justify-center space-x-2"
                    >
                      <X /> <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">₹{pass.price}</div>
                    <div className="text-green-500 font-medium mt-1">{pass.discountPercentage}% off rides</div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Check className="text-green-500 mr-2" />
                      Priority: {pass.benefits.priorityBooking ? 'Yes' : 'No'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Check className="text-green-500 mr-2" />
                      Cancellations: {pass.benefits.freeCancellations === -1 ? 'Unlimited' : pass.benefits.freeCancellations}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Check className="text-green-500 mr-2" />
                      Wait time: {pass.benefits.freeWaitTimeMinutes} mins
                    </div>
                  </div>

                  <button
                    onClick={() => startEditing(pass)}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg py-2 flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Pencil /> <span>Edit Pass</span>
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PassManagement;
