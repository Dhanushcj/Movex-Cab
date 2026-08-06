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
  const [newRoute, setNewRoute] = useState({ name: '' });
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [intermediatePoints, setIntermediatePoints] = useState([]);
  const [tempJunction, setTempJunction] = useState(null); // { lat, lng, name }

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Compute total sequence dynamically
  const routeSequence = [startPoint, ...intermediatePoints, endPoint].filter(Boolean);

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
    if (routeSequence.length < 2) {
      setRoadPolyline(null);
      return;
    }
    
    const fetchRoute = async () => {
      try {
        const coords = routeSequence.map(jId => {
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
  }, [routeSequence, junctions]);

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
    // If clicked on map, behavior depends on what's missing
    if (!startPoint) { setStartPoint(juncId); return; }
    if (!endPoint && startPoint !== juncId) { setEndPoint(juncId); return; }
    
    // If it's already an intermediate point, remove it
    if (intermediatePoints.includes(juncId)) {
      setIntermediatePoints(prev => prev.filter(id => id !== juncId));
    } else if (startPoint !== juncId && endPoint !== juncId) {
      setIntermediatePoints(prev => [...prev, juncId]);
    }
  };

  const handleCreateRoute = async () => {
    if (!newRoute.name || !startPoint || !endPoint) {
      return alert('Please provide a name, and select BOTH a Start Point and an End Point.');
    }
    try {
      await API.post('/route-manager/routes', {
        name: newRoute.name,
        junctions: routeSequence
      });
      alert('Route created!');
      setOpenRouteDialog(false);
      setNewRoute({ name: '' });
      setStartPoint('');
      setEndPoint('');
      setIntermediatePoints([]);
      fetchData();
    } catch (err) {
      alert('Failed to create route');
    }
  };

  const handleSaveTempJunction = async (assignmentType) => {
    if (!tempJunction.name) return alert('Enter a name for the new junction');
    try {
      const res = await API.post('/route-manager/junctions', {
        name: tempJunction.name,
        coordinates: [tempJunction.lng, tempJunction.lat],
        description: 'Created via Map Route Builder'
      });
      const newJunc = res.data.data;
      setJunctions(prev => [...prev, newJunc]);
      
      if (assignmentType === 'start') setStartPoint(newJunc._id);
      else if (assignmentType === 'end') setEndPoint(newJunc._id);
      else if (assignmentType === 'intermediate') setIntermediatePoints(prev => [...prev, newJunc._id]);
      else {
        // Auto assignment
        if (!startPoint) setStartPoint(newJunc._id);
        else if (!endPoint) setEndPoint(newJunc._id);
        else setIntermediatePoints(prev => [...prev, newJunc._id]);
      }
      
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
  const selectedPolylineCoords = routeSequence.map(jId => {
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
              <button onClick={() => { 
                setOpenRouteDialog(false); 
                setTempJunction(null); 
                setStartPoint(''); 
                setEndPoint(''); 
                setIntermediatePoints([]); 
              }} className="p-2 hover:bg-white/10 rounded-full">
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

                {/* Start Point */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-blue-500 uppercase mb-1 block">Start Point</label>
                  <select className="glass-input w-full border-blue-500/30" value={startPoint} onChange={e => setStartPoint(e.target.value)}>
                    <option value="">-- Select Start Junction --</option>
                    {junctions.map(j => <option key={j._id} value={j._id}>{j.name}</option>)}
                  </select>
                </div>
                
                {/* End Point */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-emerald-500 uppercase mb-1 block">End Point (Destination)</label>
                  <select className="glass-input w-full border-emerald-500/30" value={endPoint} onChange={e => setEndPoint(e.target.value)}>
                    <option value="">-- Select Destination Junction --</option>
                    {junctions.map(j => <option key={j._id} value={j._id}>{j.name}</option>)}
                  </select>
                </div>

                {/* Intermediate Junctions */}
                <div className="flex-1 mt-4">
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2 block">Intermediate Junctions</label>
                  
                  <select 
                    className="glass-input w-full mb-3 text-sm"
                    onChange={(e) => {
                      if (e.target.value && !intermediatePoints.includes(e.target.value)) {
                        setIntermediatePoints([...intermediatePoints, e.target.value]);
                      }
                      e.target.value = ''; 
                    }}
                  >
                    <option value="">+ Add Intermediate Stop</option>
                    {junctions.filter(j => j._id !== startPoint && j._id !== endPoint && !intermediatePoints.includes(j._id)).map(j => (
                      <option key={j._id} value={j._id}>{j.name}</option>
                    ))}
                  </select>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {intermediatePoints.length === 0 && (
                      <p className="text-xs text-gray-500 italic p-2">No intermediate stops added.</p>
                    )}
                    {intermediatePoints.map((jId, idx) => {
                      const j = junctions.find(junc => junc._id === jId);
                      return (
                        <div key={jId} className="flex justify-between items-center bg-white/5 p-2 rounded border border-gray-700/50">
                          <span className="text-sm font-medium">{j ? j.name : 'Unknown'}</span>
                          <button onClick={() => setIntermediatePoints(prev => prev.filter(id => id !== jId))} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
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
                
                {/* Global Location Search Bar */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-3/4 max-w-md">
                  <form onSubmit={handleLocationSearch} className="flex shadow-lg rounded-xl overflow-hidden border border-gray-200">
                    <input 
                      type="text" 
                      className="flex-1 px-4 py-3 bg-white text-gray-900 outline-none text-sm font-medium"
                      placeholder="Search global locations (e.g., Bangalore, Airport)..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="bg-blue-600 text-white px-5 font-bold hover:bg-blue-700 transition-colors">
                      {isSearching ? '...' : 'Search'}
                    </button>
                  </form>
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden max-h-60 overflow-y-auto">
                      {searchResults.map((res, i) => (
                        <div 
                          key={i} 
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 text-sm text-gray-800"
                          onClick={() => selectSearchResult(res)}
                        >
                          <div className="font-bold">{res.name || res.display_name.split(',')[0]}</div>
                          <div className="text-xs text-gray-500 truncate">{res.display_name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <MapContainer center={mapCenter} zoom={12} zoomControl={false} style={{ width: '100%', height: '100%' }}>
                  <TileLayer
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    attribution='&copy; Google Maps'
                  />
                  <MapEvents />
                  
                  {/* Draw existing junctions */}
                  {junctions.map((junc) => {
                    if (!junc.location?.coordinates) return null;
                    const isSelected = routeSequence.includes(junc._id);
                    let label = "";
                    if (junc._id === startPoint) label = "Start Point";
                    else if (junc._id === endPoint) label = "End Point";
                    else if (intermediatePoints.includes(junc._id)) label = "Intermediate Stop";
                    
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
                          {isSelected && <div className="text-xs text-blue-600 mt-1 font-bold">{label}</div>}
                          <div className="text-xs text-gray-500 mt-1 cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); handleJunctionClick(junc._id); }}>
                            {isSelected ? 'Remove from Route' : 'Add to Route (Click to toggle)'}
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}

                  {/* Draw real road routes connecting selected junctions */}
                  {roadPolyline && roadPolyline.length > 1 ? (
                    <Polyline 
                      positions={roadPolyline}
                      color="#2563EB"
                      weight={5}
                      opacity={0.8}
                    />
                  ) : selectedPolylineCoords.length > 1 && (
                    <Polyline 
                      positions={selectedPolylineCoords}
                      color="#9CA3AF"
                      weight={4}
                      dashArray="10, 10"
                    />
                  )}

                  {/* Temporary Junction Marker */}
                  {tempJunction && (
                    <Marker position={[tempJunction.lat, tempJunction.lng]} icon={defaultIcon} />
                  )}
                </MapContainer>
                
                
                {/* Floating Temp Junction Action Card */}
                {tempJunction && (
                  <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[2000] w-11/12 max-w-lg bg-white rounded-xl shadow-2xl border-2 border-blue-500 overflow-hidden animate-fade-in">
                    <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
                      <h4 className="font-bold text-blue-800 flex items-center"><MapPin className="w-4 h-4 mr-2" /> New Location Found</h4>
                      <button onClick={() => setTempJunction(null)} className="text-gray-400 hover:text-red-500"><X size={18} /></button>
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Junction Name</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
                          placeholder="e.g. Krishnagiri Bus Stand"
                          autoFocus
                          value={tempJunction.name}
                          onChange={(e) => setTempJunction({...tempJunction, name: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <button 
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 py-2 rounded-lg text-xs font-bold transition-colors"
                          onClick={() => handleSaveTempJunction('start')}
                        >
                          Set as Start
                        </button>
                        <button 
                          className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 py-2 rounded-lg text-xs font-bold transition-colors"
                          onClick={() => handleSaveTempJunction('end')}
                        >
                          Set as End
                        </button>
                        <button 
                          className="bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 py-2 rounded-lg text-xs font-bold transition-colors"
                          onClick={() => handleSaveTempJunction('intermediate')}
                        >
                          Add as Stop
                        </button>
                      </div>
                    </div>
                  </div>
                )}

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
