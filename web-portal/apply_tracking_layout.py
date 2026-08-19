import os
import re

jsx_path = r"g:\Dhanush\New folder\Movex-Cab\web-portal\src\pages\CustomerTracking.jsx"
css_path = r"g:\Dhanush\New folder\Movex-Cab\web-portal\src\pages\CustomerBooking.module.css"

with open(jsx_path, "r", encoding="utf-8") as f:
    jsx_content = f.read()

# Make sure we have the required icons
icons_needed = ["MapPin", "Phone", "MessageSquare", "ShieldCheck", "CheckCircle2", "Navigation", "Share2", "Bell", "User", "Star", "Car"]
import_match = re.search(r"import\s+\{([^}]+)\}\s+from\s+'lucide-react';", jsx_content)
if import_match:
    existing_icons = [i.strip() for i in import_match.group(1).split(',')]
    all_icons = list(set(existing_icons + icons_needed))
    jsx_content = jsx_content.replace(import_match.group(0), f"import {{ {', '.join(all_icons)} }} from 'lucide-react';")

# Add timer state if not exists
if "const [timer, setTimer] = useState(300);" not in jsx_content:
    hook_insert_point = jsx_content.find("  const [directions, setDirections] = useState(null);")
    if hook_insert_point != -1:
        insert_idx = jsx_content.find("\n", hook_insert_point)
        jsx_content = jsx_content[:insert_idx] + "\n  const [timer, setTimer] = useState(300);\n" + jsx_content[insert_idx:]

# Add timer effect
timer_effect = """
  useEffect(() => {
    if (status === 'accepted' || status === 'arrived') {
      const intervalId = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [status]);
"""
if "setTimer((prev)" not in jsx_content:
    last_effect = jsx_content.rfind("useEffect(() => {")
    if last_effect != -1:
        jsx_content = jsx_content[:last_effect] + timer_effect + "\n" + jsx_content[last_effect:]


return_start = jsx_content.find("  return (\n    <div className={styles.bookingWrapper}>")
if return_start == -1:
    return_start = jsx_content.find("  return (\n    <div")

return_end = jsx_content.rfind(");") + 2

if return_start != -1 and return_end != -1:
    new_return_block = """  const formatTime = (seconds) => {
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
              {decodedRoute.length > 0 && !directions && (
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

              {directions && (
                <DirectionsRenderer 
                  directions={directions} 
                  options={{
                    polylineOptions: { strokeColor: '#FBBF24', strokeWeight: 6, zIndex: 2 },
                    suppressMarkers: true
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
  );"""
    jsx_content = jsx_content[:return_start] + new_return_block + jsx_content[return_end:]

with open(jsx_path, "w", encoding="utf-8") as f:
    f.write(jsx_content)

# Update CSS for tracking specifics
with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

css_append = """

/* Tracking Page Specific Styles */
.driverProfileCard {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
  margin-bottom: 24px;
}

.driverHeaderRow {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.driverAvatar {
  width: 56px;
  height: 56px;
  background-color: #eff6ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--forge-blue);
  font-weight: 800;
}

.driverMeta {
  flex: 1;
}

.driverMeta h4 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.ratingBadge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f8fafc;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}

.vehicleInfo {
  text-align: right;
  background: #f1f5f9;
  padding: 8px 12px;
  border-radius: 12px;
}

.vehiclePlate {
  font-size: 16px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: 0.5px;
}

.vehicleMake {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  margin-top: 2px;
}

.driverActionGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.driverActionBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s;
}

.driverActionBtn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.otpCard {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #bbf7d0;
  border-radius: 20px;
  padding: 24px;
  text-align: center;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}

.otpHeader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #059669;
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 12px;
}

.otpValue {
  font-size: 48px;
  font-weight: 900;
  letter-spacing: 12px;
  color: #064e3b;
  font-variant-numeric: tabular-nums;
  margin-left: 12px; /* compensate for last letter spacing */
}

.otpTimer {
  font-size: 12px;
  color: #047857;
  font-weight: 500;
  margin-top: 8px;
}

.otpTimer span {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.trackingActionFooter {
  margin-top: auto;
  padding-top: 24px;
}

.actionBtnRow {
  display: flex;
  gap: 12px;
}

.btnSecondaryFlex, .btnSosFlex, .btnCancelFlex {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btnSecondaryFlex {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #1e293b;
}

.btnSecondaryFlex:hover {
  background: #f1f5f9;
}

.btnSosFlex {
  flex: 0.5;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #ef4444;
}

.btnSosFlex:hover {
  background: #fee2e2;
}

.btnCancelFlex {
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
}

.btnCancelFlex:hover {
  background: #fef2f2;
}

"""

if ".driverProfileCard" not in css_content:
    with open(css_path, "a", encoding="utf-8") as f:
        f.write(css_append)

print("Applied tracking layout successfully")
