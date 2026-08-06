import sys

file_path = r'g:\Dhanush\New folder\Movex-Cab\admin-dashboard\src\pages\RouteManager.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We want to add a dropdown to select junctions above the Route Sequence list.
search_ui = """
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
"""

if 'Search & Add Junction' not in content:
    content = content.replace(
        '<div className="flex-1">',
        search_ui
    )

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added Search/Select dropdown to RouteManager!")
