import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CarFront, Users, Map as MapIcon, CheckCircle2, ChevronRight, Bike, Navigation } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';
import styles from './CustomerBooking.module.css';
import API from '../services/api';
import { useSocket } from '../context/SocketContext';

const defaultCenter = { lat: 13.0827, lng: 80.2707 }; // Chennai
const libraries = ['places', 'geometry'];
const routeColors = ['#0053B3', '#D49F0C', '#10B981', '#EF4444', '#8B5CF6'];

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
    i.push({ lat: r / 1e5, lng: s / 1e5 });
  }
  return i;
};

// Custom snapping logic to map the click to the closest polyline coordinate
const getClosestPointOnLine = (pt, line) => {
  if (!line || line.length < 2) return pt;
  let minDistance = Infinity;
  let closestPoint = null;
  
  for (let i = 0; i < line.length - 1; i++) {
    const p1 = line[i];
    const p2 = line[i+1];
    
    const l2 = Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2);
    if (l2 === 0) continue;
    
    let t = ((pt.lat - p1.lat) * (p2.lat - p1.lat) + (pt.lng - p1.lng) * (p2.lng - p1.lng)) / l2;
    t = Math.max(0, Math.min(1, t));
    
    const proj = {
      lat: p1.lat + t * (p2.lat - p1.lat),
      lng: p1.lng + t * (p2.lng - p1.lng)
    };
    
    const dist = Math.sqrt(Math.pow(pt.lat - proj.lat, 2) + Math.pow(pt.lng - proj.lng, 2));
    if (dist < minDistance) {
      minDistance = dist;
      closestPoint = proj;
    }
  }
  return closestPoint || pt;
};

