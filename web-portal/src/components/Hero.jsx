import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight, ArrowDown, ArrowLeftRight, ArrowUpDown, CheckCircle2, XCircle, Zap, Search, Navigation, Loader2 } from 'lucide-react';
import AutoRickshawIcon from './AutoRickshawIcon';
import BikeIcon from './BikeIcon';
import CarIcon from './CarIcon';
import BusIcon from './BusIcon';
import LocationIcon from './LocationIcon';
import StationPointIcon from './StationPointIcon';
import RouteIcon from './RouteIcon';
import styles from './Hero.module.css';

// Curated Popular Places Dataset for Instant Smart Autocomplete & Fuzzy Search
const POPULAR_LOCATIONS = [
  { id: 'silks_hosur', name: 'The Chennai Silks Hosur', address: 'The Chennai Silks Hosur, 181 & 182, Hamumanthapuram, Hosur, Tamil Nadu 635109', latitude: 12.7409, longitude: 77.8253 },
  { id: 'hosur', name: 'Hosur', address: 'Hosur, Krishnagiri District, Tamil Nadu', latitude: 12.7409, longitude: 77.8253 },
  { id: 'krishnagiri_rd', name: 'Krishnagiri - Rayakottai Road', address: 'Rayakottai Road, Krishnagiri, Tamil Nadu 635001', latitude: 12.5266, longitude: 78.2144 },
  { id: 'krishnagiri', name: 'Krishnagiri', address: 'Krishnagiri, Tamil Nadu', latitude: 12.5266, longitude: 78.2144 },
  { id: 'bangalore', name: 'Bangalore', address: 'Bengaluru, Karnataka, India', latitude: 12.9716, longitude: 77.5946 },
  { id: 'electronic_city', name: 'Electronic City Bangalore', address: 'Electronic City, Bengaluru, Karnataka 560100', latitude: 12.8399, longitude: 77.6770 },
  { id: 'central', name: 'Chennai Central', code: 'MAS', latitude: 13.0827, longitude: 80.2707, address: 'Chennai Central Railway Station, Park Town, Chennai' },
  { id: 'egmore', name: 'Egmore', code: 'MS', latitude: 13.0732, longitude: 80.2609, address: 'Egmore Railway Station & Metro, Chennai' },
  { id: 'saidapet', name: 'Saidapet', code: 'SP', latitude: 13.0213, longitude: 80.2231, address: 'Saidapet Metro Station, Anna Salai, Chennai' },
  { id: 'guindy', name: 'Guindy', code: 'GDY', latitude: 13.0067, longitude: 80.2020, address: 'Guindy Railway Station & Industrial Estate, Chennai' },
  { id: 'guindy_metro', name: 'Guindy Metro', code: 'GDYM', latitude: 13.0084, longitude: 80.2052, address: 'Guindy Metro Station, GST Road, Guindy, Chennai' },
  { id: 'pallavaram', name: 'Pallavaram', code: 'PV', latitude: 12.9675, longitude: 80.1491, address: 'Pallavaram GST Road, Chennai' },
  { id: 'tambaram', name: 'Tambaram', code: 'TBM', latitude: 12.9249, longitude: 80.1000, address: 'Tambaram Terminal & Sanatorium, Chennai' },
  { id: 'tambaram_san', name: 'Tambaram Sanatorium', latitude: 12.9372, longitude: 80.1165, address: 'Tambaram Sanatorium, GST Road, Chennai' },
  { id: 'adyar_z13', name: 'Zone 13 Adyar', latitude: 13.0012, longitude: 80.2565, address: 'Zone 13 Office, LB Road, Adyar, Chennai, Tamil Nadu' },
  { id: 'adyar', name: 'Adyar', latitude: 13.0012, longitude: 80.2565, address: 'Adyar, Chennai, Tamil Nadu' },
  { id: 'velachery', name: 'Velachery', latitude: 12.9815, longitude: 80.2180, address: 'Velachery Main Road, Chennai, Tamil Nadu' },
  { id: 'koyambedu', name: 'Koyambedu Bus Terminus', latitude: 13.0694, longitude: 80.1948, address: 'Koyambedu CMBT, Inner Ring Road, Chennai' }
];

