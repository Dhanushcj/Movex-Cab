import re

file_path = r'g:\Dhanush\New folder\Movex-Cab\customer-app\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the corrupted section - the HOME TAB comment that was embedded inside Modal JSX
# and remove everything from "returnTime" line to the broken closing of the Modal
# Then re-insert the correct modal closing content

# Step 1: Fix the Modal - the code got broken at the returnTime line
# We need to restore the end of the Modal and then have the HOME TAB properly after it

broken_modal_end = """      returnTime: schedulePayload.returnTime ? schedulePayload.returnTime.toISOString().split('T')[1].substring(0,5) : null,
                     startMonth: schedulePayload.startMonth,
                     numberOfMonths: schedulePayload.numMonths
                   });
                   if (res.data.success) {
                     Alert.alert('Monthly Schedule Created', 'Your monthly commute has been scheduled successfully!');
                     setShowMonthlyPayment(false);
                     if (res.data.data && res.data.data.rides && res.data.data.rides.length > 0) {
                       const upcoming = res.data.data.rides[0];
                       setScheduledRide({
                         ...upcoming,
                         pickup: upcoming.pickup?.address || pickupAddr,
                         drop: upcoming.drop?.address || dropAddr
                       });
                     } else {
                       setScheduledRide({ pickup: pickupAddr, drop: dropAddr });
                     }
                     setPickupAddr('');
                     setDropAddr('');
                     setPickupCoords(null);
                     setDropCoords(null);
                     setEstimates([]);
                     setPickerMode(null);
                   }
                 } catch (e) {
                   console.error(e);
                   Alert.alert('Error', 'Failed to schedule ride.');
                 }
                 setProcessingMonthlyPayment(false);
               }}
            />
          </View>
        </Modal>
      )}"""

# Find what's currently in the file instead
# Let's search for "tripType: schedulePayload.tripType," and see what follows
idx = content.find("tripType: schedulePayload.tripType,")
if idx == -1:
    print("ERROR: Could not find tripType line!")
    exit(1)

print(f"Found tripType at index {idx}")

# Find what follows it (up to the HOME TAB marker)
home_tab_marker = "{/* ─────────────────── HOME TAB ─────────────────── */}"
home_tab_idx = content.find(home_tab_marker)
if home_tab_idx == -1:
    print("ERROR: Could not find HOME TAB marker!")
    exit(1)

print(f"Found HOME TAB marker at index {home_tab_idx}")

# The broken bit is between tripType line end and the HOME TAB marker
# We need to:
# 1. Replace from "tripType:" to HOME TAB marker with proper modal close + HOME TAB start

# Find the actual end of the tripType line
triptype_end = content.find('\n', idx) + 1

# Build the replacement: proper modal close then HOME TAB
proper_modal_close = """      returnTime: schedulePayload.returnTime ? schedulePayload.returnTime.toISOString().split('T')[1].substring(0,5) : null,
                     startMonth: schedulePayload.startMonth,
                     numberOfMonths: schedulePayload.numMonths
                   });
                   if (res.data.success) {
                     Alert.alert('Monthly Schedule Created', 'Your monthly commute has been scheduled successfully!');
                     setShowMonthlyPayment(false);
                     if (res.data.data && res.data.data.rides && res.data.data.rides.length > 0) {
                       const upcoming = res.data.data.rides[0];
                       setScheduledRide({
                         ...upcoming,
                         pickup: upcoming.pickup?.address || pickupAddr,
                         drop: upcoming.drop?.address || dropAddr
                       });
                     } else {
                       setScheduledRide({ pickup: pickupAddr, drop: dropAddr });
                     }
                     setPickupAddr('');
                     setDropAddr('');
                     setPickupCoords(null);
                     setDropCoords(null);
                     setEstimates([]);
                     setPickerMode(null);
                   }
                 } catch (e) {
                   console.error(e);
                   Alert.alert('Error', 'Failed to schedule ride.');
                 }
                 setProcessingMonthlyPayment(false);
               }}
            />
          </View>
        </Modal>
      )}

"""

