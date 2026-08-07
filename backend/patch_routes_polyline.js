const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

// Load environment variables
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Define schemas
const RouteSchema = new mongoose.Schema({
  name: String,
  junctions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Junction' }],
  polyline: String,
});
const Route = mongoose.models.Route || mongoose.model('Route', RouteSchema);

const JunctionSchema = new mongoose.Schema({
  name: String,
  location: { type: { type: String }, coordinates: [Number] }
});
const Junction = mongoose.models.Junction || mongoose.model('Junction', JunctionSchema);

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

async function patchRoutes() {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("No Google Maps API Key found in .env");
    process.exit(1);
  }

  const routes = await Route.find().populate('junctions');
  console.log(`Found ${routes.length} routes to patch.`);

  for (const route of routes) {
    console.log(`Patching route: ${route.name}`);
    const validStops = route.junctions.filter(j => j.location && j.location.coordinates);
    if (validStops.length < 2) {
      console.log(`Route ${route.name} has less than 2 stops, skipping.`);
      continue;
    }

    const origin = validStops[0].location.coordinates;
    const destination = validStops[validStops.length - 1].location.coordinates;
    const waypoints = validStops.slice(1, -1).map(j => `${j.location.coordinates[1]},${j.location.coordinates[0]}`).join('|');

    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin[1]},${origin[0]}&destination=${destination[1]},${destination[0]}&key=${GOOGLE_MAPS_API_KEY}`;
    if (waypoints.length > 0) {
      url += `&waypoints=${waypoints}`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.status === 'OK' && data.routes.length > 0) {
        const polyline = data.routes[0].overview_polyline.points;
        route.polyline = polyline;
        await route.save();
        console.log(`Successfully patched route: ${route.name}`);
      } else {
        console.error(`Failed to patch ${route.name}: ${data.status}`);
      }
    } catch (err) {
      console.error(`Error requesting Directions API for ${route.name}:`, err.message);
    }
  }

  console.log("Finished patching routes.");
  process.exit(0);
}

patchRoutes();