const transportModes = [
  { id: 'bike', label: 'Bike', icon: BikeIcon, eta: '18m', speed: 'Fast' },
  { id: 'auto', label: 'Auto', icon: AutoRickshawIcon, eta: '25m', speed: 'Direct' },
  { id: 'cab', label: 'Cab', icon: CarIcon, eta: '20m', speed: 'Comfort' },
  { id: 'bus', label: 'Bus', icon: BusIcon, eta: '32m', speed: 'Eco' }
];

// Landmark & Route Waypoint Knowledge Base
const WAYPOINT_KNOWLEDGE = [
  { match: ['krishnagiri', 'hosur'], waypoints: ['Rayakottai Rd', 'Shoolagiri', 'Hosur Toll'] },
  { match: ['bangalore', 'hosur'], waypoints: ['Silk Board', 'Electronic City', 'Attibele'] },
  { match: ['bangalore', 'krishnagiri'], waypoints: ['Electronic City', 'Attibele', 'Hosur', 'Shoolagiri'] },
  { match: ['chennai', 'bangalore'], waypoints: ['Kanchipuram', 'Vellore', 'Ambur', 'Hosur'] },
  { match: ['chennai central', 'tambaram'], waypoints: ['Egmore', 'Saidapet', 'Guindy', 'Pallavaram'] },
  { match: ['adyar', 'velachery'], waypoints: ['Kotturpuram', 'IIT Madras', 'Taramani'] }
];

// Helper to make 3-letter station codes
function makeStationCode(str) {
  if (!str) return 'STN';
  const words = str.trim().split(/\s+/);
  if (words.length >= 3) {
    return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  }
  const clean = str.replace(/[^a-zA-Z]/g, '').toUpperCase();
  if (clean.length <= 3) return clean || 'STN';
  return clean.slice(0, 3);
}

// Haversine Distance Calculation (in kilometers)
function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Generate Dynamic Polyline Route Stations for ANY Pickup + Drop Selection
function generateDynamicRoute(pickupLoc, dropLoc) {
  const pName = (pickupLoc.name || 'Pickup').trim();
  const dName = (dropLoc.name || 'Drop').trim();

  const pLower = pName.toLowerCase();
  const dLower = dName.toLowerCase();

  let intermediateNames = [];
  const matched = WAYPOINT_KNOWLEDGE.find(item => 
    (pLower.includes(item.match[0]) && dLower.includes(item.match[1])) ||
    (pLower.includes(item.match[1]) && dLower.includes(item.match[0]))
  );

  if (matched) {
    intermediateNames = matched.waypoints;
  } else {
    const distKm = getHaversineDistanceKm(pickupLoc.latitude, pickupLoc.longitude, dropLoc.latitude, dropLoc.longitude);
    if (distKm > 100) {
      intermediateNames = ['Vellore Junction', 'Ambur Highway', 'Toll Plaza'];
    } else if (distKm > 20) {
      intermediateNames = ['Central Bypass', 'Express Ring Rd', 'Transit Hub'];
    } else {
      intermediateNames = ['Sector 1', 'Main Avenue', 'Transit Stop'];
    }
  }

  const dynamicStations = [
    { id: 'start', name: pName, code: makeStationCode(pName), isPickup: true },
    ...intermediateNames.map((name, idx) => ({
      id: `mid_${idx}`,
      name,
      code: makeStationCode(name),
      isIntermediate: true
    })),
    { id: 'end', name: dName, code: makeStationCode(dName), isDrop: true }
  ];

  return dynamicStations;
}

