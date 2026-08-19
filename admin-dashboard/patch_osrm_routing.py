import sys

file_path = r'g:\Dhanush\New folder\Movex-Cab\admin-dashboard\src\pages\RouteManager.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add OSRM routing state and effect
routing_state = """
  const [roadPolyline, setRoadPolyline] = useState(null);

  // Fetch real road route from OSRM when junctions change
  useEffect(() => {
    if (newRoute.selectedJunctions.length < 2) {
      setRoadPolyline(null);
      return;
    }
    
    const fetchRoute = async () => {
      try {
        const coords = newRoute.selectedJunctions.map(jId => {
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
  }, [newRoute.selectedJunctions, junctions]);
"""

if 'setRoadPolyline' not in content:
    content = content.replace(
        "const [tempJunction, setTempJunction] = useState(null); // { lat, lng, name }",
        "const [tempJunction, setTempJunction] = useState(null); // { lat, lng, name }\n" + routing_state
    )

# Replace the straight line Polyline with the Road Polyline
poly_old = """                  {/* Draw lines connecting selected junctions */}
                  {selectedPolylineCoords.length > 1 && (
                    <Polyline 
                      positions={selectedPolylineCoords}
                      color="#3B82F6"
                      weight={4}
                      dashArray="10, 10"
                    />
                  )}"""

poly_new = """                  {/* Draw real road routes connecting selected junctions */}
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
                  )}"""

if 'roadPolyline &&' not in content:
    content = content.replace(poly_old, poly_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added OSRM road routing to RouteManager!")
