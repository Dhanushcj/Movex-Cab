import sys
import re

file_path = r'g:\Dhanush\New folder\Movex-Cab\admin-dashboard\src\pages\RouteManager.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# I will rewrite the entire RouteManager.jsx to ensure a clean UX implementation

new_content = """import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, MapPin, Navigation, Trash2, Edit, X, ArrowUp, ArrowDown } from 'lucide-react';
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
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
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
  const [newRoute, setNewRoute] = useState({ name: '', sequence: [] });
  const [tempJunction, setTempJunction] = useState(null); // { lat, lng, name }

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [roadPolyline, setRoadPolyline] = useState(null);

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

  // Fetch real road route from OSRM when junctions change
  useEffect(() => {
    if (newRoute.sequence.length < 2) {
      setRoadPolyline(null);
      return;
    }
    
    const fetchRoute = async () => {
      try {
        const coords = newRoute.sequence.map(jId => {
          const j = junctions.find(junc => junc._id === jId);
          return j && j.location ? `${j.location.coordinates[0]},${j.location.coordinates[1]}` : null;
        }).filter(Boolean);
        
        if (coords.length < 2) return;
        
        const coordString = coords.join(';');
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`);
        const data = await res.json();
        
        if (data.routes && data.routes.length > 0) {
          // OSRM returns [lon, lat], Leaflet needs [lat, lon]
          const latLngs = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setRoadPolyline(latLngs);
        }
      } catch (err) {
        console.error("OSRM Routing Error:", err);
      }
    };
    
    fetchRoute();
  }, [newRoute.sequence, junctions]);

  const handleLocationSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Search error', err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setMapCenter([lat, lng]);
    setTempJunction({ lat, lng, name: result.name || result.display_name.split(',')[0] });
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleJunctionClick = (juncId) => {
    if (!newRoute.sequence.includes(juncId)) {
      setNewRoute(prev => ({ ...prev, sequence: [...prev.sequence, juncId] }));
    }
  };

  const removeJunctionFromSequence = (juncId) => {
    setNewRoute(prev => ({ ...prev, sequence: prev.sequence.filter(id => id !== juncId) }));
  };

  const moveJunction = (index, direction) => {
    setNewRoute(prev => {
      const newSeq = [...prev.sequence];
      if (direction === 'up' && index > 0) {
        [newSeq[index - 1], newSeq[index]] = [newSeq[index], newSeq[index - 1]];
      } else if (direction === 'down' && index < newSeq.length - 1) {
        [newSeq[index + 1], newSeq[index]] = [newSeq[index], newSeq[index + 1]];
      }
      return { ...prev, sequence: newSeq };
    });
  };

  const handleCreateRoute = async () => {
    if (!newRoute.name || newRoute.sequence.length < 2) {
      return alert('Please provide a name, and select at least 2 stops for the route.');
    }
    try {
      await API.post('/route-manager/routes', {
        name: newRoute.name,
        junctions: newRoute.sequence
      });
      alert('Route created!');
      setOpenRouteDialog(false);
      setNewRoute({ name: '', sequence: [] });
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
      setNewRoute(prev => ({ ...prev, sequence: [...prev.sequence, newJunc._id] }));
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
  const selectedPolylineCoords = newRoute.sequence.map(jId => {
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
          <div className="glass-card w-full max-w-6xl h-[85vh] relative flex flex-col overflow-hidden shadow-2xl border border-gray-700">
            <div className="p-4 border-b border-[var(--border-glass)] flex justify-between items-center bg-gray-900 text-white">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2"><Navigation size={20} className="text-blue-400" /> Interactive Route Builder</h3>
                <p className="text-xs text-gray-400 mt-1">Select locations to build a clear, ordered transit route.</p>
              </div>
              <button onClick={() => { 
                setOpenRouteDialog(false); 
                setTempJunction(null); 
                setNewRoute({ name: '', sequence: [] });
              }} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
              {/* Left Panel: Form & Sequence */}
              <div className="w-1/3 border-r border-[var(--border-glass)] bg-gray-50 dark:bg-gray-800 p-6 flex flex-col overflow-y-auto">
                <div className="mb-6 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Route Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-100 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-3 text-sm font-medium" 
                    placeholder="e.g., Downtown Express"
                    value={newRoute.name} 
                    onChange={e => setNewRoute({...newRoute, name: e.target.value})} 
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-end mb-4">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Route Sequence ({newRoute.sequence.length} stops)</label>
                  </div>
                  
                  {/* Select Stop Dropdown */}
                  <div className="mb-4">
                    <select 
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleJunctionClick(e.target.value);
                        }
                        e.target.value = ''; 
                      }}
                    >
                      <option value="">+ Add a Stop to Route...</option>
                      {junctions.filter(j => !newRoute.sequence.includes(j._id)).map(j => (
                        <option key={j._id} value={j._id}>{j.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sequence List */}
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2 pb-4 flex-1">
                    {newRoute.sequence.length === 0 && (
                      <div className="text-sm text-gray-400 p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-center bg-gray-100/50 dark:bg-gray-900/50">
                        Select a location from the dropdown or click a pin on the map to start building your route.
                      </div>
                    )}
                    {newRoute.sequence.map((jId, index) => {
                      const j = junctions.find(junc => junc._id === jId);
                      const isStart = index === 0;
                      const isEnd = index === newRoute.sequence.length - 1 && newRoute.sequence.length > 1;
                      
                      return (
                        <div key={jId} className={`flex items-center gap-3 p-3 rounded-xl border ${isStart ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : isEnd ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700'} shadow-sm relative group transition-all`}>
                          
                          {/* Reordering Controls */}
                          <div className="flex flex-col gap-1">
                            <button disabled={index === 0} onClick={() => moveJunction(index, 'up')} className="text-gray-400 hover:text-blue-500 disabled:opacity-30"><ArrowUp size={14} /></button>
                            <button disabled={index === newRoute.sequence.length - 1} onClick={() => moveJunction(index, 'down')} className="text-gray-400 hover:text-blue-500 disabled:opacity-30"><ArrowDown size={14} /></button>
                          </div>
                          
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isStart ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : isEnd ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                            {index + 1}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{j ? j.name : 'Unknown'}</p>
                            <p className={`text-[10px] font-bold uppercase tracking-wider ${isStart ? 'text-blue-600 dark:text-blue-400' : isEnd ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`}>
                              {isStart ? 'Start Point' : isEnd ? 'End Destination' : 'Stop'}
                            </p>
                          </div>
                          
                          <button onClick={() => removeJunctionFromSequence(jId)} className="text-gray-400 hover:text-rose-500 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={16} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-xl font-bold transition-colors shadow-lg shadow-blue-600/20" onClick={handleCreateRoute}>
                    Save & Activate Route
                  </button>
                </div>
              </div>

              {/* Right Panel: Map */}
              <div className="w-2/3 h-full relative">
                
                {/* Global Location Search Bar */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-3/4 max-w-md">
                  <form onSubmit={handleLocationSearch} className="flex shadow-2xl rounded-xl overflow-hidden border border-gray-200/50 bg-white/90 backdrop-blur">
                    <input 
                      type="text" 
                      className="flex-1 px-5 py-4 bg-transparent text-gray-900 outline-none text-sm font-semibold placeholder-gray-500"
                      placeholder="Search for a location (e.g. Airport)..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="bg-blue-600 text-white px-6 font-bold hover:bg-blue-700 transition-colors">
                      {isSearching ? '...' : 'Search'}
                    </button>
                  </form>
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto z-[1001]">
                      {searchResults.map((res, i) => (
                        <div 
                          key={i} 
                          className="px-5 py-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 text-sm text-gray-800 transition-colors"
                          onClick={() => selectSearchResult(res)}
                        >
                          <div className="font-bold text-blue-900">{res.name || res.display_name.split(',')[0]}</div>
                          <div className="text-xs text-gray-500 mt-1 truncate">{res.display_name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Floating Temp Junction Action Card */}
                {tempJunction && (
                  <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[2000] w-11/12 max-w-sm bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in">
                    <div className="bg-indigo-600 px-4 py-3 flex justify-between items-center text-white">
                      <h4 className="font-bold flex items-center text-sm"><MapPin className="w-4 h-4 mr-2" /> Add Location to Map</h4>
                      <button onClick={() => setTempJunction(null)} className="text-white/70 hover:text-white"><X size={18} /></button>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Location Name</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 font-semibold" 
                          placeholder="e.g. Krishnagiri Bus Stand"
                          autoFocus
                          value={tempJunction.name}
                          onChange={(e) => setTempJunction({...tempJunction, name: e.target.value})}
                        />
                      </div>
                      <button 
                        className="bg-indigo-600 text-white hover:bg-indigo-700 w-full py-3 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-indigo-600/30"
                        onClick={handleSaveTempJunction}
                      >
                        Save Location & Add to Route
                      </button>
                    </div>
                  </div>
                )}

                <MapContainer center={mapCenter} zoom={12} zoomControl={false} style={{ width: '100%', height: '100%' }}>
                  <TileLayer
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    attribution='&copy; Google Maps'
                  />
                  <MapEvents />
                  
                  {/* Draw existing junctions */}
                  {junctions.map((junc) => {
                    if (!junc.location?.coordinates) return null;
                    const orderIndex = newRoute.sequence.indexOf(junc._id);
                    const isSelected = orderIndex !== -1;
                    
                    let label = "";
                    if (isSelected) {
                      if (orderIndex === 0) label = "Start Point";
                      else if (orderIndex === newRoute.sequence.length - 1 && newRoute.sequence.length > 1) label = "End Destination";
                      else label = `Stop #${orderIndex + 1}`;
                    }
                    
                    return (
                      <Marker 
                        key={junc._id}
                        position={[junc.location.coordinates[1], junc.location.coordinates[0]]}
                        icon={isSelected ? selectedIcon : defaultIcon}
                        eventHandlers={{
                          click: () => {
                            if (isSelected) removeJunctionFromSequence(junc._id);
                            else handleJunctionClick(junc._id);
                          },
                        }}
                      >
                        <Popup>
                          <div className="font-bold text-gray-900">{junc.name}</div>
                          {isSelected && <div className="text-xs text-red-600 mt-1 font-bold">{label}</div>}
                          <div className="text-xs text-gray-500 mt-2 font-medium">
                            {isSelected ? 'Click pin to remove from route' : 'Click pin to add to route sequence'}
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}

                  {/* Draw real road routes connecting selected junctions */}
                  {roadPolyline && roadPolyline.length > 1 ? (
                    <Polyline 
                      positions={roadPolyline}
                      color="#ef4444" 
                      weight={8}
                      opacity={1.0}
                    />
                  ) : selectedPolylineCoords.length > 1 && (
                    <Polyline 
                      positions={selectedPolylineCoords}
                      color="#ef4444"
                      weight={6}
                      dashArray="15, 15"
                      opacity={0.8}
                    />
                  )}

                  {/* Temporary Junction Marker */}
                  {tempJunction && (
                    <Marker position={[tempJunction.lat, tempJunction.lng]} icon={defaultIcon} />
                  )}
                </MapContainer>
                
                {/* Floating Map Helper text */}
                <div className="absolute bottom-6 right-6 z-[1000] bg-white/90 backdrop-blur px-5 py-3 rounded-xl shadow-xl border border-gray-200 pointer-events-none">
                  <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <MapPin size={16} className="text-blue-600" /> Map Builder Active
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
"""

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Overhauled UX for RouteManager complete!")
