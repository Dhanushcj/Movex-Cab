import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bell, MapPin, ShieldCheck, CheckCircle2, Car, Share2, Star, Navigation, MessageSquare, Phone, User } from 'lucide-react';
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
  const [osrmDriverRoute, setOsrmDriverRoute] = useState([]);
  const [timer, setTimer] = useState(300);


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
    if (mapRef.current && decodedRoute.length > 0 && osrmDriverRoute.length === 0) {
      const bounds = new window.google.maps.LatLngBounds();
      decodedRoute.forEach(coord => {
        bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
      });
      mapRef.current.fitBounds(bounds, { padding: 50 });
    }
  }, [decodedRoute, isLoaded, osrmDriverRoute]);

  
  useEffect(() => {
    if (status === 'accepted' || status === 'arrived') {
      const intervalId = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [status]);

  useEffect(() => {
    if (!ride || !isLoaded) return;
    
    let origin, destination;
    
    if (status === 'accepted' || status === 'arrived') {
      // Driver navigating to pickup
      origin = driverInfo?.currentLocation?.coordinates?.length >= 2
        ? { lat: driverInfo.currentLocation.coordinates[1], lng: driverInfo.currentLocation.coordinates[0] } 
        : (ride.pickup?.location?.coordinates?.length >= 2 ? { lat: ride.pickup.location.coordinates[1] - 0.005, lng: ride.pickup.location.coordinates[0] } : null); // Fallback to near pickup
      if (ride.pickup?.location?.coordinates?.length >= 2) {
        destination = { lat: ride.pickup.location.coordinates[1], lng: ride.pickup.location.coordinates[0] };
      }
    } else if (status === 'in_progress' || status === 'completed') {
      // Keep the predefined yellow route during the trip!
      setOsrmDriverRoute([]);
      return;
    }
    
    if (origin && destination && (origin.lat !== destination.lat || origin.lng !== destination.lng)) {
      const fetchOsrm = async () => {
        try {
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=polyline&steps=false`);
          const data = await res.json();
          if (data.code === 'Ok' && data.routes.length > 0) {
            setOsrmDriverRoute(decodePolyline(data.routes[0].geometry));
          }
        } catch (err) {
          console.warn('OSRM request failed:', err);
        }
      };
      fetchOsrm();
    }
  }, [ride, isLoaded, status]); // Removed driverInfo to prevent constant map flickering/re-routing on every location update

  if (loading) return <div>Loading...</div>;

  const driverLat = driverInfo?.currentLocation?.coordinates?.[1];
  const driverLng = driverInfo?.currentLocation?.coordinates?.[0];

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.bookingSplitWrapper}>
        {/* LEFT SIDEBAR PANEL */}
        <div className={styles.sidebarPanel}>
          <div className={styles.topHeader}>
            <div className={styles.headerLeft}>
              <h1 className={styles.title}>
                {status === 'searching' && 'Finding your driver...'}
                {status === 'accepted' && 'Driver is on the way'}
                {status === 'arrived' && 'Driver has arrived'}
                {status === 'in_progress' && 'Trip in progress'}
                {status === 'completed' && 'Trip completed'}
              </h1>
              <p className={styles.subtitle}>
                {status === 'searching' && 'Please wait while we match your ride.'}
                {status === 'accepted' && 'Your driver will arrive shortly.'}
                {status === 'arrived' && 'Meet your driver at the pickup location.'}
                {status === 'in_progress' && 'Sit back and enjoy your ride.'}
                {status === 'completed' && 'Thank you for riding with Forge India Connect.'}
              </p>
            </div>
            <div className={styles.headerRight}>
              <button className={styles.iconBtn}><Bell size={20} /></button>
              <button className={styles.iconBtn}><User size={20} /></button>
            </div>
          </div>

          <div className={styles.sidebarContent} style={{ paddingTop: '24px' }}>
            
            {status === 'searching' ? (
              <div className={styles.searchingOverlay}>
                <div className={styles.spinner}></div>
                <h3>Connecting to nearby drivers...</h3>
                <p>Please wait while we match your ride.</p>
              </div>
            ) : (
              <>
                {/* Driver Profile Card */}
                {driverInfo && (
                  <div className={styles.driverProfileCard}>
                    <div className={styles.driverHeaderRow}>
                      <div className={styles.driverAvatar}>
                        {driverInfo.name ? driverInfo.name[0] : 'D'}
                      </div>
                      <div className={styles.driverMeta}>
                        <h4>{driverInfo.name || 'Your Driver'}</h4>
                        <div className={styles.ratingBadge}>
                          <Star size={12} fill="#FBBF24" color="#FBBF24" /> 4.9
                        </div>
                      </div>
                      <div className={styles.vehicleInfo}>
                        <div className={styles.vehiclePlate}>{driverInfo.vehicle?.plateNumber || 'TN24 AU 6666'}</div>
                        <div className={styles.vehicleMake}>{driverInfo.vehicle?.make || 'Toyota Etios'}</div>
                      </div>
                    </div>
                    
                    <div className={styles.driverActionGrid}>
                      <button className={styles.driverActionBtn}>
                        <Phone size={18} />
                        Call
                      </button>
                      <button className={styles.driverActionBtn}>
                        <MessageSquare size={18} />
                        Chat
                      </button>
                    </div>
                  </div>
                )}

                {/* OTP Verification Card */}
                {(status === 'accepted' || status === 'arrived') && (
                  <div className={styles.otpCard}>
                    <div className={styles.otpHeader}>
                      <ShieldCheck size={20} color="#10B981" />
                      <span>Provide this OTP to start your ride</span>
                    </div>
                    <div className={styles.otpValue}>
                      {ride?.rideOTP || '----'}
                    </div>
                    <div className={styles.otpTimer}>
                      Code valid for <span>{formatTime(timer)}</span>
                    </div>
                  </div>
                )}

                {/* Ride Route Summary */}
                <div className={styles.bookingStateCard} style={{ marginTop: '24px' }}>
                  <div className={styles.locationsSummary}>
                    <div className={styles.locInputWrapper}>
                      <div className={styles.locDotWrapper}>
                        <div className={styles.locDot}></div>
                        <div className={styles.locLine}></div>
                      </div>
                      <div className={styles.inputArea}>
                        <span className={styles.locLabel}>Pickup Location</span>
                        <div className={styles.inputField}>
                          <span className={styles.locValueMain}>{ride?.pickup?.address?.split(',')[0] || "Pickup Point"}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.locInputWrapper}>
                      <div className={styles.locDotWrapper}>
                        <div className={styles.locDotDrop}></div>
                      </div>
                      <div className={styles.inputArea}>
                        <span className={styles.locLabel}>Drop Location</span>
                        <div className={styles.inputField}>
                          <span className={styles.locValueMain}>{ride?.drop?.address?.split(',')[0] || "Drop Point"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className={styles.trackingActionFooter}>
                  {status === 'completed' ? (
                    <button 
                      className={styles.btnPrimary} 
                      onClick={() => navigate('/customer/dashboard')}
                    >
                      Done
                    </button>
                  ) : (
                    <div className={styles.actionBtnRow}>
                      <button className={styles.btnSecondaryFlex}>
                        <Share2 size={16} /> Share Trip
                      </button>
                      <button className={styles.btnSosFlex}>
                        SOS
                      </button>
                      {(status === 'searching' || status === 'accepted') && (
                        <button 
                          className={styles.btnCancelFlex}
                          onClick={async () => {
                            if (window.confirm("Are you sure you want to cancel this ride?")) {
                              try {
                                const res = await API.put(`/bookings/${ride._id}/cancel`, { reason: 'User requested cancellation' });
                                if (res.data.success) {
                                  navigate('/customer/history');
                                }
                              } catch (err) {
                                alert(err.response?.data?.message || 'Failed to cancel ride');
                              }
                            }
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT MAP PANEL */}
        <div className={styles.mapContainer}>
          <div className={styles.mapTopOverlay}>
            <div className={styles.overlayRouteText}>
              <strong>{ride?.pickup?.address?.split(',')[0] || 'Pickup'}</strong> <span>→</span> <strong>{ride?.drop?.address?.split(',')[0] || 'Drop'}</strong>
            </div>
            {status === 'accepted' && (
              <div className={styles.overlayRouteMeta} style={{ color: '#059669', fontWeight: '700' }}>
                 Driver arriving in 3 min
              </div>
            )}
          </div>

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
              {decodedRoute.length > 0 && osrmDriverRoute.length === 0 && (
                <Polyline
                  path={decodedRoute}
                  options={{
                    strokeColor: '#FBBF24',
                    strokeOpacity: 0.8,
                    strokeWeight: 6,
                    zIndex: 2
                  }}
                />
              )}

              {osrmDriverRoute.length > 0 && (
                <Polyline
                  path={osrmDriverRoute}
                  options={{
                    strokeColor: '#FBBF24',
                    strokeOpacity: 0.8,
                    strokeWeight: 6,
                    zIndex: 2
                  }}
                />
              )}

              {ride?.pickup?.location?.coordinates && (
                <Marker
                  position={{ lat: ride.pickup.location.coordinates[1], lng: ride.pickup.location.coordinates[0] }}
                  icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' }}
                  title="Pickup Point"
                  zIndex={5}
                />
              )}
              
              {ride?.drop?.location?.coordinates && (
                <Marker
                  position={{ lat: ride.drop.location.coordinates[1], lng: ride.drop.location.coordinates[0] }}
                  icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' }}
                  title="Drop-off Point"
                  zIndex={5}
                />
              )}

              {driverLat && driverLng && (
                <Marker
                  position={{ lat: driverLat, lng: driverLng }}
                  icon={{
                    url: '/car-map.png',
                    scaledSize: new window.google.maps.Size(40, 40),
                    origin: new window.google.maps.Point(0, 0),
                    anchor: new window.google.maps.Point(20, 20)
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
    </div>
  );
};

export default CustomerTracking;
