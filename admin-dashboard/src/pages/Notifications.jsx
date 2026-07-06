import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { AlertTriangle, Plus, Trash2, Edit3, Save, Send } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', targetAudience: 'both', isActive: true });
  const [editingId, setEditingId] = useState(null);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/admin/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/admin/notifications/${editingId}`, form);
      } else {
        await API.post('/admin/notifications', form);
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ title: '', message: '', targetAudience: 'both', isActive: true });
      fetchNotifications();
    } catch (err) {
      console.error(err);
      alert('Failed to save notification');
    }
  };

  const handleEdit = (n) => {
    setForm({ title: n.title, message: n.message, targetAudience: n.targetAudience, isActive: n.isActive });
    setEditingId(n._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await API.delete(`/admin/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Push Notifications & Popups</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage global alerts displayed to users on app startup.</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ title: '', message: '', targetAudience: 'both', isActive: true }); setShowModal(true); }} className="btn-primary">
          <Send className="w-4 h-4 mr-2" /> New Notification
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notifications.map(n => (
          <div key={n._id} className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-5 h-5 ${n.isActive ? 'text-amber-400' : 'text-gray-500'}`} />
                  <span className="text-xs font-semibold uppercase px-2 py-0.5 bg-white/10 text-white rounded">
                    {n.targetAudience}
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${n.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                  {n.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h3 className="font-bold text-lg text-white mb-2">{n.title}</h3>
              <p className="text-sm text-[var(--text-muted)] mb-6">{n.message}</p>
            </div>
            <div className="flex justify-end gap-2 border-t border-[var(--border-glass)] pt-4">
              <button onClick={() => handleEdit(n)} className="p-2 text-[var(--text-muted)] hover:text-white transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(n._id)} className="p-2 text-red-400 hover:text-red-300 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="glass-card w-full max-w-md p-8 relative">
            <button type="button" onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-white">Cancel</button>
            <h3 className="text-lg font-bold text-white mb-6">{editingId ? 'Edit Notification' : 'New Notification'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Title</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="glass-input mt-1 w-full" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Message</label>
                <textarea rows="3" value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="glass-input mt-1 w-full" required></textarea>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Target Audience</label>
                <select value={form.targetAudience} onChange={e => setForm({...form, targetAudience: e.target.value})} className="glass-input mt-1 w-full">
                  <option value="both">Both</option>
                  <option value="customer">Customer App</option>
                  <option value="driver">Driver App</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} id="isActive" />
                <label htmlFor="isActive" className="text-sm text-white">Active (Show on app start)</label>
              </div>
              <button type="submit" className="btn-primary w-full justify-center mt-4"><Save className="w-4 h-4 mr-2" /> Save Notification</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
