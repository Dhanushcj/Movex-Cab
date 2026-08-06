import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Navigation, Trash2, Edit } from 'lucide-react';
import API from '../services/api';

const RouteManager = () => {
  const [routes, setRoutes] = useState([]);
  const [junctions, setJunctions] = useState([]);
  
  // Dialog States
  const [openJunctionDialog, setOpenJunctionDialog] = useState(false);
  const [openRouteDialog, setOpenRouteDialog] = useState(false);
  
  // Form States
  const [newJunction, setNewJunction] = useState({ name: '', lat: '', lng: '', description: '' });
  const [newRoute, setNewRoute] = useState({ name: '', selectedJunctions: [] });
  
  // Multi-select handling for custom UI
  const handleJunctionToggle = (juncId) => {
    setNewRoute(prev => {
      const isSelected = prev.selectedJunctions.includes(juncId);
      if (isSelected) {
        return { ...prev, selectedJunctions: prev.selectedJunctions.filter(id => id !== juncId) };
      } else {
        return { ...prev, selectedJunctions: [...prev.selectedJunctions, juncId] };
      }
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Use the API service configured for the admin dashboard
      const [routeRes, juncRes] = await Promise.all([
        API.get('/route-manager/routes'),
        API.get('/route-manager/junctions')
      ]);
      setRoutes(routeRes.data.data || []);
      setJunctions(juncRes.data.data || []);
    } catch (err) {
      console.error('Error fetching routing data', err);
    }
  };

  const handleCreateJunction = async () => {
    try {
      await API.post('/route-manager/junctions', {
        name: newJunction.name,
        coordinates: [parseFloat(newJunction.lng), parseFloat(newJunction.lat)],
        description: newJunction.description
      });
      alert('Junction created!');
      setOpenJunctionDialog(false);
      setNewJunction({ name: '', lat: '', lng: '', description: '' });
      fetchData();
    } catch (err) {
      alert('Failed to create junction');
    }
  };

  const handleCreateRoute = async () => {
    try {
      await API.post('/route-manager/routes', {
        name: newRoute.name,
        junctions: newRoute.selectedJunctions
      });
      alert('Route created!');
      setOpenRouteDialog(false);
      setNewRoute({ name: '', selectedJunctions: [] });
      fetchData();
    } catch (err) {
      alert('Failed to create route');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Route & Junction Manager</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Configure predefined Metro lines and stops</p>
        </div>
        <div className="flex gap-2">
          <button 
            className="btn-secondary py-2 px-4 text-sm flex items-center"
            onClick={() => setOpenJunctionDialog(true)}
          >
            <MapPin className="w-4 h-4 mr-2" /> New Junction
          </button>
          <button 
            className="btn-primary py-2 px-4 text-sm flex items-center"
            onClick={() => setOpenRouteDialog(true)}
          >
            <Navigation className="w-4 h-4 mr-2" /> New Route
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Routes Table */}
        <div className="lg:col-span-7">
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-[var(--border-glass)]">
              <h3 className="font-bold text-[var(--text-primary)]">Active Routes</h3>
            </div>
            <table className="premium-table w-full">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3">Route Name</th>
                  <th className="text-left px-4 py-3">Junctions</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr key={route._id}>
                    <td className="px-4 py-3 font-semibold text-sm">{route.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {route.junctions.map((j, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-[var(--bg-tertiary)] border border-[var(--border-glass)] rounded text-[var(--text-muted)]">
                            {j.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">Active</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] mr-3"><Edit size={16} /></button>
                      <button className="text-[var(--text-muted)] hover:text-rose-500"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
                {routes.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-[var(--text-muted)] text-sm">No routes created yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Junctions List */}
        <div className="lg:col-span-5">
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-[var(--border-glass)]">
              <h3 className="font-bold text-[var(--text-primary)]">All Junctions</h3>
            </div>
            <table className="premium-table w-full">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3">Junction Name</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {junctions.map((junc) => (
                  <tr key={junc._id}>
                    <td className="px-4 py-3 font-semibold text-sm">{junc.name}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-[var(--text-muted)] hover:text-rose-500"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
                {junctions.length === 0 && (
                  <tr>
                    <td colSpan="2" className="px-4 py-8 text-center text-[var(--text-muted)] text-sm">No junctions created yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Junction Dialog */}
      {openJunctionDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-6 relative">
            <h3 className="text-xl font-bold mb-4">Create New Junction</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1 block">Junction Name</label>
                <input type="text" className="glass-input w-full" value={newJunction.name} onChange={e => setNewJunction({...newJunction, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1 block">Latitude</label>
                  <input type="number" className="glass-input w-full" value={newJunction.lat} onChange={e => setNewJunction({...newJunction, lat: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1 block">Longitude</label>
                  <input type="number" className="glass-input w-full" value={newJunction.lng} onChange={e => setNewJunction({...newJunction, lng: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1 block">Description</label>
                <input type="text" className="glass-input w-full" value={newJunction.description} onChange={e => setNewJunction({...newJunction, description: e.target.value})} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="btn-secondary py-2 px-4" onClick={() => setOpenJunctionDialog(false)}>Cancel</button>
              <button className="btn-primary py-2 px-4" onClick={handleCreateJunction}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* New Route Dialog */}
      {openRouteDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-6 relative">
            <h3 className="text-xl font-bold mb-4">Create New Route</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1 block">Route Name</label>
                <input type="text" className="glass-input w-full" value={newRoute.name} onChange={e => setNewRoute({...newRoute, name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1 block">Select Junctions</label>
                <div className="bg-[var(--bg-tertiary)] border border-[var(--border-glass)] rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                  {junctions.map(j => (
                    <label key={j._id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-white/5 rounded">
                      <input 
                        type="checkbox" 
                        className="rounded border-[var(--border-glass)]"
                        checked={newRoute.selectedJunctions.includes(j._id)}
                        onChange={() => handleJunctionToggle(j._id)}
                      />
                      <span className="text-sm">{j.name}</span>
                    </label>
                  ))}
                  {junctions.length === 0 && <p className="text-xs text-[var(--text-muted)]">Create junctions first.</p>}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="btn-secondary py-2 px-4" onClick={() => setOpenRouteDialog(false)}>Cancel</button>
              <button className="btn-primary py-2 px-4" onClick={handleCreateRoute}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteManager;
