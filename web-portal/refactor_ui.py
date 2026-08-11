import os
import re

jsx_path = r"g:\Dhanush\New folder\Movex-Cab\web-portal\src\pages\CustomerBooking.jsx"
css_path = r"g:\Dhanush\New folder\Movex-Cab\web-portal\src\pages\CustomerBooking.module.css"

with open(jsx_path, "r", encoding="utf-8") as f:
    jsx_content = f.read()

# Make sure we add necessary Lucide icons
icons_needed = ["MapPin", "Users", "CheckCircle2", "ChevronRight", "Navigation", "Bell", "User", "Ticket", "Search", "LocateFixed", "Check", "ChevronDown", "ArrowUpDown", "Info"]
# Let's just find the existing lucide import and replace it
import_match = re.search(r"import\s+\{([^}]+)\}\s+from\s+'lucide-react';", jsx_content)
if import_match:
    existing_icons = [i.strip() for i in import_match.group(1).split(',')]
    all_icons = list(set(existing_icons + icons_needed))
    jsx_content = jsx_content.replace(import_match.group(0), f"import {{ {', '.join(all_icons)} }} from 'lucide-react';")

# Find the main return block
return_start = jsx_content.find("  return (\\n    <div className={styles.bookingWrapper}>")
if return_start == -1:
    return_start = jsx_content.find("  return (\\n    <div")

return_end = jsx_content.rfind(");") + 2

if return_start != -1 and return_end != -1:
    new_return_block = """  return (
    <div className={styles.pageWrapper}>
      {/* GLOBAL TOP HEADER */}
      <div className={styles.globalTopHeader}>
        <div className={styles.headerTitleArea}>
          <h1 className={styles.mainTitle}>Book a Ride</h1>
          <p className={styles.subTitle}>Choose your route and ride type</p>
        </div>
        <div className={styles.headerProfileArea}>
          <div className={styles.notificationWrapper}>
            <Bell size={20} color="#64748b" />
            <span className={styles.notificationBadge}>3</span>
          </div>
          <div className={styles.userProfileBtn}>
            <div className={styles.userAvatar}>DC</div>
            <span className={styles.userName}>Dhanush Chakravarthy</span>
            <ChevronDown size={16} color="#64748b" />
          </div>
        </div>
      </div>

      <div className={styles.bookingSplitWrapper}>
        {/* LEFT SIDEBAR PANEL */}
        <div className={styles.sidebarPanel}>
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
                      <span className={styles.locValueMain}>{pickupLocation ? pickupLocation.name.split(',')[0] : "Select from map..."}</span>
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
                      <span className={styles.locValueMain}>{dropLocation ? dropLocation.name.split(',')[0] : "Select from map..."}</span>
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
                  <span className={styles.routeMeta}>Distance 48 km <span className={styles.bullet}>•</span> Est. time 55 min</span>
                </div>
              )}
            </div>

            {pickupLocation && dropLocation && (
              <>
                <div className={styles.passCard}>
                  <div className={styles.passLeft}>
                    <div className={styles.passIcon}><Ticket size={24} color="var(--forge-blue)" /></div>
                    <div className={styles.passInfo}>
                      <h4>Gold Mobility Pass Applied</h4>
                      <p><span className={styles.strikeThru}>₹180.00</span> fare waived on this route</p>
                    </div>
                  </div>
                  <div className={styles.passRight}>
                    <div className={styles.passStatus}>ACTIVE</div>
                    <a href="#" className={styles.viewPassLink}>View Pass →</a>
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
                            <Icon size={32} color={isSelected ? "#1e293b" : "#1e293b"} />
                          </div>
                          <div className={styles.vehicleInfo}>
                            <h4>{v.name}</h4>
                            <p className={styles.etaText}>{v.time} away</p>
                            <div className={styles.priceRow}>
                              <span className={styles.priceText}>₹{v.baseFare}.00</span>
                              <Info size={14} color="#94a3b8" />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className={styles.fareSummaryCard}>
                  <div className={styles.summaryHeader}>
                    <h3 className={styles.summaryTitle}>Fare Summary <span className={styles.summaryBadge}>(Gold Pass Applied)</span></h3>
                    <div className={styles.savingsRow}>
                      You save ₹180.00
                    </div>
                  </div>
                  
                  <div className={styles.fareGridRow}>
                    <div className={styles.fareCol}>
                      <span className={styles.fareLabel}>Base Fare</span>
                      <span className={styles.fareValue}>₹180.00</span>
                    </div>
                    <div className={styles.fareCol}>
                      <span className={styles.fareLabel}>Pass Discount</span>
                      <span className={styles.fareValueDiscount}>-₹180.00</span>
                    </div>
                    <div className={styles.fareCol}>
                      <span className={styles.fareLabel}>Taxes & Fees</span>
                      <span className={styles.fareValue}>₹0.00</span>
                    </div>
                    <div className={styles.fareColTotal}>
                      <span className={styles.fareLabelTotal}>Total Fare</span>
                      <span className={styles.fareValueTotal}>₹0.00</span>
                    </div>
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
                   <div className={styles.metaIcon}><MapPin size={12}/></div> 48 km &nbsp;&nbsp; <div className={styles.metaIcon}>⏳</div> 55 min
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
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#1d4ed8',
                    fillOpacity: 1,
                    strokeWeight: 4,
                    strokeColor: '#FFFFFF',
                  }}
                  title="Pickup Point"
                />
              )}
              
              {/* Custom Drop Marker */}
              {dropLocation && (
                <Marker
                  position={{ lat: dropLocation.location.coordinates[1], lng: dropLocation.location.coordinates[0] }}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#EF4444',
                    fillOpacity: 1,
                    strokeWeight: 4,
                    strokeColor: '#FFFFFF',
                  }}
                  title="Drop-off Point"
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
  );"""
    jsx_content = jsx_content[:return_start] + new_return_block + jsx_content[return_end:]

