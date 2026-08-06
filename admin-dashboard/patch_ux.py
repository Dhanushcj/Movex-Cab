import sys

file_path = r'g:\Dhanush\New folder\Movex-Cab\admin-dashboard\src\pages\RouteManager.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace handleSaveTempJunction to accept a type parameter
old_save = """  const handleSaveTempJunction = async () => {
    if (!tempJunction.name) return alert('Enter a name for the new junction');
    try {
      const res = await API.post('/route-manager/junctions', {
        name: tempJunction.name,
        coordinates: [tempJunction.lng, tempJunction.lat],
        description: 'Created via Map Route Builder'
      });
      const newJunc = res.data.data;
      setJunctions(prev => [...prev, newJunc]);
      if (!startPoint) setStartPoint(newJunc._id);
      else if (!endPoint) setEndPoint(newJunc._id);
      else setIntermediatePoints(prev => [...prev, newJunc._id]);
      setTempJunction(null);
    } catch (err) {
      alert('Failed to create junction');
    }
  };"""

new_save = """  const handleSaveTempJunction = async (assignmentType) => {
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
  };"""

content = content.replace(old_save, new_save)

# Replace the Map Popup with a highly visible floating dialog
old_popup = """                  {/* Temporary Junction Marker (when clicking empty space) */}
                  {tempJunction && (
                    <Marker position={[tempJunction.lat, tempJunction.lng]} icon={defaultIcon}>
                      <Popup onClose={() => setTempJunction(null)}>
                        <div className="p-1 space-y-2">
                          <h4 className="font-bold text-sm">New Junction</h4>
                          <input 
                            type="text" 
                            className="border p-1 text-sm w-full rounded text-black" 
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
                  )}"""

new_popup = """                  {/* Temporary Junction Marker */}
                  {tempJunction && (
                    <Marker position={[tempJunction.lat, tempJunction.lng]} icon={defaultIcon} />
                  )}"""

content = content.replace(old_popup, new_popup)

# Add the floating Action Card outside the map but inside the map panel relative div
action_card = """
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
"""

if 'Floating Temp Junction Action Card' not in content:
    content = content.replace(
        "{/* Floating Map Helper text */}",
        action_card + "\n                {/* Floating Map Helper text */}"
    )

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied UX improvements for location addition!")
