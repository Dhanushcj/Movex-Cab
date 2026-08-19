import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bell, MapPin, ShieldCheck, CheckCircle2, Car, Share2, Star, Navigation, MessageSquare, Phone, User } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import styles from './CustomerBooking.module.css'; // Reusing styles
import API from '../services/api';
import { SocketContext } from '../context/SocketContext';

const center = [13.0827, 80.2707]; // Chennai

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

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const availableTags = ['Punctual Driver', 'Clean Vehicle', 'Smooth Ride', 'Polite Service', 'Safe Driving'];

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleReviewSubmit = async () => {
    try {
      setSubmittingReview(true);
      const combinedReview = reviewText + (selectedTags.length > 0 ? ` [Tags: ${selectedTags.join(', ')}]` : '');
      const res = await API.post(`/bookings/${id}/rate`, {
        rating,
        review: combinedReview
      });
      if (res.data.success) {
        setReviewSubmitted(true);
      }
    } catch (err) {
      console.error('Failed to submit review', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const mapRef = useRef(null);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await API.get(`/bookings/${id}`);
        if (res.data.success) {
          const bookingData = res.data.data;
          setRide(bookingData);
          setStatus(bookingData.status);
          if (bookingData.customerRating || bookingData.customerReview) {
            setReviewSubmitted(true);
            if (bookingData.customerRating) setRating(bookingData.customerRating);
            if (bookingData.customerReview) setReviewText(bookingData.customerReview);
          }
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
    if (mapRef.current && decodedRoute.length > 0 && osrmDriverRoute.length === 0 && window.google?.maps) {
      try {
        const bounds = new window.google.maps.LatLngBounds();
        decodedRoute.forEach(coord => {
          bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
        });
        mapRef.current.fitBounds(bounds, { padding: 50 });
      } catch (e) {}
    }
  }, [decodedRoute, osrmDriverRoute]);

  
  useEffect(() => {
    if (status === 'accepted' || status === 'arrived') {
      const intervalId = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [status]);

  useEffect(() => {
    if (!ride) return;
    
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
  }, [ride, status]); // Removed driverInfo to prevent constant map flickering/re-routing on every location update

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

                {/* Review & Rating Card for Completed Ride */}
                {status === 'completed' && (
                  <div className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <h3>Rate Your Trip</h3>
                      <p>How was your ride experience with {driverInfo?.name || 'your driver'}?</p>
                    </div>

                    <div className={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = (hoverRating || rating) >= star;
                        return (
                          <button
                            key={star}
                            className={styles.starBtn}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            type="button"
                          >
                            <Star
                              size={32}
                              fill={active ? "#FBBF24" : "none"}
                              color={active ? "#FBBF24" : "#CBD5E1"}
                            />
                          </button>
                        );
                      })}
                    </div>

                    {!reviewSubmitted ? (
                      <>
                        <div className={styles.tagsRow}>
                          {availableTags.map(tag => {
                            const isSelected = selectedTags.includes(tag);
                            return (
                              <button
                                key={tag}
                                type="button"
                                className={isSelected ? styles.tagChipSelected : styles.tagChip}
                                onClick={() => toggleTag(tag)}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>

                        <textarea
                          className={styles.reviewInput}
                          placeholder="Write your review or feedback for the admin and driver..."
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                        />

                        <button
                          className={styles.btnPrimary}
                          onClick={handleReviewSubmit}
                          disabled={submittingReview}
                          style={{ width: '100%', marginBottom: '12px' }}
                        >
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </>
                    ) : (
                      <div className={styles.reviewSubmittedBadge}>
                        <CheckCircle2 size={18} style={{ display: 'inline', marginRight: '6px' }} />
                        Review saved! Thank you for your feedback.
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Actions */}
                <div className={styles.trackingActionFooter}>
                  {status === 'completed' ? (
                    <button 
                      className={styles.btnPrimary} 
                      onClick={() => navigate('/customer/dashboard')}
                    >
                      Done & Return to Dashboard
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

          <MapContainer
            center={center}
            zoom={12}
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
              subdomains="abcd"
              maxZoom={19}
            />
            {decodedRoute.length > 0 && osrmDriverRoute.length === 0 && (
              <Polyline
                positions={decodedRoute.map(p => [p.lat, p.lng])}
                pathOptions={{ color: '#FBBF24', opacity: 0.8, weight: 6 }}
              />
            )}

            {osrmDriverRoute.length > 0 && (
              <Polyline
                positions={osrmDriverRoute.map(p => [p.lat, p.lng])}
                pathOptions={{ color: '#3B82F6', opacity: 0.9, weight: 6 }}
              />
            )}

            {ride?.pickup?.location?.coordinates && (
              <Marker
                position={[ride.pickup.location.coordinates[1], ride.pickup.location.coordinates[0]]}
                icon={L.divIcon({
                  className: 'pickup-marker',
                  html: `<div style="width: 20px; height: 20px; border-radius: 50%; background: #10B981; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>`,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10]
                })}
              />
            )}
            
            {ride?.drop?.location?.coordinates && (
              <Marker
                position={[ride.drop.location.coordinates[1], ride.drop.location.coordinates[0]]}
                icon={L.divIcon({
                  className: 'drop-marker',
                  html: `<div style="width: 20px; height: 20px; border-radius: 50%; background: #EF4444; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>`,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10]
                })}
              />
            )}

            {driverLat && driverLng && (
              <Marker
                position={[driverLat, driverLng]}
                icon={L.divIcon({
                  className: 'driver-marker',
                  html: `<div style="font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));">🚗</div>`,
                  iconSize: [32, 32],
                  iconAnchor: [16, 16]
                })}
              />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default CustomerTracking;
