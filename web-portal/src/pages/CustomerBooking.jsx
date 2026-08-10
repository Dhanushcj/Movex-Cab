import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CarFront, Users, Map as MapIcon, CheckCircle2, ChevronRight } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';
import styles from './CustomerBooking.module.css';
import API from '../services/api';
import { useSocket } from '../context/SocketContext';

const center = { lat: 13.0827, lng: 80.2707 }; // Chennai
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

const CustomerBooking = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [pickupJunction, setPickupJunction] = useState('');
  const [dropoffJunction, setDropoffJunction] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('mini');
  const [loading, setLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null); // null, 'searching', 'booked'

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const mapRef = useRef(null);

  const vehicles = [
    { id: 'mini', name: 'MoveX Mini', desc: 'Compact rides for daily commutes', price: 12.50, capacity: 3, time: '3 min' },
    { id: 'sedan', name: 'MoveX Sedan', desc: 'Comfortable rides for longer trips', price: 18.00, capacity: 4, time: '5 min' },
    { id: 'suv', name: 'MoveX XL', desc: 'Extra space for groups and luggage', price: 26.50, capacity: 6, time: '8 min' },
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

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    setPickupJunction('');
    setDropoffJunction('');
    
    if (mapRef.current && route.decodedPolyline && route.decodedPolyline.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      route.decodedPolyline.forEach(coord => {
        bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
      });
      mapRef.current.fitBounds(bounds);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedRoute || !pickupJunction || !dropoffJunction) return;
    
    setLoading(true);
    setBookingStatus('searching');
    
    try {
      const pickupObj = selectedRoute.junctions.find(j => j._id === pickupJunction);
      const dropoffObj = selectedRoute.junctions.find(j => j._id === dropoffJunction);
      
      const payload = {
        pickup: {
          address: pickupObj.name,
          coordinates: pickupObj.location.coordinates
        },
        drop: {
          address: dropoffObj.name,
          coordinates: dropoffObj.location.coordinates
        },
        vehicleType: selectedVehicle,
        fare: vehicles.find(v => v.id === selectedVehicle).price,
        distance: 10, // Mock distance since it's predefined
        duration: 25, // Mock duration
        routeId: selectedRoute._id
      };
      
      const res = await API.post('/bookings', payload);
      
      if (res.data.success) {
        setBookingStatus('booked');
        // If socket is connected, emit ride request to nearby drivers
        if (socket) {
          socket.emit('ride:request', {
            bookingId: res.data.data._id,
            pickup: payload.pickup,
            drop: payload.drop,
            vehicleType: selectedVehicle,
            routeId: selectedRoute._id
          });
        }
        
        setTimeout(() => {
          navigate('/customer/tracking/' + res.data.data._id);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to book ride');
      setBookingStatus(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.bookingContainer}>
      {/* Sidebar Panel */}
      <div className={styles.bookingPanel}>
        <div className={styles.panelHeader}>
          <h2>Book a Ride</h2>
          <p>Select a route to get started</p>
        </div>

        {bookingStatus === 'searching' && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
            <p>Finding a driver for your route...</p>
          </div>
        )}

        {bookingStatus === 'booked' && (
          <div className={styles.loadingOverlay}>
            <CheckCircle2 size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
            <p>Ride Confirmed! Redirecting...</p>
          </div>
        )}

        {!bookingStatus && (
          <div className={styles.panelContent}>
            
            {/* Step 1: Select Route */}
            <div className={styles.stepSection}>
              <h3 className={styles.stepTitle}>1. Select Route</h3>
              {!selectedRoute ? (
                <div className={styles.routesList}>
                  {routes.map(r => (
                    <div 
                      key={r._id} 
                      className={styles.routeCard}
                      onClick={() => handleRouteSelect(r)}
                      style={{ borderLeftColor: r.displayColor }}
                    >
                      <MapIcon size={20} color={r.displayColor} style={{ marginRight: '12px' }} />
                      <div className={styles.routeCardInfo}>
                        <h4>{r.name}</h4>
                        <p>{r.junctions?.length || 0} stops</p>
                      </div>
                      <ChevronRight size={20} color="#ccc" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.selectedRouteBanner}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <MapIcon size={20} color={selectedRoute.displayColor} style={{ marginRight: '12px' }} />
                    <div>
                      <h4 style={{ margin: 0 }}>{selectedRoute.name}</h4>
                      <button 
                        onClick={() => setSelectedRoute(null)}
                        className={styles.btnLink}
                      >
                        Change Route
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Select Junctions */}
            {selectedRoute && (
              <div className={styles.stepSection}>
                <h3 className={styles.stepTitle}>2. Select Stops</h3>
                
                <div className={styles.inputGroup}>
                  <div className={styles.inputIcon}><MapPin size={18} color="var(--primary)" /></div>
                  <select 
                    className={styles.selectInput}
                    value={pickupJunction}
                    onChange={(e) => setPickupJunction(e.target.value)}
                  >
                    <option value="">Select Pickup Junction...</option>
                    {selectedRoute.junctions?.map(j => (
                      <option key={j._id} value={j._id} disabled={j._id === dropoffJunction}>{j.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.inputGroup} style={{ marginTop: '16px' }}>
                  <div className={styles.inputIcon}><MapPin size={18} color="var(--secondary)" /></div>
                  <select 
                    className={styles.selectInput}
                    value={dropoffJunction}
                    onChange={(e) => setDropoffJunction(e.target.value)}
                  >
                    <option value="">Select Dropoff Junction...</option>
                    {selectedRoute.junctions?.map(j => (
                      <option key={j._id} value={j._id} disabled={j._id === pickupJunction}>{j.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Select Vehicle */}
            {selectedRoute && pickupJunction && dropoffJunction && (
              <div className={styles.stepSection}>
                <h3 className={styles.stepTitle}>3. Select Vehicle</h3>
                <div className={styles.vehiclesList}>
                  {vehicles.map(v => (
                    <div 
                      key={v.id} 
                      className={`${styles.vehicleCard} ${selectedVehicle === v.id ? styles.selectedVehicle : ''}`}
                      onClick={() => setSelectedVehicle(v.id)}
                    >
                      <CarFront size={28} color={selectedVehicle === v.id ? 'var(--primary)' : 'var(--text-main)'} />
                      <div className={styles.vehicleInfo}>
                        <h4>{v.name}</h4>
                        <div className={styles.vehicleMeta}>
                          <span><Users size={12} style={{ display: 'inline', marginRight: '4px' }}/>{v.capacity}</span>
                          <span>• {v.time}</span>
                        </div>
                      </div>
                      <div className={styles.vehiclePrice}>
                        ${v.price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Button */}
            {selectedRoute && pickupJunction && dropoffJunction && (
              <button 
                className={styles.btnBook} 
                onClick={handleConfirmBooking}
                disabled={loading}
              >
                Confirm Booking
              </button>
            )}

          </div>
        )}
      </div>

      {/* Map View */}
      <div className={styles.mapPanel}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={center}
            zoom={12}
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
              ],
              restriction: {
                latLngBounds: {
                  north: 37.6,
                  south: 8.4,
                  west: 68.7,
                  east: 97.25,
                },
                strictBounds: false,
              }
            }}
            onLoad={map => mapRef.current = map}
          >
            {routes.map(r => {
              // Faded styling if a route is selected and it's not this one
              const isSelected = selectedRoute && selectedRoute._id === r._id;
              const isFaded = selectedRoute && !isSelected;
              
              return r.decodedPolyline?.length > 0 && (
                <Polyline
                  key={r._id}
                  path={r.decodedPolyline}
                  options={{
                    strokeColor: isFaded ? '#bbbbbb' : r.displayColor,
                    strokeOpacity: isFaded ? 0.3 : 1.0,
                    strokeWeight: isSelected ? 6 : 4,
                  }}
                  onClick={() => !selectedRoute && handleRouteSelect(r)}
                />
              )
            })}
            
            {/* Show Junction Markers only for selected route */}
            {selectedRoute && selectedRoute.junctions?.map(j => (
              <Marker 
                key={j._id}
                position={{ lat: j.location.coordinates[1], lng: j.location.coordinates[0] }}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  fillColor: '#FFFFFF',
                  fillOpacity: 1,
                  strokeColor: selectedRoute.displayColor,
                  strokeWeight: 3,
                  scale: 6
                }}
                onClick={() => {
                  if (!pickupJunction) setPickupJunction(j._id);
                  else if (!dropoffJunction && pickupJunction !== j._id) setDropoffJunction(j._id);
                }}
              />
            ))}
          </GoogleMap>
        ) : (
          <div className={styles.mapLoading}>Loading Map...</div>
        )}
      </div>
    </div>
  );
};

export default CustomerBooking;
