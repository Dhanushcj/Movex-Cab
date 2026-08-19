import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Power, MapPin, Navigation, Clock, CheckCircle2, Navigation2, FileText, LifeBuoy, History, Zap } from 'lucide-react';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import styles from './DriverDashboard.module.css';

const center = [13.0827, 80.2707]; // Chennai

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
  const [driverLocation, setDriverLocation] = useState(center);
  const mapRef = useRef(null);
  
  // Mock operational stats for the layout
  const opStats = {
    tripsToday: 4,
    onlineTime: "3h 45m",
    acceptance: "92%",
    completedRides: 124
  };

  // Track location via geolocation watch
  const driverLocationRef = useRef(driverLocation);
  useEffect(() => { driverLocationRef.current = driverLocation; }, [driverLocation]);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setDriverLocation(loc);
        },
        (err) => console.warn('Geolocation error:', err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Mirror mobile app: emit driver:online, periodic location:update, and ride:incoming listener
  useEffect(() => {
    if (!socket || !user) return;

    if (isOnline) {
      // Emit driver:online exactly like mobile app
      socket.emit('driver:online', {
        driverId: user._id,
        location: {
          type: 'Point',
          coordinates: [driverLocationRef.current.lng, driverLocationRef.current.lat]
        },
        vehicleType: user.vehicle?.type
      });

      // Periodic location updates (every 5s) — same as mobile app
      const locationInterval = setInterval(() => {
        const currLoc = driverLocationRef.current;
        if (currLoc) {
          socket.emit('location:update', {
            driverId: user._id,
            location: {
              type: 'Point',
              coordinates: [currLoc.lng, currLoc.lat]
            }
          });
          // Also update DB so driver shows up in GeoJSON queries
          API.put('/drivers/location', {
            latitude: currLoc.lat,
            longitude: currLoc.lng
          }).catch(() => {});
        }
      }, 5000);

      // Listen for ride events
      const handleIncoming = (data) => {
        console.log('🔔 Ride request received:', data);
        setIncomingRide(data);
      };
      const handleExpired = () => {
        console.log('⏰ Ride request expired');
        setIncomingRide(null);
      };
      const handleCancelled = () => {
        console.log('❌ Ride cancelled');
        setIncomingRide(null);
      };

      socket.on('ride:incoming', handleIncoming);
      socket.on('ride:expired', handleExpired);
      socket.on('ride:cancelled', handleCancelled);

      return () => {
        clearInterval(locationInterval);
        socket.off('ride:incoming', handleIncoming);
        socket.off('ride:expired', handleExpired);
        socket.off('ride:cancelled', handleCancelled);
      };
    } else {
      // Emit driver:offline exactly like mobile app
      socket.emit('driver:offline', { driverId: user._id });
    }
  }, [socket, isOnline, user]);

  
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const driverRes = await API.get('/auth/me');
        if (driverRes.data.success) {
          const driverData = driverRes.data.data;
          setIsOnline(driverData.isAvailable);
          
          const route = driverData.assignedRoute;
          if (route && typeof route === 'object' && route._id) {
            try {
              const routeRes = await API.get('/route-manager/routes');
              if (routeRes.data.success) {
                const fullRoute = routeRes.data.data.find(r => r._id === route._id);
                if (fullRoute) {
                  fullRoute.decodedPolyline = fullRoute.polyline ? decodePolyline(fullRoute.polyline) : [];
                  setAssignedRoute(fullRoute);
                  
                  if (mapRef.current && fullRoute.decodedPolyline.length > 0 && window.google?.maps) {
                    try {
                      const bounds = new window.google.maps.LatLngBounds();
                      fullRoute.decodedPolyline.forEach(coord => {
                        bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
                      });
                      mapRef.current.fitBounds(bounds);
                    } catch (e) {}
                  }
                }
              }
            } catch (routeErr) {
              route.decodedPolyline = route.polyline ? decodePolyline(route.polyline) : [];
              setAssignedRoute(route);
            }
          } else if (route && typeof route === 'string') {
            try {
              const routesRes = await API.get('/route-manager/routes');
              if (routesRes.data.success) {
                const matchedRoute = routesRes.data.data.find(r => r._id === route);
                if (matchedRoute) {
                  matchedRoute.decodedPolyline = matchedRoute.polyline ? decodePolyline(matchedRoute.polyline) : [];
                  setAssignedRoute(matchedRoute);
                }
              }
            } catch (routeErr) {
              console.error('Failed to fetch routes:', routeErr);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch driver data:', err);
      }
    };
    fetchData();
  }, []);

  // Listen for route assignment events (separate from ride events)
  useEffect(() => {
    if (!socket) return;

    const handleRouteAssigned = (data) => {
      if (data.route) {
        const fullRoute = { ...data.route };
        fullRoute.decodedPolyline = fullRoute.polyline ? decodePolyline(fullRoute.polyline) : [];
        setAssignedRoute(fullRoute);
      } else {
        setAssignedRoute(null);
      }
    };

    socket.on('route:assigned', handleRouteAssigned);

    return () => {
      socket.off('route:assigned', handleRouteAssigned);
    };
  }, [socket]);

  const toggleOnline = async () => {
    try {
      const newStatus = !isOnline;
      await API.put('/drivers/status', { isAvailable: newStatus, location: { type: 'Point', coordinates: [driverLocation.lng, driverLocation.lat] } });
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
    <div className={`${styles.dashboardContainer} fullBleed`}>
      
      {/* Background Map - Full Bleed */}
      <div className={styles.mapPanel}>
        <MapContainer
          center={[driverLocation.lat || 13.0827, driverLocation.lng || 80.2707]}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />
          {/* Driver Location Marker */}
          {driverLocation && (
            <Marker 
              position={[driverLocation.lat, driverLocation.lng]} 
              icon={L.divIcon({
                className: 'driver-loc-marker',
                html: `<div style="width: 16px; height: 16px; border-radius: 50%; background-color: ${isOnline ? '#075AAA' : '#94A3B8'}; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
              })}
            />
          )}

          {/* Assigned Route Polyline */}
          {assignedRoute && assignedRoute.decodedPolyline && (
            <Polyline
              positions={assignedRoute.decodedPolyline.map(p => [p.lat, p.lng])}
              pathOptions={{
                color: '#E8C84A',
                opacity: 0.9,
                weight: 6
              }}
            />
          )}
          
          {/* Stops/Junctions */}
          {assignedRoute && assignedRoute.junctions?.map(j => (
            <Marker 
              key={j._id}
              position={[j.location.coordinates[1], j.location.coordinates[0]]}
              icon={L.divIcon({
                className: 'junction-marker',
                html: `<div style="width: 12px; height: 12px; border-radius: 50%; background-color: white; border: 3px solid #075AAA; box-shadow: 0 1px 4px rgba(0,0,0,0.3);"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
              })}
            />
          ))}
        </MapContainer>
      </div>

      {/* 1. Floating Driver Status Panel */}
      <div className={`${styles.glassPanel} ${styles.statusPanel}`}>
        <div className={styles.statusHeader}>
          <div className={isOnline ? styles.statusDot : styles.statusOfflineDot}></div>
          <h2 className={styles.statusTitle}>{isOnline ? 'Online' : 'Offline'}</h2>
        </div>
        <div className={styles.statusSubtitle}>
          {isOnline ? 'Available for ride requests' : 'Currently not receiving requests'}
        </div>

        <div className={styles.detailRow}>
          <div className={styles.detailIcon}><Navigation2 size={16} /></div>
          <div className={styles.detailInfo}>
            <span className={styles.detailLabel}>Assigned Corridor</span>
            <span className={styles.detailValue}>{assignedRoute ? assignedRoute.name : 'No route assigned'}</span>
          </div>
        </div>

        <div className={styles.detailRow}>
          <div className={styles.detailIcon}><MapPin size={16} /></div>
          <div className={styles.detailInfo}>
            <span className={styles.detailLabel}>Current Location</span>
            <span className={styles.detailValue}>Live Tracking Active</span>
          </div>
        </div>

        <button 
          className={`${styles.toggleBtn} ${isOnline ? styles.btnGoOffline : styles.btnGoOnline}`}
          onClick={toggleOnline}
        >
          <Power size={16} />
          {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
        </button>
      </div>

      {/* 2. Today's Operational Stats */}
      <div className={`${styles.glassPanel} ${styles.statsPanel}`}>
        <h3 className={styles.panelTitle}><Zap size={16} color="var(--forge-yellow)" /> Operational Stats</h3>
        
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{opStats.tripsToday}</span>
            <span className={styles.statLabel}>TRIPS TODAY</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{opStats.onlineTime}</span>
            <span className={styles.statLabel}>ONLINE TIME</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{opStats.acceptance}</span>
            <span className={styles.statLabel}>ACCEPTANCE</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{opStats.completedRides}</span>
            <span className={styles.statLabel}>COMPLETED</span>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions */}
      <div className={styles.quickActionsPanel}>
        <button className={styles.actionBtn} onClick={() => navigate('/driver/trip')}>
          <Navigation size={18} />
          Active Trip
        </button>
        <button className={styles.actionBtn} onClick={() => navigate('/driver/history')}>
          <History size={18} />
          History
        </button>
        <button className={styles.actionBtn} onClick={() => navigate('/driver/documents')}>
          <FileText size={18} />
          Documents
        </button>
        <button className={styles.actionBtn} onClick={() => navigate('/driver/support')}>
          <LifeBuoy size={18} />
          Support
        </button>
      </div>

      {/* 4. Ride Request Overlay */}
      {incomingRide && (
        <div className={styles.requestOverlay}>
          <div className={styles.requestCard}>
            <div className={styles.reqHeader}>
              <div className={styles.reqPulse}>
                <Zap size={24} color="var(--forge-yellow)" />
              </div>
              <h3 className={styles.reqTitle}>New Ride Request</h3>
              <p className={styles.reqSubtitle}>Passenger is waiting near your route</p>
            </div>
            
            <div className={styles.reqBody}>
              <div className={styles.reqTimeline}>
                <div className={styles.reqLine}></div>
                
                <div className={styles.reqStop}>
                  <div className={`${styles.reqDot} ${styles.dotPickup}`}></div>
                  <div>
                    <p className={styles.reqLocText}>{incomingRide.pickup?.address}</p>
                    <span className={styles.reqLocMeta}>Pickup • {incomingRide.distanceToPickup} km away</span>
                  </div>
                </div>
                
                <div className={styles.reqStop}>
                  <div className={`${styles.reqDot} ${styles.dotDrop}`}></div>
                  <div>
                    <p className={styles.reqLocText}>{incomingRide.drop?.address}</p>
                    <span className={styles.reqLocMeta}>Dropoff</span>
                  </div>
                </div>
              </div>

              <div className={styles.reqStatsRow}>
                <div className={styles.reqStat}>
                  <div className={styles.reqStatValue}>Est. {Math.round(incomingRide.distanceToPickup * 3)} min</div>
                  <div className={styles.reqStatLabel}>TO PICKUP</div>
                </div>
                <div className={styles.reqStat}>
                  <div className={styles.reqStatValue}>4.9 ★</div>
                  <div className={styles.reqStatLabel}>PASSENGER</div>
                </div>
              </div>

              <div className={styles.reqActions}>
                <button className={styles.btnDecline} onClick={rejectRide}>Decline</button>
                <button className={styles.btnAccept} onClick={acceptRide}>Accept Ride</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DriverDashboard;
