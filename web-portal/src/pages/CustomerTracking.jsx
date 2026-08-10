import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, MessageSquare, ShieldCheck, CheckCircle2, Navigation } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';
import styles from './CustomerBooking.module.css'; // Reusing styles
import API from '../services/api';
import { SocketContext } from '../context/SocketContext';

const center = { lat: 13.0827, lng: 80.2707 }; // Chennai
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

const CustomerTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const [ride, setRide] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [status, setStatus] = useState('searching');
  const [loading, setLoading] = useState(true);
  const [decodedRoute, setDecodedRoute] = useState([]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const mapRef = useRef(null);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await API.get(`/bookings/${id}`);
        if (res.data.success) {
          const bookingData = res.data.data;
          setRide(bookingData);
          setStatus(bookingData.status);
          if (bookingData.driver) {
            setDriverInfo(bookingData.driver);
          }
          if (bookingData.route && bookingData.route.polyline) {
            setDecodedRoute(decodePolyline(bookingData.route.polyline));
          }
        }
      } catch (err) {
        console.error('Failed to fetch ride', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, [id]);

  useEffect(() => {
    if (!socket || !ride) return;

    socket.emit('tracking:join', { bookingId: ride._id });

    const handleStatusUpdate = (data) => {
      setStatus(data.status);
    };

    const handleRideAccepted = (data) => {
      if (data.driverInfo) setDriverInfo(data.driverInfo);
      if (data.booking) {
        setRide(data.booking);
      }
      setStatus('accepted');
    };

    const handleRideStarted = () => {
      setStatus('in_progress');
    };

    const handleRideCompleted = () => {
      setStatus('completed');
    };

    const handleDriverLocation = (data) => {
      if (data.location) {
        setDriverInfo(prev => prev ? {
          ...prev, 
          currentLocation: {
            type: 'Point',
            coordinates: [data.location.lng, data.location.lat]
          }
        } : prev);
      }
    };

    socket.on('booking:status', handleStatusUpdate);
    socket.on('ride:accepted', handleRideAccepted);
    socket.on('ride:started', handleRideStarted);
    socket.on('ride:completed', handleRideCompleted);
    socket.on('driver:location', handleDriverLocation);

    return () => {
      socket.off('booking:status', handleStatusUpdate);
      socket.off('ride:accepted', handleRideAccepted);
      socket.off('ride:started', handleRideStarted);
      socket.off('ride:completed', handleRideCompleted);
      socket.off('driver:location', handleDriverLocation);
    };
  }, [socket, ride]);

  // Adjust map bounds when route is loaded
  useEffect(() => {
    if (mapRef.current && decodedRoute.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      decodedRoute.forEach(coord => {
        bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
      });
      mapRef.current.fitBounds(bounds, { padding: 50 });
    }
  }, [decodedRoute, isLoaded]);

  if (loading) return <div>Loading...</div>;

  const driverLat = driverInfo?.currentLocation?.coordinates?.[1];
  const driverLng = driverInfo?.currentLocation?.coordinates?.[0];

  return (
    <div className={styles.bookingWrapper}>
      <div className={styles.sidebarPanel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.title} style={{ fontSize: '24px' }}>
            {status === 'searching' && 'Finding your driver...'}
            {status === 'accepted' && 'Driver is on the way'}
            {status === 'arrived' && 'Driver has arrived'}
            {status === 'in_progress' && 'Trip in progress'}
            {status === 'completed' && 'Trip completed'}
          </h3>
        </div>

        <div className={styles.bookingStateCard}>
          {status === 'searching' ? (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div className={styles.spinner} style={{ margin: '0 auto 20px', width: '40px', height: '40px' }}></div>
              <p>Connecting you to nearby drivers...</p>
            </div>
          ) : (
            <>
              {driverInfo && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--bg-soft-blue)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'var(--forge-blue)', fontWeight: 'bold' }}>
                    {driverInfo.name ? driverInfo.name[0] : 'D'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>{driverInfo.name || 'Your Driver'}</h4>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>4.9 ★ • {driverInfo.vehicle?.make || 'Car'}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{driverInfo.vehicle?.plateNumber || 'XYZ-123'}</div>
                  </div>
                </div>
              )}

              {(status === 'accepted' || status === 'arrived') && (
                <div style={{ backgroundColor: 'var(--bg-soft-blue)', padding: '24px', borderRadius: 'var(--radius-xl)', textAlign: 'center', marginBottom: '24px', border: '1px solid var(--forge-blue)' }}>
                  <p style={{ margin: '0 0 12px', color: 'var(--forge-blue)', fontWeight: 600 }}>Provide this OTP to your driver</p>
                  <div style={{ fontSize: '32px', letterSpacing: '8px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{ride?.rideOTP || '----'}</div>
                </div>
              )}

              <div className={styles.locationsSummary} style={{ marginBottom: '24px' }}>
                <div className={styles.locItem}>
                  <div className={styles.locDot}></div>
                  <div>
                    <span className={styles.locLabel}>Pickup</span>
                    <span className={styles.locValue}>{ride?.pickup?.address}</span>
                  </div>
                </div>
                <div className={styles.locLine} style={{ top: '24px', bottom: '30px' }}></div>
                <div className={styles.locItem}>
                  <div className={styles.locDotDrop}></div>
                  <div>
                    <span className={styles.locLabel}>Drop-off</span>
                    <span className={styles.locValue}>{ride?.drop?.address}</span>
                  </div>
                </div>
              </div>

              {status === 'completed' && (
                <button 
                  className={styles.btnPrimary} 
                  onClick={() => navigate('/customer/dashboard')}
                >
                  Done
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className={styles.mapContainer}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={center}
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
            {decodedRoute.length > 0 && (
              <Polyline
                path={decodedRoute}
                options={{
                  strokeColor: '#0053B3',
                  strokeOpacity: 0.8,
                  strokeWeight: 6,
                  zIndex: 2
                }}
              />
            )}

            {ride?.pickup?.location?.coordinates && (
              <Marker
                position={{ lat: ride.pickup.location.coordinates[1], lng: ride.pickup.location.coordinates[0] }}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '#0053B3',
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: '#FFFFFF',
                }}
                title="Pickup Point"
                zIndex={5}
              />
            )}
            
            {ride?.drop?.location?.coordinates && (
              <Marker
                position={{ lat: ride.drop.location.coordinates[1], lng: ride.drop.location.coordinates[0] }}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '#EF4444',
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: '#FFFFFF',
                }}
                title="Drop-off Point"
                zIndex={5}
              />
            )}

            {driverLat && driverLng && (
              <Marker
                position={{ lat: driverLat, lng: driverLng }}
                icon={{
                  url: 'https://cdn-icons-png.flaticon.com/512/3204/3204966.png', // Fallback to a car-like icon or anchor. Ideally use a clean car icon.
                  scaledSize: new window.google.maps.Size(32, 32),
                  origin: new window.google.maps.Point(0, 0),
                  anchor: new window.google.maps.Point(16, 16)
                }}
                title="Driver Location"
                zIndex={10}
              />
            )}
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

export default CustomerTracking;
