import sys

file_path = r'g:\Dhanush\New folder\Movex-Cab\admin-dashboard\src\pages\RouteManager.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add states for Location Search
state_add = """
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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
"""

if 'handleLocationSearch' not in content:
    content = content.replace(
        "const [tempJunction, setTempJunction] = useState(null); // { lat, lng, name }",
        "const [tempJunction, setTempJunction] = useState(null); // { lat, lng, name }\n" + state_add
    )

# Add the UI for the search bar inside the right panel (map panel)
search_bar_ui = """
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
"""

if 'Global Location Search Bar' not in content:
    content = content.replace(
        '{/* Right Panel: Map */}\n              <div className="w-2/3 h-full relative">',
        search_bar_ui
    )

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added Global Location Search to RouteManager!")