# Now build the complete HOME TAB section (clean, standalone)
home_tab_new = """      {/* ─────────────────── HOME TAB ─────────────────── */}
      {activeTab === 'home' && (
        <View style={{ flex: 1 }}>

          {/* STATE 1: DASHBOARD - shown when not in any booking flow */}
          {(!dropAddr && (!estimates || estimates.length === 0) && pickerMode === null && !bookingRide && !showMap && !showRouteBookingSheet && bookingMode !== 'metro') ? (
            <DashboardUI
              user={user}
              activePasses={activePasses}
              onProfilePress={onNavigateProfile}
              onNotificationPress={() => setShowNotificationScreen(true)}
              onBuyPass={() => setShowPassConfig(true)}
              onBookRide={() => { setBookingMode('metro'); setSelectedMetroRoute(null); setShowMap(true); }}
              onScheduleRide={() => { setIsScheduling(true); setShowScheduleRideScreen(true); }}
              onTrackRide={() => {
                if (scheduledRide.status === 'scheduled') {
                  Alert.alert('Scheduled Ride', 'Driver will be assigned 15 minutes before the pickup time.');
                } else {
                  API.get('/users/me/rides').then(res => {
                    if (res.data.success) {
                      const activeBooking = res.data.data.find((r: any) => r.scheduledRideId === scheduledRide._id && !['completed', 'cancelled'].includes(r.status));
                      if (activeBooking) {
                        onRideBooked(activeBooking);
                      } else {
                        Alert.alert('Ride Update', 'Could not find active tracking details. Please check your rides history.');
                      }
                    }
                  }).catch(() => {
                    Alert.alert('Error', 'Failed to fetch ride tracking info.');
                  });
                }
              }}
              scheduledRide={scheduledRide}
              onCancelScheduledRide={(id: string) => {
                Alert.alert(
                  "Cancel Scheduled Ride",
                  "Are you sure you want to cancel this scheduled ride?",
                  [
                    { text: "No", style: "cancel" },
                    { text: "Yes", onPress: () => {
                        API.post(`/scheduled-rides/${id}/cancel`)
                          .then(res => {
                            if (res.data && res.data.success) {
                              setScheduledRide(null);
                              Alert.alert('Success', 'Scheduled ride cancelled successfully.');
                            } else {
                              Alert.alert('Error', res.data?.message || 'Failed to cancel scheduled ride.');
                            }
                          })
                          .catch(err => {
                            Alert.alert('Error', err.response?.data?.message || 'Failed to cancel scheduled ride.');
                          });
                      }
                    }
                  ]
                );
              }}
            />

          ) : (bookingMode === 'metro' && showMap) ? (

            // ─────────────────── METRO MAP SCREEN ───────────────────
            <View style={{ flex: 1 }}>
              {/* Back button - always on top */}
              <TouchableOpacity
                onPress={() => {
                  if (selectedMetroRoute) {
                    setSelectedMetroRoute(null);
                    setShowRouteBookingSheet(false);
                  } else {
                    setShowMap(false);
                    setBookingMode('ride');
                  }
                }}
                style={{ position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 16, zIndex: 200, width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 10 }}
              >
                <Feather name="arrow-left" size={22} color="#262D36" />
              </TouchableOpacity>

              {/* Title badge */}
              {!selectedMetroRoute && (
                <View style={{ position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 76, right: 16, zIndex: 200, height: 44, backgroundColor: '#fff', borderRadius: 22, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 8 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#262D36' }}>Select a Route</Text>
                </View>
              )}

              {/* Full-screen interactive map with NO transparent overlays blocking touch */}
              <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                customMapStyle={LIGHT_MAP_STYLE}
                showsUserLocation={true}
                showsMyLocationButton={false}
                initialRegion={{
                  latitude: location?.coords.latitude ?? 11.1271,
                  longitude: location?.coords.longitude ?? 78.6569,
                  latitudeDelta: 0.25,
                  longitudeDelta: 0.25,
                }}
                scrollEnabled={true}
                zoomEnabled={true}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                {/* All routes (unselected) */}
                {!selectedMetroRoute && allMetroRoutes.map((route: any, idx: number) => {
                  const colorsArr = ['#0053B3', '#D49F0C', '#10B981', '#EF4444', '#8B5CF6'];
                  const routeColor = colorsArr[idx % colorsArr.length];
                  if (!route.polyline) return null;
                  return (
                    <Polyline
                      key={`metro-all-${route._id}`}
                      coordinates={decodePolyline(route.polyline)}
                      strokeColor={routeColor}
                      strokeWidth={6}
                      lineCap="round"
                      tappable={true}
                      onPress={() => {
                        setSelectedMetroRoute({ route, color: routeColor });
                        setShowRouteBookingSheet(true);
                        const coords = decodePolyline(route.polyline);
                        setTimeout(() => {
                          mapRef.current?.fitToCoordinates(coords, {
                            edgePadding: { top: 120, right: 50, bottom: 420, left: 50 },
                            animated: true
                          });
                        }, 100);
                      }}
                    />
                  );
                })}

                {/* Selected route polyline */}
                {selectedMetroRoute?.route?.polyline && (
                  <Polyline key="selected-metro" coordinates={decodePolyline(selectedMetroRoute.route.polyline)} strokeColor={selectedMetroRoute.color} strokeWidth={7} lineCap="round" />
                )}

                {/* Stop markers on selected route */}
                {selectedMetroRoute?.route?.junctions?.map((j: any, i: number) => (
                  <Marker key={`stop-${i}`} coordinate={{ latitude: j.location.coordinates[1], longitude: j.location.coordinates[0] }}>
                    <View style={{ alignItems: 'center' }}>
                      <View style={{ paddingHorizontal: 8, paddingVertical: 3, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 10, marginBottom: 4, borderWidth: 1.5, borderColor: selectedMetroRoute.color }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: selectedMetroRoute.color }}>{j.name}</Text>
                      </View>
                      <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#FFF', borderWidth: 3, borderColor: selectedMetroRoute.color }} />
                    </View>
                  </Marker>
                ))}

                {/* Walking path to pickup */}
                {metroPickup && location && (
                  <Polyline
                    coordinates={[
                      { latitude: location.coords.latitude, longitude: location.coords.longitude },
                      { latitude: metroPickup.location.coordinates[1], longitude: metroPickup.location.coordinates[0] }
                    ]}
                    strokeColor="#666" strokeWidth={3} lineDashPattern={[5, 5]}
                  />
                )}

                {/* Nearby drivers */}
                {nearbyDrivers.map((d: any, i: number) => (
                  <Marker key={`drv-${d._id || i}`} coordinate={{ latitude: d.currentLocation.coordinates[1], longitude: d.currentLocation.coordinates[0] }}>
                    <Image source={getVehicle3DIcon(d.vehicle?.type || '')} style={{ width: 44, height: 44, resizeMode: 'contain' }} />
                  </Marker>
                ))}
              </MapView>
            </View>

          ) : (
"""

