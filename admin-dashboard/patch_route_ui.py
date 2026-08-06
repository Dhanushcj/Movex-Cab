import sys

file_path = r'g:\Dhanush\New folder\Movex-Cab\admin-dashboard\src\pages\RouteManager.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace newRoute state with start, end, intermediate
state_old = "const [newRoute, setNewRoute] = useState({ name: '', selectedJunctions: [] });"
state_new = """const [newRoute, setNewRoute] = useState({ name: '' });
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [intermediatePoints, setIntermediatePoints] = useState([]);

  // Compute total sequence dynamically
  const routeSequence = [startPoint, ...intermediatePoints, endPoint].filter(Boolean);
"""

if 'const [startPoint' not in content:
    content = content.replace(state_old, state_new)

# Update handleJunctionClick for map clicks
click_old = """  const handleJunctionClick = (juncId) => {
    setNewRoute(prev => {
      const isSelected = prev.selectedJunctions.includes(juncId);
      if (isSelected) {
        return { ...prev, selectedJunctions: prev.selectedJunctions.filter(id => id !== juncId) };
      } else {
        return { ...prev, selectedJunctions: [...prev.selectedJunctions, juncId] };
      }
    });
  };"""

click_new = """  const handleJunctionClick = (juncId) => {
    // If clicked on map, behavior depends on what's missing
    if (!startPoint) { setStartPoint(juncId); return; }
    if (!endPoint && startPoint !== juncId) { setEndPoint(juncId); return; }
    
    // If it's already an intermediate point, remove it
    if (intermediatePoints.includes(juncId)) {
      setIntermediatePoints(prev => prev.filter(id => id !== juncId));
    } else if (startPoint !== juncId && endPoint !== juncId) {
      setIntermediatePoints(prev => [...prev, juncId]);
    }
  };"""

if 'if (!startPoint) {' not in content:
    content = content.replace(click_old, click_new)

# Update handleCreateRoute
create_old = """  const handleCreateRoute = async () => {
    if (!newRoute.name || newRoute.selectedJunctions.length < 2) {
      return alert('Please provide a name and select at least 2 junctions (Start and End).');
    }
    try {
      await API.post('/route-manager/routes', {
        name: newRoute.name,
        junctions: newRoute.selectedJunctions
      });"""

create_new = """  const handleCreateRoute = async () => {
    if (!newRoute.name || !startPoint || !endPoint) {
      return alert('Please provide a name, and select BOTH a Start Point and an End Point.');
    }
    try {
      await API.post('/route-manager/routes', {
        name: newRoute.name,
        junctions: routeSequence
      });"""

if '!startPoint || !endPoint' not in content:
    content = content.replace(create_old, create_new)

# Update reset in handleCreateRoute
reset_old = """      setOpenRouteDialog(false);
      setNewRoute({ name: '', selectedJunctions: [] });
      fetchData();"""

reset_new = """      setOpenRouteDialog(false);
      setNewRoute({ name: '' });
      setStartPoint('');
      setEndPoint('');
      setIntermediatePoints([]);
      fetchData();"""

content = content.replace(reset_old, reset_new)

# Update handleSaveTempJunction
temp_old = """      setJunctions(prev => [...prev, newJunc]);
      setNewRoute(prev => ({ ...prev, selectedJunctions: [...prev.selectedJunctions, newJunc._id] }));
      setTempJunction(null);"""

temp_new = """      setJunctions(prev => [...prev, newJunc]);
      if (!startPoint) setStartPoint(newJunc._id);
      else if (!endPoint) setEndPoint(newJunc._id);
      else setIntermediatePoints(prev => [...prev, newJunc._id]);
      setTempJunction(null);"""

if 'if (!startPoint) setStartPoint(newJunc._id);' not in content:
    content = content.replace(temp_old, temp_new)

# Update OSRM use effect dependencies
osrm_old = """  useEffect(() => {
    if (newRoute.selectedJunctions.length < 2) {
      setRoadPolyline(null);
      return;
    }
    
    const fetchRoute = async () => {
      try {
        const coords = newRoute.selectedJunctions.map(jId => {"""

osrm_new = """  useEffect(() => {
    if (routeSequence.length < 2) {
      setRoadPolyline(null);
      return;
    }
    
    const fetchRoute = async () => {
      try {
        const coords = routeSequence.map(jId => {"""

content = content.replace(osrm_old, osrm_new)
content = content.replace("  }, [newRoute.selectedJunctions, junctions]);", "  }, [routeSequence, junctions]);")

# Update selectedPolylineCoords
poly_old = """  const selectedPolylineCoords = newRoute.selectedJunctions.map(jId => {"""
poly_new = """  const selectedPolylineCoords = routeSequence.map(jId => {"""
content = content.replace(poly_old, poly_new)

# Update UI Panel Left
left_panel_old = """                {/* Search and Add Junctions */}
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
                </div>"""

left_panel_new = """                
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
"""

if '{/* Start Point */}' not in content:
    content = content.replace(left_panel_old, left_panel_new)

# Update Map Markers
marker_old = """                  {/* Draw existing junctions */}
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
                  })}"""

marker_new = """                  {/* Draw existing junctions */}
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
                  })}"""

content = content.replace(marker_old, marker_new)

# Update X button clearing
x_btn_old = """              <button onClick={() => { setOpenRouteDialog(false); setTempJunction(null); }} className="p-2 hover:bg-white/10 rounded-full">"""
x_btn_new = """              <button onClick={() => { 
                setOpenRouteDialog(false); 
                setTempJunction(null); 
                setStartPoint(''); 
                setEndPoint(''); 
                setIntermediatePoints([]); 
              }} className="p-2 hover:bg-white/10 rounded-full">"""
content = content.replace(x_btn_old, x_btn_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Refactored RouteManager to have explicit Start, End, and Intermediate Points!")
