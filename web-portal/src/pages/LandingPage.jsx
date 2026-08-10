import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CarFront, ShieldCheck, Map, CreditCard, ChevronRight } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Polyline } from '@react-google-maps/api';
import API from '../services/api';
import styles from './LandingPage.module.css';

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

const libraries = ['places', 'geometry'];
const DEFAULT_CENTER = { lat: 13.0827, lng: 80.2707 }; // Chennai

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('daily');
  const [routes, setRoutes] = useState([]);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  // Fetch user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error fetching location", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await API.get('/route-manager/routes');
        if (res.data.success) {
          setRoutes(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch routes', err);
      }
    };
    fetchRoutes();
  }, []);

  return (
    <div className={styles.landingContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>MoveX</div>
        <div className={styles.navLinks}>
          <button onClick={() => navigate('/login?type=customer')} className={styles.btnGhost}>Log In</button>
          <button onClick={() => navigate('/register?type=customer')} className={styles.btnPrimary}>Sign Up</button>
        </div>
      </nav>

      <main className={styles.heroSection}>
        <div className={styles.bookingWidget}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'daily' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('daily')}
            >
              DAILY RIDES
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'routes' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('routes')}
            >
              ROUTES
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'passes' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('passes')}
            >
              PASSES
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'daily' && (
              <div className={styles.dailyRides}>
                <div className={styles.inputGroup}>
                  <div className={styles.inputLabel}>FROM</div>
                  <input type="text" placeholder="Enter pickup location" className={styles.input} />
                </div>
                <div className={styles.inputGroup}>
                  <div className={styles.inputLabel}>TO</div>
                  <input type="text" placeholder="Search for a locality or landmark" className={styles.input} />
                </div>
                <div className={styles.inputGroup}>
                  <div className={styles.inputLabel}>WHEN</div>
                  <select className={styles.input}>
                    <option>Now</option>
                    <option>Schedule for later</option>
                  </select>
                </div>

                <div className={styles.availableRides}>
                  <div className={styles.rideOption} onClick={() => navigate('/login?type=customer')}>
                    <div className={styles.rideIcon}><CarFront size={24} /></div>
                    <div className={styles.rideDetails}>
                      <h4>MoveX Mini</h4>
                      <p>Comfy hatchbacks at pocket-friendly fares</p>
                    </div>
                  </div>
                  <div className={styles.rideOption} onClick={() => navigate('/login?type=customer')}>
                    <div className={styles.rideIcon}><CarFront size={24} /></div>
                    <div className={styles.rideDetails}>
                      <h4>MoveX Sedan</h4>
                      <p>Sedans with free wifi and top drivers</p>
                    </div>
                  </div>
                  <div className={styles.rideOption} onClick={() => navigate('/login?type=customer')}>
                    <div className={styles.rideIcon}><CarFront size={24} /></div>
                    <div className={styles.rideDetails}>
                      <h4>MoveX SUV</h4>
                      <p>SUVs with free wifi and top drivers</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'routes' && (
              <div className={styles.routesSection}>
                <h3 style={{ marginBottom: '16px' }}>Popular Metro Routes</h3>
                <div className={styles.routeCard}>
                  <h4>Koramangala ↔ Indiranagar</h4>
                  <p>Operates every 15 mins</p>
                </div>
                <div className={styles.routeCard}>
                  <h4>HSR Layout ↔ Whitefield</h4>
                  <p>Operates every 30 mins</p>
                </div>
                <div className={styles.routeCard}>
                  <h4>Electronic City ↔ Majestic</h4>
                  <p>Operates every 20 mins</p>
                </div>
                <button 
                  className={styles.btnFull}
                  onClick={() => navigate('/login?type=customer')}
                >
                  View All Routes
                </button>
              </div>
            )}

            {activeTab === 'passes' && (
              <div className={styles.passesSection}>
                <h3 style={{ marginBottom: '16px' }}>Ride Passes</h3>
                <div className={styles.passCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4>Silver Pass</h4>
                    <strong>₹299</strong>
                  </div>
                  <p>5% off on all rides • 30 days validity</p>
                </div>
                <div className={styles.passCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4>Gold Pass</h4>
                    <strong>₹599</strong>
                  </div>
                  <p>10% off on all rides • Priority booking</p>
                </div>
                <div className={styles.passCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4>Diamond Pass</h4>
                    <strong>₹999</strong>
                  </div>
                  <p>15% off • Zero cancellation fees • 30 days</p>
                </div>
                <button 
                  className={styles.btnFull}
                  onClick={() => navigate('/login?type=customer')}
                >
                  Buy a Pass
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.heroBackground}>
          <div className={styles.heroTextContainer}>
            <h1 className={styles.heroTitle}>Everyday city commute</h1>
            <p className={styles.heroSubtitle}>Affordable AC cab rides at your doorstep</p>
          </div>
        </div>
      </main>

      <section className={styles.mapSection}>
        <div className={styles.mapHeader}>
          <h2>Explore our Routes</h2>
          <p>We connect the city with premium, fixed-route shuttle services.</p>
        </div>
        <div className={styles.mapContainer}>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={mapCenter}
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
            >
              {routes.map(route => {
                if (!route.polyline) return null;
                const path = decodePolyline(route.polyline);
                return (
                  <Polyline
                    key={route._id}
                    path={path}
                    options={{
                      strokeColor: '#2563EB',
                      strokeOpacity: 0.8,
                      strokeWeight: 4,
                    }}
                  />
                );
              })}
            </GoogleMap>
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#eaeaea' }} />
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
