import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AlertTriangle, MessageSquare, X, Send } from 'lucide-react';

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionText, setResolutionText] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/admin/complaints');
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching complaints', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id, resolutionStr = '') => {
    if (!resolutionStr && !window.confirm('Are you sure you want to resolve this ticket without a reply?')) return;
    try {
      const res = await api.put(`/admin/complaints/${id}`, { 
        status: 'resolved',
        resolution: resolutionStr 
      });
      if (res.data.success) {
        setSelectedComplaint(null);
        setResolutionText('');
        fetchComplaints();
      }
    } catch (error) {
      console.error('Error resolving ticket', error);
      alert('Failed to resolve ticket');
    }
  };

  const openViewModal = (complaint) => {
    setSelectedComplaint(complaint);
    setResolutionText(complaint.resolution || '');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Complaints & Tickets</h1>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="table-header">
              <tr>
                <th className="p-4">Ticket ID</th>
                <th className="p-4">User</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-4 text-center">Loading tickets...</td></tr>
              ) : complaints.map((c) => (
                <tr key={c._id} className="table-row">
                  <td className="p-4 font-mono text-xs">{c._id.slice(-8)}</td>
                  <td className="p-4 font-medium">{c.user?.name || 'Unknown'}</td>
                  <td className="p-4">{c.subject || c.description?.substring(0, 30) + '...'}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      c.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                      c.status === 'open' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {c.status || 'open'}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button 
                      onClick={() => openViewModal(c)}
                      className="text-[var(--accent-color)] hover:underline font-medium"
                    >
                      View
                    </button>
                    {c.status !== 'resolved' && (
                      <button 
                        className="text-emerald-600 hover:underline font-medium ml-2"
                        onClick={() => openViewModal(c)}
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {complaints.length === 0 && !loading && (
                <tr><td colSpan="5" className="p-4 text-center text-[var(--text-muted)]">No open complaints</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View & Reply Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative">
            <button 
              onClick={() => setSelectedComplaint(null)}
              className="absolute top-6 right-6 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5 text-[var(--text-muted)]" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="text-indigo-500 w-6 h-6" />
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Ticket Details</h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">User Name</p>
                  <p className="font-medium text-[var(--text-primary)]">{selectedComplaint.user?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">Status</p>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    selectedComplaint.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedComplaint.status || 'open'}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">Type</p>
                  <p className="font-medium text-[var(--text-primary)] capitalize">{(selectedComplaint.type || 'other').replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">Date</p>
                  <p className="font-medium text-[var(--text-primary)]">{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">Subject</p>
                <p className="font-medium text-[var(--text-primary)] text-lg">{selectedComplaint.subject}</p>
              </div>

              <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-glass)]">
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">Description</p>
                <p className="text-[var(--text-primary)] whitespace-pre-wrap">{selectedComplaint.description}</p>
              </div>

              <div className="border-t border-[var(--border-glass)] pt-6">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2 block">
                  Admin Resolution / Reply
                </label>
                {selectedComplaint.status === 'resolved' ? (
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                    <p className="text-indigo-900 whitespace-pre-wrap">{selectedComplaint.resolution || 'Resolved without message.'}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea
                      rows="4"
                      className="glass-input w-full"
                      placeholder="Type your resolution reply to the customer..."
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                    ></textarea>
                    
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setSelectedComplaint(null)}
                        className="px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleResolve(selectedComplaint._id, resolutionText)}
                        className="btn-primary"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Resolve & Send Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
