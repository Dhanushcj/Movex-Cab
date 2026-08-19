import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, ArrowRight } from 'lucide-react';
import AutoRickshawIcon from './AutoRickshawIcon';
import BikeIcon from './BikeIcon';
import CarIcon from './CarIcon';
import BusIcon from './BusIcon';
import LocationIcon from './LocationIcon';
import StationPointIcon from './StationPointIcon';
import styles from './MetroPolyline.module.css';

const corridorData = [
  {
    id: 'st-1',
    name: 'Chennai Central',
    code: 'MAS',
    type: 'Major Terminal',
    modes: ['Bike', 'Auto', 'Cab', 'Bus'],
    distFromStart: '0 km',
    avgWait: '1 min',
    popularSpot: 'Railway Station & Bus Hub'
  },
  {
    id: 'st-2',
    name: 'Egmore',
    code: 'MS',
    type: 'Junction',
    modes: ['Bike', 'Auto', 'Cab', 'Bus'],
    distFromStart: '3.5 km',
    avgWait: '2 min',
    popularSpot: 'Government Hospital & Metro Station'
  },
  {
    id: 'st-3',
    name: 'Saidapet',
    code: 'SP',
    type: 'Transit Node',
    modes: ['Bike', 'Auto', 'Bus'],
    distFromStart: '9.2 km',
    avgWait: '2 min',
    popularSpot: 'Anna Salai Arterial Corridor'
  },
  {
    id: 'st-4',
    name: 'Guindy',
    code: 'GDY',
    type: 'IT & Hub Node',
    modes: ['Bike', 'Auto', 'Cab', 'Bus'],
    distFromStart: '14.8 km',
    avgWait: '1 min',
    popularSpot: 'Olympia Tech Park & Race Course'
  },
  {
    id: 'st-5',
    name: 'Pallavaram',
    code: 'PV',
    type: 'Residential Hub',
    modes: ['Bike', 'Auto', 'Bus'],
    distFromStart: '20.1 km',
    avgWait: '3 min',
    popularSpot: 'GST Road Commercial Belt'
  },
  {
    id: 'st-6',
    name: 'Tambaram',
    code: 'TBM',
    type: 'Major Terminal',
    modes: ['Bike', 'Auto', 'Cab', 'Bus'],
    distFromStart: '27.4 km',
    avgWait: '2 min',
    popularSpot: 'Terminal Junction & MEPZ IT Zone'
  }
];

