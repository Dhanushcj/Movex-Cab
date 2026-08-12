import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LocateFixed, Check, Bell, Users, ArrowUpDown, Info, User, Search, MapPin, ChevronRight, Ticket, Navigation, CheckCircle2 } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';
import BikeIcon from '../components/BikeIcon';
import AutoRickshawIcon from '../components/AutoRickshawIcon';
import CarIcon from '../components/CarIcon';
import BusIcon from '../components/BusIcon';
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
    { id: 'bike', name: 'Forge Bike', capacity: 1, time: '2 min', baseFare: 45, icon: BikeIcon, type: 'bike' },
    { id: 'auto', name: 'Forge Auto', capacity: 3, time: '3 min', baseFare: 65, icon: AutoRickshawIcon, type: 'auto' },
    { id: 'mini', name: 'Forge Mini', capacity: 3, time: '4 min', baseFare: 120, icon: CarIcon, type: 'car' },
    { id: 'bus', name: 'Forge Bus', capacity: 40, time: '6 min', baseFare: 180, icon: BusIcon, type: 'bus' },
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
  const [activePass, setActivePass] = useState(null);

  // Pass Verification Effect
  useEffect(() => {
    const fetchMyPass = async () => {
      try {
        const res = await API.get('/subscriptions/my-pass');
        if (!res.data.success || !res.data.data) {
          alert("You must have an active pass to book a ride.");
          navigate('/customer/passes');
        } else {
          setActivePass(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch pass', err);
        alert("You must have an active pass to book a ride.");
        navigate('/customer/passes');
      }
    };
    fetchMyPass();
  }, [navigate]);

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

  const handleMarkerDrag = async (e, isPickup) => {
    if (!selectedRoute) return;
    const clickCoord = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    const lineCoords = selectedRoute.decodedPolyline;
    const snappedCoord = getClosestPointOnLine(clickCoord, lineCoords);
    const locationName = await reverseGeocode(snappedCoord.lat, snappedCoord.lng);
    const customJunction = {
      _id: `temp-${Date.now()}`,
      name: locationName,
      location: { coordinates: [snappedCoord.lng, snappedCoord.lat] }
    };
    if (isPickup) {
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

  const renderStepIndicator = () => (
    <div className={styles.stepIndicator}>
      <div className={`${styles.stepItem} ${styles.active}`}>
        <div className={styles.stepCircle}>1</div>
        <span>Route</span>
      </div>
      <div className={`${styles.stepLine} ${pickupLocation && dropLocation ? styles.activeLine : ''}`}></div>
      <div className={`${styles.stepItem} ${pickupLocation && dropLocation ? styles.active : ''}`}>
        <div className={styles.stepCircle}>2</div>
        <span>Vehicle</span>
      </div>
      <div className={`${styles.stepLine} ${selectedVehicle && pickupLocation && dropLocation ? styles.activeLine : ''}`}></div>
      <div className={`${styles.stepItem} ${selectedVehicle && pickupLocation && dropLocation ? styles.active : ''}`}>
        <div className={styles.stepCircle}>3</div>
        <span>Confirm</span>
      </div>
    </div>
  );

  let distInfo = { dist: "0.0", time: 0 };
  if (pickupLocation && dropLocation && window.google && window.google.maps.geometry) {
    try {
      const p1 = new window.google.maps.LatLng(pickupLocation.location.coordinates[1], pickupLocation.location.coordinates[0]);
      const p2 = new window.google.maps.LatLng(dropLocation.location.coordinates[1], dropLocation.location.coordinates[0]);
      const distInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
      distInfo = {
        dist: (distInMeters / 1000).toFixed(1),
        time: Math.round((distInMeters / 1000) * 1.5) || 1
      };
    } catch(e) {}
  }

  if (!activePass) {
    return <div style={{padding: 40, textAlign: 'center', marginTop: 100, fontSize: 20}}>Checking pass status...</div>;
  }

  return (
    <div className={styles.pageWrapper}>
      {/* GLOBAL TOP HEADER - Removed from here because the global layout already has it! */}
      {/* Wait, the global layout in the screenshot HAS the top header, but it lacks the secondary title "Book a Ride - Choose your route..." and the notification icon styles. */}
      {/* Looking at the screenshot, the global layout top nav ONLY has "Book a Ride" on the left, and "DC Dhanush Chakravarthy" on the right. */}
      {/* Our specific "Book a Ride - Choose your route" is inside the content area. */}
      {/* Let's wrap our main content in a container that pushes the new header to the top of our content area. */}

      <div className={styles.bookingSplitWrapper}>
        {/* LEFT SIDEBAR PANEL */}
        <div className={styles.sidebarPanel}>
          <div className={styles.topHeader}>
            <div className={styles.headerLeft}>
              <h1 className={styles.title}>Book a Ride</h1>
              <p className={styles.subtitle}>Choose your route and ride type</p>
            </div>
            <div className={styles.headerRight}>
              <button className={styles.iconBtn}><Bell size={20} /></button>
              <button className={styles.iconBtn}><User size={20} /></button>
            </div>
          </div>
          {renderStepIndicator()}

          <div className={styles.sidebarContent}>
            
            <h3 className={styles.sectionTitleMain}>Where are you going?</h3>
            <div className={styles.bookingStateCard}>
              <div className={styles.locationsSummary}>
                
                <div className={styles.locInputWrapper}>
                  <div className={styles.locDotWrapper}>
                    <div className={styles.locDot}></div>
                    <div className={styles.locLine}></div>
                  </div>
                  <div className={styles.inputArea}>
                    <span className={styles.locLabel}>Pickup Location</span>
                    <div className={styles.inputField}>
                      <span className={styles.locValueMain}>{pickupLocation ? pickupLocation.name.split(',')[0] : "Select from map or search..."}</span>
                      <button className={styles.useCurrentBtn}>
                        <LocateFixed size={14} /> Use current location
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.swapBtnWrapper}>
                  <button className={styles.swapBtn}><ArrowUpDown size={14} color="#64748b" /></button>
                </div>

                <div className={styles.locInputWrapper}>
                  <div className={styles.locDotWrapper}>
                    <div className={styles.locDotDrop}></div>
                  </div>
                  <div className={styles.inputArea}>
                    <span className={styles.locLabel}>Drop Location</span>
                    <div className={styles.inputField}>
                      <span className={styles.locValueMain}>{dropLocation ? dropLocation.name.split(',')[0] : "Select from map or search..."}</span>
                      <Search size={18} color="#94a3b8" />
                    </div>
                  </div>
                </div>

              </div>
              
              {pickupLocation && dropLocation && (
                <div className={styles.routeDistanceInfo}>
                  <div className={styles.routePathText}>
                    <MapPin size={14} color="var(--forge-blue)" /> {pickupLocation.name.split(',')[0]} → {dropLocation.name.split(',')[0]}
                  </div>
                  <span className={styles.routeMeta}>Distance {distInfo.dist} km <span className={styles.bullet}>•</span> Est. time {distInfo.time} min</span>
                </div>
              )}
            </div>

            {pickupLocation && dropLocation && activePass && (
              <>
                <div className={styles.passCard}>
                  <div className={styles.passLeft}>
                    <div className={styles.passIcon}><Ticket size={24} color="var(--forge-blue)" /></div>
                    <div className={styles.passInfo}>
                      <h4>{activePass.pass?.name || 'Mobility Pass'} Applied</h4>
                      <p><span className={styles.strikeThru}>₹180.00</span> fare waived on this route</p>
                    </div>
                  </div>
                  <div className={styles.passRight}>
                    <div className={styles.passStatus}>ACTIVE</div>
                    <a href="/customer/passes" className={styles.viewPassLink}>View Pass →</a>
                  </div>
                </div>

                <div className={styles.vehicleSelection}>
                  <h3 className={styles.sectionTitleMain}>Choose a ride</h3>
                  <div className={styles.vehicleGrid}>
                    {vehicles.map(v => {
                      const Icon = v.icon;
                      const isSelected = selectedVehicle === v.id;
                      return (
                        <div 
                          key={v.id} 
                          className={`${styles.vehicleCard} ${isSelected ? styles.selected : ''}`}
                          onClick={() => setSelectedVehicle(v.id)}
                        >
                          {isSelected && <div className={styles.checkIcon}><Check size={12} /></div>}
                          <div className={styles.vehicleImage}>
                            <Icon size={32} color={isSelected ? "#1e293b" : "#64748b"} />
                          </div>
                          <div className={styles.vehicleInfo}>
                            <h4>{v.name}</h4>
                            <p className={styles.etaText}>{v.time} away</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className={styles.actionFooter}>
                  <button 
                    className={styles.btnPrimary}
                    onClick={handleConfirmBooking}
                    disabled={loading || bookingStatus}
                  >
                    {bookingStatus === 'searching' ? 'Finding Driver...' : bookingStatus === 'booked' ? 'Ride Booked!' : 'Continue to Confirm →'}
                  </button>
                </div>
              </>
            )}
          </div>

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

        {/* RIGHT MAP PANEL */}
        <div className={styles.mapContainer}>
          {pickupLocation && dropLocation && (
            <>
              <div className={styles.mapTopOverlay}>
                <div className={styles.overlayRouteText}>
                  <strong>{pickupLocation.name.split(',')[0]}</strong> <span>→</span> <strong>{dropLocation.name.split(',')[0]}</strong>
                </div>
                <div className={styles.overlayRouteMeta}>
                   <div className={styles.metaIcon}><MapPin size={12}/></div> {distInfo.dist} km &nbsp;&nbsp; <div className={styles.metaIcon}>⏳</div> {distInfo.time} min
                </div>
              </div>
              <div className={styles.mapBottomOverlay}>
                <div className={styles.nearbyTitle}>3 vehicles nearby</div>
                <div className={styles.nearbyGrid}>
                  <div className={styles.nearbyItem}><span className={styles.nIcon}>🏍</span> 2 min</div>
                  <div className={styles.nearbyItem}><span className={styles.nIcon}>🛺</span> 3 min</div>
                  <div className={styles.nearbyItem}><span className={styles.nIcon}>🚗</span> 4 min</div>
                </div>
              </div>
            </>
          )}

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
                
                if (!route.decodedPolyline || route.decodedPolyline.length === 0) return null;

                return (
                  <Polyline
                    key={route._id}
                    path={route.decodedPolyline}
                    options={{
                      strokeColor: '#FBBF24',
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
                  draggable={true}
                  onDragEnd={(e) => handleMarkerDrag(e, true)}
                  icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' }}
                  title="Pickup Point (Drag to move)"
                />
              )}
              
              {/* Custom Drop Marker */}
              {dropLocation && (
                <Marker
                  position={{ lat: dropLocation.location.coordinates[1], lng: dropLocation.location.coordinates[0] }}
                  draggable={true}
                  onDragEnd={(e) => handleMarkerDrag(e, false)}
                  icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' }}
                  title="Drop-off Point (Drag to move)"
                />
              )}
              
              {/* Active Nearby Drivers Markers */}
              {activeDrivers.map((driver) => {
                let iconUrl = '/car_map.png';
                const type = (driver.vehicle?.type || driver.vehicleType || '').toLowerCase();
                if (type === 'bike') iconUrl = '/bike_map.png';
                else if (type === 'auto') iconUrl = '/auto_map.png';
                
                return (
                  <Marker
                    key={driver._id}
                    position={{
                      lat: driver.currentLocation.coordinates[1],
                      lng: driver.currentLocation.coordinates[0]
                    }}
                    icon={{
                      url: iconUrl,
                      scaledSize: new window.google.maps.Size(32, 32),
                    }}
                    title={driver.name || 'Driver'}
                    zIndex={15}
                  />
                );
              })}
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

export default CustomerBooking;