// Levenshtein distance for fuzzy tolerance
function getLevenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Compute fuzzy match score between target place and query string
function computeFuzzyScore(targetName, targetAddress, queryStr) {
  if (!queryStr || !queryStr.trim()) return 0;
  const q = queryStr.toLowerCase().trim();
  const name = targetName.toLowerCase();
  const addr = (targetAddress || '').toLowerCase();
  const combined = `${name} ${addr}`;

  if (name === q) return 100;
  if (name.startsWith(q)) return 95;
  if (combined.includes(q)) return 85;

  const qWords = q.split(/\s+/);
  const targetWords = combined.split(/[\s,–-]+/);

  let totalScore = 0;
  qWords.forEach(qw => {
    let bestWordScore = 0;
    targetWords.forEach(tw => {
      if (tw.startsWith(qw)) {
        bestWordScore = Math.max(bestWordScore, 80);
      } else if (tw.includes(qw)) {
        bestWordScore = Math.max(bestWordScore, 70);
      } else if (qw.length >= 3 && tw.length >= 3) {
        const dist = getLevenshteinDistance(tw, qw);
        if (dist <= 2) {
          bestWordScore = Math.max(bestWordScore, 60 - dist * 10);
        }
      }
    });
    totalScore += bestWordScore;
  });

  return Math.min(99, Math.round(totalScore / qWords.length));
}