with open(jsx_path, "w", encoding="utf-8") as f:
    f.write(jsx_content)

css_complete = """
.pageWrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background: #f8fafc;
  overflow: hidden;
}

.globalTopHeader {
  height: 80px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32px;
  flex-shrink: 0;
  z-index: 20;
}

.headerTitleArea {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mainTitle {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.subTitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.headerProfileArea {
  display: flex;
  align-items: center;
  gap: 24px;
}

.notificationWrapper {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.notificationBadge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #FBBF24;
  color: #1e293b;
  font-size: 10px;
  font-weight: 700;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid #ffffff;
}

.userProfileBtn {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  transition: background 0.2s;
}

.userProfileBtn:hover {
  background: #f1f5f9;
}

.userAvatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #eff6ff;
  color: var(--forge-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.userName {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.bookingSplitWrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebarPanel {
  width: 460px;
  background: #ffffff;
  background-image: 
    linear-gradient(to right, rgba(0, 83, 179, 0.02) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 83, 179, 0.02) 1px, transparent 1px);
  background-size: 20px 20px;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  z-index: 10;
  overflow-y: auto;
  padding: 0;
}

.sidebarContent {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 32px 32px 32px;
}

/* Step Indicator Overhaul */
.stepIndicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 32px 16px 32px;
}

.stepItem {
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.stepItem.active {
  opacity: 1;
}

.stepCircle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.3s ease;
}

.stepItem.active .stepCircle {
  background-color: var(--forge-blue);
  color: white;
}

.stepItem span {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  display: flex;
  flex-direction: column;
}

.stepItem span::after {
  content: "Select path";
  font-size: 11px;
  font-weight: 400;
  color: #94a3b8;
  margin-top: 2px;
}
.stepItem:nth-child(3) span::after {
  content: "Choose ride";
}
.stepItem:nth-child(5) span::after {
  content: "Review & book";
}

.stepItem.active span {
  color: var(--forge-blue);
}
.stepItem.active span::after {
  color: #64748b;
}

.stepLine {
  flex: 1;
  height: 1px;
  background-color: #e2e8f0;
  margin: 0 16px;
  transition: all 0.3s ease;
}

.stepLine.activeLine {
  background-color: #94a3b8;
}


.sectionTitleMain {
  font-size: 18px;
  font-weight: 700;
  color: var(--forge-blue);
  margin-top: 16px;
  margin-bottom: 16px;
}

.bookingStateCard {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}

.locationsSummary {
  position: relative;
  display: flex;
  flex-direction: column;
}

.locInputWrapper {
  display: flex;
  padding: 16px;
  gap: 16px;
}

.locInputWrapper:first-child {
  border-bottom: 1px solid #f1f5f9;
}

.locDotWrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 16px;
  padding-top: 6px;
  position: relative;
}

.locDot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--forge-blue);
}

.locLine {
  width: 1px;
  height: 50px;
  background: #e2e8f0;
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.locDotDrop {
  width: 10px;
  height: 10px;
  background: #ef4444;
}

.inputArea {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.locLabel {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.inputField {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.locValueMain {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.useCurrentBtn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: var(--forge-blue);
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s;
}
.useCurrentBtn:hover {
  background: #f1f5f9;
}

.swapBtnWrapper {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
}

.swapBtn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.2s;
}
.swapBtn:hover {
  background: #f8fafc;
}

.routeDistanceInfo {
  background: #ffffff;
  padding: 12px 16px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

.routePathText {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--forge-blue);
  background: #eff6ff;
  padding: 4px 10px;
  border-radius: 12px;
}

.routeMeta {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}
.bullet { margin: 0 4px; opacity: 0.5; }

/* Pass Card */
.passCard {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
}

.passLeft {
  display: flex;
  align-items: center;
  gap: 16px;
}

.passIcon {
  width: 44px;
  height: 44px;
  background: #ffffff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.2);
}

.passInfo h4 {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.passInfo p {
  font-size: 13px;
  color: #475569;
}
.strikeThru { text-decoration: line-through; opacity: 0.6; }

.passRight {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.passStatus {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #34d399;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.viewPassLink {
  font-size: 12px;
  font-weight: 600;
  color: var(--forge-blue);
  text-decoration: none;
}

/* Vehicle Selection - HORIZONTAL GRID */
.vehicleGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.vehicleCard {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;
  position: relative;
  text-align: center;
}

.vehicleCard:hover {
  border-color: #cbd5e1;
}

.vehicleCard.selected {
  border-color: #FBBF24;
  background: #fffbeb;
  border-width: 2px;
  padding: 15px 7px; /* compensate for border width */
}

.checkIcon {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #FBBF24;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vehicleImage {
  margin-bottom: 12px;
}

.vehicleInfo h4 {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.etaText {
  font-size: 11px;
  color: #64748b;
  margin-bottom: 8px;
}

.priceRow {
  display: flex;
  align-items: center;
  gap: 4px;
}

.priceText {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}


/* Fare Summary */
.fareSummaryCard {
  background: #ffffff;
  border-radius: 16px;
  padding: 0;
  margin-top: 32px;
}

.summaryHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.summaryTitle {
  font-size: 15px;
  font-weight: 700;
  color: var(--forge-blue);
  display: flex;
  align-items: center;
  gap: 8px;
}

.summaryBadge {
  font-size: 12px;
  font-weight: 600;
  color: #d97706;
}

.savingsRow {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 12px;
}

.fareGridRow {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  border-top: 1px solid #e2e8f0;
  padding-top: 20px;
}

.fareCol, .fareColTotal {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fareColTotal {
  border-left: 1px solid #e2e8f0;
  padding-left: 16px;
}

.fareLabel {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.fareValue {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.fareValueDiscount {
  font-size: 16px;
  font-weight: 700;
  color: #059669;
}

.fareLabelTotal {
  font-size: 12px;
  color: var(--forge-blue);
  font-weight: 700;
}

.fareValueTotal {
  font-size: 18px;
  font-weight: 800;
  color: var(--forge-blue);
}

.actionFooter {
  margin-top: 24px;
}

.btnPrimary {
  width: 100%;
  padding: 16px;
  background-color: #FBBF24;
  color: #1e293b;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btnPrimary:hover:not(:disabled) {
  background-color: #f59e0b;
}


/* MAP Container & Overlays */
.mapContainer {
  flex: 1;
  position: relative;
  background: #f1f5f9;
}

.mapTopOverlay {
  position: absolute;
  top: 24px;
  left: 24px;
  background: #ffffff;
  padding: 16px 20px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.overlayRouteText {
  font-size: 16px;
  color: var(--forge-blue);
}
.overlayRouteText span { color: #94a3b8; margin: 0 4px; }
.overlayRouteText strong { font-weight: 700; }

.overlayRouteMeta {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}
.metaIcon { display: inline-flex; margin-right: 6px; }


.mapBottomOverlay {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  padding: 16px 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.nearbyTitle {
  font-size: 13px;
  font-weight: 600;
  color: var(--forge-blue);
}

.nearbyGrid {
  display: flex;
  gap: 20px;
}

.nearbyItem {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}
.nIcon { font-size: 16px; }

/* Existing stuff for loading etc */
.searchingOverlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 50;
  backdrop-filter: blur(4px);
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: var(--forge-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}
@keyframes spin { 100% { transform: rotate(360deg); } }

"""

with open(css_path, "w", encoding="utf-8") as f:
    f.write(css_complete)

print("UI successfully rebuilt!")