const CustomerBooking = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropLocation, setDropLocation] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('mini');
  const [loading, setLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null); // null, 'searching', 'booked'
  const [activeDrivers, setActiveDrivers] = useState([]);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const mapRef = useRef(null);

  const vehicles = [
    { id: 'bike', name: 'MoveX Bike', desc: 'Fastest in traffic', capacity: 1, time: '2 min', icon: Bike },
    { id: 'auto', name: 'MoveX Auto', desc: 'Breeze through streets', capacity: 3, time: '3 min', icon: CarFront },
    { id: 'mini', name: 'MoveX Mini', desc: 'Compact rides for daily commutes', capacity: 3, time: '3 min', icon: CarFront },
    { id: 'sedan', name: 'MoveX Sedan', desc: 'Comfortable rides for longer trips', capacity: 4, time: '5 min', icon: CarFront },
    { id: 'suv', name: 'MoveX XL', desc: 'Extra space for groups and luggage', capacity: 6, time: '8 min', icon: CarFront },
  ];

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await API.get('/route-manager/routes');
        if (res.data.success) {
          const processedRoutes = res.data.data.map((r, idx) => ({
            ...r,
            displayColor: routeColors[idx % routeColors.length],
            decodedPolyline: r.polyline ? decodePolyline(r.polyline) : []
          }));
          setRoutes(processedRoutes);
        }
      } catch (err) {
        console.error('Failed to fetch routes', err);
      }
    };
    fetchRoutes();
  }, []);

  const [currentPosition, setCurrentPosition] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocation not available or denied:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchDrivers = async () => {
      const pos = currentPosition || mapCenter;
      try {
        const res = await API.get(`/drivers/nearby?lat=${pos.lat}&lng=${pos.lng}&radius=10`);
        if (res.data.success) {
          setActiveDrivers(res.data.drivers || []);
        }
      } catch (err) {
        console.error('Failed to fetch nearby drivers', err);
      }
    };
    
    fetchDrivers();
    const intervalId = setInterval(fetchDrivers, 10000);
    return () => clearInterval(intervalId);
  }, [currentPosition, mapCenter]);

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    setPickupLocation(null);
    setDropLocation(null);
    
    if (mapRef.current && route.decodedPolyline && route.decodedPolyline.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      route.decodedPolyline.forEach(coord => {
        bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
      });
      mapRef.current.fitBounds(bounds, { padding: 50 });
    }
  };

  const reverseGeocode = async (lat, lng) => {
    if (window.google) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        const response = await geocoder.geocode({ location: { lat, lng } });
        if (response.results[0]) {
          return response.results[0].formatted_address.split(',')[0];
        }
      } catch (e) {
        console.warn("Google Geocoder failed, trying fallback: " + e);
      }
    }
    
    // Fallback to OSM Nominatim
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      if (data && data.address) {
        return data.address.road || data.address.suburb || data.address.neighbourhood || data.display_name.split(',')[0];
      }
    } catch (e) {
      console.error("OSM Geocoder failed: " + e);
    }
    
    return "Selected Location";
  };

  const handleJunctionClick = (junction) => {
    if (!pickupLocation) {
      setPickupLocation(junction);
    } else if (!dropLocation && junction._id !== pickupLocation._id) {
      setDropLocation(junction);
    }
  };

  const handlePolylineClick = async (e, route) => {
    // If not the selected route, just select it
    if (!selectedRoute || selectedRoute._id !== route._id) {
      handleRouteSelect(route);
      return;
    }

    // Both points already selected, do nothing
    if (pickupLocation && dropLocation) return;

    const clickCoord = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    const lineCoords = route.decodedPolyline;
    const snappedCoord = getClosestPointOnLine(clickCoord, lineCoords);
    
    const locationName = await reverseGeocode(snappedCoord.lat, snappedCoord.lng);

    const customJunction = {
      _id: `temp-${Date.now()}`,
      name: locationName,
      location: { coordinates: [snappedCoord.lng, snappedCoord.lat] }
    };

    if (!pickupLocation) {
      setPickupLocation(customJunction);
    } else {
      setDropLocation(customJunction);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedRoute || !pickupLocation || !dropLocation) return;
    
    setLoading(true);
    setBookingStatus('searching');
    
    try {
      const res = await API.post('/bookings', {
        routeId: selectedRoute._id,
        pickup: {
          address: pickupLocation.name,
          coordinates: pickupLocation.location.coordinates
        },
        drop: {
          address: dropLocation.name,
          coordinates: dropLocation.location.coordinates
        },
        vehicleType: selectedVehicle,
        paymentMethod: 'cash'
      });
      
      if (res.data.success) {
        if (socket) {
          socket.emit('ride:request', {
            bookingId: res.data.data._id,
            routeId: selectedRoute._id,
            vehicleType: selectedVehicle
          });
        }
        
        setTimeout(() => {
          setBookingStatus('booked');
          setLoading(false);
          setTimeout(() => navigate(`/customer/tracking/${res.data.data._id}`), 2000);
        }, 1500);
      }
    } catch (err) {
      console.error('Booking failed', err);
      alert(err.response?.data?.message || 'Failed to create booking. Please try again.');
      setBookingStatus(null);
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setPickupLocation(null);
    setDropLocation(null);
  };

  return (
    <div className={styles.bookingWrapper}>
      
      {/* Dynamic Left Panel */}
      <div className={styles.sidebarPanel}>
        <div className={styles.panelHeader}>
          <h1 className={styles.title}>Where to?</h1>
          <p className={styles.subtitle}>Tap on the map to set your ride</p>
        </div>

        <div className={styles.bookingStateCard}>
          {!selectedRoute ? (
            <div className={styles.stateStep}>
              <div className={styles.stepIcon}><Navigation size={24} /></div>
              <h3>1. Select a Route</h3>
              <p>Tap any colored route line on the map to choose your path.</p>
            </div>
          ) : !pickupLocation ? (
            <div className={styles.stateStep}>
              <div className={styles.stepIcon}><MapPin size={24} color="var(--forge-blue)" /></div>
              <h3>2. Set Pickup Point</h3>
              <p>Tap anywhere along the <b>{selectedRoute.name}</b> route to set your pickup location.</p>
              <button className={styles.btnSecondary} onClick={clearSelection}>Back to Routes</button>
            </div>
          ) : !dropLocation ? (
            <div className={styles.stateStep}>
              <div className={styles.stepIcon}><MapPin size={24} color="#EF4444" /></div>
              <h3>3. Set Drop-off Point</h3>
              <p>Pickup: <b>{pickupLocation.name}</b></p>
              <p>Tap further along the route to set your drop-off.</p>
              <button className={styles.btnSecondary} onClick={clearSelection}>Change Pickup</button>
            </div>
          ) : (
            <div className={styles.stateStepReady}>
              <div className={styles.locationsSummary}>
                <div className={styles.locItem}>
                  <div className={styles.locDot}></div>
                  <div>
                    <span className={styles.locLabel}>Pickup</span>
                    <span className={styles.locValue}>{pickupLocation.name}</span>
                  </div>
                </div>
                <div className={styles.locLine}></div>
                <div className={styles.locItem}>
                  <div className={styles.locDotDrop}></div>
                  <div>
                    <span className={styles.locLabel}>Drop-off</span>
                    <span className={styles.locValue}>{dropLocation.name}</span>
                  </div>
                </div>
              </div>
              <button className={styles.btnSecondaryText} onClick={clearSelection}>Edit Route Points</button>
            </div>
          )}
        </div>

        {pickupLocation && dropLocation && (
          <div className={styles.vehicleSelection}>
            <h3 className={styles.sectionTitle}>Available Vehicles</h3>
            <div className={styles.vehicleList}>
              {vehicles.map(v => {
                const Icon = v.icon;
                return (
                  <div 
                    key={v.id} 
                    className={`${styles.vehicleCard} ${selectedVehicle === v.id ? styles.selected : ''}`}
                    onClick={() => setSelectedVehicle(v.id)}
                  >
                    <div className={styles.vehicleImage}>
                      <Icon size={32} strokeWidth={1.5} color={selectedVehicle === v.id ? "var(--forge-blue)" : "#64748b"} />
                    </div>
                    <div className={styles.vehicleInfo}>
                      <h4>{v.name} <Users size={12} className={styles.capacityIcon}/> {v.capacity}</h4>
                      <p>{v.time} away</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {pickupLocation && dropLocation && (
          <div className={styles.actionFooter}>
            <button 
              className={styles.btnPrimary}
              onClick={handleConfirmBooking}
              disabled={loading || bookingStatus}
            >
              {bookingStatus === 'searching' ? 'Finding Driver...' : bookingStatus === 'booked' ? 'Ride Booked!' : 'Confirm Ride'}
              {!bookingStatus && <ChevronRight size={20} />}
            </button>
          </div>
        )}

        {/* Searching Overlay */}
        {bookingStatus === 'searching' && (
          <div className={styles.searchingOverlay}>
            <div className={styles.spinner}></div>
            <h3>Connecting to nearby drivers...</h3>
            <p>Please wait while we match your ride.</p>
          </div>
        )}
        
        {bookingStatus === 'booked' && (
          <div className={styles.searchingOverlay}>
            <CheckCircle2 size={48} color="#10B981" style={{marginBottom: 16}} />
            <h3>Ride Confirmed!</h3>
            <p>Redirecting to your ride details...</p>
          </div>
        )}
      </div>

      {/* Map Area */}
      <div className={styles.mapContainer}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={mapCenter}
            zoom={12}
            onLoad={map => mapRef.current = map}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              styles: [
                { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
                { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
                { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
                { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
                { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
                { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
                { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
                { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
                { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
                { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
                { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
                { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dadada" }] },
                { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
                { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
                { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
                { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
                { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] },
                { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }
              ]
            }}
          >
            {routes.filter(r => !selectedRoute || selectedRoute._id === r._id).map((route) => {
              const isSelected = selectedRoute?._id === route._id;
              
              return (
                <Polyline
                  key={route._id}
                  path={route.decodedPolyline}
                  options={{
                    strokeColor: route.displayColor,
                    strokeOpacity: isSelected ? 1.0 : 0.6,
                    strokeWeight: isSelected ? 6 : 4,
                    clickable: true,
                    zIndex: isSelected ? 10 : 1,
                  }}
                  onClick={(e) => handlePolylineClick(e, route)}
                />
              );
            })}

            {/* Custom Pickup Marker */}
            {pickupLocation && (
              <Marker
                position={{ lat: pickupLocation.location.coordinates[1], lng: pickupLocation.location.coordinates[0] }}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: 'var(--forge-blue)',
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: '#FFFFFF',
                }}
                title="Pickup Point"
              />
            )}
            
            {/* Custom Drop Marker */}
            {dropLocation && (
              <Marker
                position={{ lat: dropLocation.location.coordinates[1], lng: dropLocation.location.coordinates[0] }}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '#EF4444',
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: '#FFFFFF',
                }}
                title="Drop-off Point"
              />
            )}
            {currentPosition && (
              <Marker
                position={currentPosition}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '#4285F4',
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: '#FFFFFF',
                }}
                title="Your Location"
                zIndex={20}
              />
            )}
            
            {/* Active Nearby Drivers Markers */}
            {activeDrivers.map((driver) => (
              <Marker
                key={driver._id}
                position={{
                  lat: driver.currentLocation.coordinates[1],
                  lng: driver.currentLocation.coordinates[0]
                }}
                icon={{
                  url: '/car.png',
                  scaledSize: new window.google.maps.Size(32, 32),
                }}
                title={driver.name || 'Driver'}
                zIndex={15}
              />
            ))}
          </GoogleMap>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Loading Map...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerBooking;
