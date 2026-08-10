import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import { MapIcon } from 'lucide-react';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import styles from './DriverDashboard.module.css';

const center = { lat: 13.0827, lng: 80.2707 }; // Chennai
const libraries = ['places', 'geometry'];

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

const DriverDashboard = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [incomingRide, setIncomingRide] = useState(null);
  const [assignedRoute, setAssignedRoute] = useState(null);
  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const driverRes = await API.get('/drivers/me');
        if (driverRes.data.success) {
          const driverData = driverRes.data.data;
          setIsOnline(driverData.isAvailable);
          
          if (driverData.assignedRoute) {
            // Fetch routes to get polyline
            const routesRes = await API.get('/route-manager/routes');
            if (routesRes.data.success) {
              const matchedRoute = routesRes.data.data.find(
                r => r._id === driverData.assignedRoute || r._id === driverData.assignedRoute._id
              );
              if (matchedRoute) {
                matchedRoute.decodedPolyline = matchedRoute.polyline ? decodePolyline(matchedRoute.polyline) : [];
                setAssignedRoute(matchedRoute);
                
                // Fit map to route bounds if map is ready
                if (mapRef.current && matchedRoute.decodedPolyline.length > 0) {
                  const bounds = new window.google.maps.LatLngBounds();
                  matchedRoute.decodedPolyline.forEach(coord => {
                    bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
                  });
                  mapRef.current.fitBounds(bounds);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (data) => {
      setIncomingRide(data);
    };

    const handleCancelled = () => {
      setIncomingRide(null);
    };

    socket.on('ride:incoming', handleIncoming);
    socket.on('ride:cancelled', handleCancelled);

    return () => {
      socket.off('ride:incoming', handleIncoming);
      socket.off('ride:cancelled', handleCancelled);
    };
  }, [socket]);

  const toggleOnline = async () => {
    try {
      const newStatus = !isOnline;
      await API.put('/drivers/status', { isAvailable: newStatus, location: { type: 'Point', coordinates: [80.2707, 13.0827] } });
      setIsOnline(newStatus);
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const acceptRide = async () => {
    if (!incomingRide) return;
    try {
      const res = await API.put(`/bookings/${incomingRide.bookingId}/accept`, {});
      if (res.data.success) {
        socket.emit('ride:accept', {
          bookingId: incomingRide.bookingId,
          driverId: user._id,
          driverInfo: {
            name: user.name,
            phone: user.phone,
            vehicle: user.vehicle
          },
          booking: res.data.data
        });
        setIncomingRide(null);
        navigate(`/driver/active-ride/${incomingRide.bookingId}`);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to accept ride');
      setIncomingRide(null);
    }
  };

  const rejectRide = () => {
    setIncomingRide(null);
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Side Panel */}
      <div className={styles.sidePanel}>
        <div className={styles.panelHeader}>
          <h2>Driver Dashboard</h2>
          <div className={styles.statusWrapper}>
            <div className={`${styles.statusBadge} ${isOnline ? styles.statusOnline : styles.statusOffline}`}>
              <div className={`${styles.statusDot} ${isOnline ? styles.dotOnline : styles.dotOffline}`}></div>
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <button 
              className={`${styles.toggleBtn} ${isOnline ? styles.btnOnline : styles.btnOffline}`}
              onClick={toggleOnline}
            >
              {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
            </button>
          </div>
        </div>
        
        <div className={styles.panelContent}>
          <div className={styles.routeInfoCard}>
            <h3>Assigned Route</h3>
            {assignedRoute ? (
              <p><MapIcon size={20} color="var(--forge-blue)" /> {assignedRoute.name}</p>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No route assigned</p>
            )}
          </div>
          
          <div style={{ marginTop: '32px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
              Ensure your vehicle is active on the correct polyline track. Ride requests will automatically be routed to you based on your assigned corridor.
            </p>
          </div>
        </div>
      </div>

      {/* Map Panel */}
      <div className={styles.mapPanel}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={center}
            zoom={13}
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
            }}
            onLoad={map => {
              mapRef.current = map;
              if (assignedRoute?.decodedPolyline?.length > 0) {
                const bounds = new window.google.maps.LatLngBounds();
                assignedRoute.decodedPolyline.forEach(coord => {
                  bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
                });
                map.fitBounds(bounds);
              }
            }}
          >
            {/* Driver Location */}
            <Marker position={center} icon={{ path: window.google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: '#2563EB', fillOpacity: 1, strokeWeight: 2, strokeColor: '#FFFFFF' }} />

            {/* Assigned Route Polyline */}
            {assignedRoute && assignedRoute.decodedPolyline && (
              <Polyline
                path={assignedRoute.decodedPolyline}
                options={{
                  strokeColor: '#075AAA',
                  strokeOpacity: 0.8,
                  strokeWeight: 6,
                }}
              />
            )}
            
            {/* Stops/Junctions */}
            {assignedRoute && assignedRoute.junctions?.map(j => (
              <Marker 
                key={j._id}
                position={{ lat: j.location.coordinates[1], lng: j.location.coordinates[0] }}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  fillColor: '#FFFFFF',
                  fillOpacity: 1,
                  strokeColor: '#075AAA',
                  strokeWeight: 3,
                  scale: 5
                }}
              />
            ))}
          </GoogleMap>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Loading Map...
          </div>
        )}

        {/* Incoming Ride Overlay */}
        {incomingRide && (
          <div className={styles.incomingRequestCard}>
            <h3>New Ride Request</h3>
            <div className={styles.requestDetails}>
              <div className={styles.requestRow}>
                <span className={styles.requestLabel}>Pickup</span>
                <span className={styles.requestValue}>{incomingRide.pickup?.address}</span>
              </div>
              <div className={styles.requestRow}>
                <span className={styles.requestLabel}>Dropoff</span>
                <span className={styles.requestValue}>{incomingRide.drop?.address}</span>
              </div>
              <div className={styles.requestRow}>
                <span className={styles.requestLabel}>Distance</span>
                <span className={styles.requestValue}>{incomingRide.distanceToPickup} km</span>
              </div>
            </div>
            <div className={styles.actionButtons}>
              <button className={styles.btnReject} onClick={rejectRide}>Reject</button>
              <button className={styles.btnAccept} onClick={acceptRide}>Accept Ride</button>
            </div>
          </div>
        )}

        {/* Offline Overlay */}
        {!isOnline && (
          <div className={styles.mapOverlay}>
            <h2>You are Offline</h2>
            <p>Go online to start receiving ride requests on your route.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
