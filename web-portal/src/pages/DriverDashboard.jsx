import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import { MapIcon, MapPin, Navigation, Power, CheckCircle2 } from 'lucide-react';
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
            const routesRes = await API.get('/route-manager/routes');
            if (routesRes.data.success) {
              const matchedRoute = routesRes.data.data.find(
                r => r._id === driverData.assignedRoute || r._id === driverData.assignedRoute._id
              );
              if (matchedRoute) {
                matchedRoute.decodedPolyline = matchedRoute.polyline ? decodePolyline(matchedRoute.polyline) : [];
                setAssignedRoute(matchedRoute);
                
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
      
      {/* Background Map - Full Bleed */}
      <div className={styles.mapPanel}>
        {isLoaded ? (
          <div className={`${isOnline ? styles.mapOnline : styles.mapOffline}`} style={{ height: '100%', width: '100%' }}>
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
                  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
                  { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
                  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dadada" }] },
                  { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
                  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] },
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
              {/* Driver Location Marker */}
              <Marker 
                position={center} 
                icon={{ 
                  path: window.google.maps.SymbolPath.CIRCLE, 
                  scale: 8, 
                  fillColor: isOnline ? '#075AAA' : '#94A3B8', 
                  fillOpacity: 1, 
                  strokeWeight: 3, 
                  strokeColor: '#FFFFFF' 
                }} 
              />

              {/* Assigned Route Polyline */}
              {assignedRoute && assignedRoute.decodedPolyline && (
                <Polyline
                  path={assignedRoute.decodedPolyline}
                  options={{
                    strokeColor: isOnline ? '#075AAA' : '#94A3B8',
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
                    strokeColor: isOnline ? '#075AAA' : '#94A3B8',
                    strokeWeight: 3,
                    scale: 5
                  }}
                />
              ))}
            </GoogleMap>
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' }}>
            <span style={{ color: '#94A3B8', fontWeight: 600 }}>Loading Map Environment...</span>
          </div>
        )}
      </div>

      {/* Floating Action Panel - Glassmorphism UI */}
      <div className={styles.floatingPanel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.title}>Dashboard</h2>
          <div className={`${styles.statusIndicator} ${isOnline ? styles.statusOnline : styles.statusOffline}`}>
            <div className={isOnline ? styles.pulseDot : styles.staticDot}></div>
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>

        <div className={styles.routeCard}>
          <div className={styles.routeLabel}>Assigned Corridor</div>
          <div className={styles.routeValue}>
            <div className={styles.iconBox}>
              <MapIcon size={18} />
            </div>
            {assignedRoute ? assignedRoute.name : 'No route assigned'}
          </div>
        </div>

        <button 
          className={`${styles.toggleBtn} ${isOnline ? styles.btnGoOffline : styles.btnGoOnline}`}
          onClick={toggleOnline}
        >
          <Power size={18} />
          {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
        </button>
      </div>

      {/* Incoming Request Floating Card */}
      {incomingRide && (
        <div className={styles.requestOverlay}>
          <div className={styles.requestCard}>
            <div className={styles.requestHeader}>
              <h3 className={styles.requestTitle}>New Ride Request</h3>
              <p className={styles.requestSubtitle}>Passenger is waiting near your route</p>
            </div>
            
            <div className={styles.routeTimeline}>
              <div className={styles.routeLine}></div>
              
              <div className={styles.timelineItem}>
                <div className={`${styles.timelineDot} ${styles.dotPickup}`}></div>
                <p className={styles.locationText}>{incomingRide.pickup?.address}</p>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Pickup • {incomingRide.distanceToPickup} km away</span>
              </div>
              
              <div className={styles.timelineItem}>
                <div className={`${styles.timelineDot} ${styles.dotDrop}`}></div>
                <p className={styles.locationText}>{incomingRide.drop?.address}</p>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Dropoff</span>
              </div>
            </div>

            <div className={styles.actionGrid}>
              <button className={styles.btnReject} onClick={rejectRide}>Decline</button>
              <button className={styles.btnAccept} onClick={acceptRide}>Accept Ride</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DriverDashboard;