const Hero = () => {
  // Location States holding { name, address, latitude, longitude }
  const [pickupLoc, setPickupLoc] = useState({
    name: 'Krishnagiri',
    address: 'Krishnagiri, Tamil Nadu',
    latitude: 12.5266,
    longitude: 78.2144
  });

  const [dropLoc, setDropLoc] = useState({
    name: 'Hosur',
    address: 'Hosur, Krishnagiri District, Tamil Nadu',
    latitude: 12.7409,
    longitude: 77.8253
  });

  const [activeMode, setActiveMode] = useState('auto'); // Default Auto mode
  const [animProgress, setAnimProgress] = useState(0);
  const [openPopover, setOpenPopover] = useState(null); // 'pickup' | 'drop' | null

  // Search & Geocoding States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  const selectorRef = useRef(null);

  // Dynamically generated route corridor stations based on pickupLoc and dropLoc
  const dynamicStations = generateDynamicRoute(pickupLoc, dropLoc);
  const totalDistanceKm = Math.round(getHaversineDistanceKm(pickupLoc.latitude, pickupLoc.longitude, dropLoc.latitude, dropLoc.longitude));

  // Route Corridor Pass Coverage Validation
  const isCorridorEligible =
    pickupLoc.name.toLowerCase() !== dropLoc.name.toLowerCase() &&
    totalDistanceKm > 0 &&
    totalDistanceKm <= 350;

  // Close search panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setOpenPopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Smart Autocomplete & Fuzzy Search Engine
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const q = searchQuery.trim();

    // 1. Calculate fuzzy scores over curated popular spots
    const scoredPopular = POPULAR_LOCATIONS.map(item => ({
      ...item,
      score: computeFuzzyScore(item.name, item.address, q)
    }))
    .filter(item => item.score >= 35)
    .sort((a, b) => b.score - a.score);

    setSearchResults(scoredPopular.slice(0, 5));

    // 2. Fetch live Places / Geocoding API results in parallel
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const queryWithRegion = q.toLowerCase().includes('tamil nadu') || q.toLowerCase().includes('karnataka') || q.toLowerCase().includes('chennai') || q.toLowerCase().includes('hosur')
          ? q
          : `${q}, India`;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryWithRegion)}&addressdetails=1&limit=5`
        );
        const data = await res.json();
        const apiFormatted = data.map((item) => ({
          id: `api_${item.place_id}`,
          name: item.name || item.address?.road || item.address?.suburb || item.display_name.split(',')[0],
          address: item.display_name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          score: computeFuzzyScore(item.name || item.display_name, item.display_name, q)
        }));

        const merged = [...scoredPopular];
        apiFormatted.forEach(apiItem => {
          if (!merged.some(m => m.name.toLowerCase() === apiItem.name.toLowerCase())) {
            merged.push(apiItem);
          }
        });
        merged.sort((a, b) => b.score - a.score);

        setSearchResults(merged.slice(0, 5));
      } catch (err) {
        // Fallback to local scored results if network fails
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // GPS Geolocation Handler with Instant IP Fallback
  const handleUseCurrentLocation = async (type, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setGpsLoading(true);
    setGpsError(null);

    const applyLocation = (newLoc) => {
      if (type === 'pickup') {
        setPickupLoc(newLoc);
        setSearchQuery(newLoc.name);
      } else {
        setDropLoc(newLoc);
        setSearchQuery(newLoc.name);
      }
      setOpenPopover(null);
      setGpsLoading(false);
    };

    // Try HTML5 Geolocation API with 5s timeout
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            const areaName = data.address?.suburb || data.address?.neighbourhood || data.address?.road || data.address?.city || data.address?.town || 'My Location';
            const fullAddr = data.display_name || `${areaName}, India`;
            applyLocation({
              name: areaName,
              address: fullAddr,
              latitude: lat,
              longitude: lng
            });
          } catch (err) {
            applyLocation({
              name: 'My Location',
              address: `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
              latitude: lat,
              longitude: lng
            });
          }
        },
        async (err) => {
          // If browser GPS is denied/blocked/timed out, try IP Geolocation fallback
          try {
            const ipRes = await fetch('https://ipwho.is/');
            const ipData = await ipRes.json();
            if (ipData && ipData.success) {
              const city = ipData.city || 'Chennai';
              const region = ipData.region || 'Tamil Nadu';
              applyLocation({
                name: `${city} Central`,
                address: `${city}, ${region}, India`,
                latitude: ipData.latitude || 13.0827,
                longitude: ipData.longitude || 80.2707
              });
              return;
            }
          } catch (ipErr) {
            // Ignore IP fetch failure
          }
          applyLocation({
            name: 'Chennai Central',
            address: 'Chennai Central, Tamil Nadu',
            latitude: 13.0827,
            longitude: 80.2707
          });
        },
        { timeout: 5000, enableHighAccuracy: true, maximumAge: 30000 }
      );
    } else {
      applyLocation({
        name: 'Chennai Central',
        address: 'Chennai Central, Tamil Nadu',
        latitude: 13.0827,
        longitude: 80.2707
      });
    }
  };

  // Reset and restart smooth vehicle movement along the dynamic polyline
  useEffect(() => {
    setAnimProgress(0);
    const interval = setInterval(() => {
      setAnimProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1.2;
      });
    }, 35);
    return () => clearInterval(interval);
  }, [activeMode, pickupLoc, dropLoc]);

  return (
    <section id="hero" className={styles.heroSection}>
      {/* Subtle Background Accent Mesh */}
      <div className={styles.heroBgMesh} />

      <div className="container">
        <div className={styles.heroGrid}>
          {/* Left Column: Brand Storytelling & Copy */}
          <motion.div 
            className={styles.heroLeft}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Subtle Integrated Hero Vehicle Background Illustration */}
            <div className={styles.heroVehicleBgWrapper}>
              <img 
                src="/hero.png" 
                alt="" 
                aria-hidden="true"
                className={styles.heroVehicleBgImg} 
              />
            </div>

            {/* Top Badge */}
            <div className={styles.badgePill}>
              <span className={styles.badgePulse} />
              <span className={styles.badgeText}>Powered by FORGE INDIA CONNECT</span>
              <span className={styles.badgeTag}>COMMUTE PASS</span>
            </div>

            {/* Headline - Calm, Premium & Corporate Forge Blue */}
            <h1 className={styles.headline}>
              <span className={styles.headlineBlueWithAccent}>
                Unlimited Rides.
                <svg className={styles.yellowUnderlineSvg} viewBox="0 0 240 12" fill="none">
                  <path d="M2 8 C 60 2, 180 2, 238 8" stroke="#E8C84A" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
              <br />
              <span className="forge-blue-text">Your Route.</span>
            </h1>

            {/* Muted Blue-Gray Description with Subtle Soft Yellow Highlight */}
            <p className={styles.supportingText}>
              Ride smarter with one mobility pass. Get <strong className={styles.highlightText}>FREE Bike, Auto, Cab and Bus rides</strong> across our predefined routes while your pass is active.
            </p>

            {/* CTA Buttons */}
            <div className={styles.ctaGroup}>
              <a href="#passes" className="btn btn-yellow">
                <span>Get Your Pass</span>
                <ArrowRight size={18} />
              </a>
              <a href="#routes" className="btn btn-outline-blue">
                <span>Explore Covered Routes</span>
              </a>
            </div>

            {/* Redesigned Premium Horizontal Stepper */}
            <div className={styles.valueStoryBox}>
              <div className={styles.valueStoryHeader}>
                <span>HOW YOUR UNLIMITED MOBILITY PASS WORKS:</span>
              </div>
              <div className={styles.valueStepsRow}>
                {/* Step 01 */}
                <motion.div 
                  className={styles.valueStepCard}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <span className={styles.valueStepNum}>01</span>
                  <span className={styles.valueStepTitle}>Buy Pass</span>
                </motion.div>

                <span className={styles.valueArrow}>
                  <ArrowRight size={14} className={styles.arrowDesktop} />
                  <ArrowDown size={14} className={styles.arrowMobile} />
                </span>

                {/* Step 02 */}
                <motion.div 
                  className={styles.valueStepCard}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <span className={styles.valueStepNum}>02</span>
                  <span className={styles.valueStepTitle}>Select Route</span>
                </motion.div>

                <span className={styles.valueArrow}>
                  <ArrowRight size={14} className={styles.arrowDesktop} />
                  <ArrowDown size={14} className={styles.arrowMobile} />
                </span>

                {/* Step 03 */}
                <motion.div 
                  className={styles.valueStepCard}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <span className={styles.valueStepNum}>03</span>
                  <span className={styles.valueStepTitle}>Pick Pickup / Drop</span>
                </motion.div>

                <span className={styles.valueArrow}>
                  <ArrowRight size={14} className={styles.arrowDesktop} />
                  <ArrowDown size={14} className={styles.arrowMobile} />
                </span>

                {/* Step 04: Ride FREE (Highlighted Final Step) */}
                <motion.div 
                  className={styles.valueStepCardYellow}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <span className={styles.valueStepNumYellow}>04</span>
                  <div className={styles.yellowTitleGroup}>
                    <CheckCircle2 size={15} className={styles.checkIconYellow} />
                    <span className={styles.valueStepTitleYellow}>Ride FREE</span>
                  </div>
                  <span className={styles.activePulseRing} />
                </motion.div>
              </div>
            </div>

            {/* Trust Metrics */}
            <div className={styles.trustRow}>
              <div className={styles.trustItem}>
                <div className={styles.trustNumber}>₹0</div>
                <div className={styles.trustLabel}>Additional Fare</div>
              </div>
              <div className={styles.trustDivider} />
              <div className={styles.trustItem}>
                <div className={styles.trustNumber}>4 Modes</div>
                <div className={styles.trustLabel}>Bike · Auto · Cab · Bus</div>
              </div>
              <div className={styles.trustDivider} />
              <div className={styles.trustItem}>
                <div className={styles.trustNumber}>100%</div>
                <div className={styles.trustLabel}>Fixed Route Guarantee</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Hero White Route Card */}
          <motion.div 
            className={styles.heroRight}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className={styles.visualCard}>
              {/* Card Header with Dynamic Corridor Label */}
              <div className={styles.visualHeader}>
                <div className={styles.headerTitleGroup}>
                  <div className={styles.liveDot} />
                  <span className={styles.visualCardTitle}>Live Route Pass Corridor</span>
                </div>
                <div className={styles.corridorTag}>
                  {pickupLoc.name.toUpperCase()} – {dropLoc.name.toUpperCase()} LINE ({totalDistanceKm || 45} KM)
                </div>
              </div>

              {/* Transport Tabs (Bike, Auto, Cab, Bus) */}
              <div className={styles.modeSelectorRow}>
                {transportModes.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = activeMode === mode.id;
                  return (
                    <motion.button
                      key={mode.id}
                      className={`${styles.modeBtn} ${isActive ? styles.modeBtnActive : styles.modeBtnInactive}`}
                      onClick={() => setActiveMode(mode.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon size={24} className={isActive ? styles.activeIcon : styles.inactiveIcon} />
                      <span>{mode.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Real Direct-Typeable Location Input Selector Bar */}
              <div className={styles.routeSelectorBar} ref={selectorRef}>
                {/* Pickup Inline Editable Field */}
                <div 
                  className={`${styles.customInputField} ${openPopover === 'pickup' ? styles.fieldActive : ''}`}
                  onClick={() => {
                    if (openPopover !== 'pickup') {
                      setOpenPopover('pickup');
                      setSearchQuery(pickupLoc.name);
                    }
                  }}
                >
                  <span className={styles.fieldLabel}>PICKUP LOCATION</span>
                  <div className={styles.locationValueRow}>
                    <LocationIcon size={18} className={styles.pinIconPickup} />
                    <input
                      type="text"
                      className={styles.inlineTextInput}
                      value={openPopover === 'pickup' ? searchQuery : pickupLoc.name}
                      placeholder="Type pickup location..."
                      onFocus={() => {
                        setOpenPopover('pickup');
                        setSearchQuery(pickupLoc.name);
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSearchQuery(val);
                        setOpenPopover('pickup');
                        const matched = POPULAR_LOCATIONS.find(s => s.name.toLowerCase() === val.toLowerCase());
                        if (matched) {
                          setPickupLoc({
                            name: matched.name,
                            address: matched.address,
                            latitude: matched.latitude,
                            longitude: matched.longitude
                          });
                        } else {
                          setPickupLoc(prev => ({
                            ...prev,
                            name: val || 'Pickup Location',
                            address: val || 'Typed Location'
                          }));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setOpenPopover(null);
                      }}
                    />
                  </div>
                  <div className={styles.subtleBottomBorder} />

                  {/* Location Search Panel Popover */}
                  <AnimatePresence>
                    {openPopover === 'pickup' && (
                      <motion.div
                        className={styles.popoverDropdown}
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* GPS Current Location Button */}
                        <button
                          type="button"
                          className={styles.gpsLocationBtn}
                          onClick={(e) => handleUseCurrentLocation('pickup', e)}
                          disabled={gpsLoading}
                        >
                          {gpsLoading ? (
                            <Loader2 size={16} className={styles.gpsSpinner} />
                          ) : (
                            <Navigation size={16} className={styles.gpsIcon} />
                          )}
                          <span>{gpsLoading ? 'Detecting your GPS location...' : 'Use my current location'}</span>
                        </button>

                        {/* GPS Error Message */}
                        {gpsError && (
                          <div className={styles.gpsErrorBanner}>
                            <XCircle size={14} />
                            <span>{gpsError}</span>
                          </div>
                        )}

                        {/* Suggestions / Predefined List */}
                        <div className={styles.popoverList}>
                          <span className={styles.popoverListSectionTitle}>MATCHING PLACES</span>

                          {searching && (
                            <div className={styles.searchLoadingRow}>
                              <Loader2 size={14} className={styles.searchSpinner} />
                              <span>Searching places...</span>
                            </div>
                          )}

                          {(searchResults.length > 0 ? searchResults : POPULAR_LOCATIONS.slice(0, 5)).map((item, idx) => {
                            const isSelected = pickupLoc.name.toLowerCase() === item.name.toLowerCase();
                            return (
                              <button
                                key={item.id || idx}
                                type="button"
                                className={`${styles.popoverItem} ${isSelected ? styles.popoverItemActive : ''}`}
                                onClick={() => {
                                  setPickupLoc({
                                    name: item.name,
                                    address: item.address || item.name,
                                    latitude: item.latitude,
                                    longitude: item.longitude
                                  });
                                  setOpenPopover(null);
                                }}
                              >
                                <LocationIcon size={16} className={isSelected ? styles.popoverPinActive : styles.popoverPin} />
                                <div className={styles.popoverTextGroup}>
                                  <span className={styles.popoverName}>{item.name}</span>
                                  {item.address && <span className={styles.popoverAddress}>{item.address}</span>}
                                </div>
                                {item.code && <span className={styles.popoverCode}>{item.code}</span>}
                                {isSelected && <span className={styles.selectedCheck}>✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Center Swap / Route Button */}
                <div className={styles.selectorArrowWrapper}>
                  <button
                    type="button"
                    className={styles.swapBtnHero}
                    onClick={(e) => {
                      e.stopPropagation();
                      const temp = { ...pickupLoc };
                      setPickupLoc({ ...dropLoc });
                      setDropLoc(temp);
                    }}
                    title="Swap Pickup and Drop Locations"
                  >
                    <RouteIcon size={26} />
                  </button>
                </div>

                {/* Drop Inline Editable Field */}
                <div 
                  className={`${styles.customInputField} ${openPopover === 'drop' ? styles.fieldActive : ''}`}
                  onClick={() => {
                    if (openPopover !== 'drop') {
                      setOpenPopover('drop');
                      setSearchQuery(dropLoc.name);
                    }
                  }}
                >
                  <span className={styles.fieldLabel}>DROP LOCATION</span>
                  <div className={styles.locationValueRow}>
                    <LocationIcon size={18} className={styles.pinIconDrop} />
                    <input
                      type="text"
                      className={styles.inlineTextInput}
                      value={openPopover === 'drop' ? searchQuery : dropLoc.name}
                      placeholder="Type drop location..."
                      onFocus={() => {
                        setOpenPopover('drop');
                        setSearchQuery(dropLoc.name);
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSearchQuery(val);
                        setOpenPopover('drop');
                        const matched = POPULAR_LOCATIONS.find(s => s.name.toLowerCase() === val.toLowerCase());
                        if (matched) {
                          setDropLoc({
                            name: matched.name,
                            address: matched.address,
                            latitude: matched.latitude,
                            longitude: matched.longitude
                          });
                        } else {
                          setDropLoc(prev => ({
                            ...prev,
                            name: val || 'Drop Location',
                            address: val || 'Typed Location'
                          }));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setOpenPopover(null);
                      }}
                    />
                  </div>
                  <div className={styles.subtleBottomBorder} />

                  {/* Location Search Panel Popover */}
                  <AnimatePresence>
                    {openPopover === 'drop' && (
                      <motion.div
                        className={styles.popoverDropdown}
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* GPS Current Location Button */}
                        <button
                          type="button"
                          className={styles.gpsLocationBtn}
                          onClick={(e) => handleUseCurrentLocation('drop', e)}
                          disabled={gpsLoading}
                        >
                          {gpsLoading ? (
                            <Loader2 size={16} className={styles.gpsSpinner} />
                          ) : (
                            <Navigation size={16} className={styles.gpsIcon} />
                          )}
                          <span>{gpsLoading ? 'Detecting your GPS location...' : 'Use my current location'}</span>
                        </button>

                        {/* GPS Error Message */}
                        {gpsError && (
                          <div className={styles.gpsErrorBanner}>
                            <XCircle size={14} />
                            <span>{gpsError}</span>
                          </div>
                        )}

                        {/* Suggestions / Predefined List */}
                        <div className={styles.popoverList}>
                          <span className={styles.popoverListSectionTitle}>MATCHING PLACES</span>

                          {searching && (
                            <div className={styles.searchLoadingRow}>
                              <Loader2 size={14} className={styles.searchSpinner} />
                              <span>Searching places...</span>
                            </div>
                          )}

                          {(searchResults.length > 0 ? searchResults : POPULAR_LOCATIONS.slice(0, 5)).map((item, idx) => {
                            const isSelected = dropLoc.name.toLowerCase() === item.name.toLowerCase();
                            return (
                              <button
                                key={item.id || idx}
                                type="button"
                                className={`${styles.popoverItem} ${isSelected ? styles.popoverItemActive : ''}`}
                                onClick={() => {
                                  setDropLoc({
                                    name: item.name,
                                    address: item.address || item.name,
                                    latitude: item.latitude,
                                    longitude: item.longitude
                                  });
                                  setOpenPopover(null);
                                }}
                              >
                                <LocationIcon size={16} className={isSelected ? styles.popoverPinActive : styles.popoverPin} />
                                <div className={styles.popoverTextGroup}>
                                  <span className={styles.popoverName}>{item.name}</span>
                                  {item.address && <span className={styles.popoverAddress}>{item.address}</span>}
                                </div>
                                {item.code && <span className={styles.popoverCode}>{item.code}</span>}
                                {isSelected && <span className={styles.selectedCheck}>✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Dynamic Metro Line Polyline Track Visualization */}
              <div className={styles.metroLineContainer}>
                <div className={styles.metroLineTrack}>
                  {/* Outer Network Line (Forge Blue Line #075AAA) */}
                  <div className={styles.trackBase} />
                  
                  {/* Eligible Corridor Track Base */}
                  <div 
                    className={styles.trackCorridorBase}
                    style={{
                      left: `0%`,
                      width: `100%`
                    }}
                  />

                  {/* Active Visited Segment (Muted Accent Yellow #E8C84A) */}
                  <div 
                    className={styles.trackVisitedSegment}
                    style={{
                      left: `0%`,
                      width: `${animProgress}%`
                    }}
                  />

                  {/* Premium Vehicle Marker: White center, Blue vehicle icon, Thin Yellow ring */}
                  <motion.div 
                    key={`${activeMode}-${pickupLoc.name}-${dropLoc.name}`}
                    className={styles.movingVehicleContainer}
                    style={{
                      left: `${animProgress}%`
                    }}
                    initial={{ scale: 0.9, opacity: 0.9 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={styles.vehicleGlowRing} />

                    <div className={styles.vehicleIconWrapper}>
                      {activeMode === 'bike' && <BikeIcon size={20} className={styles.vehicleBlueIcon} />}
                      {activeMode === 'auto' && <AutoRickshawIcon size={18} className={styles.vehicleBlueIcon} />}
                      {activeMode === 'cab' && <CarIcon size={20} className={styles.vehicleBlueIcon} />}
                      {activeMode === 'bus' && <BusIcon size={20} className={styles.vehicleBlueIcon} />}
                    </div>

                    {isCorridorEligible && (
                      <div className={styles.vehicleTooltipTag}>
                        {transportModes.find(m => m.id === activeMode)?.label} · Free Pass Ride
                      </div>
                    )}
                  </motion.div>

                  {/* Dynamic Route Station Nodes */}
                  <div className={styles.stationsRow}>
                    {dynamicStations.map((st, idx) => {
                      const stationPct = (idx / (dynamicStations.length - 1)) * 100;
                      const isPickup = idx === 0;
                      const isDrop = idx === dynamicStations.length - 1;
                      const isVisited = stationPct <= animProgress;

                      return (
                        <div key={st.id} className={styles.stationItem}>
                          <div 
                            className={`${styles.stationNode} ${styles.stationActive} ${
                              isVisited ? styles.stationVisited : ''
                            } ${isPickup || isDrop ? styles.stationTerminal : ''}`}
                          >
                            {isPickup && <LocationIcon size={14} className={styles.pinIconPickup} />}
                            {isDrop && <LocationIcon size={14} className={styles.pinIconDrop} />}
                            {!isPickup && !isDrop && <StationPointIcon size={24} className={styles.stationPointImg} />}
                          </div>
                          <div className={styles.stationMeta}>
                            <span className={`${styles.stationName} ${styles.textActive}`}>
                              {st.name}
                            </span>
                            <span className={styles.stationCode}>{st.code}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Floating Pass Badge */}
              <div className={`${styles.floatingPassBadge} floating-anim`}>
                <div className={styles.passBadgeTop}>
                  <span className={styles.passName}>MONTHLY PASS</span>
                  <span className={styles.passStatusDot}>ACTIVE</span>
                </div>
                <div className={styles.passBadgeVal}>₹0 Fare Charged</div>
                <div className={styles.passBadgeRemaining}>21 Days Remaining</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
