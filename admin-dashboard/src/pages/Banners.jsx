import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { LayoutDashboard, Plus, Trash2, Edit3, Save } from 'lucide-react';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', imageUrl: '', targetAudience: 'both', isActive: true, linkUrl: '', position: 'banner1' });
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `https://movex-cab.onrender.com${url}`;
  };

  const fetchBanners = async () => {
    try {
      const res = await API.get('/admin/banners');
      setBanners(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalImageUrl = form.imageUrl;

      if (selectedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);

        const uploadRes = await API.post('/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        finalImageUrl = uploadRes.data.imageUrl;
        setUploading(false);
      }

      const payload = { ...form, imageUrl: finalImageUrl };

      if (editingId) {
        await API.put(`/admin/banners/${editingId}`, payload);
      } else {
        await API.post('/admin/banners', payload);
      }
      setShowModal(false);
      setEditingId(null);
      setSelectedFile(null);
      setForm({ title: '', imageUrl: '', targetAudience: 'both', isActive: true, linkUrl: '', position: 'banner1' });
      fetchBanners();
    } catch (err) {
      console.error(err);
      setUploading(false);
      alert('Failed to save banner');
    }
  };

  const handleEdit = (b) => {
    setForm({ title: b.title, imageUrl: b.imageUrl, targetAudience: b.targetAudience, isActive: b.isActive, linkUrl: b.linkUrl || '', position: b.position || 'banner1' });
    setEditingId(b._id);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await API.delete(`/admin/banners/${id}`);
      fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-6 text-[var(--text-primary)]">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Ad Banners</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage promotional banners for customers and drivers.</p>
        </div>
        <button onClick={() => { setEditingId(null); setSelectedFile(null); setForm({ title: '', imageUrl: '', targetAudience: 'both', isActive: true, linkUrl: '', position: 'banner1' }); setShowModal(true); }} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" /> Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map(b => (
          <div key={b._id} className="glass-card overflow-hidden flex flex-col">
            <img src={getImageUrl(b.imageUrl)} alt={b.title} className="w-full h-40 object-cover bg-gray-200 dark:bg-gray-800" />
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-[var(--text-primary)]">{b.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${b.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                    {b.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-muted)] mb-2">Audience: {b.targetAudience}</p>
                <p className="text-sm text-[var(--text-muted)] mb-2">Position: {b.position === 'banner2' ? 'Banner 2 (Bottom)' : 'Banner 1 (Top)'}</p>
                {b.linkUrl && <p className="text-xs text-blue-400 truncate mb-4">{b.linkUrl}</p>}
              </div>
              <div className="flex justify-end gap-2 border-t border-[var(--border-glass)] pt-4 mt-2">
                <button onClick={() => handleEdit(b)} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(b._id)} className="p-2 text-red-400 hover:text-red-300 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="glass-card w-full max-w-md p-8 relative">
            <button type="button" onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-[var(--text-primary)]">Cancel</button>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">{editingId ? 'Edit Banner' : 'New Banner'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Title</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="glass-input mt-1 w-full" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Banner Image</label>
                <input type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files[0])} className="glass-input mt-1 w-full text-[var(--text-primary)]" />
                {form.imageUrl && !selectedFile && (
                  <div className="mt-2">
                    <p className="text-xs text-blue-500 truncate mb-1">Current: {form.imageUrl}</p>
                    <img src={getImageUrl(form.imageUrl)} alt="Current banner preview" className="h-24 w-auto object-contain rounded border border-[var(--border-glass)]" />
                  </div>
                )}
                {selectedFile && (
                  <div className="mt-2">
                    <p className="text-xs text-emerald-500 mb-1">Selected: {selectedFile.name}</p>
                    <img src={URL.createObjectURL(selectedFile)} alt="Selected banner preview" className="h-24 w-auto object-contain rounded border border-[var(--border-glass)]" />
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Target Audience</label>
                <select value={form.targetAudience} onChange={e => setForm({...form, targetAudience: e.target.value})} className="glass-input mt-1 w-full">
                  <option value="both">Both</option>
                  <option value="customer">Customer App</option>
                  <option value="driver">Driver App</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Position</label>
                <select value={form.position} onChange={e => setForm({...form, position: e.target.value})} className="glass-input mt-1 w-full">
                  <option value="banner1">Banner 1 (Top)</option>
                  <option value="banner2">Banner 2 (Bottom)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Link URL (Optional)</label>
                <input type="url" value={form.linkUrl} onChange={e => setForm({...form, linkUrl: e.target.value})} className="glass-input mt-1 w-full" />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} id="isActive" />
                <label htmlFor="isActive" className="text-sm text-[var(--text-primary)]">Active (Show to users)</label>
              </div>
              <button type="submit" disabled={uploading} className="btn-primary w-full justify-center mt-4">
                {uploading ? 'Uploading...' : <><Save className="w-4 h-4 mr-2" /> Save Banner</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
