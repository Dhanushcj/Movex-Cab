import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Image } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import API from '../services/api';

const LIGHT_MAP_STYLE = [
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
];

const decodePolyline = (t: string) => {
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
    i.push({ latitude: r / 1e5, longitude: s / 1e5 });
  }
  return i;
};

const routeColors = ['#0053B3', '#D49F0C', '#10B981', '#EF4444', '#8B5CF6'];

const MetroBookingMap = ({ onClose, onBookTicket, userLocation, nearbyDrivers = [] }: any) => {
  const { colors } = useTheme();
  const mapRef = useRef<MapView>(null);
  
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [pickupJunction, setPickupJunction] = useState<any>(null);
  const [dropJunction, setDropJunction] = useState<any>(null);
  
  const [vehicleType, setVehicleType] = useState<string | null>(null);
  const [isSelectingVehicle, setIsSelectingVehicle] = useState(false);

  useEffect(() => {
    API.get('/route-manager/routes')
      .then(res => {
        if (res.data && res.data.data) {
          const activeRoutes = res.data.data.map((r: any, idx: number) => ({
            ...r,
            displayColor: routeColors[idx % routeColors.length],
            decodedPolyline: r.polyline ? decodePolyline(r.polyline) : []
          }));
          setRoutes(activeRoutes);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedRoute && selectedRoute.decodedPolyline.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(selectedRoute.decodedPolyline, {
        edgePadding: { top: 100, right: 40, bottom: 350, left: 40 },
        animated: true,
      });
    } else if (userLocation && mapRef.current) {
       mapRef.current.animateToRegion({
         latitude: userLocation.latitude,
         longitude: userLocation.longitude,
         latitudeDelta: 0.05,
         longitudeDelta: 0.05,
       });
    }
  }, [selectedRoute, userLocation]);

  const handleRouteSelect = (route: any) => {
    setSelectedRoute(route);
    setPickupJunction(null);
    setDropJunction(null);
    setVehicleType(null);
    setIsSelectingVehicle(false);
  };

  const handleConfirm = () => {
    if (!selectedRoute || !pickupJunction || !dropJunction || !vehicleType) return;
    onBookTicket({
      route: selectedRoute,
      pickupJunction,
      dropoffJunction: dropJunction,
      vehicleType
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        customMapStyle={LIGHT_MAP_STYLE}
        showsUserLocation={true}
        showsMyLocationButton={false}
        initialRegion={{
          latitude: userLocation?.latitude || 11.1271,
          longitude: userLocation?.longitude || 78.6569,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {(routes || []).map(r => {
          if (selectedRoute && selectedRoute._id !== r._id) return null;
          
          return (
            <React.Fragment key={r._id}>
              {(r.decodedPolyline?.length > 0 || r.junctions?.length > 0) && (
                <Polyline
                  coordinates={r.decodedPolyline?.length > 0 ? r.decodedPolyline : r.junctions.map((j: any) => ({
                    latitude: j.location?.coordinates?.[1] || 0,
                    longitude: j.location?.coordinates?.[0] || 0
                  }))}
                  strokeColor={r.displayColor}
                  strokeWidth={selectedRoute ? 5 : 3.5}
                  lineCap="round"
                  lineJoin="round"
                  zIndex={5}
                  tappable={true}
                  onPress={(e) => {
                    if (!selectedRoute) {
                      handleRouteSelect(r);
                      return;
                    }
                    if (selectedRoute._id === r._id) {
                      const coord = e.nativeEvent.coordinate;
                      if (!coord) return; // Fix: TS 'coord' is possibly 'undefined'
                      
                      const customJunction = {
                        _id: `temp-${Date.now()}`,
                        name: !pickupJunction ? 'Custom Pickup' : 'Custom Drop-off',
                        location: { coordinates: [coord.longitude, coord.latitude] }
                      };
                      if (!pickupJunction) {
                        setPickupJunction(customJunction);
                      } else if (!dropJunction) {
                        setDropJunction(customJunction);
                      }
                    }
                  }}
                />
              )}
              
              {r.junctions?.map((j: any) => {
                const isSelectedPickup = pickupJunction?._id === j._id;
                const isSelectedDrop = dropJunction?._id === j._id;
                const isSelected = isSelectedPickup || isSelectedDrop;
                
                return (
                  <Marker 
                    key={j._id} 
                    coordinate={{ latitude: j.location?.coordinates?.[1] || 0, longitude: j.location?.coordinates?.[0] || 0 }}
                    onPress={() => {
                      if (!selectedRoute) {
                        handleRouteSelect(r);
                      } else if (selectedRoute._id === r._id) {
                        if (!pickupJunction) {
                          setPickupJunction(j);
                        } else if (!dropJunction && pickupJunction._id !== j._id) {
                          setDropJunction(j);
                        } else if (pickupJunction._id === j._id) {
                          setPickupJunction(null);
                          setDropJunction(null);
                        } else {
                          setDropJunction(j);
                        }
                      }
                    }}
                    tracksViewChanges={true}
                    style={{ zIndex: isSelected ? 10 : 1 }}
                  >
                    <View style={{ 
                      width: isSelected ? 22 : 14, height: isSelected ? 22 : 14, 
                      borderRadius: isSelected ? 11 : 7, 
                      backgroundColor: isSelectedPickup ? '#10B981' : isSelectedDrop ? '#EF4444' : '#FFF', 
                      borderWidth: isSelected ? 0 : 2.5, borderColor: r.displayColor,
                      shadowColor: '#000', shadowOffset: {width:0,height:1}, shadowOpacity:0.2, shadowRadius:1.5, elevation:2,
                      alignItems: 'center', justifyContent: 'center'
                    }}>
                       {isSelectedPickup && <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF'}}/>}
                       {isSelectedDrop && <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF'}}/>}
                    </View>
                  </Marker>
                );
              })}

              {/* Render custom pickup/dropoff points if they were tapped on the polyline */}
              {[pickupJunction, dropJunction].map((j, idx) => {
                if (!j || !j._id.startsWith('temp-')) return null;
                const isPickup = idx === 0;
                return (
                  <Marker 
                    key={j._id} 
                    coordinate={{ latitude: j.location?.coordinates?.[1] || 0, longitude: j.location?.coordinates?.[0] || 0 }}
                    onPress={() => {
                      if (isPickup) {
                        setPickupJunction(null);
                        setDropJunction(null);
                      } else {
                        setDropJunction(null);
                      }
                    }}
                    style={{ zIndex: 12 }}
                  >
                    <View style={{ 
                      width: 22, height: 22, borderRadius: 11, 
                      backgroundColor: isPickup ? '#10B981' : '#EF4444', 
                      shadowColor: '#000', shadowOffset: {width:0,height:1}, shadowOpacity:0.3, shadowRadius:2, elevation:3,
                      alignItems: 'center', justifyContent: 'center'
                    }}>
                       <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF'}}/>
                    </View>
                  </Marker>
                );
              })}
            </React.Fragment>
          );
        })}

        {(nearbyDrivers || []).map((d: any, i: number) => (
          <Marker key={`driver-${d._id || i}`} coordinate={{ latitude: d.currentLocation?.coordinates?.[1] || 0, longitude: d.currentLocation?.coordinates?.[0] || 0 }} tracksViewChanges={false}>
             <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF', padding: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3, elevation: 4 }}>
                <Image 
                  source={(function(type) {
                    const t = (type||'').toLowerCase();
                    if (t === 'bike') return require('../../assets/bike_realistic.jpg');
                    if (t === 'auto') return require('../../assets/auto_realistic.jpg');
                    return require('../../assets/mini_realistic.jpg');
                  })(d.vehicle?.type)} 
                  style={{ width: 28, height: 28, resizeMode: 'contain' }} 
                />
             </View>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity 
        onPress={() => selectedRoute ? setSelectedRoute(null) : onClose()} 
        style={{ 
          position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 16, zIndex: 100, 
          width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', 
          alignItems: 'center', justifyContent: 'center', 
          shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 
        }}
      >
        <Feather name="chevron-left" size={28} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: colors.bgPrimary, 
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 15
      }}>
        {loading ? (
           <View style={{ padding: 40, alignItems: 'center' }}>
             <ActivityIndicator size="large" color={colors.accent} />
             <Text style={{ marginTop: 16, color: colors.textSecondary }}>Fetching live metro routes...</Text>
           </View>
        ) : !selectedRoute ? (
           <View>
             <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 16 }}>Select a Route</Text>
             {routes.length === 0 ? (
                <Text style={{ color: colors.textSecondary }}>No routes active currently.</Text>
             ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 24, gap: 12 }}>
                  {(routes || []).map(r => (
                    <TouchableOpacity 
                      key={r._id} 
                      onPress={() => handleRouteSelect(r)}
                      style={{ 
                        width: 220, padding: 16, borderRadius: 20, 
                        backgroundColor: r.displayColor + '15',
                        borderWidth: 1, borderColor: r.displayColor + '40'
                      }}
                    >
                       <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: r.displayColor, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                          <Feather name="map" size={20} color="#FFF" />
                       </View>
                       <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 4 }} numberOfLines={1}>{r.name}</Text>
                       <Text style={{ fontSize: 13, color: colors.textSecondary }}>{r.junctions?.length || 0} Stops ΓÇó Tap to select</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
             )}
           </View>
        ) : isSelectingVehicle ? (
           <View>
             <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
               <TouchableOpacity onPress={() => setIsSelectingVehicle(false)} style={{ marginRight: 12 }}>
                 <Feather name="arrow-left" size={24} color={colors.textPrimary} />
               </TouchableOpacity>
               <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.textPrimary }}>Select Vehicle</Text>
             </View>
             
             <View style={{ gap: 12, marginBottom: 20 }}>
               {['Mini', 'Auto', 'Bike'].map(type => (
                 <TouchableOpacity 
                   key={type}
                   onPress={() => setVehicleType(type)}
                   style={{
                     flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16,
                     backgroundColor: vehicleType === type ? '#10B98115' : colors.bgSecondary,
                     borderWidth: 2, borderColor: vehicleType === type ? '#10B981' : 'transparent'
                   }}
                 >
                   <Image 
                     source={type === 'Bike' ? require('../../assets/bike_realistic.jpg') : type === 'Auto' ? require('../../assets/auto_realistic.jpg') : require('../../assets/mini_realistic.jpg')}
                     style={{ width: 40, height: 40, resizeMode: 'contain', marginRight: 16 }}
                   />
                   <View style={{ flex: 1 }}>
                     <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.textPrimary }}>{type}</Text>
                     <Text style={{ fontSize: 13, color: colors.textSecondary }}>Nearest in 2 mins</Text>
                   </View>
                   <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.textPrimary }}>₹{Math.floor(Math.random() * 50) + 30}</Text>
                 </TouchableOpacity>
               ))}
             </View>

             <TouchableOpacity 
               onPress={handleConfirm}
               disabled={!vehicleType}
               style={{ 
                 backgroundColor: !vehicleType ? colors.border : '#000',
                 paddingVertical: 18, borderRadius: 16, alignItems: 'center'
               }}
             >
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>Confirm Booking</Text>
             </TouchableOpacity>
           </View>
        ) : (
           <View>
             <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 4 }}>{selectedRoute.name}</Text>
             <Text style={{ fontSize: 15, fontWeight: '500', color: (!pickupJunction || !dropJunction) ? '#10B981' : colors.textSecondary, marginBottom: 20 }}>
               {!pickupJunction ? '📍 Tap a stop on the map for Pickup' : !dropJunction ? '🎯 Tap a stop on the map for Drop-off' : '✅ Route Selected'}
             </Text>

             <View style={{ gap: 16 }}>
               {/* Selected Stops Summary */}
               <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgSecondary, padding: 16, borderRadius: 16 }}>
                  <View style={{ alignItems: 'center', marginRight: 16 }}>
                    <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: pickupJunction ? '#10B981' : colors.textSecondary }} />
                    <View style={{ width: 2, height: 28, backgroundColor: colors.border, marginVertical: 4 }} />
                    <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: dropJunction ? '#EF4444' : colors.border }} />
                  </View>
                  <View style={{ flex: 1, gap: 16 }}>
                    <View>
                      <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: 'bold', letterSpacing: 1, marginBottom: 2 }}>PICKUP</Text>
                      <Text style={{ fontSize: 16, color: pickupJunction ? colors.textPrimary : colors.textSecondary, fontWeight: '600' }}>
                        {pickupJunction ? pickupJunction.name : 'Select on map...'}
                      </Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: 'bold', letterSpacing: 1, marginBottom: 2 }}>DROP-OFF</Text>
                      <Text style={{ fontSize: 16, color: dropJunction ? colors.textPrimary : colors.textSecondary, fontWeight: '600' }}>
                        {dropJunction ? dropJunction.name : 'Select on map...'}
                      </Text>
                    </View>
                  </View>
               </View>

               <TouchableOpacity 
                 onPress={() => setIsSelectingVehicle(true)}
                 disabled={!pickupJunction || !dropJunction}
                 style={{ 
                   backgroundColor: (!pickupJunction || !dropJunction) ? colors.border : '#000',
                   paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 12
                 }}
               >
                  <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>Continue</Text>
               </TouchableOpacity>
             </View>
           </View>
        )}
      </View>
    </View>
  );
};

export default MetroBookingMap;