# Find the end of the old HOME TAB section that we need to skip
# We want to keep everything from the BOTTOM CARD onwards
bottom_card_marker = "          {/* ── BOTTOM CARD ── */"
bottom_card_idx = content.find(bottom_card_marker, home_tab_idx)
if bottom_card_idx == -1:
    print("ERROR: Could not find BOTTOM CARD marker!")
    exit(1)
print(f"Found BOTTOM CARD at index {bottom_card_idx}")

# Build the new content:
# 1. Everything before the "tripType: schedulePayload.tripType," line
before_triptype = content[:idx]

# 2. Proper modal close
# 3. New HOME TAB start up to (but not including) BOTTOM CARD
# 4. Old else branch: View + BOTTOM CARD content onwards

new_else_open = "            <View style={{ flex: 1 }}>\n"

# Find the closing of the entire HOME TAB section
# It ends with the PASS TAB section
pass_tab_marker = "      {/* ─────────────────── PASS TAB (REDESIGNED) ─────────────────── */"
pass_tab_idx = content.find(pass_tab_marker)
if pass_tab_idx == -1:
    # Try alternative
    pass_tab_marker = "{activeTab === 'wallet' &&"
    pass_tab_idx = content.find(pass_tab_marker)
    print(f"Using alternative PASS TAB marker, found at {pass_tab_idx}")
else:
    print(f"Found PASS TAB at index {pass_tab_idx}")

# Everything from BOTTOM CARD to just before PASS TAB is the old else branch content
old_else_content = content[bottom_card_idx:pass_tab_idx]

# Check for correct closing of the else branch
# The HOME TAB section should close with:
#   </View>   <- closes the else <View style={{ flex: 1 }}>
#   )}         <- closes the HOME TAB ternary
#   )}         <- closes the activeTab === 'home' conditional
# Check what's currently there:
print("Old else content ending (last 200 chars):")
print(repr(old_else_content[-200:]))

# Build the new content
new_content = (
    before_triptype +
    proper_modal_close +
    home_tab_new +
    new_else_open +
    old_else_content
)

# Now append everything after pass_tab_idx
new_content += content[pass_tab_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"\nDone! New file length: {len(new_content)} chars (original: {len(content)} chars)")
