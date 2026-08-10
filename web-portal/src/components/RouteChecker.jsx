import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, XCircle, ArrowLeftRight, ArrowUpDown, Navigation, Loader2 } from 'lucide-react';
import AutoRickshawIcon from './AutoRickshawIcon';
import BikeIcon from './BikeIcon';
import CarIcon from './CarIcon';
import BusIcon from './BusIcon';
import LocationIcon from './LocationIcon';
import StationPointIcon from './StationPointIcon';
import RouteIcon from './RouteIcon';
import styles from './RouteChecker.module.css';

// Dataset of Popular Places for Autocomplete & Search
const POPULAR_LOCATIONS = [
  { id: 'guindy', name: 'Guindy', address: 'Guindy Railway Station & Industrial Estate, Chennai', latitude: 13.0067, longitude: 80.2020 },
  { id: 'tambaram', name: 'Tambaram', address: 'Tambaram Terminal & Sanatorium, Chennai', latitude: 12.9249, longitude: 80.1000 },
  { id: 'central', name: 'Chennai Central', address: 'Chennai Central Railway Station, Park Town, Chennai', latitude: 13.0827, longitude: 80.2707 },
  { id: 'egmore', name: 'Egmore', address: 'Egmore Railway Station & Metro, Chennai', latitude: 13.0732, longitude: 80.2609 },
  { id: 'saidapet', name: 'Saidapet', address: 'Saidapet Metro Station, Anna Salai, Chennai', latitude: 13.0213, longitude: 80.2231 },
  { id: 'pallavaram', name: 'Pallavaram', address: 'Pallavaram GST Road, Chennai', latitude: 12.9675, longitude: 80.1491 },
  { id: 'silks_hosur', name: 'The Chennai Silks Hosur', address: 'The Chennai Silks Hosur, Hosur, Tamil Nadu 635109', latitude: 12.7409, longitude: 77.8253 },
  { id: 'hosur', name: 'Hosur', address: 'Hosur, Krishnagiri District, Tamil Nadu', latitude: 12.7409, longitude: 77.8253 },
  { id: 'krishnagiri', name: 'Krishnagiri', address: 'Krishnagiri, Tamil Nadu', latitude: 12.5266, longitude: 78.2144 },
  { id: 'bangalore', name: 'Bangalore', address: 'Bengaluru, Karnataka, India', latitude: 12.9716, longitude: 77.5946 },
  { id: 'electronic_city', name: 'Electronic City Bangalore', address: 'Electronic City, Bengaluru, Karnataka', latitude: 12.8399, longitude: 77.6770 }
];

const transportModes = [
  { id: 'bike', label: 'Bike', icon: BikeIcon },
  { id: 'auto', label: 'Auto', icon: AutoRickshawIcon },
  { id: 'cab', label: 'Cab', icon: CarIcon },
  { id: 'bus', label: 'Bus', icon: BusIcon }
];

// Calculate Haversine distance in km
function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (typeof lat1 !== 'number' || typeof lon1 !== 'number' || typeof lat2 !== 'number' || typeof lon2 !== 'number') return 25;
  const R = 6371;
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

