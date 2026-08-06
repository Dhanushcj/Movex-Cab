import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, MapPin, Navigation, Trash2, Edit, X } from 'lucide-react';
import API from '../services/api';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const center = [28.7041, 77.1025]; // Default center (Delhi)

const RouteManager = () => {
  const [routes, setRoutes] = useState([]);
  const [junctions, setJunctions] = useState([]);
  
  // Dialog States
  const [openRouteDialog, setOpenRouteDialog] = useState(false);
  const [mapCenter, setMapCenter] = useState(center);
  
  // Form States
  const [newRoute, setNewRoute] = useState({ name: '', selectedJunctions: [] });
  const [tempJunction, setTempJunction] = useState(null); // { lat, lng, name }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [routeRes, juncRes] = await Promise.all([
        API.get('/route-manager/routes'),
        API.get('/route-manager/junctions')
      ]);
      setRoutes(routeRes.data.data || []);
      const fetchedJunctions = juncRes.data.data || [];
      setJunctions(fetchedJunctions);
      
      if (fetchedJunctions.length > 0 && fetchedJunctions[0].location?.coordinates) {
        setMapCenter([fetchedJunctions[0].location.coordinates[1], fetchedJunctions[0].location.coordinates[0]]);
      }
    } catch (err) {
      console.error('Error fetching routing data', err);
    }
  };

  const handleJunctionClick = (juncId) => {
    setNewRoute(prev => {
      const isSelected = prev.selectedJunctions.includes(juncId);
      if (isSelected) {
        return { ...prev, selectedJunctions: prev.selectedJunctions.filter(id => id !== juncId) };
      } else {
        return { ...prev, selectedJunctions: [...prev.selectedJunctions, juncId] };
      }
    });
  };

  const handleCreateRoute = async () => {
    if (!newRoute.name || newRoute.selectedJunctions.length < 2) {
      return alert('Please provide a name and select at least 2 junctions (Start and End).');
    }
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

  const handleSaveTempJunction = async () => {
    if (!tempJunction.name) return alert('Enter a name for the new junction');
    try {
      const res = await API.post('/route-manager/junctions', {
        name: tempJunction.name,
        coordinates: [tempJunction.lng, tempJunction.lat],
        description: 'Created via Map Route Builder'
      });
      const newJunc = res.data.data;
      setJunctions(prev => [...prev, newJunc]);
      setNewRoute(prev => ({ ...prev, selectedJunctions: [...prev.selectedJunctions, newJunc._id] }));
      setTempJunction(null);
    } catch (err) {
      alert('Failed to create junction');
    }
  };

  // Map Click Listener Component
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setTempJunction({ lat: e.latlng.lat, lng: e.latlng.lng, name: '' });
      },
    });
    return null;
  };

  // Calculate Polyline coordinates for the selected route
  const selectedPolylineCoords = newRoute.selectedJunctions.map(jId => {
    const j = junctions.find(junc => junc._id === jId);
    return j && j.location ? [j.location.coordinates[1], j.location.coordinates[0]] : null;
  }).filter(Boolean);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Route & Junction Manager</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Configure predefined Metro lines and stops via Map</p>
        </div>
        <div className="flex gap-2">
          <button 
            className="btn-primary py-2 px-4 text-sm flex items-center"
            onClick={() => setOpenRouteDialog(true)}
          >
            <Navigation className="w-4 h-4 mr-2" /> Open Route Builder
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Routes Table */}
        <div className="lg:col-span-12">
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-[var(--border-glass)]">
              <h3 className="font-bold text-[var(--text-primary)]">Active Routes</h3>
            </div>
            <table className="premium-table w-full">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3">Route Name</th>
                  <th className="text-left px-4 py-3">Junctions (Start ➔ End)</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr key={route._id}>
                    <td className="px-4 py-3 font-semibold text-sm">{route.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1">
                        {route.junctions.map((j, i) => (
                          <React.Fragment key={i}>
                            <span className={`text-xs px-2 py-0.5 border rounded ${i === 0 ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 font-bold' : i === route.junctions.length - 1 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold' : 'bg-[var(--bg-tertiary)] border-[var(--border-glass)] text-[var(--text-muted)]'}`}>
                              {j.name}
                            </span>
                            {i < route.junctions.length - 1 && <span className="text-[var(--text-muted)] text-xs">➔</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">Active</span>
                    </td>
                    <td className="px-4 py-3 text-right">
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
      </div>

      {/* Advanced Map-Based Route Builder Dialog */}
      {openRouteDialog && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-6xl h-[85vh] relative flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[var(--border-glass)] flex justify-between items-center bg-white/5">
              <div>
                <h3 className="text-xl font-bold">Interactive Route Builder</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Click existing junctions on the map to add them to the route, or click anywhere to create a new junction.</p>
              </div>
              <button onClick={() => { setOpenRouteDialog(false); setTempJunction(null); }} className="p-2 hover:bg-white/10 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
              {/* Left Panel: Form & Sequence */}
              <div className="w-1/3 border-r border-[var(--border-glass)] bg-[var(--bg-tertiary)] p-6 flex flex-col overflow-y-auto">
                <div className="mb-6">
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2 block">Route Name</label>
                  <input 
                    type="text" 
                    className="glass-input w-full" 
                    placeholder="e.g., Downtown Metro Line"
                    value={newRoute.name} 
                    onChange={e => setNewRoute({...newRoute, name: e.target.value})} 
                  />
                </div>

                
                {/* Search and Add Junctions */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2 block">Search & Add Junction</label>
                  <select 
                    className="glass-input w-full"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleJunctionClick(e.target.value);
                        e.target.value = ''; // Reset after selection
                      }
                    }}
                  >
                    <option value="">-- Select a Junction to Add --</option>
                    {junctions.filter(j => !newRoute.selectedJunctions.includes(j._id)).map(j => (
                      <option key={j._id} value={j._id}>{j.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">Select from the dropdown or click on the map.</p>
                </div>

                <div className="flex-1">

                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-3 block">Route Sequence ({newRoute.selectedJunctions.length})</label>
                  <div className="space-y-3">
                    {newRoute.selectedJunctions.length === 0 && (
                      <div className="text-sm text-gray-400 p-4 border border-dashed border-gray-600 rounded-xl text-center">
                        Click on junctions in the map to start building your route.
                      </div>
                    )}
                    {newRoute.selectedJunctions.map((jId, index) => {
                      const j = junctions.find(junc => junc._id === jId);
                      return (
                        <div key={`${jId}-${index}`} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-[var(--border-glass)] relative">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${index === 0 ? 'bg-blue-500 text-white' : index === newRoute.selectedJunctions.length - 1 ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                            {index + 1}
                          </div>
                          
                {/* Search and Add Junctions */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2 block">Search & Add Junction</label>
                  <select 
                    className="glass-input w-full"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleJunctionClick(e.target.value);
                        e.target.value = ''; // Reset after selection
                      }
                    }}
                  >
                    <option value="">-- Select a Junction to Add --</option>
                    {junctions.filter(j => !newRoute.selectedJunctions.includes(j._id)).map(j => (
                      <option key={j._id} value={j._id}>{j.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">Select from the dropdown or click on the map.</p>
                </div>

                <div className="flex-1">

                            <p className="font-semibold text-sm truncate">{j ? j.name : 'Unknown'}</p>
                            <p className="text-[10px] text-gray-400 uppercase">{index === 0 ? 'Start Point' : index === newRoute.selectedJunctions.length - 1 ? 'End Point' : 'Intermediate Stop'}</p>
                          </div>
                          <button onClick={() => handleJunctionClick(jId)} className="text-gray-500 hover:text-rose-500">
                            <X size={16} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-[var(--border-glass)]">
                  <button className="btn-primary w-full py-3" onClick={handleCreateRoute}>
                    Save & Activate Route
                  </button>
                </div>
              </div>

              {/* Right Panel: Map */}
              <div className="w-2/3 h-full relative">
                <MapContainer center={mapCenter} zoom={12} zoomControl={false} style={{ width: '100%', height: '100%' }}>
                  <TileLayer
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    attribution='&copy; Google Maps'
                  />
                  <MapEvents />
                  
                  {/* Draw existing junctions */}
                  {junctions.map((junc) => {
                    if (!junc.location?.coordinates) return null;
                    const isSelected = newRoute.selectedJunctions.includes(junc._id);
                    const orderIndex = newRoute.selectedJunctions.indexOf(junc._id);
                    return (
                      <Marker 
                        key={junc._id}
                        position={[junc.location.coordinates[1], junc.location.coordinates[0]]}
                        icon={isSelected ? selectedIcon : defaultIcon}
                        eventHandlers={{
                          click: () => handleJunctionClick(junc._id),
                        }}
                      >
                        <Popup>
                          <div className="font-bold">{junc.name}</div>
                          {isSelected && <div className="text-xs text-blue-600 mt-1">Stop #{orderIndex + 1} in route</div>}
                          <div className="text-xs text-gray-500 mt-1 cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); handleJunctionClick(junc._id); }}>
                            {isSelected ? 'Remove from Route' : 'Add to Route'}
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}

                  {/* Draw lines connecting selected junctions */}
                  {selectedPolylineCoords.length > 1 && (
                    <Polyline 
                      positions={selectedPolylineCoords}
                      color="#3B82F6"
                      weight={4}
                      dashArray="10, 10"
                    />
                  )}

                  {/* Temporary Junction Marker (when clicking empty space) */}
                  {tempJunction && (
                    <Marker position={[tempJunction.lat, tempJunction.lng]} icon={defaultIcon}>
                      <Popup onClose={() => setTempJunction(null)}>
                        <div className="p-1 space-y-2">
                          <h4 className="font-bold text-sm">New Junction</h4>
                          <input 
                            type="text" 
                            className="border p-1 text-sm w-full rounded" 
                            placeholder="Junction Name"
                            autoFocus
                            value={tempJunction.name}
                            onChange={(e) => setTempJunction({...tempJunction, name: e.target.value})}
                          />
                          <button 
                            className="bg-indigo-600 text-white text-xs px-3 py-1 rounded w-full font-bold hover:bg-indigo-700"
                            onClick={handleSaveTempJunction}
                          >
                            Save & Add to Route
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
                
                {/* Floating Map Helper text */}
                <div className="absolute bottom-6 right-6 z-[1000] bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg border border-gray-200 pointer-events-none">
                  <p className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin size={14} className="text-blue-500" /> Map Builder Active
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default RouteManager;
