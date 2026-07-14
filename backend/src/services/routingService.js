const axios = require('axios');

/**
 * Fetch directions and distance between coordinates using OSRM
 * @param {Array} pickup - [lng, lat]
 * @param {Array} drop - [lng, lat]
 * @returns {Promise<Object>} - { distance (km), duration (mins), polyline, steps[] }
 */
const getRouteDetails = async (pickup, drop) => {
  try {
    const [pLng, pLat] = pickup || [];
    const [dLng, dLat] = drop || [];

    // Validate that all coordinates are valid numbers
    if (
      typeof pLng !== 'number' || isNaN(pLng) ||
      typeof pLat !== 'number' || isNaN(pLat) ||
      typeof dLng !== 'number' || isNaN(dLng) ||
      typeof dLat !== 'number' || isNaN(dLat)
    ) {
      throw new Error('Invalid coordinates provided to routing service');
    }

    const baseUrl = process.env.OSRM_BASE_URL || 'https://router.project-osrm.org';
    // steps=true fetches turn-by-turn maneuvers for navigation HUD
    const url = `${baseUrl}/route/v1/driving/${pLng},${pLat};${dLng},${dLat}?overview=full&geometries=polyline&steps=true&annotations=false`;

    const response = await axios.get(url);

    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];

      // Extract turn-by-turn steps from each leg for the driver navigation HUD
      const steps = [];
      if (route.legs && route.legs.length > 0) {
        route.legs.forEach((leg) => {
          if (leg.steps && leg.steps.length > 0) {
            leg.steps.forEach((step) => {
              steps.push({
                distance: step.distance,               // metres to this step's end
                duration: step.duration,               // seconds
                name: step.name || '',                 // street name
                mode: step.mode || 'driving',
                maneuver: {
                  type: step.maneuver?.type || 'straight',
                  modifier: step.maneuver?.modifier || 'straight',
                  bearingAfter: step.maneuver?.bearing_after ?? 0,
                  bearingBefore: step.maneuver?.bearing_before ?? 0,
                  // Location of the turn point [lng, lat]
                  location: step.maneuver?.location || null,
                }
              });
            });
          }
        });
      }

      return {
        distance: Number((route.distance / 1000).toFixed(2)), // meters → km
        duration: Number((route.duration / 60).toFixed(2)),   // seconds → minutes
        polyline: route.geometry,
        steps,
      };
    }
  } catch (error) {
    console.error('⚠️ OSRM Routing Error. Falling back to straight-line estimation:', error.message);
  }

  // Fallback straight line distance (Haversine formula)
  const distance = calculateHaversineDistance(pickup[1], pickup[0], drop[1], drop[0]);
  const avgSpeedKmh = 30; // Assumed speed in city traffic
  const duration = (distance / avgSpeedKmh) * 60; // in minutes

  return {
    distance: Number(distance.toFixed(2)),
    duration: Number(duration.toFixed(2)),
    polyline: '',
    steps: [],
  };
};

/**
 * Haversine formula to estimate distance
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = { getRouteDetails, calculateHaversineDistance };