const RouteChecker = () => {
  const [pickupLoc, setPickupLoc] = useState({
    name: 'Guindy',
    address: 'Guindy Railway Station & Industrial Estate, Chennai',
    latitude: 13.0067,
    longitude: 80.2020
  });

  const [dropLoc, setDropLoc] = useState({
    name: 'Tambaram',
    address: 'Tambaram Terminal & Sanatorium, Chennai',
    latitude: 12.9249,
    longitude: 80.1000
  });

  const [selectedMode, setSelectedMode] = useState('cab');
  const [openPopover, setOpenPopover] = useState(null); // 'pickup' | 'drop' | null
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [resultState, setResultState] = useState(null); // 'ELIGIBLE' | 'NOT_ELIGIBLE'
  const [animProgress, setAnimProgress] = useState(0);

  const containerRef = useRef(null);

  const totalDistKm = Math.round(getHaversineDistanceKm(pickupLoc.latitude, pickupLoc.longitude, dropLoc.latitude, dropLoc.longitude));

  // Swap Pickup and Drop Locations
  const handleSwapLocations = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const temp = { ...pickupLoc };
    setPickupLoc({ ...dropLoc });
    setDropLoc(temp);
    setResultState(null);
  };

  // Close search popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenPopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autocomplete search engine
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const matches = POPULAR_LOCATIONS.filter(l => 
      l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q)
    );
    setSearchResults(matches);

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ', India')}&limit=4`);
        const data = await res.json();
        const apiFormatted = data.map(item => ({
          id: `api_${item.place_id}`,
          name: item.name || item.display_name.split(',')[0],
          address: item.display_name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon)
        }));
        const merged = [...matches];
        apiFormatted.forEach(item => {
          if (!merged.some(m => m.name.toLowerCase() === item.name.toLowerCase())) {
            merged.push(item);
          }
        });
        setSearchResults(merged.slice(0, 5));
      } catch (err) {
        // Fallback
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // GPS Geolocation Handler
  const handleUseCurrentLocation = async (type, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setGpsLoading(true);

    const applyLocation = (newLoc) => {
      if (type === 'pickup') setPickupLoc(newLoc);
      else setDropLoc(newLoc);
      setOpenPopover(null);
      setGpsLoading(false);
      setResultState(null);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            const areaName = data.address?.suburb || data.address?.road || data.address?.city || 'My Location';
            applyLocation({
              name: areaName,
              address: data.display_name || `${areaName}, India`,
              latitude: lat,
              longitude: lng
            });
          } catch (err) {
            applyLocation({ name: 'My Location', address: `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`, latitude: lat, longitude: lng });
          }
        },
        async () => {
          // IP fallback
          try {
            const ipRes = await fetch('https://ipwho.is/');
            const ipData = await ipRes.json();
            if (ipData && ipData.success) {
              applyLocation({
                name: `${ipData.city || 'Chennai'} Central`,
                address: `${ipData.city || 'Chennai'}, India`,
                latitude: ipData.latitude || 13.0827,
                longitude: ipData.longitude || 80.2707
              });
              return;
            }
          } catch (ipErr) {}
          applyLocation({ name: 'Guindy', address: 'Guindy, Chennai', latitude: 13.0067, longitude: 80.2020 });
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    } else {
      applyLocation({ name: 'Guindy', address: 'Guindy, Chennai', latitude: 13.0067, longitude: 80.2020 });
    }
  };

  // Submit Check Route Form
  const handleCheckRoute = (e) => {
    e.preventDefault();
    if (pickupLoc.name.toLowerCase() !== dropLoc.name.toLowerCase() && totalDistKm > 0 && totalDistKm <= 350) {
      setResultState('ELIGIBLE');
    } else {
      setResultState('NOT_ELIGIBLE');
    }
  };

  // Vehicle progress animation along dynamic polyline
  useEffect(() => {
    if (resultState === 'ELIGIBLE') {
      setAnimProgress(0);
      const interval = setInterval(() => {
        setAnimProgress(prev => (prev >= 100 ? 0 : prev + 2));
      }, 35);
      return () => clearInterval(interval);
    }
  }, [resultState, pickupLoc, dropLoc, selectedMode]);

  return (
    <section id="checker" className={styles.checkerSection}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>REAL-TIME ROUTE VERIFICATION</span>
          <h2 className={styles.sectionTitle}>
            Is Your Route <span className="forge-blue-text">Covered?</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Select your pickup and drop location to verify if your daily commute is eligible under your active pass.
          </p>
        </div>

        {/* Route Checker Card */}
        <div className={styles.checkerCard} ref={containerRef}>
          <form onSubmit={handleCheckRoute} className={styles.checkerForm}>
            {/* Pickup / Swap / Drop Input Row */}
            <div className={styles.locationFieldsRow}>
              {/* Pickup Location Field */}
              <div 
                className={`${styles.locationFieldBox} ${openPopover === 'pickup' ? styles.fieldBoxActive : ''}`}
                onClick={() => {
                  if (openPopover !== 'pickup') {
                    setOpenPopover('pickup');
                    setSearchQuery(pickupLoc.name);
                  }
                }}
              >
                <span className={styles.fieldLabel}>PICKUP LOCATION</span>
                <div className={styles.inputValRow}>
                  <LocationIcon size={18} />
                  <input
                    type="text"
                    className={styles.inlineInput}
                    value={openPopover === 'pickup' ? searchQuery : pickupLoc.name}
                    placeholder="Search pickup location..."
                    onFocus={() => {
                      setOpenPopover('pickup');
                      setSearchQuery(pickupLoc.name);
                    }}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setOpenPopover('pickup');
                      setPickupLoc(prev => ({
                        ...prev,
                        name: e.target.value || 'Pickup Location'
                      }));
                    }}
                  />
                </div>

                {/* Pickup Search Panel Popover */}
                <AnimatePresence>
                  {openPopover === 'pickup' && (
                    <motion.div 
                      className={styles.popoverPanel}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className={styles.gpsBtn}
                        onClick={(e) => handleUseCurrentLocation('pickup', e)}
                        disabled={gpsLoading}
                      >
                        {gpsLoading ? <Loader2 size={15} className={styles.spinner} /> : <Navigation size={15} />}
                        <span>{gpsLoading ? 'Detecting location...' : 'Use my current location'}</span>
                      </button>

                      <div className={styles.popoverList}>
                        <span className={styles.popoverTitle}>SUGGESTED PLACES</span>
                        {searching && <div className={styles.searchingText}>Searching locations...</div>}
                        {(searchResults.length > 0 ? searchResults : POPULAR_LOCATIONS.slice(0, 5)).map((item, idx) => (
                          <button
                            key={item.id || idx}
                            type="button"
                            className={styles.popoverItem}
                            onClick={() => {
                              setPickupLoc(item);
                              setOpenPopover(null);
                              setResultState(null);
                            }}
                          >
                            <LocationIcon size={15} />
                            <div className={styles.itemText}>
                              <span className={styles.itemName}>{item.name}</span>
                              {item.address && <span className={styles.itemAddr}>{item.address}</span>}
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Circular Swap Button */}
              <div className={styles.swapBtnWrapper}>
                <button
                  type="button"
                  className={styles.swapBtn}
                  onClick={handleSwapLocations}
                  title="Swap Pickup and Drop Locations"
                >
                  <RouteIcon size={26} />
                </button>
              </div>

              {/* Drop Location Field */}
              <div 
                className={`${styles.locationFieldBox} ${openPopover === 'drop' ? styles.fieldBoxActive : ''}`}
                onClick={() => {
                  if (openPopover !== 'drop') {
                    setOpenPopover('drop');
                    setSearchQuery(dropLoc.name);
                  }
                }}
              >
                <span className={styles.fieldLabel}>DROP LOCATION</span>
                <div className={styles.inputValRow}>
                  <LocationIcon size={18} />
                  <input
                    type="text"
                    className={styles.inlineInput}
                    value={openPopover === 'drop' ? searchQuery : dropLoc.name}
                    placeholder="Search drop location..."
                    onFocus={() => {
                      setOpenPopover('drop');
                      setSearchQuery(dropLoc.name);
                    }}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setOpenPopover('drop');
                      setDropLoc(prev => ({
                        ...prev,
                        name: e.target.value || 'Drop Location'
                      }));
                    }}
                  />
                </div>

                {/* Drop Search Panel Popover */}
                <AnimatePresence>
                  {openPopover === 'drop' && (
                    <motion.div 
                      className={styles.popoverPanel}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className={styles.gpsBtn}
                        onClick={(e) => handleUseCurrentLocation('drop', e)}
                        disabled={gpsLoading}
                      >
                        {gpsLoading ? <Loader2 size={15} className={styles.spinner} /> : <Navigation size={15} />}
                        <span>{gpsLoading ? 'Detecting location...' : 'Use my current location'}</span>
                      </button>

                      <div className={styles.popoverList}>
                        <span className={styles.popoverTitle}>SUGGESTED PLACES</span>
                        {searching && <div className={styles.searchingText}>Searching locations...</div>}
                        {(searchResults.length > 0 ? searchResults : POPULAR_LOCATIONS.slice(0, 5)).map((item, idx) => (
                          <button
                            key={item.id || idx}
                            type="button"
                            className={styles.popoverItem}
                            onClick={() => {
                              setDropLoc(item);
                              setOpenPopover(null);
                              setResultState(null);
                            }}
                          >
                            <LocationIcon size={15} />
                            <div className={styles.itemText}>
                              <span className={styles.itemName}>{item.name}</span>
                              {item.address && <span className={styles.itemAddr}>{item.address}</span>}
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Transport Mode Section */}
            <div className={styles.transportSection}>
              <span className={styles.transportTitle}>CHOOSE YOUR RIDE</span>
              <div className={styles.modeCardsRow}>
                {transportModes.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = selectedMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      className={`${styles.modeCard} ${isActive ? styles.modeCardActive : ''}`}
                      onClick={() => {
                        setSelectedMode(mode.id);
                        if (resultState) setResultState('ELIGIBLE');
                      }}
                    >
                      <Icon size={20} className={styles.modeIcon} />
                      <span className={styles.modeLabel}>{mode.label}</span>
                      {isActive && <span className={styles.modeActiveDot} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Compact CTA Row */}
            <div className={styles.ctaRow}>
              <button type="submit" className={styles.checkBtn}>
                <Search size={19} className={styles.btnSearchIcon} />
                <span>Check Route Eligibility</span>
              </button>
            </div>
          </form>

          {/* Dynamic Result Card & Live Track */}
          {resultState && (
            <motion.div 
              className={resultState === 'ELIGIBLE' ? styles.resultEligibleCard : styles.resultNotEligibleCard}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {resultState === 'ELIGIBLE' ? (
                <div>
                  <div className={styles.resultHeaderGroup}>
                    <div className={styles.successIconBadge}>
                      <CheckCircle2 size={24} />
                    </div>
                    <div className={styles.resultTextCol}>
                      <div className={styles.statusTitleSuccess}>✓ Route Corridor Eligible</div>
                      <div className={styles.routeRouteSub}>
                        {pickupLoc.name} → {dropLoc.name} ({totalDistKm} KM)
                      </div>
                      <div className={styles.passDetailsMeta}>
                        <span className={styles.tagMode}>{selectedMode.toUpperCase()} · Free Pass Ride</span>
                        <span>•</span>
                        <span className={styles.tagPassActive}>Pass Active · 21 Days Remaining</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Route Polyline Canvas */}
                  <div className={styles.polyTrackWrapper}>
                    <div className={styles.trackLineBase} />
                    <div className={styles.trackLineVisited} style={{ width: `${animProgress}%` }} />
                    
                    {/* Animated Moving Vehicle Marker */}
                    <div className={styles.animVehicleTag} style={{ left: `${animProgress}%` }}>
                      <div className={styles.vehWrapperMini}>
                        {selectedMode === 'bike' && <BikeIcon size={16} />}
                        {selectedMode === 'auto' && <AutoRickshawIcon size={16} />}
                        {selectedMode === 'cab' && <CarIcon size={16} />}
                        {selectedMode === 'bus' && <BusIcon size={16} />}
                      </div>
                    </div>

                    <div className={styles.terminalStationsRow}>
                      <div className={styles.terminalItem}>
                        <div className={styles.terminalNode}><LocationIcon size={14} /></div>
                        <span className={styles.terminalText}>{pickupLoc.name}</span>
                      </div>
                      <div className={styles.terminalItem}>
                        <div className={styles.terminalNode}><LocationIcon size={14} /></div>
                        <span className={styles.terminalText}>{dropLoc.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.resultHeaderGroup}>
                  <div className={styles.errorIconBadge}>
                    <XCircle size={24} />
                  </div>
                  <div className={styles.resultTextCol}>
                    <div className={styles.statusTitleError}>✕ Route Not Covered</div>
                    <p className={styles.errorMsgText}>
                      Your selected pickup or drop location is outside the active pass corridor.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RouteChecker;
