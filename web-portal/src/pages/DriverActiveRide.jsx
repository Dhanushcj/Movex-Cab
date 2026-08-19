import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { 
  PhoneCall, 
  MessageSquare, 
  Star, 
  MapPin, 
  Navigation, 
  AlertTriangle,
  Clock,
  Car,
  CreditCard,
  Target,
  User
} from 'lucide-react';
import styles from './DriverActiveRide.module.css';

const libraries = ['places', 'geometry'];

const decodePolyline = (t) => {
  if (!t) return [];
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

const DriverActiveRide = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const [ride, setRide] = useState(null);
  const [status, setStatus] = useState('accepted');
  const [otp, setOtp] = useState('');
  const [osrmRoute, setOsrmRoute] = useState([]);
  const [osrmData, setOsrmData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Use browser geolocation for driver position
  const [currentLocation, setCurrentLocation] = useState(null);
  const locationRef = useRef(currentLocation);
  useEffect(() => { locationRef.current = currentLocation; }, [currentLocation]);

  // Watch browser geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (err) => console.warn('Geolocation error:', err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await API.get(`/bookings/${id}`);
        if (res.data.success) {
          const fetchedRide = res.data.data;
          setRide(fetchedRide);
          setStatus(fetchedRide.status);
          
          // If we haven't received GPS yet, default to the pickup location so we don't route from 0,0 or Chennai
          if (!locationRef.current && fetchedRide.pickup?.location?.coordinates) {
            setCurrentLocation({
              lat: fetchedRide.pickup.location.coordinates[1] - 0.005, // offset slightly so they aren't directly on top
              lng: fetchedRide.pickup.location.coordinates[0]
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch ride:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, [id]);

  // Join tracking room and listen for status updates (matching mobile app flow)
  useEffect(() => {
    if (!socket || !id) return;

    const joinTracking = () => {
      socket.emit('tracking:join', { bookingId: id });
    };
    joinTracking();
    socket.on('connect', joinTracking);

    const handleBookingStatus = (data) => {
      if (data.status) setStatus(data.status);
    };
    const handleRideCompleted = () => setStatus('completed');

    socket.on('booking:status', handleBookingStatus);
    socket.on('ride:completed', handleRideCompleted);

    return () => {
      socket.off('connect', joinTracking);
      socket.off('booking:status', handleBookingStatus);
      socket.off('ride:completed', handleRideCompleted);
    };
  }, [socket, id]);

  useEffect(() => {
    if (!ride) return;
    
    let origin, destination;
    
    if (status === 'accepted' || status === 'arrived') {
      origin = currentLocation;
      if (ride.pickup?.location?.coordinates?.length >= 2) {
        destination = { lat: ride.pickup.location.coordinates[1], lng: ride.pickup.location.coordinates[0] };
      }
    } else if (status === 'in_progress') {
      if (ride.pickup?.location?.coordinates?.length >= 2) {
        origin = { lat: ride.pickup.location.coordinates[1], lng: ride.pickup.location.coordinates[0] };
      }
      if (ride.drop?.location?.coordinates?.length >= 2) {
        destination = { lat: ride.drop.location.coordinates[1], lng: ride.drop.location.coordinates[0] };
      }
    }
    
    if (origin && destination && (origin.lat !== destination.lat || origin.lng !== destination.lng)) {
      const fetchOsrmRoute = async () => {
        try {
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=polyline&steps=true`);
          const data = await res.json();
          if (data.code === 'Ok' && data.routes.length > 0) {
            const route = data.routes[0];
            setOsrmRoute(decodePolyline(route.geometry));
            setOsrmData(route);
          }
        } catch (err) {
          console.error("OSRM Routing Error:", err);
        }
      };
      fetchOsrmRoute();
    }
  }, [ride, status, currentLocation]);

  const handleArrive = async () => {
    try {
      const res = await API.put(`/bookings/${id}/arrived`, {});
      if (res.data.success) {
        setStatus('arrived');
        if (socket) socket.emit('ride:driverArrived', { bookingId: id });
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const handleStartTrip = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 4) return alert('Enter 4-digit OTP');
    try {
      const res = await API.put(`/bookings/${id}/start`, { otp });
      if (res.data.success) {
        setStatus('in_progress');
        if (socket) socket.emit('ride:started', { bookingId: id });
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleCompleteTrip = async () => {
    try {
      const res = await API.put(`/bookings/${id}/complete`, {});
      if (res.data.success) {
        setStatus('completed');
        if (socket) socket.emit('ride:completed', { bookingId: id });
        alert('Trip Completed!');
        navigate('/driver/dashboard');
      }
    } catch (e) {
      alert('Failed to complete trip');
    }
  };

  if (loading) return <div style={{padding: '40px', fontWeight: '600'}}>Loading ride details...</div>;
  if (!ride) return <div style={{padding: '40px', fontWeight: '600'}}>Ride not found</div>;

  const renderActionButton = () => {
    if (status === 'accepted') {
      return (
        <button className={styles.btnPrimaryLarge} onClick={handleArrive}>
          I Have Arrived
        </button>
      );
    }
    if (status === 'arrived') {
      return (
        <form onSubmit={handleStartTrip} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 8px', fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>Enter 4-digit OTP from customer</p>
            <input 
              type="text" 
              maxLength={4}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              style={{ width: '100%', padding: '16px', fontSize: '24px', fontWeight: '700', textAlign: 'center', letterSpacing: '12px', background: '#F9FAFB', border: '1px solid var(--border-light)', borderRadius: '12px', color: 'var(--forge-blue)' }}
            />
          </div>
          <button type="submit" className={styles.btnPrimaryLarge} style={{ background: '#10B981' }}>
            Start Trip
          </button>
        </form>
      );
    }
    if (status === 'in_progress') {
      return (
        <button className={styles.btnPrimaryLarge} onClick={handleCompleteTrip}>
          Complete Trip
        </button>
      );
    }
    return null;
  };

  const getStatusText = () => {
    switch(status) {
      case 'accepted': return 'Navigating to Pickup';
      case 'arrived': return 'Waiting for Customer';
      case 'in_progress': return 'On Trip';
      default: return 'Trip Status';
    }
  };

  const getNavigationText = () => {
    if (status === 'arrived') return 'You have arrived at the pickup location';
    
    if (osrmData?.legs?.[0]?.steps) {
      const steps = osrmData.legs[0].steps;
      if (steps.length > 1) {
        const currentSegment = steps[0];
        const nextManeuver = steps[1];
        const modifier = nextManeuver.maneuver?.modifier || nextManeuver.maneuver?.type || '';
        const name = nextManeuver.name || 'the road';
        const distance = Math.round(currentSegment.distance);
        
        if (distance > 1000) {
          return `Continue straight for ${(distance/1000).toFixed(1)} km`;
        } else if (modifier) {
          return `In ${distance}m, turn ${modifier.replace('-', ' ')} onto ${name}`;
        }
      }
    }

    if (status === 'accepted') return 'Navigating to pickup location...';
    if (status === 'in_progress') return 'Navigating to drop-off location...';
    return 'Navigation instructions will appear here';
  };

  const distanceText = osrmData ? `${(osrmData.distance / 1000).toFixed(1)} km` : '...';
  const durationText = osrmData ? `${Math.ceil(osrmData.duration / 60)} mins` : '...';
  
  const durationSec = osrmData?.duration;
  const etaText = durationSec 
    ? new Date(Date.now() + durationSec * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '...';

  return (
    <div className={styles.container}>
      
      <div className={styles.mainLayout}>
        {/* Left Panel: Trip Details */}
        <div className={styles.card}>
          <div className={styles.statusHeader}>
            <div className={`${styles.statusBadge} ${status === 'in_progress' ? styles.statusActive : styles.statusWaiting}`}>
              <div style={{width: 8, height: 8, borderRadius: '50%', background: 'currentColor'}}></div>
              {getStatusText()}
            </div>
            <div className={styles.etaBlock}>
              <h3>{durationText}</h3>
              <p>to destination</p>
            </div>
          </div>

          <div className={styles.customerCard}>
            <div className={styles.customerInfo}>
              <div className={styles.customerAvatar}>
                <User size={24} />
              </div>
              <div className={styles.customerDetails}>
                <h4>{ride.customer?.name || 'Customer Name'}</h4>
                <div className={styles.customerRating}>
                  <Star size={12} fill="#F59E0B" color="#F59E0B" /> 4.9
                </div>
              </div>
            </div>
            <div className={styles.customerActions}>
              <button className={styles.btnCircle}><PhoneCall size={18} /></button>
              <button className={styles.btnCircle}><MessageSquare size={18} /></button>
            </div>
          </div>

          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <div className={`${styles.timelineIcon} ${styles.iconPickup}`}><MapPin size={14} strokeWidth={3} /></div>
              <div className={styles.timelineContent}>
                <h4>Pickup</h4>
                <p>{ride.pickup.address}</p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <div className={`${styles.timelineIcon} ${styles.iconDropoff}`}><Target size={14} strokeWidth={3} /></div>
              <div className={styles.timelineContent}>
                <h4>Drop-off</h4>
                <p>{ride.drop.address}</p>
              </div>
            </div>
          </div>

          <div className={styles.tripMetaGrid} style={{ gridTemplateColumns: '1fr' }}>
            <div className={styles.metaItem}>
              <span>Vehicle / Ride</span>
              <strong>{ride.vehicleType || 'Sedan'}</strong>
            </div>
          </div>

          <div className={styles.actionGroup}>
            {renderActionButton()}
            <button className={styles.btnSecondaryAction}>
              <AlertTriangle size={16} /> Report an Issue
            </button>
          </div>
        </div>

        {/* Right Panel: Map */}
        <div className={styles.mapContainer}>
          <div className={styles.mapNavOverlay}>
            <div className={styles.navIcon}><Navigation size={18} /></div>
            <span className={styles.navText}>{getNavigationText()}</span>
          </div>

          <MapContainer
            center={[currentLocation?.lat || 13.0827, currentLocation?.lng || 80.2707]}
            zoom={15}
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
              subdomains="abcd"
              maxZoom={19}
            />
            {osrmRoute.length > 0 && (
              <Polyline
                positions={osrmRoute.map(p => [p.lat, p.lng])}
                pathOptions={{ color: '#2563EB', weight: 6, opacity: 0.9 }}
              />
            )}
            {currentLocation && (
              <Marker
                position={[currentLocation.lat, currentLocation.lng]}
                icon={L.divIcon({
                  className: 'driver-loc-marker',
                  html: `<div style="width: 18px; height: 18px; border-radius: 50%; background-color: #2563EB; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>`,
                  iconSize: [18, 18],
                  iconAnchor: [9, 9]
                })}
              />
            )}
          </MapContainer>
        </div>
      </div>

      {/* Bottom Row: Trip Statistics */}
      <div className={styles.bottomStatsRow}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.time}`}><Clock size={24} /></div>
          <div className={styles.statContent}>
            <h4>Trip Time</h4>
            <p>{durationText}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.dist}`}><Navigation size={24} /></div>
          <div className={styles.statContent}>
            <h4>Remaining</h4>
            <p>{distanceText}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.eta}`}><MapPin size={24} /></div>
          <div className={styles.statContent}>
            <h4>Arrival</h4>
            <p>{etaText}</p>
          </div>
        </div>

        <div className={styles.performanceCard}>
          <div className={styles.perfText}>
            <h4>Great Job!</h4>
            <p>Your rating is excellent</p>
          </div>
          <div className={styles.perfScore}>
            <Star size={16} fill="#FBB040" color="#FBB040" /> 4.9
          </div>
        </div>
      </div>

    </div>
  );
};

export default DriverActiveRide;