const MetroPolyline = () => {
  const [selectedStation, setSelectedStation] = useState(corridorData[3]); // Default Guindy
  const [hoveredStation, setHoveredStation] = useState(null);
  const [vehProgress, setVehProgress] = useState(60);

  const activeStation = hoveredStation || selectedStation;

  // Smooth vehicle position animation on polyline track
  useEffect(() => {
    const activeIdx = corridorData.findIndex(s => s.id === activeStation.id);
    const targetPct = (activeIdx / (corridorData.length - 1)) * 100;
    setVehProgress(targetPct);
  }, [activeStation]);

  return (
    <section id="routes" className={styles.polylineSection}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        {/* Compact Section Header */}
        <div className={styles.sectionHeader}>
          {/* Small Pill Badge */}
          <motion.div 
            className={styles.sectionTag}
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <span className={styles.tagIconYellow}>◇</span>
            <span>METRO POLYLINE CORRIDOR</span>
          </motion.div>

          {/* Main Heading: No Repetition */}
          <motion.h2 
            className={styles.sectionTitle}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className={styles.headlinePrimary}>Anywhere Along the Route.</span>
            <span className={styles.headlineSecondary}>Choose Your Pickup. Choose Your Drop.</span>
          </motion.h2>

          {/* Subtext Description */}
          <motion.p 
            className={styles.sectionSubtitle}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Choose any pickup and drop location within a covered corridor. Your active pass unlocks{' '}
            <span className={styles.subtitleHighlight}>eligible rides</span> between connected locations.
          </motion.p>
        </div>

        {/* Interactive Metro Map Container */}
        <motion.div 
          className={styles.mapCard}
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          {/* Top Corridor Info Bar */}
          <div className={styles.mapTopInfo}>
            <div className={styles.corridorBadge}>
              <span className={styles.pulseDot} />
              <span>MAIN CORRIDOR #01: CHENNAI CENTRAL TO TAMBARAM</span>
            </div>
            <div className={styles.corridorStats}>
              <span>27.4 KM COVERED</span>
              <span>•</span>
              <span>6 FIXED STATIONS</span>
              <span>•</span>
              <span className={styles.yellowText}>PASS ELIGIBLE</span>
            </div>
          </div>

          {/* Helper Interaction Hint */}
          <div className={styles.routeInteractionHint}>
            <span className={styles.hintDot} />
            <span>Select any two connected locations</span>
          </div>

          {/* Metro Route Track Canvas Container (Scrollable on Mobile) */}
          <div className={styles.metroScrollWrapper}>
            <div className={styles.metroCanvas}>
              <svg className={styles.svgTrack} viewBox="0 0 1000 100" preserveAspectRatio="none">
                {/* Inactive Route Base Track (#D9E5F0) */}
                <line x1="50" y1="50" x2="950" y2="50" stroke="#D9E5F0" strokeWidth="6" strokeLinecap="round" />
                
                {/* Active Route Segment Line (#E8C84A) */}
                <motion.line 
                  x1="50" 
                  y1="50" 
                  x2={50 + (vehProgress / 100) * 900} 
                  y2="50" 
                  stroke="#E8C84A" 
                  strokeWidth="6" 
                  strokeLinecap="round"
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </svg>

              {/* Small Animated Vehicle Marker along Route */}
              <motion.div 
                className={styles.movingVehicleTag}
                animate={{ left: `calc(5% + (${vehProgress}% * 0.9))` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <div className={styles.vehicleWrapperSmall}>
                  <AutoRickshawIcon size={16} className={styles.vehicleBlueIcon} />
                </div>
              </motion.div>

              {/* Station Nodes along the Track */}
              <div className={styles.nodesContainer}>
                {corridorData.map((station, idx) => {
                  const isSelected = selectedStation.id === station.id;
                  const isHovered = hoveredStation?.id === station.id;
                  const isActive = isSelected || isHovered;

                  const isTerminalPickup = idx === 0;
                  const isTerminalDrop = idx === corridorData.length - 1;

                  let tooltipText = 'Station Node';
                  if (isTerminalPickup) tooltipText = 'Pickup Available';
                  else if (isTerminalDrop) tooltipText = 'Drop Available';
                  else tooltipText = 'Pass Covered Node';

                  return (
                    <button
                      key={station.id}
                      type="button"
                      className={`${styles.nodeWrapper} ${isActive ? styles.nodeWrapperActive : ''}`}
                      onClick={() => setSelectedStation(station)}
                      onMouseEnter={() => setHoveredStation(station)}
                      onMouseLeave={() => setHoveredStation(null)}
                    >
                      {/* Hover / Active Tooltip */}
                      {isActive && (
                        <motion.div 
                          className={styles.nodeTooltip}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {tooltipText}
                        </motion.div>
                      )}

                      {/* Station Node Circle */}
                      <div className={`${styles.nodeCircle} ${isActive ? styles.circleActive : ''}`}>
                        {isTerminalPickup || isTerminalDrop ? (
                          <LocationIcon size={14} />
                        ) : isActive ? (
                          <div className={styles.activeYellowCenter} />
                        ) : (
                          <StationPointIcon size={20} />
                        )}
                      </div>

                      {/* Station Label & Code */}
                      <div className={styles.nodeLabelGroup}>
                        <span className={`${styles.stationTitle} ${isActive ? styles.titleActive : ''}`}>
                          {station.name}
                        </span>
                        <span className={styles.stationCodeBadge}>{station.code}</span>
                      </div>

                      {/* Active Pulse Halo */}
                      {isActive && <div className={styles.nodeHalo} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Station Details & Transport Compatibility Panel */}
          <div className={styles.detailCardGrid}>
            {/* Left Box: Station Overview */}
            <div className={styles.stationOverview}>
              <div className={styles.overviewHeader}>
                <div className={styles.pinWrapper}>
                  <LocationIcon size={22} />
                </div>
                <div>
                  <h3 className={styles.activeStationName}>{activeStation.name}</h3>
                  <span className={styles.activeStationType}>{activeStation.type} · {activeStation.code}</span>
                </div>
              </div>

              <div className={styles.metaRowGrid}>
                <div className={styles.metaBox}>
                  <span className={styles.metaLabel}>DISTANCE FROM START</span>
                  <span className={styles.metaValue}>{activeStation.distFromStart}</span>
                </div>
                <div className={styles.metaBox}>
                  <span className={styles.metaLabel}>AVG VEHICLE WAIT</span>
                  <span className={styles.metaValue}>{activeStation.avgWait}</span>
                </div>
                <div className={styles.metaBox}>
                  <span className={styles.metaLabel}>KEY LANDMARK</span>
                  <span className={styles.metaValue}>{activeStation.popularSpot}</span>
                </div>
              </div>
            </div>

            {/* Right Box: Transport Pass Coverage */}
            <div className={styles.modesOverview}>
              <div className={styles.modesHeader}>
                <span className={styles.modesHeaderTitle}>Pass Covered Vehicles at Station:</span>
                <span className={styles.freeRideBadge}>₹0 Fare with Active Pass</span>
              </div>

              <div className={styles.modesList}>
                <div className={`${styles.modePill} ${activeStation.modes.includes('Bike') ? styles.modeActive : styles.modeDisabled}`}>
                  <BikeIcon size={16} />
                  <span>Bike Pass</span>
                  <span className={styles.statusDot} />
                </div>

                <div className={`${styles.modePill} ${activeStation.modes.includes('Auto') ? styles.modeActive : styles.modeDisabled}`}>
                  <AutoRickshawIcon size={16} />
                  <span>Auto Pass</span>
                  <span className={styles.statusDot} />
                </div>

                <div className={`${styles.modePill} ${activeStation.modes.includes('Cab') ? styles.modeActive : styles.modeDisabled}`}>
                  <CarIcon size={16} />
                  <span>Cab Pass</span>
                  <span className={styles.statusDot} />
                </div>

                <div className={`${styles.modePill} ${activeStation.modes.includes('Bus') ? styles.modeActive : styles.modeDisabled}`}>
                  <BusIcon size={16} />
                  <span>Bus Pass</span>
                  <span className={styles.statusDot} />
                </div>
              </div>

              <a href="#hero" className={styles.verifyRouteBtn}>
                <span>Verify Pickup & Drop Eligibility</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MetroPolyline;
