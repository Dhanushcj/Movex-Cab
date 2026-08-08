import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, MapPin, Navigation, Trash2, Edit, X, ArrowUp, ArrowDown } from 'lucide-react';
import API from '../services/api';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from 'react-leaflet';
import { useLoadScript } from '@react-google-maps/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const libraries = ['places'];

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
});

// Custom Icons
const defaultIcon = new L.Icon({
  iconUrl: '/images/marker-icon-2x-grey.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const selectedIcon = new L.Icon({
  iconUrl: '/images/marker-icon-2x-red.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const center = [28.7041, 77.1025]; // Default center

const decodePolyline = (t) => {
  let n, o, a = 0, r = 0, s = 0, l = 0, i = [];
  for (; a < t.length;) {
    n = 0, o = 0;
    do {
      o |= (31 & (n = t.charCodeAt(a++) - 63)) << l;
      l += 5;
    } while (n >= 32);
    const d = 1 & o ? ~(o >> 1) : o >> 1;
    r += d;
    l = 0, n = 0, o = 0;
    do {
      o |= (31 & (n = t.charCodeAt(a++) - 63)) << l;
      l += 5;
    } while (n >= 32);
    const u = 1 & o ? ~(o >> 1) : o >> 1;
    s += u;
    l = 0;
    i.push([r / 1e5, s / 1e5]);
  }
  return i;
};

const RouteManager = () => {
  const [routes, setRoutes] = useState([]);
  const [junctions, setJunctions] = useState([]);
  
  // Dialog States
  const [openRouteDialog, setOpenRouteDialog] = useState(false);
  const [mapCenter, setMapCenter] = useState(center);
  
  // Form States (Google Maps Style)
  const [newRoute, setNewRoute] = useState({ 
    name: '', 
    sequence: [
      { id: 'start', name: '', lat: null, lng: null, juncId: null, searchResults: [], isSearching: false },
      { id: 'end', name: '', lat: null, lng: null, juncId: null, searchResults: [], isSearching: false }
    ] 
  });
  const [activeInputId, setActiveInputId] = useState('start');
  const [editingRouteId, setEditingRouteId] = useState(null);

  const [suggestedStops, setSuggestedStops] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const [roadPolyline, setRoadPolyline] = useState(null); // Array of [lat, lng] for Map
  const [rawPolyline, setRawPolyline] = useState(''); // Encoded string for DB

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

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

  const handleEditRoute = (route) => {
    setEditingRouteId(route._id);
    setNewRoute({
      name: route.name,
      sequence: route.junctions.map(j => ({
        id: Math.random().toString(36).substr(2, 9),
        name: j.name,
        lat: j.location.coordinates[1],
        lng: j.location.coordinates[0],
        juncId: j._id,
        searchResults: [],
        isSearching: false
      }))
    });
    setOpenRouteDialog(true);
  };

  const handleDeleteRoute = async (id) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;
    try {
      await API.delete(`/admin/routes/${id}`);
      setRoutes(routes.filter(r => r._id !== id));
    } catch (err) {
      console.error('Error deleting route:', err);
      alert('Failed to delete route');
    }
  };

  // Fetch real road route using OSRM when sequence changes
  useEffect(() => {
    const validStops = newRoute.sequence.filter(s => s.lat && s.lng);
    if (validStops.length < 2) {
      setRoadPolyline(null);
      setRawPolyline('');
      return;
    }
    
    const fetchRoute = async () => {
      try {
        const coordinatesString = validStops.map(s => `${s.lng},${s.lat}`).join(';');
        const url = `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=polyline`;
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.code === 'Ok' && result.routes && result.routes.length > 0) {
          const encoded = result.routes[0].geometry;
          setRawPolyline(encoded);
          setRoadPolyline(decodePolyline(encoded));
        } else {
          console.error("OSRM API Error:", result);
        }
      } catch (err) {
        console.error("OSRM Routing Error:", err);
      }
    };
    
    // debounce fetching
    const timer = setTimeout(fetchRoute, 800);
    return () => clearTimeout(timer);
  }, [newRoute.sequence]);

  // Fetch suggested stops when roadPolyline changes
  useEffect(() => {
    if (!roadPolyline || roadPolyline.length < 2) {
      setSuggestedStops([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoadingSuggestions(true);
      try {
        const sampleSize = Math.max(1, Math.floor(roadPolyline.length / 10));
        const sampledPoints = roadPolyline.filter((_, i) => i % sampleSize === 0);
        if (sampledPoints[sampledPoints.length - 1] !== roadPolyline[roadPolyline.length - 1]) {
          sampledPoints.push(roadPolyline[roadPolyline.length - 1]);
        }

        const pointCoordsStr = sampledPoints.map(p => `${p[0]},${p[1]}`).join(',');
        const query = `[out:json];node(around:3000,${pointCoordsStr})["place"~"town|village|city|suburb"];out;`;
        
        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query
        });
        const data = await res.json();
        
        if (data && data.elements) {
          const stops = data.elements
            .filter(e => e.tags && e.tags.name)
            .map(e => ({
              id: e.id.toString(),
              name: e.tags.name,
              lat: e.lat,
              lng: e.lon,
              type: e.tags.place
            }));
            
          const existingNames = newRoute.sequence.map(s => s.name.toLowerCase());
          const uniqueStops = stops.filter(s => !existingNames.includes(s.name.toLowerCase()));
          const uniqueByName = Array.from(new Map(uniqueStops.map(item => [item.name, item])).values());
          
          setSuggestedStops(uniqueByName);
        }
      } catch (err) {
        console.error("Failed to fetch suggested stops", err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 1000); 
    
    return () => clearTimeout(timeoutId);
  }, [roadPolyline, newRoute.sequence]);

  // --- Handlers for Input ---
  const handleStopSearchChange = (id, val) => {
    setNewRoute(prev => ({
      ...prev,
      sequence: prev.sequence.map(s => {
        if (s.id === id) {
          return { ...s, name: val, isSearching: true, searchResults: [] };
        }
        return s;
      })
    }));

    if (!val.trim() || !window.google) return;

    // Use standard PlacesService textSearch instead of deprecated AutocompleteService
    const mapDiv = document.createElement('div');
    const service = new window.google.maps.places.PlacesService(mapDiv);
    
    service.textSearch({ query: val + " India" }, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        setNewRoute(prev => ({
          ...prev,
          sequence: prev.sequence.map(s => s.id === id ? { 
            ...s, 
            searchResults: results.slice(0, 5).map(r => ({
              place_id: r.place_id,
              name: r.name,
              formatted_address: r.formatted_address,
              lat: r.geometry.location.lat(),
              lng: r.geometry.location.lng()
            }))
          } : s)
        }));
      } else {
        setNewRoute(prev => ({
          ...prev,
          sequence: prev.sequence.map(s => s.id === id ? { 
            ...s, 
            searchResults: [{ 
              place_id: 'error', 
              name: 'No exact matches found',
              formatted_address: 'Try typing the town name clearly or click on the map.'
            }] 
          } : s)
        }));
      }
    });
  };

  const handleSelectStopPlace = (id, place) => {
    if (place.place_id === 'error') return;
    
    setMapCenter([place.lat, place.lng]);
    
    setNewRoute(prev => ({
      ...prev,
      sequence: prev.sequence.map(s => {
        if (s.id === id) {
          return { 
            ...s, 
            name: place.name, 
            lat: place.lat, 
            lng: place.lng, 
            juncId: null,
            isSearching: false, 
            searchResults: [] 
          };
        }
        return s;
      })
    }));
  };

  const addStop = (index) => {
    setNewRoute(prev => {
      const newSeq = [...prev.sequence];
      newSeq.splice(index + 1, 0, { id: Math.random().toString(36).substr(2, 9), name: '', lat: null, lng: null, juncId: null, searchResults: [], isSearching: false });
      return { ...prev, sequence: newSeq };
    });
  };

  const removeStop = (id) => {
    setNewRoute(prev => ({ ...prev, sequence: prev.sequence.filter(s => s.id !== id) }));
  };

  const moveStop = (index, direction) => {
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

  const handleAddSuggestedStop = (stop) => {
    // Insert at the end, right before the destination if possible
    setNewRoute(prev => {
      const newSeq = [...prev.sequence];
      let insertIndex = newSeq.length - 1;
      if (insertIndex < 0) insertIndex = 0;
      
      newSeq.splice(insertIndex, 0, { 
        id: stop.id, 
        name: stop.name, 
        lat: stop.lat, 
        lng: stop.lng, 
        juncId: null,
        searchResults: [],
        isSearching: false 
      });
      return { ...prev, sequence: newSeq };
    });
    setSuggestedStops(prev => prev.filter(s => s.id !== stop.id));
  };

  // Map Click
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        if (!activeInputId) return;
        setNewRoute(prev => ({
          ...prev,
          sequence: prev.sequence.map(s => {
            if (s.id === activeInputId) {
              return { 
                ...s, 
                name: s.name || 'Dropped Pin', 
                lat: e.latlng.lat, 
                lng: e.latlng.lng, 
                juncId: null,
                isSearching: false,
                searchResults: [] 
              };
            }
            return s;
          })
        }));
      },
    });
    return null;
  };

  const handleMarkerDragEnd = (id, e) => {
    const marker = e.target;
    const position = marker.getLatLng();
    setNewRoute(prev => ({
      ...prev,
      sequence: prev.sequence.map(s => s.id === id ? { ...s, lat: position.lat, lng: position.lng, juncId: null } : s)
    }));
  };

  const resetForm = () => {
    setOpenRouteDialog(false);
    setEditingRouteId(null);
    setNewRoute({ 
      name: '', 
      sequence: [
        { id: 'start', name: '', lat: null, lng: null, juncId: null, searchResults: [], isSearching: false },
        { id: 'end', name: '', lat: null, lng: null, juncId: null, searchResults: [], isSearching: false }
      ] 
    });
    setActiveInputId('start');
  };

  const handleCreateRoute = async () => {
    const validStops = newRoute.sequence.filter(s => s.lat && s.lng);
    if (!newRoute.name || validStops.length < 2) {
      return alert('Please provide a route name and at least 2 valid stops.');
    }
    
    try {
      // 1. Create or Find Junctions for each stop
      const finalSequenceIds = [];
      for (const stop of validStops) {
        if (stop.juncId) {
          finalSequenceIds.push(stop.juncId);
        } else {
          // Check if junction exists with same name
          let existing = junctions.find(j => j.name.toLowerCase() === stop.name.toLowerCase());
          if (existing) {
            // Update its coords to match the drag if necessary
             await API.put(`/route-manager/junctions/${existing._id}`, { coordinates: [stop.lng, stop.lat] });
             finalSequenceIds.push(existing._id);
          } else {
             const res = await API.post('/route-manager/junctions', {
               name: stop.name,
               coordinates: [stop.lng, stop.lat],
               description: 'Auto-created during route builder'
             });
             finalSequenceIds.push(res.data.data._id);
          }
        }
      }

      // 2. Use raw encoded Polyline
      let polylineStr = rawPolyline || '';
      
      // 3. Save Route
      if (editingRouteId) {
        await API.put(`/route-manager/routes/${editingRouteId}`, {
          name: newRoute.name,
          junctions: finalSequenceIds,
          polyline: polylineStr
        });
        alert('Route updated!');
      } else {
        await API.post('/route-manager/routes', {
          name: newRoute.name,
          junctions: finalSequenceIds,
          polyline: polylineStr
        });
        alert('Route created!');
      }
      
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error saving route:', err);
      alert(err.response?.data?.message || err.response?.data?.error || 'Failed to save route');
    }
  };

  const selectedPolylineCoords = newRoute.sequence.filter(s => s.lat && s.lng).map(s => [s.lat, s.lng]);

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
                      <button onClick={() => handleEditRoute(route)} className="text-[var(--text-muted)] hover:text-blue-500 mr-4"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteRoute(route._id)} className="text-[var(--text-muted)] hover:text-rose-500"><Trash2 size={16} /></button>
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

      {openRouteDialog && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-6xl h-[85vh] relative flex flex-col overflow-hidden shadow-2xl border border-gray-700">
            <div className="p-4 border-b border-[var(--border-glass)] flex justify-between items-center bg-gray-900 text-white">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Navigation size={20} className="text-blue-400" /> 
                  {editingRouteId ? 'Edit Route' : 'Interactive Route Builder'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">Select locations to build a clear, ordered transit route.</p>
              </div>
              <button onClick={resetForm} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
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
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-4">Route Stops</label>
                  
                  {/* Sequence List */}
                  <div className="relative space-y-3 max-h-96 overflow-y-auto pr-2 pb-4 flex-1 mt-2">
                    {/* Timeline vertical line */}
                    <div className="absolute left-4 top-6 bottom-14 w-0.5 bg-gray-300 dark:bg-gray-600 z-0"></div>

                    {newRoute.sequence.map((stop, index) => {
                      const isStart = index === 0;
                      const isEnd = index === newRoute.sequence.length - 1 && newRoute.sequence.length > 1;
                      
                      return (
                        <div key={stop.id} className="relative group flex items-center gap-3 z-10">
                          
                          {/* Timeline Icon */}
                          <div className="w-8 flex justify-center shrink-0">
                            {isStart ? (
                              <div className="w-4 h-4 rounded-full border-4 border-blue-500 bg-white dark:bg-gray-900 z-10 shadow-sm"></div>
                            ) : isEnd ? (
                              <MapPin size={20} className="text-red-500 fill-red-500 z-10 drop-shadow-md" />
                            ) : (
                              <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-500 z-10 shadow-sm"></div>
                            )}
                          </div>
                          
                          {/* Input Container */}
                          <div className={`flex-1 flex items-center min-w-0 bg-gray-100 dark:bg-gray-800 rounded-lg border transition-all ${activeInputId === stop.id ? 'border-blue-500 shadow-md ring-1 ring-blue-500/50' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}>
                            
                            <div className="flex-1 min-w-0 relative px-4 py-2.5">
                              <input 
                                type="text"
                                value={stop.name}
                                onChange={(e) => handleStopSearchChange(stop.id, e.target.value)}
                                onFocus={() => setActiveInputId(stop.id)}
                                placeholder={isStart ? "Choose starting point, or click on the map..." : isEnd ? "Choose destination, or click on the map..." : "Add a stop..."}
                                className="w-full bg-transparent border-none outline-none font-medium text-sm text-gray-900 dark:text-white truncate placeholder-gray-500"
                              />

                              {/* Search Results Dropdown */}
                              {stop.isSearching && stop.searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                                  {stop.searchResults.map((res) => (
                                    <div 
                                      key={res.place_id} 
                                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 text-sm transition-colors flex items-center gap-3"
                                      onClick={() => handleSelectStopPlace(stop.id, res)}
                                    >
                                      <MapPin size={16} className="text-gray-400 shrink-0" />
                                      <div className="min-w-0">
                                        <div className="font-semibold text-gray-900 truncate">{res.name}</div>
                                        <div className="text-xs text-gray-500 truncate">{res.formatted_address || ''}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            {/* Actions within Input */}
                            <div className="flex items-center gap-1 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!isStart && !isEnd && (
                                <button onClick={() => removeStop(stop.id)} className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                                  <X size={14} />
                                </button>
                              )}
                              <div className="flex flex-col gap-0.5 px-1 border-l border-gray-300 dark:border-gray-600 pl-1">
                                <button disabled={index === 0} onClick={() => moveStop(index, 'up')} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-20"><ArrowUp size={12} /></button>
                                <button disabled={index === newRoute.sequence.length - 1} onClick={() => moveStop(index, 'down')} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-20"><ArrowDown size={12} /></button>
                              </div>
                            </div>
                          </div>
                          
                        </div>
                      )
                    })}
                    
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-8 flex justify-center shrink-0">
                        <Plus size={16} className="text-blue-600" />
                      </div>
                      <button onClick={() => addStop(newRoute.sequence.length - 1)} className="text-blue-600 text-sm font-semibold hover:text-blue-800 transition-colors">
                        Add destination
                      </button>
                    </div>

                  </div>
                </div>

                {/* Suggested Stops */}
                {newRoute.sequence.filter(s => s.lat && s.lng).length >= 2 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      Suggested Stops Along Route
                      {isLoadingSuggestions && <span className="text-blue-500 text-[10px] animate-pulse">Scanning route...</span>}
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {!isLoadingSuggestions && suggestedStops.length === 0 && (
                        <div className="text-xs text-gray-400 italic">No suggestions found.</div>
                      )}
                      {suggestedStops.map(stop => (
                        <button 
                          key={stop.id}
                          onClick={() => handleAddSuggestedStop(stop)}
                          className="shrink-0 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold border border-indigo-200 transition-colors"
                        >
                          <Plus size={12} /> {stop.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-xl font-bold transition-colors shadow-lg shadow-blue-600/20" onClick={handleCreateRoute}>
                    {editingRouteId ? 'Save Changes' : 'Save & Activate Route'}
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
                  
                  {newRoute.sequence.map((stop, index) => {
                    if (!stop.lat || !stop.lng) return null;
                    const isSelected = activeInputId === stop.id;
                    const isStart = index === 0;
                    const isEnd = index === newRoute.sequence.length - 1;
                    
                    let label = "Stop";
                    if (isStart) label = "Start Point";
                    else if (isEnd) label = "End Destination";
                    
                    return (
                      <Marker 
                        key={stop.id}
                        position={[stop.lat, stop.lng]}
                        icon={isSelected ? selectedIcon : defaultIcon}
                        draggable={true}
                        eventHandlers={{
                          click: () => setActiveInputId(stop.id),
                          dragend: (e) => handleMarkerDragEnd(stop.id, e)
                        }}
                      >
                        <Popup>
                          <div className="font-bold text-gray-900">{stop.name || 'Unnamed Stop'}</div>
                          <div className="text-xs text-red-600 mt-1 font-bold">{label}</div>
                          <div className="text-xs text-gray-500 mt-2 font-medium">Drag to adjust</div>
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
                </MapContainer>
                
                {/* Floating Map Helper text */}
                <div className="absolute bottom-6 right-6 z-[1000] bg-white/90 backdrop-blur px-5 py-3 rounded-xl shadow-xl border border-gray-200 pointer-events-none">
                  <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <MapPin size={16} className="text-blue-600" /> Click anywhere to drop a pin for the selected input
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
