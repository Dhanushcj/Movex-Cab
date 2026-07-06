import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AlertTriangle, MessageSquare } from 'lucide-react';

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

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
                    <button className="text-[var(--accent-color)] hover:underline font-medium">View</button>
                    {c.status !== 'resolved' && (
                      <button className="text-emerald-600 hover:underline font-medium ml-2">Resolve</button>
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
    </div>
  );
}
