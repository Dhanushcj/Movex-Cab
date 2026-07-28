import React, { useState, useEffect, useRef } from 'react';
import { getMessaging, onMessage, requestPermission, getToken, AuthorizationStatus } from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  Keyboard,
  Switch,
  Animated,
  Image,
  SafeAreaView,
  Linking
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, UrlTile, Polyline, AnimatedRegion } from 'react-native-maps';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LocationProvider, useLocation } from './src/context/LocationContext';
import { SocketProvider, useSocket } from './src/context/SocketContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Colors from './src/constants/colors';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import SlideToStartScreen from './src/components/SlideToStartScreen';
import TripCompletedPaymentSheet from './src/components/TripCompletedPaymentSheet';
import CustomerPaymentOptionsSheet from './src/components/CustomerPaymentOptionsSheet';
import CustomerInRideOptions from './src/components/CustomerInRideOptions';
import CustomerBookedRideSheet from './src/components/CustomerBookedRideSheet';
import DriverWalletScreen from './src/components/DriverWalletScreen';
import { mapStyle } from './src/constants/mapStyles';
import API from './src/services/api';
import AuthScreen from './src/components/AuthScreen';
import OnboardingScreen from './src/components/OnboardingScreen';
import RegistrationScreen from './src/components/RegistrationScreen';
import ProfileScreen from './src/components/ProfileScreen';
import PassPurchaseScreen from './src/components/PassPurchaseScreen';
import DashboardUI from './src/components/DashboardUI';

const schedulePassNotifications = async (passes: any[]) => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const pass of passes) {
      if (pass.pickupTime) {
        const [hour, minute] = pass.pickupTime.split(':').map(Number);
        let notifyHour = hour;
        let notifyMinute = minute - 30;
        if (notifyMinute < 0) {
          notifyMinute += 60;
          notifyHour -= 1;
        }
        if (notifyHour < 0) { notifyHour += 24; }
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Upcoming Commute Ride',
            body: `Your commute pass ride is scheduled for ${pass.pickupTime}. Open the app to book now.`,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: notifyHour,
            minute: notifyMinute,
          } as any
        });
      }
      
      if (pass.isReturnTrip && pass.returnTime) {
        const [hour, minute] = pass.returnTime.split(':').map(Number);
        let notifyHour = hour;
        let notifyMinute = minute - 30;
        if (notifyMinute < 0) {
          notifyMinute += 60;
          notifyHour -= 1;
        }
        if (notifyHour < 0) { notifyHour += 24; }
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Upcoming Return Ride',
            body: `Your return commute pass ride is scheduled for ${pass.returnTime}. Open the app to book now.`,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: notifyHour,
            minute: notifyMinute,
          } as any
        });
      }
    }
  } catch (error) {
    console.error('Failed to schedule pass notifications', error);
  }
};
import ProfileEditScreen from './src/components/ProfileEditScreen';
import LanguageScreen from './src/components/LanguageScreen';
import DriverHistoryScreen from './src/components/DriverHistoryScreen';
import DriverAchievementsScreen from './src/components/DriverAchievementsScreen';
import AdminDashboardScreen from './src/components/AdminDashboardScreen';
import ScheduleRideScreen from './src/components/ScheduleRideScreen';
import ScheduleConfirmScreen from './src/components/ScheduleConfirmScreen';
// Force TS Reload
import MyPassScreen from './src/components/MyPassScreen';
import CustomerWalletScreen from './src/components/CustomerWalletScreen';
import EmergencyScreen from './src/components/EmergencyScreen';
import NotificationScreen from './src/components/NotificationScreen';
import CustomerQRScannerScreen from './src/components/CustomerQRScannerScreen';
import SupportTicketScreen from './src/components/SupportTicketScreen';
import SettingsScreen from './src/components/SettingsScreen';
import HelpCentreScreen from './src/components/HelpCentreScreen';
const LIGHT_MAP_STYLE = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "on" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "color": Colors.borderGlass }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": Colors.bgSecondary }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#dadada" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#c6e2ff" }]
  }
];

export const getVehicle3DIcon = (type: string) => {
  if (type === 'bike') return require('./assets/3d_bike_icon.png');
  if (type === 'auto') return require('./assets/3d_auto_icon.png');
  return require('./assets/3d_car_icon.png');
};

type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: { prefillData?: any; isCorrection?: boolean } | undefined;
  Home: undefined;
  Tracking: { ride: any };
  DriverProfile: undefined;
  DriverProfileEdit: undefined;
  DriverLanguage: undefined;
  CustomerLanguage: undefined;
  DriverHistory: undefined;
  DriverAchievements: undefined;
  DriverWallet: undefined;
  AdminDashboard: undefined;
  PassPurchase: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Navigation controller
function NavigationRoot() {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const { user, loading } = useAuth();
  const [activePasses, setActivePasses] = React.useState<any[]>([]);
  const [driverRegData, setDriverRegData] = useState<any>(null);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        setInitialRoute('AdminDashboard');
      } else if (user.role === 'driver' && user.approvalStatus === 'correction_needed') {
        setInitialRoute('Register');
      } else {
        setInitialRoute('Home');
        API.get('/subscriptions/my-pass').then(r => { 
          if(r.data.success && r.data.data) {
            setActivePasses([r.data.data]);
            schedulePassNotifications([r.data.data]);
          } else {
            setActivePasses([]);
          }
        }).catch(()=>{});
      }
    } else {
      setInitialRoute(onboardingDone ? 'Login' : 'Onboarding');
    }
  }, [user, onboardingDone]);

  // Foreground notification handler
  useEffect(() => {
    // Configure Android notification channel
    if (require('react-native').Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00C896',
      });
    }

    const messaging = getMessaging();
    const unsubscribe = onMessage(messaging, async (remoteMessage: any) => {
      console.log('A new FCM message arrived in foreground!', remoteMessage);
      if (remoteMessage.notification || remoteMessage.data) {
        const title = remoteMessage.notification?.title || remoteMessage.data?.title || 'MoveX';
        const body = remoteMessage.notification?.body || remoteMessage.data?.body || 'You have a new message.';
        await Notifications.scheduleNotificationAsync({
          content: {
            title: title as string,
            body: body as string,
            data: remoteMessage.data,
          },
          trigger: null,
        });
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      const syncToken = async () => {
        try {
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;
          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }
          if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
          }

          const messaging = getMessaging();
          const authStatus = await requestPermission(messaging);
          if (authStatus === AuthorizationStatus.AUTHORIZED || authStatus === AuthorizationStatus.PROVISIONAL) {
            const token = await getToken(messaging);
            if (token && token !== user.fcmToken) {
              const endpoint = user.role === 'driver' ? '/drivers/profile' : '/users/me';
              await API.put(endpoint, { fcmToken: token });
            }
          }
        } catch (e) {
          console.warn('Failed to sync FCM token', e);
        }
      };
      syncToken();
    }
  }, [user]);

  if (loading || !initialRoute) {
    return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color="#00C896" /></View>;
  }

  return (
    <View style={styles.container}>
      <NavigationContainer key={initialRoute}>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          
          <Stack.Screen name="Onboarding">
            {(props) => (
              <OnboardingScreen 
                onComplete={() => {
                  setOnboardingDone(true);
                  props.navigation.replace('Login');
                }} 
              />
            )}
          </Stack.Screen>
          
          <Stack.Screen name="Login">
            {(props) => (
              <AuthScreen 
                onNavigateRegister={(data) => {
                  setDriverRegData(data);
                  props.navigation.navigate('Register');
                }} 
              />
            )}
          </Stack.Screen>
          
          <Stack.Screen name="Register">
            {(props) => (
              <RegistrationScreen 
                onBack={() => props.navigation.goBack()} 
                prefillData={user?.approvalStatus === 'correction_needed' ? user : driverRegData} 
                isCorrection={user?.approvalStatus === 'correction_needed'} 
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="Home">
            {(props) => (
              user?.role === 'customer' ? (
                <HomeScreen 
                  onRideBooked={(ride) => props.navigation.navigate('Tracking', { ride })}
                  onNavigateProfile={() => props.navigation.navigate('DriverProfile')}
                  onNavigateLanguage={() => props.navigation.navigate('CustomerLanguage')}
                  activePasses={activePasses}
                  onPassPurchased={() => {
                    API.get('/subscriptions/my-pass').then(r => {
                      if(r.data.success && r.data.data) {
                        setActivePasses([r.data.data]);
                      } else {
                        setActivePasses([]);
                      }
                    }).catch(()=>{});
                  }}
                />
              ) : (
                <DriverHomeScreen 
                  onRideAccepted={(ride: any) => props.navigation.navigate('Tracking', { ride: ride })}
                  onNavigateProfile={() => props.navigation.navigate('DriverProfile')}
                  onNavigateHistory={() => props.navigation.navigate('DriverHistory')}
                  onNavigateWallet={() => props.navigation.navigate('DriverWallet')}
                />
              )
            )}
          </Stack.Screen>

          <Stack.Screen name="Tracking">
            {(props) => (
              user?.role === 'customer' ? (
                <TrackingScreen 
                  ride={props.route.params?.ride} 
                  onClose={() => props.navigation.navigate('Home')} 
                />
              ) : (
                <DriverActiveRideScreen 
                  ride={props.route.params?.ride} 
                  onClose={() => props.navigation.navigate('Home')} 
                />
              )
            )}
          </Stack.Screen>

          <Stack.Screen name="DriverProfile">
            {(props) => (
              <ProfileScreen 
                onBack={() => props.navigation.goBack()} 
                onEditProfile={() => props.navigation.navigate('DriverProfileEdit')}
                onNavigateLanguage={() => props.navigation.navigate('DriverLanguage')}
                activePasses={activePasses}
                onOpenPassConfig={() => props.navigation.navigate('PassPurchase')}
                onPassCancelled={() => {
                  API.get('/subscriptions/my-pass').then(r => {
                    if(r.data.success && r.data.data) {
                      setActivePasses([r.data.data]);
                    } else {
                      setActivePasses([]);
                    }
                  }).catch(()=>{});
                }}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="PassPurchase">
            {(props) => (
              <PassPurchaseScreen
                onBack={() => props.navigation.goBack()}
                onPassPurchased={() => {
                  props.navigation.goBack();
                  API.get('/subscriptions/my-pass').then(r => {
                    if(r.data.success && r.data.data) {
                      setActivePasses([r.data.data]);
                    } else {
                      setActivePasses([]);
                    }
                  }).catch(()=>{});
                }}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="DriverProfileEdit">
            {(props) => (
              <ProfileEditScreen 
                onBack={() => props.navigation.goBack()}
                onSave={() => props.navigation.goBack()}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="CustomerLanguage">
            {(props) => (
              <LanguageScreen onBack={() => props.navigation.goBack()} />
            )}
          </Stack.Screen>

          <Stack.Screen name="DriverLanguage">
            {(props) => (
              <LanguageScreen onBack={() => props.navigation.goBack()} />
            )}
          </Stack.Screen>

          <Stack.Screen name="DriverHistory">
            {(props) => (
              <DriverHistoryScreen 
                onNavigateHome={() => props.navigation.navigate('Home')} 
                onNavigateAchievements={() => props.navigation.navigate('DriverAchievements')}
                onNavigateWallet={() => props.navigation.navigate('DriverWallet')}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="DriverAchievements">
            {(props) => (
              <DriverAchievementsScreen
                onNavigateHome={() => props.navigation.navigate('Home')}
                onNavigateHistory={() => props.navigation.navigate('DriverHistory')}
                onNavigateWallet={() => props.navigation.navigate('DriverWallet')}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="DriverWallet">
            {(props) => (
              <DriverWalletScreen
                onBack={() => props.navigation.goBack()}
                onNavigateHome={() => props.navigation.navigate('Home')}
                onNavigateHistory={() => props.navigation.navigate('DriverHistory')}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="AdminDashboard">
            {(props) => (
              <AdminDashboardScreen onNavigateLogout={() => props.navigation.replace('Login')} />
            )}
          </Stack.Screen>

        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </View>
  );
}

// 1. REVAMPED LOGIN SCREEN
// Polyline decoder for OSRM format
const decodePolyline = (t: string, e: number = 5) => {
  let points = [];
  let index = 0, len = t.length;
  let lat = 0, lng = 0;
  while (index < len) {
    let b, shift = 0, result = 0;
    do { b = t.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += ((result & 1) ? ~(result >> 1) : (result >> 1));
    shift = 0; result = 0;
    do { b = t.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += ((result & 1) ? ~(result >> 1) : (result >> 1));
    points.push({ latitude: lat / Math.pow(10, e), longitude: lng / Math.pow(10, e) });
  }
  return points;
};


// ─── Location Picker Screen (moveable center-pin map) ─────────────────────────
function LocationPickerScreen({
  initialPickup,
  initialDrop,
  initialActiveField,
  onConfirm,
  onBack,
}: {
  initialPickup: { address: string; coordinates: number[] } | null;
  initialDrop: { address: string; coordinates: number[] } | null;
  initialActiveField: 'pickup' | 'drop';
  onConfirm: (pickup: { address: string; coordinates: number[] }, drop: { address: string; coordinates: number[] }) => void;
  onBack: () => void;
}) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const { location, geocodeSearch } = useLocation();
  const { t } = useLanguage();

  const [activeField, setActiveField] = useState<'pickup' | 'drop'>(initialActiveField);

  // States for pickup and drop
  const defaultUserCoords = location ? [location.coords.longitude, location.coords.latitude] : [78.6569, 11.1271];
  const [pickupData, setPickupData] = useState(initialPickup || { address: 'Finding location...', coordinates: defaultUserCoords });
  const [dropData, setDropData] = useState(initialDrop || { address: '', coordinates: [] as number[] });

  // Map center coordinates based on active field
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number }>(
    activeField === 'pickup' 
      ? { latitude: pickupData.coordinates[1], longitude: pickupData.coordinates[0] }
      : (dropData.coordinates.length > 0 
          ? { latitude: dropData.coordinates[1], longitude: dropData.coordinates[0] } 
          : { latitude: pickupData.coordinates[1], longitude: pickupData.coordinates[0] })
  );

  const [isGeocoding, setIsGeocoding] = useState(false);
  const geocodeTimeout = useRef<NodeJS.Timeout | null>(null);
  const isProgrammaticPan = useRef(false);
  
  // Search state
  const mapRef = useRef<MapView>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Reverse geocode on mount if pickup is missing address
  useEffect(() => {
    if (!initialPickup && location) {
      reverseGeocode(location.coords.latitude, location.coords.longitude, 'pickup');
    }
  }, []);

  const handleFieldSwitch = (field: 'pickup' | 'drop') => {
    setActiveField(field);
    setSearchQuery('');
    setSearchResults([]);
    // Pan map to the existing coordinates for that field
    const targetData = field === 'pickup' ? pickupData : dropData;
    if (targetData.coordinates && targetData.coordinates.length === 2) {
      isProgrammaticPan.current = true;
      setCurrentCoords({
        latitude: targetData.coordinates[1],
        longitude: targetData.coordinates[0],
      });
      mapRef.current?.animateToRegion({
        latitude: targetData.coordinates[1],
        longitude: targetData.coordinates[0],
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      }, 500);
    }
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.length > 2) {
      const results = await geocodeSearch(text);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const onSelectResult = (item: any) => {
    setSearchQuery('');
    setSearchResults([]);
    Keyboard.dismiss();
    
    if (activeField === 'pickup') {
      setPickupData({ address: item.address, coordinates: item.coordinates });
    } else {
      setDropData({ address: item.address, coordinates: item.coordinates });
    }
    
    isProgrammaticPan.current = true;
    mapRef.current?.animateToRegion({
      latitude: item.coordinates[1],
      longitude: item.coordinates[0],
      latitudeDelta: 0.012,
      longitudeDelta: 0.012,
    }, 500);
  };

  const reverseGeocode = async (lat: number, lng: number, targetField: 'pickup' | 'drop') => {
    setIsGeocoding(true);
    try {
      const result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      let addressStr = 'Selected Location';
      if (result && result.length > 0) {
        const a = result[0];
        const parts = [a.name, a.street, a.district, a.city, a.subregion]
          .filter(Boolean)
          .filter((v, i, arr) => arr.indexOf(v) === i);
        addressStr = parts.slice(0, 3).join(', ') || 'Selected Location';
      }
      
      if (targetField === 'pickup') {
        setPickupData(prev => ({ ...prev, address: addressStr, coordinates: [lng, lat] }));
      } else {
        setDropData(prev => ({ ...prev, address: addressStr, coordinates: [lng, lat] }));
      }
    } catch {
      // Fallback
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleRegionChangeComplete = (region: any) => {
    const { latitude, longitude } = region;
    setCurrentCoords({ latitude, longitude });
    
    if (isProgrammaticPan.current) {
      // If we just animated here from a search result, don't overwrite the address!
      isProgrammaticPan.current = false;
      return;
    }
    
    if (activeField === 'pickup') {
      setPickupData(prev => ({ ...prev, coordinates: [longitude, latitude] }));
    } else {
      setDropData(prev => ({ ...prev, coordinates: [longitude, latitude] }));
    }

    if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);
    geocodeTimeout.current = setTimeout(() => reverseGeocode(latitude, longitude, activeField), 800);
  };

  const handleConfirm = () => {
    const finalPickupData = { ...pickupData, address: pickupData.address && pickupData.address !== 'Finding location...' ? pickupData.address : 'Selected Pickup Location' };
    const finalDropData = { ...dropData, address: dropData.address ? dropData.address : 'Selected Drop Location' };

    if (activeField === 'pickup') {
      if (!pickupData.coordinates.length) return Alert.alert('Missing Location', 'Please select a pickup location');
      // Update pickup data with fallback just in case before switching
      setPickupData(finalPickupData);
      handleFieldSwitch('drop');
    } else {
      if (!dropData.coordinates.length) return Alert.alert('Missing Location', 'Please select a drop location');
      onConfirm(finalPickupData, finalDropData);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      
      {/* Full-screen map */}
      <View style={{ ...StyleSheet.absoluteFillObject }}>
        <MapView provider={PROVIDER_GOOGLE}
          ref={mapRef}
          style={{ flex: 1 }}
          customMapStyle={LIGHT_MAP_STYLE}
          initialRegion={{
            latitude: currentCoords.latitude,
            longitude: currentCoords.longitude,
            latitudeDelta: 0.012,
            longitudeDelta: 0.012,
          }}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation
          showsMyLocationButton={false}
        >
        </MapView>
      </View>

      {/* Floating Back Button */}
      <TouchableOpacity 
        onPress={onBack} 
        style={{ position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.bgSecondary, alignItems: 'center', justifyContent: 'center', zIndex: 100, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }}
        activeOpacity={0.8}
      >
        <Feather name="chevron-left" size={24} color="#262D36" />
      </TouchableOpacity>

      {/* Floating Location Card */}
      <View style={{ position: 'absolute', top: Platform.OS === 'ios' ? 120 : 100, left: 20, right: 20, backgroundColor: colors.bgSecondary, borderRadius: 20, padding: 20, zIndex: 100, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }}>
        
        {/* Dotted connecting line */}
        <View style={{ position: 'absolute', left: 25, top: 45, bottom: 45, width: 1, borderStyle: 'dotted', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 1 }} />

        {/* Pickup Field */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.success, marginTop: 4, marginRight: 16 }} />
          <TouchableOpacity 
            style={{ flex: 1 }}
            onPress={() => handleFieldSwitch('pickup')}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>Pickup Location</Text>
            {activeField === 'pickup' ? (
              <TextInput
                style={{ fontSize: 15, color: colors.textPrimary, padding: 0 }}
                placeholder={t('home.searchPickup') || 'Search pickup location...'}
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus={true}
              />
            ) : (
              <Text style={{ fontSize: 15, color: pickupData.address ? colors.textPrimary : colors.textMuted }} numberOfLines={1}>
                {pickupData.address || t('home.setPickup') || 'Set Pickup Location'}
              </Text>
            )}
            {activeField === 'pickup' && <View style={{ height: 1, backgroundColor: colors.borderGlass, marginTop: 8 }} />}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: '#F3F4F6', marginLeft: 28, marginBottom: 20 }} />

        {/* Drop Field */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 3, borderColor: colors.danger, backgroundColor: '#FFF', marginTop: 4, marginRight: 16 }} />
          <TouchableOpacity 
            style={{ flex: 1 }}
            onPress={() => handleFieldSwitch('drop')}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>Drop Location</Text>
            {activeField === 'drop' ? (
              <TextInput
                style={{ fontSize: 15, color: colors.textPrimary, padding: 0 }}
                placeholder={t('home.searchDrop') || 'Search drop location...'}
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus={true}
              />
            ) : (
              <Text style={{ fontSize: 15, color: dropData.address ? colors.textPrimary : colors.textMuted }} numberOfLines={1}>
                {dropData.address || t('home.whereTo') || 'Where to?'}
              </Text>
            )}
            {activeField === 'drop' && <View style={{ height: 1, backgroundColor: colors.borderGlass, marginTop: 8 }} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Results Dropdown */}
      {searchResults.length > 0 && (
        <View style={{ position: 'absolute', top: Platform.OS === 'ios' ? 290 : 270, left: 20, right: 20, backgroundColor: colors.bgSecondary, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, maxHeight: 250, zIndex: 110 }}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {searchResults.map((item, index) => (
              <TouchableOpacity key={index} style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center' }} onPress={() => onSelectResult(item)}>
                <Feather name="map-pin" size={16} color={colors.textSecondary} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, color: colors.textPrimary }} numberOfLines={2}>{item.address}</Text>
                </View>
                {item.distance && (
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginLeft: 8, fontWeight: '600' }}>{item.distance}</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
        
      {/* Fixed center crosshair pin ?" does NOT move, map scrolls under it */}
      <View style={styles.pickerCrosshairWrapper} pointerEvents="none">
        {isGeocoding && (
          <View style={{ position: 'absolute', top: -40, backgroundColor: colors.bgSecondary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, shadowColor: colors.textPrimary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>Finding address...</Text>
          </View>
        )}
        <View style={[styles.pickerPinOuter, { backgroundColor: activeField === 'pickup' ? colors.success : colors.danger }]}>
          <View style={styles.pickerPinInner} />
        </View>
        <View style={[styles.pickerPinStem, { backgroundColor: activeField === 'pickup' ? colors.success : colors.danger }]} />
        <View style={styles.pickerPinShadow} />
      </View>

      {/* Recenter button */}
      {location && (
        <TouchableOpacity
          style={{ position: 'absolute', bottom: 100, right: 20, width: 48, height: 48, borderRadius: 24, backgroundColor: colors.bgSecondary, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5, zIndex: 50 }}
          activeOpacity={0.8}
          onPress={() => {
            isProgrammaticPan.current = true;
            setCurrentCoords({ latitude: location.coords.latitude, longitude: location.coords.longitude });
            reverseGeocode(location.coords.latitude, location.coords.longitude, activeField);
            mapRef.current?.animateToRegion({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.012,
              longitudeDelta: 0.012,
            }, 500);
          }}
        >
          <Feather name="crosshair" size={20} color="#262D36" />
        </TouchableOpacity>
      )}

      {/* Confirm Button */}
      <View style={{ position: 'absolute', bottom: 30, left: 20, right: 20, zIndex: 100 }}>
        <TouchableOpacity 
          style={{ backgroundColor: '#0053B3', paddingVertical: 16, borderRadius: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 }} 
          onPress={handleConfirm} 
          activeOpacity={0.85}
        >
          <Text style={{ color: '#FCFCFC', fontSize: 16, fontWeight: '600' }}>
            {activeField === 'pickup' && dropData.address ? 'Book Ride' : activeField === 'pickup' ? (t('app.ConfirmPickupLocation') || 'Confirm Pickup Location') : (t('home.confirmDrop') || 'Confirm Drop Location')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 2. REVAMPED HOME / BOOKING SCREEN
function HomeScreen({ onRideBooked, onNavigateProfile, onNavigateLanguage, activePasses = [], onPassPurchased }: { onRideBooked: (ride: any) => void; onNavigateProfile: () => void; onNavigateLanguage: () => void; activePasses?: any[]; onPassPurchased?: () => void; }) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const { user, logout, updateUserWallet } = useAuth();
  const { t } = useLanguage();
  const { toggleTheme } = useTheme();
  const { location, locationAddress, geocodeSearch } = useLocation();

  // ── Location / booking state ───────────────────────────────────────────────
  const [pickupAddr, setPickupAddr] = useState('');
  const [pickupCoords, setPickupCoords] = useState<number[] | null>(null);
  const [dropAddr, setDropAddr] = useState('');
  const [dropCoords, setDropCoords] = useState<number[] | null>(null);
  const [estimates, setEstimates] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [loadingEstimates, setLoadingEstimates] = useState(false);
  const [bookingRide, setBookingRide] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef<MapView>(null);
  const [passEstimate, setPassEstimate] = useState<any>(null);
  const [bookingMode, setBookingMode] = useState<'ride'|'pass'>('ride');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [showPassConfig, setShowPassConfig] = useState(false);

  // ── Picker state ──────────────────────────────────────────────────────────
  type PickerMode = null | 'pickup' | 'drop';
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);

  // ── Tab bar ───────────────────────────────────────────────────────────────
  type TabName = 'home' | 'services' | 'trips' | 'account' | 'wallet';
  const [activeTab, setActiveTab] = useState<TabName>('home');

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showEmergencyScreen, setShowEmergencyScreen] = useState(false);
  const [showNotificationScreen, setShowNotificationScreen] = useState(false);
  const [showScheduleRideScreen, setShowScheduleRideScreen] = useState(false);
  const [showScheduleConfirmScreen, setShowScheduleConfirmScreen] = useState(false);
  const [schedulePayload, setSchedulePayload] = useState<any>(null);
  const [scheduledRide, setScheduledRide] = useState<any>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [managePass, setManagePass] = useState<any>(null);
  const [skipPickup, setSkipPickup] = useState(false);
  const [skipReturn, setSkipReturn] = useState(false);
  const [newPickupTime, setNewPickupTime] = useState('');
  const [newReturnTime, setNewReturnTime] = useState('');
  const [savingPass, setSavingPass] = useState(false);
  const [showSupportTicketScreen, setShowSupportTicketScreen] = useState(false);
  const [showHelpCentreScreen, setShowHelpCentreScreen] = useState(false);
  const [showSettingsScreen, setShowSettingsScreen] = useState(false);
  const [showMonthlyPayment, setShowMonthlyPayment] = useState(false);
  const [monthlyFareAmount, setMonthlyFareAmount] = useState(0);
  const [processingMonthlyPayment, setProcessingMonthlyPayment] = useState(false);

  // ── Profile fields ─────────────────────────────────────────────────────────
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [walletAmount, setWalletAmount] = useState('');
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [myRides, setMyRides] = useState<any[]>([]);
  const [loadingRides, setLoadingRides] = useState(false);
  const [activeTripFilter, setActiveTripFilter] = useState<'All' | 'Completed' | 'Cancelled'>('All');
  const [tripSearchQuery, setTripSearchQuery] = useState('');
  const [offeredFare, setOfferedFare] = useState(0);

  // ── Banners ────────────────────────────────────────────────────────────────
  const [banner1List, setBanner1List] = useState<any[]>([]);
  const [banner2List, setBanner2List] = useState<any[]>([]);
  const [banner1Index, setBanner1Index] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await API.get('/public/banners?targetAudience=customer');
        if (res.data && res.data.success) {
          const banners = res.data.data;
          setBanner1List(banners.filter((b: any) => b.position === 'banner1' || !b.position));
          setBanner2List(banners.filter((b: any) => b.position === 'banner2'));
        }
      } catch (err) {
        console.warn('Failed to fetch banners', err);
      }
    };
    const fetchUpcomingScheduledRide = async () => {
      try {
        const res = await API.get('/scheduled-rides');
        if (res.data && res.data.success && res.data.data.length > 0) {
          const upcoming = res.data.data.find((r: any) => ['scheduled', 'searching', 'driver_assigned'].includes(r.status));
          if (upcoming) {
            setScheduledRide({
              ...upcoming,
              pickup: upcoming.pickup?.address || 'Pickup',
              drop: upcoming.drop?.address || 'Drop'
            });
          }
        }
      } catch (err) {
        console.warn('Failed to fetch scheduled rides', err);
      }
    };
    fetchBanners();
    fetchUpcomingScheduledRide();
  }, []);

  const handleUpdatePassException = async () => {
    if (!managePass) return;
    setSavingPass(true);
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      const payload = {
        date: todayDate,
        skipPickup,
        skipReturn,
        newPickupTime: newPickupTime || undefined,
        newReturnTime: newReturnTime || undefined
      };
      
      const res = await API.post(`/subscriptions/${managePass._id}/customize`, payload);
      if (res.data.success) {
        Alert.alert('Success', 'Ride schedule updated for today');
        setManagePass(null);
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update ride schedule');
    } finally {
      setSavingPass(false);
    }
  };


  useEffect(() => {
    if (banner1List.length > 1) {
      const interval = setInterval(() => {
        setBanner1Index((prev) => (prev + 1) % banner1List.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banner1List]);

  // ── Nearby drivers ─────────────────────────────────────────────────────────
  const [nearbyDrivers, setNearbyDrivers] = useState<any[]>([]);

  // Radar search anim
  const searchAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (bookingRide) {
      searchAnim.setValue(0);
      Animated.loop(Animated.timing(searchAnim, { toValue: 1, duration: 2000, useNativeDriver: false })).start();
    } else {
      searchAnim.stopAnimation();
      searchAnim.setValue(0);
    }
  }, [bookingRide]);

  // Auto-set pickup from GPS
  useEffect(() => {
    if (location) {
      setPickupAddr(locationAddress);
      setPickupCoords([location.coords.longitude, location.coords.latitude]);
    }
  }, [location, locationAddress]);

  // Sync profile
  useEffect(() => {
    if (user) { setProfileName(user.name || ''); setProfileEmail(user.email || ''); }
  }, [user]);

  // Poll nearby drivers based on pickupCoords
  useEffect(() => {
    if (!pickupCoords) return;
    const fetchNearby = async () => {
      try {
        const res = await API.get(`/drivers/nearby?lng=${pickupCoords[0]}&lat=${pickupCoords[1]}&radius=2`);
        if (res.data.success) setNearbyDrivers(res.data.drivers);
      } catch {}
    };
    fetchNearby();
    const iv = setInterval(fetchNearby, 10000);
    return () => clearInterval(iv);
  }, [pickupCoords]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const isVehicleDisabled = (type: string) => false;
  
  const handleEstimatePass = async (type: string) => {
    if (!pickupCoords || !dropCoords) return;
    try {
      const res = await API.post('/subscriptions/estimate', {
        pickup: { address: pickupAddr, coordinates: pickupCoords },
        drop: { address: dropAddr, coordinates: dropCoords },
        vehicleType: type
      });
      if (res.data.success) setPassEstimate(res.data.data);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to estimate pass');
    }
  };

  const handlePurchasePass = async () => {
    if (!passEstimate || !selectedVehicle) return;
    setBookingRide(true);
    try {
      const res = await API.post('/subscriptions/purchase', {
        pickup: { address: pickupAddr, coordinates: pickupCoords },
        drop: { address: dropAddr, coordinates: dropCoords },
        vehicleType: selectedVehicle.vehicleType,
        totalRides: passEstimate.totalRides,
        pricePerRide: passEstimate.pricePerRide,
        totalPrice: passEstimate.totalPrice
      });
      if (res.data.success) {
        Alert.alert('Success', 'Commute Pass purchased successfully!');
        setPassEstimate(null);
        setEstimates([]);
        API.get('/subscriptions').then(r => {
          // if (r.data.success) setActivePasses(r.data.data);
        });
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to purchase pass');
    } finally {
      setBookingRide(false);
    }
  };

  const getEstimates = async (puCoords: number[], puAddr: string, drCoords: number[], drAddr: string) => {
    setLoadingEstimates(true);
    try {
      const res = await API.post('/bookings/estimate', {
        pickup: { address: puAddr, coordinates: puCoords },
        drop: { address: drAddr, coordinates: drCoords },
        vehicleType: 'mini',
      });
      if (res.data.success) {
        setEstimates(res.data.estimates);
        const best = res.data.estimates[0];
        setSelectedVehicle(best);
        setOfferedFare(best.fareDetails.totalFare);
        if (bookingMode === 'pass') handleEstimatePass(best.vehicleType);
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to estimate fare');
    } finally {
      setLoadingEstimates(false);
    }
  };

  const handlePickerConfirm = (mode: PickerMode, result: { address: string; coordinates: number[] }) => {
    setPickerMode(null);
    if (mode === 'pickup') {
      setPickupAddr(result.address);
      setPickupCoords(result.coordinates);
      if (dropCoords ) getEstimates(result.coordinates, result.address, dropCoords, dropAddr);
    } else {
      setDropAddr(result.address);
      setDropCoords(result.coordinates);
      if (pickupCoords ) getEstimates(pickupCoords, pickupAddr, result.coordinates, result.address);
    }
  };

  const handleBookRide = async () => {
    if (!selectedVehicle || !pickupCoords) return;
    setBookingRide(true);
    try {
      const payload: any = {
        pickup: { address: pickupAddr, coordinates: pickupCoords },
        vehicleType: selectedVehicle.vehicleType,
        paymentMethod: 'cash',
        fare: offeredFare,
        preferences: preferences
      };
      if (dropCoords && dropCoords.length === 2) {
        payload.drop = { address: dropAddr, coordinates: dropCoords };
      }
      const res = await API.post('/bookings', payload);
      if (res.data.success) onRideBooked(res.data.data);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to book ride');
    } finally {
      setBookingRide(false);
    }
  };

  const handleBookPassRide = async (pass: any) => {
    setBookingRide(true);
    try {
      const res = await API.post('/bookings', {
        pickup: { address: pass.pickup.address, coordinates: pass.pickup.location.coordinates },
        drop: { address: pass.drop.address, coordinates: pass.drop.location.coordinates },
        vehicleType: pass.vehicleType,
        paymentMethod: 'wallet',
        subscriptionId: pass._id
      });
      if (res.data.success) onRideBooked(res.data.data);
    } catch (e: any) { 
      Alert.alert('Error', e.response?.data?.message || 'Failed to book via pass'); 
    } finally {
      setBookingRide(false);
    }
  };

  const fetchMyRides = async () => {
    setLoadingRides(true);
    try {
      const res = await API.get('/users/me/rides');
      if (res.data.success) setMyRides(res.data.data);
    } catch {}
    finally { setLoadingRides(false); }
  };

  const handleCancelHistoryRide = (rideId: string) => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride request?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await API.put(`/bookings/${rideId}/cancel`, { reason: 'Cancelled by customer' });
              if (res.data.success) {
                Alert.alert('Success', 'Ride cancelled successfully.');
                fetchMyRides();
              }
            } catch (e: any) {
              Alert.alert('Error', e.response?.data?.message || 'Failed to cancel ride');
            }
          }
        }
      ]
    );
  };

  const handleUpdateProfile = async () => {
    if (!profileName.trim()) return Alert.alert('Error', 'Name is required');
    setUpdatingProfile(true);
    try {
      const res = await API.put('/users/me', { name: profileName, email: profileEmail });
      if (res.data.success) { Alert.alert('Success', 'Profile updated!'); }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update profile');
    } finally { setUpdatingProfile(false); }
  };

  const handleTopup = async () => {
    if (!walletAmount || isNaN(Number(walletAmount)) || Number(walletAmount) <= 0)
      return Alert.alert('Invalid Amount', 'Please enter a valid amount');
    setLoadingWallet(true);
    try {
      await updateUserWallet(Number(walletAmount));
      Alert.alert('Success', `₹${walletAmount} added to wallet!`);
      setWalletAmount(''); setShowWalletModal(false);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to add money');
    } finally { setLoadingWallet(false); }
  };

  const handleSOS = () => setShowEmergencyScreen(true);

  const formatInitials = (name: string) => (name || 'R').split(' ').map(p => p[0]).join('').toUpperCase().substring(0, 2);
  const formatTripDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const getVehicleEmoji = (type: string) => ({ bike: '🏍️', auto: '🛺', mini: '🚗', sedan: '🚘', suv: '🚙' }[type] || '🚗');

  const handleTabPress = (tab: TabName) => {
    setActiveTab(tab);
    if (tab === 'trips') { fetchMyRides(); }
  };

  // ── If picker is open — show full-screen picker ──────────────────────────
  if (pickerMode) {
    const initialPickup = pickupCoords ? { address: pickupAddr, coordinates: pickupCoords } : null;
    const initialDrop = dropCoords ? { address: dropAddr, coordinates: dropCoords } : null;

    return (
      <LocationPickerScreen
        initialPickup={initialPickup}
        initialDrop={initialDrop}
        initialActiveField={pickerMode}
        onConfirm={(pickupData, dropData) => {
          setPickerMode(null);
          setPickupAddr(pickupData.address);
          const validPickup = pickupData.coordinates?.length === 2 ? pickupData.coordinates : null;
          const validDrop = dropData.coordinates?.length === 2 ? dropData.coordinates : null;
          setPickupCoords(validPickup);
          setDropAddr(dropData.address);
          setDropCoords(validDrop);
          if (validPickup && validDrop) {
            getEstimates(validPickup, pickupData.address, validDrop, dropData.address);
          }
          if (isScheduling) {
            setShowScheduleConfirmScreen(true);
          }
        }}
        onBack={() => {
          setPickerMode(null);
          if (isScheduling) {
            setShowScheduleConfirmScreen(true);
          }
        }}
      />
    );
  }

  // ── Main home screen ──────────────────────────────────────────────────────
  return (
    <View style={styles.homeContainer}>
      <EmergencyScreen visible={showEmergencyScreen} onClose={() => setShowEmergencyScreen(false)} />
      <NotificationScreen visible={showNotificationScreen} onClose={() => setShowNotificationScreen(false)} />
      <SupportTicketScreen visible={showSupportTicketScreen} onClose={() => setShowSupportTicketScreen(false)} />
      <HelpCentreScreen visible={showHelpCentreScreen} onClose={() => setShowHelpCentreScreen(false)} />
      <SettingsScreen visible={showSettingsScreen} onClose={() => setShowSettingsScreen(false)} />
      <ScheduleRideScreen visible={showScheduleRideScreen} onClose={() => { setShowScheduleRideScreen(false); setIsScheduling(false); }} onContinue={(payload: any) => { setSchedulePayload(payload); setShowScheduleRideScreen(false); setShowScheduleConfirmScreen(true); }} />
      <ScheduleConfirmScreen
        visible={showScheduleConfirmScreen}
        estimates={estimates}
        selectedVehicle={selectedVehicle}
        setSelectedVehicle={setSelectedVehicle}
        onClose={() => {
          setShowScheduleConfirmScreen(false);
          setIsScheduling(false);
        }}
        onSchedule={async (pickupStr, dropStr, vehicleType, estimatedFare) => {
          setShowScheduleConfirmScreen(false);
          setIsScheduling(false);

          try {
            if (schedulePayload?.scheduleType === 'today') {
              const res = await API.post('/scheduled-rides/one-time', {
                pickup: { address: pickupAddr, location: { type: 'Point', coordinates: pickupCoords } },
                drop: { address: dropAddr, location: { type: 'Point', coordinates: dropCoords } },
                vehicleType: vehicleType,
                scheduledDate: schedulePayload.scheduledDate.toISOString().split('T')[0],
                scheduledTime: schedulePayload.scheduledTime.toISOString().split('T')[1].substring(0,5),
                tripType: schedulePayload.tripType,
                returnTime: schedulePayload.returnTime ? schedulePayload.returnTime.toISOString().split('T')[1].substring(0,5) : null,
                estimatedFare: estimatedFare
              });
              if (res.data.success) {
                Alert.alert('Ride Scheduled', 'Your ride has been successfully scheduled!');
                if (res.data.data && res.data.data.length > 0) {
                  const upcoming = res.data.data[0];
                  setScheduledRide({
                    ...upcoming,
                    pickup: upcoming.pickup?.address || pickupAddr,
                    drop: upcoming.drop?.address || dropAddr
                  });
                }
              }
            } else if (schedulePayload?.scheduleType === 'monthly') {
              const baseFare = estimatedFare; // Use actual estimate
              const numMonths = schedulePayload.numMonths || 1;
              const tripsPerDay = schedulePayload.tripType === 'round' ? 2 : 1;
              const totalEst = baseFare * tripsPerDay * numMonths * 30; // Approx 30 days
              const discount = totalEst * 0.10;
              setMonthlyFareAmount(totalEst - discount);
              setShowMonthlyPayment(true);
            }
          } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to schedule ride.');
          }

          if (schedulePayload?.scheduleType !== 'monthly' && schedulePayload?.scheduleType !== 'today') {
            setScheduledRide({ pickup: pickupAddr, drop: dropAddr });
          }
          setPickupAddr('');
          setDropAddr('');
          setPickupCoords(null);
          setDropCoords(null);
          setEstimates([]);
          setPickerMode(null);
        }}
        pickupAddress={pickupAddr}
        dropAddress={dropAddr}
        onSelectLocation={(field) => {
          setShowScheduleConfirmScreen(false);
          setPickerMode(field);
        }}
      />

      {showMonthlyPayment && (
        <Modal visible transparent animationType="slide">
          <View style={{flex:1, backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <TouchableOpacity style={{flex: 1}} activeOpacity={1} onPress={() => !processingMonthlyPayment && setShowMonthlyPayment(false)} />
            <CustomerPaymentOptionsSheet 
               amount={monthlyFareAmount}
               processing={processingMonthlyPayment}
               onCancel={() => setShowMonthlyPayment(false)}
               onSelect={async (method: string) => {
                 setProcessingMonthlyPayment(true);
                 try {
                   const res = await API.post('/scheduled-rides/monthly', {
                     pickup: { address: pickupAddr, location: { type: 'Point', coordinates: pickupCoords } },
                     drop: { address: dropAddr, location: { type: 'Point', coordinates: dropCoords } },
                     vehicleType: 'mini', // Fallback
                     repeatDay: parseInt(schedulePayload.repeatDay, 10),
                     scheduledTime: schedulePayload.scheduledTime.toISOString().split('T')[1].substring(0,5),
                     tripType: schedulePayload.tripType,
                     returnTime: schedulePayload.returnTime ? schedulePayload.returnTime.toISOString().split('T')[1].substring(0,5) : null,
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

      {/* ─────────────────── HOME TAB ─────────────────── */}
      {activeTab === 'home' && (
        <View style={{ flex: 1 }}>
          {(!dropAddr && (!estimates || estimates.length === 0) && pickerMode === null && !bookingRide && !showMap) ? (
            <DashboardUI 
              user={user}
              activePasses={activePasses}
              onProfilePress={onNavigateProfile}
              onNotificationPress={() => setShowNotificationScreen(true)}
              onBuyPass={() => setShowPassConfig(true)}
              onBookRide={() => setPickerMode('drop')}
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
          ) : (
            <View style={{ flex: 1 }}>
              {showMap && (
                <TouchableOpacity onPress={() => setShowMap(false)} style={{ position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 16, zIndex: 100, width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 }}>
                  <Feather name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
              )}
          {/* Full-screen map */}
          <View style={styles.homeMapPreview}>
            <MapView provider={PROVIDER_GOOGLE}
              style={{ flex: 1 }}
              customMapStyle={LIGHT_MAP_STYLE}
              showsUserLocation={true}
              showsMyLocationButton={false}
              initialRegion={{
                latitude:      location?.coords.latitude  ?? 11.1271,
                longitude:     location?.coords.longitude ?? 78.6569,
                latitudeDelta:  0.025,
                longitudeDelta: 0.025,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
{pickupCoords && pickupCoords.length === 2 && (
                <Marker key="pickup-marker" coordinate={{ latitude: pickupCoords[1], longitude: pickupCoords[0] }} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={bookingRide}>
                  <View style={{ alignItems: 'center', justifyContent: 'center', width: 150, height: 150 }}>
                    {bookingRide && (
                      <Animated.View style={{
                        position: 'absolute', width: 150, height: 150, borderRadius: 75,
                        backgroundColor: 'rgba(0,83,179,0.15)', borderWidth: 1, borderColor: 'rgba(0,83,179,0.5)',
                        transform: [{ scale: searchAnim }],
                        opacity: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })
                      }} />
                    )}
                    <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: colors.success, borderWidth: 2.5, borderColor: colors.bgSecondary, shadowColor: colors.success, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.5, shadowRadius: 5, elevation: 6 }} />
                  </View>
                </Marker>
              )}
              {dropCoords && dropCoords.length === 2 && (
                <Marker key="drop-marker" coordinate={{ latitude: dropCoords[1], longitude: dropCoords[0] }}>
                  <View style={{ alignItems: 'center', justifyContent: 'flex-end', height: 44, width: 32 }}>
                    <View style={[styles.pickerPinOuter, { backgroundColor: colors.danger }]}>
                      <View style={styles.pickerPinInner} />
                    </View>
                    <View style={[styles.pickerPinStem, { backgroundColor: colors.danger }]} />
                    <View style={styles.pickerPinShadow} />
                  </View>
                </Marker>
              )}
              {selectedVehicle?.routeDetails?.polyline && (
                <Polyline key="route-polyline" coordinates={decodePolyline(selectedVehicle.routeDetails.polyline)} strokeColor={colors.accent} strokeWidth={4} lineCap="round" />
              )}
              {nearbyDrivers.map((d, i) => (
                <Marker key={`driver-${d._id || i}`} coordinate={{ latitude: d.currentLocation.coordinates[1], longitude: d.currentLocation.coordinates[0] }}>
                  <Image source={getVehicle3DIcon(d.vehicle?.type || '')} style={{ width: 44, height: 44, resizeMode: 'contain' }} />
                </Marker>
              ))}
            </MapView>

            {/* Transparent overlay to open picker */}
            <TouchableOpacity
              style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 5 }}
              activeOpacity={0.9}
              onPress={() => setPickerMode('pickup')}
            />

            {/* Floating top header on map */}
            <View style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              backgroundColor: colors.bgSecondary, borderWidth: 1, borderColor: colors.bgSecondary,
              borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
              paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 20, zIndex: 10,
              shadowColor: colors.textPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
            }}>
              <View style={{ paddingHorizontal: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => handleTabPress('account')} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.bgTertiary, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderGlass }}>
                      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.accent }}>{formatInitials(user?.name || 'U')}</Text>
                    </View>
                    <View style={{ flexDirection: 'column', gap: 4 }}>
                      <Text style={{ fontFamily: 'sans-serif', fontSize: 14, color: colors.textMuted }}>{new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}</Text>
                      <Text style={{ fontFamily: 'sans-serif', fontSize: 20, color: colors.textPrimary, fontWeight: 'bold' }}>{user?.name?.split(' ')[0] || 'Rider'}</Text>
                    </View>
                  </TouchableOpacity>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={handleSOS} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEECEC', borderWidth: 1.5, borderColor: '#F71313', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name="alert-triangle" size={18} color="#F71313" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowNotificationScreen(true)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.iconBg, borderWidth: 1.2, borderColor: '#9098A2', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name="bell" size={18} color="#9098A2" />
                    </TouchableOpacity>

                  </View>
                </View>
              </View>
            </View>

            {/* Pickup strip on map bottom */}
            <TouchableOpacity style={styles.homePickupStrip} activeOpacity={0.85} onPress={() => setPickerMode('pickup')}>
              <View style={styles.homePickupDot} />
              <Text style={styles.homePickupText} numberOfLines={1}>
                {pickupAddr || 'Detecting your location…'}
              </Text>
              <Feather name="chevron-down" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* ── BOTTOM CARD ── */}
          <View style={styles.homeBottomCard}>
            <View style={styles.sheetHandle} />

            {/* WHERE TO GO search bar */}
            <TouchableOpacity style={styles.homeSearchBar} activeOpacity={0.85} onPress={() => setPickerMode('drop')}>
              <View style={styles.homeSearchIconWrap}>
                <Feather name="search" size={16} color={colors.accent} />
              </View>
              <Text style={dropAddr ? styles.homeSearchTextFilled : styles.homeSearchText}>
                {dropAddr || t('home.whereDoYouWantToGo') || 'Where do you want to go?'}
              </Text>
              {dropAddr && (
                <TouchableOpacity onPress={() => { setDropAddr(''); setDropCoords(null); setEstimates([]); }} style={{ padding: 6 }}>
                  <Feather name="x" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {loadingEstimates && (
              <View style={styles.estimateLoaderWrapper}>
                <ActivityIndicator color={colors.accent} size="small" />
                <Text style={styles.loaderLabel}>Computing route & surge fares…</Text>
              </View>
            )}

            {estimates.length > 0 && !loadingEstimates && (
              <View style={styles.homeEstimatesPanel}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#262D36', marginBottom: 20 }}>Choose a Ride</Text>
                
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  {estimates.map((est, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={{ borderWidth: 1, borderColor: selectedVehicle?.vehicleType === est.vehicleType ? '#0053B3' : '#E9EAEC', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: selectedVehicle?.vehicleType === est.vehicleType ? '#F3F8FF' : '#FFFFFF' }}
                      onPress={() => {
                        if (!isVehicleDisabled(est.vehicleType)) {
                          setSelectedVehicle(est);
                          setOfferedFare(est.fareDetails.totalFare);
                          if (bookingMode === 'pass') handleEstimatePass(est.vehicleType);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <Image 
                          source={(function(type) {
                            const t = type.toLowerCase();
                            if (t === 'bike') return require('./assets/bike_realistic.jpg');
                            if (t === 'auto') return require('./assets/auto_realistic.jpg');
                            if (t === 'sedan') return require('./assets/sedan_realistic.jpg');
                            if (t === 'suv') return require('./assets/suv_realistic.jpg');
                            return require('./assets/mini_realistic.jpg');
                          })(est.vehicleType)} 
                          style={{ width: 60, height: 40, resizeMode: 'contain' }} 
                        />
                        <View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={{ fontSize: 16, color: '#262D36', fontWeight: '500' }}>{est.vehicleType.charAt(0).toUpperCase() + est.vehicleType.slice(1)}</Text>
                            <Feather name="user" size={14} color="#7C848D" />
                            <Text style={{ fontSize: 14, color: '#7C848D' }}>{est.capacity || 4}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                            <Feather name="zap" size={12} color="#7C848D" />
                            <Text style={{ fontSize: 12, color: '#7C848D' }}>{est.eta ? est.eta : est.routeDetails.duration.toFixed(0)} min away</Text>
                          </View>
                        </View>
                      </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{ fontSize: 18, fontWeight: '600', color: '#262D36' }}>
                            ₹{est.fareDetails.totalFare}
                          </Text>
                          {est.fareDetails.passDiscount > 0 && (
                            <Text style={{ fontSize: 12, fontWeight: '500', color: '#7C848D', textDecorationLine: 'line-through' }}>
                              ₹{est.fareDetails.originalFare}
                            </Text>
                          )}
                        </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={{ marginTop: 24, paddingBottom: Platform.OS === 'ios' ? 20 : 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 16, color: '#262D36', fontWeight: '500' }}>₹ Cash</Text>
                      <Feather name="chevron-right" size={16} color="#262D36" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[{ backgroundColor: '#0053B3', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24 }, (bookingRide || isVehicleDisabled(selectedVehicle?.vehicleType)) && { opacity: 0.5 }]} 
                      onPress={bookingMode === 'pass' ? handlePurchasePass : handleBookRide}
                      disabled={bookingRide || isVehicleDisabled(selectedVehicle?.vehicleType)}
                    >
                      {bookingRide ? <ActivityIndicator color="#FCFCFC" /> : (
                        <Text style={{ color: '#FCFCFC', fontSize: 16, fontWeight: '600' }}>Confirm Ride ₹{offeredFare}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {estimates.length === 0 && !loadingEstimates && (
              <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                  {[
                    { icon: '\uD83D\uDE97', label: t('home.serviceCab') || 'Cab', mode: 'ride' },
                    { icon: '\uD83C\uDFCD\uFE0F', label: t('home.serviceBike') || 'Bike', mode: 'ride' },
                    { icon: '\uD83D\uDEFA', label: t('home.serviceAuto') || 'Auto', mode: 'ride' },
                  ].map((s, i) => (
                    <TouchableOpacity key={i} style={[styles.homeServiceChip, { width: '31%' }]} activeOpacity={0.8} onPress={() => { setBookingMode(s.mode as any); setPickerMode('drop'); }}>
                      <Text style={{ fontSize: 24 }}>{s.icon}</Text>
                      <Text style={styles.homeServiceLabel} numberOfLines={1}>{s.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Banner 1 (Top) - Auto swiping carousel */}
                {banner1List.length > 0 ? (
                  <TouchableOpacity 
                    style={[styles.promoBanner1, { padding: 0, overflow: 'hidden', height: 160 }]} 
                    activeOpacity={0.9} 
                    onPress={() => banner1List[banner1Index]?.linkUrl ? Linking.openURL(banner1List[banner1Index].linkUrl) : null}
                  >
                    <Image 
                      source={{ uri: banner1List[banner1Index]?.imageUrl ? (banner1List[banner1Index].imageUrl.startsWith('http') ? banner1List[banner1Index].imageUrl : `https://movex-cab.onrender.com${banner1List[banner1Index].imageUrl}`) : undefined }} 
                      style={{ width: '100%', height: '100%', resizeMode: 'cover' }} 
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.promoBanner1} activeOpacity={0.9}>
                    <View>
                      <Text style={styles.promoBannerTag}>{t('home.limitedOffer') || 'LIMITED OFFER'}</Text>
                      <Text style={styles.promoBannerTitle}>{t('home.firstRideFree') || 'FIRST RIDE FREE'}</Text>
                      <Text style={styles.promoBannerSub}>{t('home.offerNewUsers') || 'Offer detected for new users.'}</Text>
                      <View style={styles.promoBannerBtn}>
                        <Text style={styles.promoBannerBtnText}>{t('home.tapToApply') || 'Tap here to apply'} {'\u2192'}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 48, position: 'absolute', right: 16, bottom: 16, opacity: 0.6 }}>{'\uD83D\uDE80'}</Text>
                  </TouchableOpacity>
                )}

                {/* Banner 2 (Bottom) */}
                {banner2List.length > 0 ? (
                  <TouchableOpacity 
                    style={[styles.promoBanner2, { padding: 0, overflow: 'hidden', height: 120 }]} 
                    activeOpacity={0.9} 
                    onPress={() => banner2List[0]?.linkUrl ? Linking.openURL(banner2List[0].linkUrl) : setPickerMode('drop')}
                  >
                    <Image 
                      source={{ uri: banner2List[0]?.imageUrl ? (banner2List[0].imageUrl.startsWith('http') ? banner2List[0].imageUrl : `https://movex-cab.onrender.com${banner2List[0].imageUrl}`) : undefined }} 
                      style={{ width: '100%', height: '100%', resizeMode: 'cover' }} 
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.promoBanner2} activeOpacity={0.9} onPress={() => setPickerMode('drop')}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.promoBanner2Title}>{t('home.tapSearchBar') || 'Tap the search bar above'}</Text>
                      <Text style={styles.promoBanner2Sub}>{t('home.enterDestination') || 'and enter your destination'}</Text>
                      <Text style={{ fontSize: 28, marginTop: 8 }}>{'\uD83D\uDDFA\uFE0F'} {'\u27A1'} {'\uD83D\uDCCD'}</Text>
                    </View>
                    <Text style={{ fontSize: 52, opacity: 0.8 }}>{'\uD83D\uDCF1'}</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.homeTaglineRow}>
                  <Text style={styles.homeTagline}>#goMoveX</Text>
                  <Text style={styles.homeTaglineSub}>{t('home.yourCityYourRide') || 'Your city, your ride.'}</Text>
                </View>
              </ScrollView>
            )}
          </View>
            </View>
          )}
        </View>
      )}

      {/* ─────────────────── PASS TAB (REDESIGNED) ─────────────────── */}
      {activeTab === 'wallet' && (
        <MyPassScreen
          user={user}
          activePasses={activePasses}
          onBack={() => setActiveTab('home')}
          onNavigateHome={() => handleTabPress('home')}
          onNavigateHistory={() => handleTabPress('trips')}
          onUpgradePlan={() => setShowPassConfig(true)}
        />
      )}
      
      {activeTab === 'account' && (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, paddingHorizontal: 16, paddingTop: 40 }} contentContainerStyle={{ paddingBottom: 120 }}>
            {/* Header (Back button in image) */}
            <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.iconBg, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }} onPress={() => setActiveTab('home')}>
              <Feather name="chevron-left" size={24} color={colors.textPrimary} />
            </TouchableOpacity>

            {/* Profile Card */}
            <TouchableOpacity onPress={onNavigateProfile} style={{ backgroundColor: '#0053B3', borderRadius: 16, padding: 16, marginBottom: 20, shadowColor: colors.textPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }} activeOpacity={0.9}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#005FCC', alignItems: 'center', justifyContent: 'center', borderWidth: 2.1, borderColor: '#FCFCFC' }}>
                  <Feather name="user" size={28} color="#FCFCFC" />
                </View>
                <View style={{ justifyContent: 'center', flex: 1 }}>
                  <Text style={{ color: '#FCFCFC', fontSize: 16, fontWeight: '600', fontFamily: 'sans-serif' }}>{user?.name || 'Rider'}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4, letterSpacing: 1 }}>{user?.id?.substring(0, 9).toUpperCase() || 'FE2889108'}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 }}>
                    <Text style={{ color: '#FED101', fontSize: 14 }}>★</Text>
                    <Text style={{ color: '#FED101', fontSize: 14 }}>★</Text>
                    <Text style={{ color: '#FED101', fontSize: 14 }}>★</Text>
                    <Text style={{ color: '#FED101', fontSize: 14 }}>★</Text>
                    <Text style={{ color: '#8DABCE', fontSize: 14 }}>★</Text>
                    <Text style={{ color: '#FCFCFC', fontSize: 14, fontWeight: '500', marginLeft: 4 }}>4.9</Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={24} color="#FCFCFC" style={{ opacity: 1 }} />
              </View>
            </TouchableOpacity>

            {/* Referral Bonus */}
            <TouchableOpacity style={{ backgroundColor: colors.bgSecondary, borderRadius: 16, padding: 20, marginBottom: 20, flexDirection: 'column', gap: 4 }}>
              <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '400' }}>Upto ₹4,500 referral bonus</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>Refer your friend and earn</Text>
            </TouchableOpacity>

                        {/* Active Passes Block */}
            {activePasses.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textSecondary, marginBottom: 12 }}>Active Passes</Text>
                {activePasses.map((pass: any) => (
                  <View key={pass._id} style={{ backgroundColor: colors.bgSecondary, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, textTransform: 'capitalize' }}>{pass.pass?.name || pass.passType || pass.vehicleType || 'Gold'} Pass</Text>
                      <Text style={{ color: colors.success, fontSize: 12, fontWeight: '700' }}>ACTIVE</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <Text style={{ color: colors.accent, fontSize: 14 }}>{pass.validUntil ? Math.max(0, Math.ceil((new Date(pass.validUntil).getTime() - new Date().getTime()) / (1000 * 3600 * 24))) : 30} days remaining</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Options Block */}
            <View style={{ backgroundColor: colors.bgSecondary, borderRadius: 16, paddingHorizontal: 16, marginBottom: 20 }}>
              {([ { key: 'commutePass', label: 'Monthly Commute Pass', icon: 'calendar', color: '#0053B3', onPress: () => setShowPassConfig(true) },
                { key: 'darkTheme', icon: 'moon', color: '#0053B3', toggle: true },
                { key: 'appLanguage', icon: 'globe', color: '#0053B3', onPress: onNavigateLanguage } ] as any[]).map((item, idx) => (
                <View key={idx}>
                  <TouchableOpacity onPress={item.toggle ? toggleTheme : item.onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 }} activeOpacity={0.7} disabled={!item.toggle && !item.onPress}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.iconBg, borderWidth: 1.5, borderColor: '#0053B3', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <Text style={{ fontSize: 14, color: colors.textPrimary, fontWeight: '400', flex: 1 }}>{item.label || t('profile.' + item.key)}</Text>
                    {item.toggle ? (
                      <View style={[{ width: 56, height: 28, backgroundColor: '#DEE0E3', borderRadius: 16 }, isDark && { backgroundColor: '#22282F' }]}>
                        <View style={[{ position: 'absolute', top: -3, width: 34, height: 34, borderRadius: 17, backgroundColor: colors.textMuted, left: -3, shadowColor: colors.textPrimary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 }, isDark && { backgroundColor: '#0053B3', left: 25 }]} />
                      </View>
                    ) : (
                      <Feather name="chevron-right" size={24} color={colors.textPrimary} style={{ opacity: 1 }} />
                    )}
                  </TouchableOpacity>
                  {idx < 2 && <View style={{ height: 1, backgroundColor: colors.bgPrimary, marginHorizontal: -16 }} />}
                </View>
              ))}
            </View>

            {/* Support Block */}
            <View style={{ backgroundColor: colors.bgSecondary, borderRadius: 16, paddingHorizontal: 16, marginBottom: 20 }}>
              {([ { key: 'supportTickets', icon: 'message-square', color: '#0053B3', onPress: () => setShowSupportTicketScreen(true) },
                { key: 'settings', icon: 'settings', color: '#0053B3', onPress: () => setShowSettingsScreen(true) }, ] as any[]).map((item, idx) => (
                <View key={idx}>
                  <TouchableOpacity onPress={item.toggle ? toggleTheme : item.onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 }} activeOpacity={0.7} disabled={!item.toggle && !item.onPress}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.iconBg, borderWidth: 1.5, borderColor: '#0053B3', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <Text style={{ fontSize: 14, color: colors.textPrimary, fontWeight: '400', flex: 1 }}>{item.label || t('profile.' + item.key)}</Text>
                    <Feather name="chevron-right" size={24} color={colors.textPrimary} style={{ opacity: 1 }} />
                  </TouchableOpacity>
                  {idx < 2 && <View style={{ height: 1, backgroundColor: colors.bgPrimary, marginHorizontal: -16 }} />}
                </View>
              ))}
            </View>

            {/* Log out */}
            <TouchableOpacity style={{ flexDirection: 'row', gap: 10, borderWidth: 1, borderColor: '#F52F14', borderRadius: 16, padding: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 40 }} onPress={async () => { await logout(); }}>
              <Feather name="log-out" size={18} color="#F52F14" style={{ transform: [{ rotate: '180deg' }] }} />
              <Text style={{ color: '#F52F14', fontSize: 14, fontWeight: '400' }}>{t('app.Logout')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      )}

      {/* ─────────────────── TRIPS TAB ─────────────────── */}
      {activeTab === 'trips' && (
        <View style={styles.custTabPage}>
          <View style={{ marginTop: Platform.OS === 'ios' ? 40 : 60, paddingHorizontal: 16, marginBottom: 20 }}>
            <Text style={{ fontSize: 16, color: colors.textPrimary, fontWeight: '400' }}>Ride History</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.bgSecondary, borderRadius: 16, paddingHorizontal: 12, height: 48, marginHorizontal: 16, marginBottom: 24, gap: 8, backgroundColor: colors.bgPrimary }}>
            <Feather name="search" size={16} color={colors.textMuted} />
            <TextInput
              style={{ flex: 1, fontSize: 12, color: colors.textPrimary }}
              placeholder="search by location or date"
              placeholderTextColor={colors.textMuted}
              value={tripSearchQuery}
              onChangeText={setTripSearchQuery}
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, marginBottom: 20 }}>
            {['All', 'Completed', 'Cancelled'].map((filter) => {
              const isActive = activeTripFilter === filter;
              return (
                <TouchableOpacity 
                  key={filter} 
                  style={[{ height: 32, borderRadius: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }, isActive ? { backgroundColor: '#0053B3' } : { backgroundColor: '#DEE0E3' }]}
                  onPress={() => setActiveTripFilter(filter as any)}
                  activeOpacity={0.8}
                >
                  <Text style={[{ fontSize: 14, fontWeight: '400' }, isActive ? { color: '#FCFCFC' } : { color: colors.textSecondary }]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
          {loadingRides ? (
            <View style={styles.ridesLoader}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.ridesLoaderText}>Loading trips…</Text>
            </View>
          ) : (
            <FlatList
              data={myRides.filter(item => {
                if (activeTripFilter !== 'All' && item.status !== activeTripFilter.toLowerCase()) return false;
                if (tripSearchQuery) {
                  const q = tripSearchQuery.toLowerCase();
                  const pickup = (item.pickup?.address || '').toLowerCase();
                  const drop = (item.dropoff?.address || item.drop?.address || '').toLowerCase();
                  const dateStr = formatTripDate(item.createdAt).toLowerCase();
                  if (!pickup.includes(q) && !drop.includes(q) && !dateStr.includes(q)) return false;
                }
                return true;
              })}
              keyExtractor={(item) => item._id}
              contentContainerStyle={[styles.ridesList, { paddingBottom: 100 }]}
              ListEmptyComponent={
                <View style={styles.emptyRides}>
                  <Text style={{ fontSize: 48, marginBottom: 16 }}>{'\uD83D\uDE97'}</Text>
                  <Text style={styles.emptyRidesText}>No trips yet</Text>
                  <Text style={{ color: colors.textMuted, marginTop: 4 }}>Your ride history will appear here</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.custRideCard}>
                  <View style={styles.custRideHeader}>
                    <View style={styles.custRideVehicleChip}>
                      <Text style={{ fontSize: 18 }}>{getVehicleEmoji(item.vehicleType)}</Text>
                      <Text style={styles.custRideVehicleText}>{item.vehicleType?.toUpperCase()}</Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      item.status === 'completed' && styles.statusCompleted,
                      item.status === 'cancelled' && styles.statusCancelled
                    ]}>
                      <Text style={styles.statusBadgeText}>{item.status?.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.rideDate}>{formatTripDate(item.createdAt)}</Text>
                  <View style={styles.custRideRoute}>
                    <View style={styles.custRideRouteRow}>
                      <View style={styles.custRideDotGreen} />
                      <Text style={styles.addressLineText} numberOfLines={1}>{item.pickup?.address}</Text>
                    </View>
                    <View style={styles.custRideRouteLine} />
                    <View style={styles.custRideRouteRow}>
                      <View style={styles.custRideDotRed} />
                      <Text style={styles.addressLineText} numberOfLines={1}>{item.dropoff?.address || item.drop?.address}</Text>
                    </View>
                  </View>
                  <View style={styles.rideFooter}>
                    <Text style={styles.rideDriver}>Driver: {item.driver?.name || (item.status === 'searching' ? 'Searching...' : 'Partner')}</Text>
                    <Text style={styles.ridePrice}>{'\u20B9'}{item.fare?.totalFare || 0}</Text>
                  </View>
                  {(item.status === 'searching' || item.status === 'requested') && (
                    <TouchableOpacity 
                      style={{ marginTop: 12, backgroundColor: colors.danger || '#FF3B30', paddingVertical: 8, borderRadius: 8, alignItems: 'center' }}
                      onPress={() => handleCancelHistoryRide(item._id)}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cancel Ride</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          )}
        </View>
      )}


      {/* ─────────────────── WALLET TAB ─────────────────── */}
      {activeTab === 'services' && (
        <CustomerWalletScreen
          onBack={() => setActiveTab('home')}
          onNavigateHome={() => handleTabPress('home')}
          onNavigateHistory={() => handleTabPress('trips')}
        />
      )}

      {/* ─────────────────── BOTTOM TAB BAR (REDESIGNED) ─────────────────── */}
      {!(activeTab === 'home' && (!!dropAddr || (estimates && estimates.length > 0) || pickerMode !== null || showMap)) && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, position: 'absolute', bottom: 16, left: 16, right: 16, borderRadius: 20, backgroundColor: colors.bgSecondary, shadowColor: colors.textPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
        {([
          { key: 'home',     icon: 'home',  label: 'Home' },
          { key: 'wallet',   icon: 'credit-card', label: 'My Pass' },
          { key: 'services', icon: 'briefcase', label: 'Wallet' },
          { key: 'trips',    icon: 'clock', label: 'History' },
        ] as { key: 'home' | 'wallet' | 'services' | 'trips'; icon: string; label: string }[]).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={activeTab === tab.key ? { backgroundColor: '#F6F8FE', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 6 } : { padding: 8 }}
            onPress={() => handleTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <Feather name={tab.icon as any} size={activeTab === tab.key ? 18 : 24} color={activeTab === tab.key ? '#0053B3' : '#7C848D'} />
            {activeTab === tab.key && (
              <Text style={{ color: '#0053B3', fontSize: 14, fontWeight: '600', marginLeft: 6 }}>
                {tab.label}
              </Text>
            )}
          </TouchableOpacity>
        ))}
        </View>
      )}

      {/* ─────────────────── MANAGE PASS MODAL ─────────────────── */}
      <Modal visible={!!managePass} animationType="slide" transparent onRequestClose={() => setManagePass(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalInnerContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Today's Ride</Text>
              <TouchableOpacity onPress={() => setManagePass(null)} style={styles.modalCloseBtn}>
                <Feather name="x" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.inputFormGroup}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Text style={styles.inputLabel}>Skip Pickup Today?</Text>
                  <Switch value={skipPickup} onValueChange={setSkipPickup} trackColor={{ true: colors.accent }} />
                </View>

                {!skipPickup && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={styles.inputLabel}>Reschedule Pickup Time (HH:MM)</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput style={styles.formInput} placeholder={managePass?.pickupTime || "HH:MM"} placeholderTextColor={colors.textSecondary} value={newPickupTime} onChangeText={setNewPickupTime} />
                    </View>
                  </View>
                )}
              </View>

              {managePass?.isReturnTrip && (
                <View style={styles.inputFormGroup}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Text style={styles.inputLabel}>Skip Return Today?</Text>
                    <Switch value={skipReturn} onValueChange={setSkipReturn} trackColor={{ true: colors.accent }} />
                  </View>

                  {!skipReturn && (
                    <View style={{ marginBottom: 16 }}>
                      <Text style={styles.inputLabel}>Reschedule Return Time (HH:MM)</Text>
                      <View style={styles.inputWrapper}>
                        <TextInput style={styles.formInput} placeholder={managePass?.returnTime || "HH:MM"} placeholderTextColor={colors.textSecondary} value={newReturnTime} onChangeText={setNewReturnTime} />
                      </View>
                    </View>
                  )}
                </View>
              )}

              <TouchableOpacity style={{ backgroundColor: '#0053B3', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 }} onPress={handleUpdatePassException} disabled={savingPass}>
                {savingPass ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#FCFCFC', fontSize: 16, fontWeight: '700' }}>Save Changes</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─────────────────── WALLET MODAL ─────────────────── */}
      <Modal visible={showWalletModal} animationType="slide" transparent onRequestClose={() => setShowWalletModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalInnerContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Wallet Top-Up</Text>
              <TouchableOpacity onPress={() => setShowWalletModal(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.walletModalCard}>
                <Text style={styles.walletBalanceLabel}>Current Balance</Text>
                <Text style={styles.walletBalanceVal}>{'\u20B9'}{user?.wallet?.balance || 0}</Text>
              </View>
              <View style={styles.inputFormGroup}>
                <Text style={styles.inputLabel}>Enter Amount ({'\u20B9'})</Text>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.formInput} placeholder="e.g. 500" placeholderTextColor={colors.textSecondary} keyboardType="number-pad" value={walletAmount} onChangeText={setWalletAmount} />
                </View>
              </View>
              <View style={styles.quickAmountRow}>
                {['100', '200', '500'].map((amt) => (
                  <TouchableOpacity key={amt} style={styles.quickAmountBtn} onPress={() => setWalletAmount(amt)}>
                    <Text style={styles.quickAmountText}>+ {'\u20B9'}{amt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={[styles.premiumBookBtn, { marginTop: 8 }]} onPress={handleTopup} disabled={loadingWallet}>
                {loadingWallet ? <ActivityIndicator color={colors.bgSecondary} /> : <Text style={styles.premiumBookBtnText}>Add Money</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      {showPassConfig && (
        <View style={StyleSheet.absoluteFill}>
          <PassPurchaseScreen 
            onBack={() => setShowPassConfig(false)}
            onPassPurchased={() => {
              setShowPassConfig(false);
              if (onPassPurchased) onPassPurchased();
            }}
          />
        </View>
      )}
    </View>
  );
}

// 3. REVAMPED LIVE TRACKING & STATUS TIMELINE

function TrackingScreen({ ride, onClose }: { ride: any; onClose: () => void }) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const { socket } = useSocket();
  const { location } = useLocation();
  const mapRef = useRef<MapView>(null);

  const [localRide, setLocalRide] = useState(ride);
  const [rideStatus, setRideStatus] = useState(ride?.status);
  const [driverLoc, setDriverLoc] = useState<number[] | null>(
    ride?.driverLocation ? ride.driverLocation.coordinates : null
  );
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [nearbyDrivers, setNearbyDrivers] = useState<any[]>([]);
  const [driverInfo, setDriverInfo] = useState<any>({
    name: ride?.driver?.name || null,
    phone: ride?.driver?.phone || null,
    vehicle: ride?.driver?.vehicle || null
  });

  // Fetch nearby drivers if searching
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (rideStatus === 'searching' && ride?.pickup?.location?.coordinates) {
      const fetchDrivers = async () => {
        try {
          const coords = ride.pickup.location.coordinates;
          const res = await API.get(`/drivers/nearby?lng=${coords[0]}&lat=${coords[1]}&radius=2`);
          if (res.data.success) setNearbyDrivers(res.data.drivers);
        } catch {}
      };
      fetchDrivers();
      interval = setInterval(fetchDrivers, 5000);
    }
    return () => clearInterval(interval);
  }, [rideStatus, ride]);

  // ── Customer-side Navigation State ────────────────────────────────────────
  const [navStepIndex, setNavStepIndex]   = useState(0);
  const [distToTurn, setDistToTurn]       = useState(0);
  const [remainingDist, setRemainingDist] = useState((ride?.route?.distance || 0) * 1000);
  const [remainingETA, setRemainingETA]   = useState(Math.ceil(ride?.route?.duration || 0));
  const [routeProgress, setRouteProgress] = useState(0);
  const [custHeading, setCustHeading]     = useState(0);

  const polylinePoints = React.useMemo(
    () => (ride?.route?.polyline ? decodePolyline(ride.route.polyline) : []),
    [ride?.route?.polyline]
  );
  const totalRouteDist = (ride?.route?.distance || 0) * 1000; // metres
  const steps: any[]  = ride?.route?.steps || [];

  // Fetch populated booking on mount to get driver details if already accepted
  useEffect(() => {
    if (ride?._id) {
      API.get(`/bookings/${ride._id}`).then((res) => {
        if (res.data.success) {
          const b = res.data.data;
          setDriverInfo({
            name: b.driver?.name || null,
            phone: b.driver?.phone || null,
            vehicle: b.driver?.vehicle || null
          });
          setRideStatus(b.status);
          setLocalRide(b);
        }
      }).catch(() => {});
    }
  }, []);

  const animatedDriverLoc = useRef(
    new AnimatedRegion({
      latitude: ride?.driverLocation ? ride.driverLocation.coordinates[1] : (ride?.pickup?.location?.coordinates[1] || 0),
      longitude: ride?.driverLocation ? ride.driverLocation.coordinates[0] : (ride?.pickup?.location?.coordinates[0] || 0),
      latitudeDelta: 0,
      longitudeDelta: 0
    })
  ).current;

  // Animate driver location updates
  useEffect(() => {
    if (driverLoc) {
      (animatedDriverLoc.timing as any)({
        latitude: driverLoc[1],
        longitude: driverLoc[0],
        latitudeDelta: 0,
        longitudeDelta: 0,
        duration: 3000,
        useNativeDriver: false
      }).start();
    }
  }, [driverLoc]);

  // ── Socket listeners ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !ride) return;

    const joinTracking = () => {
      socket.emit('tracking:join', { bookingId: ride._id });
    };

    joinTracking();
    socket.on('connect', joinTracking);

    socket.on('ride:accepted', (data: any) => {
      if (data.driverInfo) setDriverInfo(data.driverInfo);
      if (data.booking) {
        setLocalRide(data.booking);
      }
      setRideStatus('accepted');
    });

    socket.on('booking:status', (data: any) => {
      setRideStatus(data.status);
      if (data.status === 'cancelled') {
        Alert.alert('Trip Cancelled', data.reason || 'Your ride was cancelled by the counterpart.');
        onClose();
      }
    });

    socket.on('driver:location', (data: any) => {
      setDriverLoc(data.location.coordinates);
    });

    socket.on('ride:driverArrived', () => { setRideStatus('arrived'); });
    socket.on('ride:started',       () => { setRideStatus('in_progress'); });
    socket.on('ride:completed',     () => { setRideStatus('completed'); });
    socket.on('ride:payment_pending', () => { setRideStatus('payment_pending'); });

    return () => {
      socket.off('connect', joinTracking);
      socket.off('ride:accepted');
      socket.off('booking:status');
      socket.off('driver:location');
      socket.off('ride:driverArrived');
      socket.off('ride:started');
      socket.off('ride:completed');
      socket.off('ride:payment_pending');
    };
  }, [socket, ride]);

  // ── Customer live navigation (fires when GPS updates & trip is active) ────
  useEffect(() => {
    if (!location || rideStatus !== 'in_progress') return;

    const { latitude, longitude, heading } = location.coords;
    if (heading !== null && heading >= 0) setCustHeading(heading);

    if (steps.length > 0) {
      const nav = getActiveNavStep(steps, latitude, longitude);
      setNavStepIndex(nav.stepIndex);
      setDistToTurn(nav.distToTurn);
      setRemainingDist(nav.remainingDist);
      setRemainingETA(nav.remainingETA);
    } else if (polylinePoints.length > 0) {
      // Fallback: nearest polyline point → remaining distance
      let nearestIdx = 0, nearestDist = Infinity;
      polylinePoints.forEach((pt: any, i: number) => {
        const d = haversineDistance(latitude, longitude, pt.latitude, pt.longitude);
        if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
      });

      let rem = 0;
      for (let i = nearestIdx; i < polylinePoints.length - 1; i++) {
        rem += haversineDistance(
          polylinePoints[i].latitude, polylinePoints[i].longitude,
          polylinePoints[i + 1].latitude, polylinePoints[i + 1].longitude
        );
      }
      setRemainingDist(rem);
      setRemainingETA(Math.ceil((rem / 1000 / 30) * 60));

      // Distance to next turn (bearing change > 25°)
      let turnDist = 0, foundTurn = false;
      for (let i = nearestIdx; i < polylinePoints.length - 2 && !foundTurn; i++) {
        const b1 = computeBearing(
          polylinePoints[i].latitude, polylinePoints[i].longitude,
          polylinePoints[i + 1].latitude, polylinePoints[i + 1].longitude
        );
        const b2 = computeBearing(
          polylinePoints[i + 1].latitude, polylinePoints[i + 1].longitude,
          polylinePoints[i + 2].latitude, polylinePoints[i + 2].longitude
        );
        const diff = Math.abs(b2 - b1) % 360;
        const angle = diff > 180 ? 360 - diff : diff;
        turnDist += haversineDistance(
          polylinePoints[i].latitude, polylinePoints[i].longitude,
          polylinePoints[i + 1].latitude, polylinePoints[i + 1].longitude
        );
        if (angle > 25) foundTurn = true;
      }
      setDistToTurn(foundTurn ? turnDist : rem);
    }

    // Progress bar
    if (totalRouteDist > 0) {
      const travelled = totalRouteDist - remainingDist;
      setRouteProgress(Math.min(Math.max(travelled / totalRouteDist, 0), 1));
    }

    // Camera tracks customer
    if (mapRef.current) {
      mapRef.current.animateCamera(
        {
          center:  { latitude, longitude },
          heading: heading && heading >= 0 ? heading : custHeading,
          pitch:   55,
          zoom:    17,
        },
        { duration: 800 }
      );
    }
  }, [location, rideStatus]);

  // Initial camera tilt when trip starts
  useEffect(() => {
    if (rideStatus === 'in_progress' && mapRef.current) {
      setTimeout(() => {
        const lat = location?.coords.latitude  ?? (ride?.pickup?.location?.coordinates[1] || 0);
        const lng = location?.coords.longitude ?? (ride?.pickup?.location?.coordinates[0] || 0);
        mapRef.current?.animateCamera(
          { pitch: 55, heading: 0, zoom: 17, center: { latitude: lat, longitude: lng } },
          { duration: 2000 }
        );
      }, 400);
    }
    // Zoom out to overview when trip ends
    if (rideStatus === 'completed' && mapRef.current && ride?.drop?.location) {
      mapRef.current.animateCamera(
        {
          center: {
            latitude:  ride.drop.location.coordinates[1],
            longitude: ride.drop.location.coordinates[0],
          },
          pitch:   0,
          zoom:    14,
          heading: 0,
        },
        { duration: 1500 }
      );
    }
  }, [rideStatus]);

  // ── Nav HUD data ───────────────────────────────────────────────────────────
  const currentStep = steps[navStepIndex] || null;
  const maneuver    = getManeuverIcon(
    currentStep?.maneuver?.type     || 'straight',
    currentStep?.maneuver?.modifier || 'straight'
  );
  const nextStreet = currentStep?.name || ride?.drop?.address || 'Destination';

  // ── Helpers ────────────────────────────────────────────────────────────────
  const handleCancelRide = () => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              let res;
              if (ride.pickupDateTime) {
                res = await API.post(`/scheduled-rides/${ride._id}/cancel`, { reason: 'Cancelled by customer' });
              } else {
                res = await API.put(`/bookings/${ride._id}/cancel`, { reason: 'Cancelled by customer' });
              }
              if (res.data.success) {
                Alert.alert('Ride Cancelled', 'Your ride has been successfully cancelled.');
                onClose();
              }
            } catch (e: any) {
              Alert.alert('Error', e.response?.data?.message || 'Failed to cancel ride');
            } finally { setCancelling(false); }
          }
        }
      ]
    );
  };

  const handleRate = async () => {
    setSubmittingRating(true);
    setTimeout(() => { setSubmittingRating(false); onClose(); }, 1200);
  };

  const getStepStatusStyle = (stepName: string) => {
    const statuses = ['accepted', 'arrived', 'in_progress', 'completed'];
    const currentIdx = statuses.indexOf(rideStatus);
    const stepIdx    = statuses.indexOf(stepName);
    return currentIdx >= stepIdx ? styles.stepDotActive : styles.stepDotInactive;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (!ride) return null;

  if (rideStatus === 'payment_pending') {
    return (
      <CustomerQRScannerScreen 
        ride={ride} 
        onPaymentComplete={() => setRideStatus('completed')} 
        onClose={onClose} 
      />
    );
  }

  return (
    <View style={styles.container}>

      {/* ── MAP ── */}
      <MapView provider={PROVIDER_GOOGLE}
        ref={mapRef}
        style={styles.map}
        customMapStyle={rideStatus === 'in_progress' ? LIGHT_MAP_STYLE : mapStyle}
        initialRegion={{
          latitude:      ride.pickup.location.coordinates[1],
          longitude:     ride.pickup.location.coordinates[0],
          latitudeDelta:  0.04,
          longitudeDelta: 0.04,
        }}
      >
{/* Customer live position (only when navigating) */}
        {location && rideStatus === 'in_progress' && (
          <Marker
            coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.custNavPin}>
              <View style={styles.custNavPinInner} />
            </View>
          </Marker>
        )}

        {/* Pickup marker (hidden during navigation to reduce clutter) */}
        {rideStatus !== 'in_progress' && (
          <Marker
            coordinate={{
              latitude:  ride.pickup.location.coordinates[1],
              longitude: ride.pickup.location.coordinates[0],
            }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[styles.olaPin, {backgroundColor: 'rgba(0,194,99,0.15)'}]}><View style={[styles.olaPinInner, {backgroundColor: colors.success}]} /></View>
          </Marker>
        )}

        {/* Drop / destination marker */}
        <Marker
          coordinate={{
            latitude:  ride.drop.location.coordinates[1],
            longitude: ride.drop.location.coordinates[0],
          }}
          pinColor="red"
          title="Your Destination"
        />

        {/* Nearby drivers when searching */}
        {rideStatus === 'searching' && nearbyDrivers.map((d, i) => (
          <Marker key={`nearby-${d._id || i}`} coordinate={{ latitude: d.currentLocation.coordinates[1], longitude: d.currentLocation.coordinates[0] }}>
            <Image source={getVehicle3DIcon(d.vehicle?.type || '')} style={{ width: 44, height: 44, resizeMode: 'contain', opacity: 0.7 }} />
          </Marker>
        ))}

        {/* Animated driver position */}
        {driverLoc && (
          <Marker.Animated coordinate={animatedDriverLoc as any} title="Driver">
            <Image source={getVehicle3DIcon(ride.vehicleType || '')} style={{ width: 48, height: 48, resizeMode: 'contain' }} />
          </Marker.Animated>
        )}

        {/* Route polyline */}
        {polylinePoints.length > 0 && (
          <Polyline
            coordinates={polylinePoints}
            strokeColor={rideStatus === 'in_progress' ? colors.accentCyan : colors.accent}
            strokeWidth={rideStatus === 'in_progress' ? 6 : 4}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapView>

      {/* ── CUSTOMER NAVIGATION HUD (in_progress only) ── */}
      {rideStatus === 'in_progress' && (
        <View style={styles.custNavHudWrapper} pointerEvents="none">

          {/* Ride-in-progress banner above turn card */}
          <View style={styles.custNavBanner}>
            <View style={styles.custNavBannerDot} />
            <Text style={styles.custNavBannerText}>You're on your way</Text>
            <Text style={styles.custNavBannerSub}>  ·  {formatDistance(remainingDist)} remaining</Text>
          </View>

          {/* Turn instruction card */}
          <View style={styles.custNavHudCard}>
            <View style={styles.custNavArrowBox}>
              <Text style={styles.custNavArrowIcon}>{maneuver.icon}</Text>
            </View>
            <View style={styles.navInfoCol}>
              <Text style={styles.custNavDistText}>In {formatDistance(distToTurn)}</Text>
              <Text style={styles.custNavManeuverText} numberOfLines={1}>{maneuver.label}</Text>
              <Text style={styles.custNavStreetText} numberOfLines={1}>{nextStreet}</Text>
            </View>
          </View>

          {/* Progress + ETA strip */}
          <View style={styles.custNavEtaStrip}>
            <View style={styles.navProgressBar}>
              <View style={[styles.custNavProgressFill, { width: `${Math.round(routeProgress * 100)}%` }]} />
            </View>
            <View style={styles.navEtaRow}>
              <Text style={styles.custNavEtaText}>🕒 {remainingETA} min</Text>
              <Text style={styles.custNavEtaText}>📍 {formatDistance(remainingDist)}</Text>
              <Text style={styles.custNavEtaText}>↓ {ride.drop?.address?.split(',')[0]}</Text>
            </View>
          </View>
        </View>
      )}

      {/* ── Pre-trip sheet — rendered as absolute overlay directly on screen ── */}
      {(rideStatus === 'accepted' || rideStatus === 'arrived') && (
        <CustomerBookedRideSheet
          driverInfo={driverInfo}
          rideInfo={localRide}
          rideStatus={rideStatus}
          onCall={() => Alert.alert('Calling Driver', 'Initiating call...')}
          onMessage={() => Alert.alert('Message', 'Opening chat...')}
          onCancel={handleCancelRide}
        />
      )}

      {/* ── BOTTOM SHEET (searching / in_progress / completed only) ── */}
      {(rideStatus === 'requested' || rideStatus === 'searching' || rideStatus === 'in_progress' || rideStatus === 'completed') && (
      <View style={rideStatus === 'in_progress' ? styles.custNavBottomSheet : styles.custNavBottomSheet}>
        <View style={styles.sheetHandle} />

        {/* ── Searching ── */}
        {(rideStatus === 'requested' || rideStatus === 'searching') && (
          <View style={{ paddingVertical: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={{ marginTop: 15, fontSize: 16, fontWeight: '700', color: colors.textSecondary }}>
              Waiting for a driver to accept...
            </Text>
            <TouchableOpacity
              style={[styles.premiumButton, { backgroundColor: colors.danger, marginTop: 25, width: '100%' }]}
              onPress={handleCancelRide}
              disabled={cancelling}
            >
              {cancelling ? <ActivityIndicator color={colors.bgSecondary} /> : <Text style={styles.premiumButtonText}>Cancel Request</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* ── In-progress compact bottom row ── */}
        {rideStatus === 'in_progress' && (
          <CustomerInRideOptions
            rideId={localRide._id}
            initialPaymentMethod={localRide.paymentMethod}
            driverName={driverInfo?.name}
            vehiclePlate={driverInfo?.vehicle?.plateNumber || localRide.vehicleType?.toUpperCase()}
            fare={localRide.fare?.totalFare || 0}
          />
        )}

        {/* ── Completed / Rating ── */}
        {rideStatus === 'completed' && (
          <View style={styles.ratingSection}>
            <Text style={styles.ratingTitleText}>How was your MoveX trip?</Text>
            <Text style={styles.ratingSubText}>Rate your journey experience below</Text>
            <View style={styles.starsWrapper}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Text style={[styles.starEmoji, rating >= star && { color: colors.warning }]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              placeholder="Leave comments (optional)..."
              placeholderTextColor={colors.textSecondary}
              style={[styles.revampInput, { marginTop: 15, height: 60, textAlignVertical: 'top' }]}
              value={review}
              onChangeText={setReview}
              multiline
            />
            <TouchableOpacity style={[styles.premiumButton, { marginTop: 15 }]} onPress={handleRate}>
              {submittingRating ? <ActivityIndicator color={colors.bgSecondary} /> : <Text style={styles.premiumButtonText}>Submit Feedback</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>
      )}
    </View>
  );
}


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  return (
    <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <LocationProvider>
              <SocketProvider>
                <NavigationRoot />
              </SocketProvider>
            </LocationProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
  );
}

// --- ADMIN SCREENS ---
// --- DRIVER SCREENS ---
function DriverHomeScreen({ onRideAccepted, onNavigateProfile, onNavigateHistory, onNavigateWallet }: { onRideAccepted: (ride: any) => void; onNavigateProfile: () => void; onNavigateHistory: () => void; onNavigateWallet: () => void; }) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const { user, updateOnlineStatus, logout } = useAuth();
  const { t } = useLanguage();
  const { location } = useLocation();
  const { socket, connected } = useSocket();
  const [isOnline, setIsOnline] = useState(user?.isOnline || false);
  const [showEmergencyScreen, setShowEmergencyScreen] = useState(false);
  const [showNotificationScreen, setShowNotificationScreen] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState<any>(null);
  const [scanAnim] = useState(new Animated.Value(0));

  const [earningsData, setEarningsData] = useState<any>(null);

  // Fetch earnings
  useEffect(() => {
    if (!isOnline) {
      fetchEarnings();
    }
  }, [isOnline]);

  const fetchEarnings = async () => {
    try {
      const res = await API.get('/drivers/earnings');
      if (res.data.success) {
        setEarningsData(res.data);
      }
    } catch (e) {
      console.log('Failed to fetch earnings');
    }
  };

  const getTodayEarnings = () => {
    if (!earningsData?.rides) return 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    return earningsData.rides
      .filter((r: any) => new Date(r.completedAt) >= today)
      .reduce((sum: number, r: any) => sum + (r.fare?.driverShare || r.fare?.totalFare * 0.8 || 0), 0).toFixed(0);
  };

  const getTotalTrips = () => {
    if (!earningsData?.rides) return 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    return earningsData.rides.filter((r: any) => new Date(r.completedAt) >= today).length;
  };

  const getTripHours = () => {
    return earningsData?.onlineHours || 0;
  };

  useEffect(() => {
    if (isOnline && !incomingRequest) {
      scanAnim.setValue(0);
      Animated.loop(
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        })
      ).start();
    } else {
      scanAnim.stopAnimation();
      scanAnim.setValue(0);
    }
  }, [isOnline, incomingRequest, scanAnim]);

  const locationRef = useRef(location);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    if (!socket || !connected || !user) return;

    if (isOnline) {
      socket.emit('driver:online', {
        driverId: user._id,
        location: {
          type: 'Point',
          coordinates: location ? [location.coords.longitude, location.coords.latitude] : [80.2707, 13.0827]
        },
        vehicleType: user.vehicle?.type
      });

      const interval = setInterval(() => {
        const currLoc = locationRef.current;
        if (currLoc) {
          socket.emit('location:update', {
            driverId: user._id,
            location: {
              type: 'Point',
              coordinates: [currLoc.coords.longitude, currLoc.coords.latitude]
            }
          });
          // Also update the database so the driver shows up in GeoJSON queries
          API.put('/drivers/location', {
            latitude: currLoc.coords.latitude,
            longitude: currLoc.coords.longitude
          }).catch(() => {});
        }
      }, 5000);

      socket.on('ride:incoming', (payload: any) => {
        setIncomingRequest(payload);
      });

      socket.on('ride:expired', () => {
        setIncomingRequest(null);
      });

      return () => {
        clearInterval(interval);
        socket.off('ride:incoming');
        socket.off('ride:expired');
      };
    } else {
      socket.emit('driver:offline', { driverId: user._id });
    }
  }, [socket, connected, isOnline, user]);

  const toggleOnline = async (value: boolean) => {
    if (value && user?.approvalStatus !== 'approved') {
      Alert.alert('Verification Pending', 'Your documents are under verification. Please wait for admin approval.');
      return;
    }
    const success = await updateOnlineStatus(value);
    if (success) {
      setIsOnline(value);
    }
  };

  const handleAcceptRide = async () => {
    if (!incomingRequest || !socket) return;
    try {
      const response = await API.put(`/bookings/${incomingRequest.bookingId}/accept`, {});
      if (response.data.success) {
        socket.emit('ride:accept', {
          bookingId: incomingRequest.bookingId,
          driverId: user._id,
          driverInfo: {
            name: user.name,
            phone: user.phone,
            vehicle: user.vehicle
          },
          booking: response.data.data
        });
        const currentRide = response.data.data;
        setIncomingRequest(null);
        onRideAccepted(currentRide);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to accept ride');
      setIncomingRequest(null);
    }
  };

  const handleRejectRide = () => {
    if (incomingRequest && socket) {
      socket.emit('ride:reject', {
        bookingId: incomingRequest.bookingId,
        driverId: user._id
      });
      setIncomingRequest(null);
    }
  };

  return (
    <View style={styles.container}>
      <EmergencyScreen visible={showEmergencyScreen} onClose={() => setShowEmergencyScreen(false)} />
      <NotificationScreen visible={showNotificationScreen} onClose={() => setShowNotificationScreen(false)} />
      {isOnline ? (
        <>
          {location && (
            <View style={{ flex: 1, width: '100%', height: '100%', position: 'absolute' }}>
              <MapView provider={PROVIDER_GOOGLE}
                style={StyleSheet.absoluteFill}
                customMapStyle={mapStyle}
                showsUserLocation={true}
                showsMyLocationButton={true}
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.03,
                  longitudeDelta: 0.03
                }}
              >
</MapView>
              
              {/* Radar Effect Overlay removed */}
            </View>
          )}
          
          {/* Top Header Card for Online Mode */}
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.bgSecondary,
            borderWidth: 1,
            borderColor: colors.bgSecondary,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            paddingTop: Platform.OS === 'ios' ? 80 : 60,
            paddingBottom: 25,
            zIndex: 10,
          }}>
            <View style={{ paddingHorizontal: 16 }}>
              {/* Profile & Greeting Row */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <TouchableOpacity onPress={onNavigateProfile} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.bgTertiary, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={require('./assets/icon.png')} style={{ width: 48, height: 48 }} />
                  </View>
                  <View style={{ flexDirection: 'column', gap: 4 }}>
                    <Text style={{ fontFamily: 'sans-serif', fontSize: 14, color: colors.textMuted }}>{t('driverHome.goodMorning') || 'Good Morning'}</Text>
                    <Text style={{ fontFamily: 'sans-serif', fontSize: 20, color: colors.textPrimary }}>{user?.name?.split(' ')[0] || 'Driver'}</Text>
                  </View>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity onPress={() => setShowEmergencyScreen(true)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEECEC', borderWidth: 1.5, borderColor: '#F71313', alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="alert-triangle" size={18} color="#F71313" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowNotificationScreen(true)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.iconBg, borderWidth: 1.2, borderColor: '#9098A2', alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="bell" size={18} color="#9098A2" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Status & Online Toggle Row */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'column', gap: 4 }}>
                  <Text style={{ fontFamily: 'sans-serif', fontSize: 12, color: colors.textMuted }}>Status</Text>
                  <Text style={{ fontFamily: 'sans-serif', fontSize: 20, color: colors.textPrimary }}>You're Online</Text>
                  <Text style={{ fontFamily: 'sans-serif', fontSize: 14, color: colors.textMuted }}>Waiting for new ride requests.</Text>
                </View>
                <View style={{ justifyContent: 'center' }}>
                  <Switch 
                    value={isOnline} 
                    onValueChange={toggleOnline}
                    trackColor={{ false: '#DEE0E3', true: '#0053B3' }}
                    thumbColor={'#FCFCFC'}
                    style={Platform.OS === 'ios' ? { transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] } : undefined}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={{
            position: 'absolute',
            top: Platform.OS === 'ios' ? 240 : 220,
            alignSelf: 'center',
            backgroundColor: colors.bgSecondary,
            borderRadius: 24,
            paddingHorizontal: 20,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            shadowColor: colors.textPrimary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5,
            zIndex: 10,
          }}>
            <Text style={{ fontFamily: 'sans-serif', fontSize: 16, color: colors.textPrimary, fontWeight: '500' }}>Waiting for rides</Text>
            <ActivityIndicator size="small" color="#0053B3" />
          </View>

          {/* Bottom Navigation */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, position: 'absolute', bottom: 16, left: 16, right: 16, borderRadius: 20, backgroundColor: colors.bgSecondary, shadowColor: colors.textPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, zIndex: 10 }}>
            <TouchableOpacity style={{ backgroundColor: '#0053B3', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather name="home" size={18} color="#FCFCFC" />
              <Text style={{ color: '#FCFCFC', fontSize: 14 }}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 8 }}>
              <Feather name="award" size={24} color="#9098A2" />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 8 }}>
              <Feather name="credit-card" size={24} color="#9098A2" />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 8 }} onPress={onNavigateHistory}>
              <Feather name="clock" size={24} color="#9098A2" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        /* OFFLINE DASHBOARD */
        <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
          
          {/* Top Header Card */}
          <View style={{
            backgroundColor: colors.bgSecondary,
            borderWidth: 1,
            borderColor: colors.bgSecondary,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            paddingTop: Platform.OS === 'ios' ? 80 : 60,
            paddingBottom: 25,
            zIndex: 10,
          }}>
            <View style={{ paddingHorizontal: 16 }}>
              {/* Profile & Greeting Row */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <TouchableOpacity onPress={onNavigateProfile} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.bgTertiary, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={require('./assets/icon.png')} style={{ width: 48, height: 48 }} />
                  </View>
                  <View style={{ flexDirection: 'column', gap: 4 }}>
                    <Text style={{ fontFamily: 'sans-serif', fontSize: 14, color: colors.textMuted }}>{t('driverHome.goodMorning') || 'Good Morning'}</Text>
                    <Text style={{ fontFamily: 'sans-serif', fontSize: 20, color: colors.textPrimary }}>{user?.name?.split(' ')[0] || 'Driver'}</Text>
                  </View>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity onPress={() => setShowEmergencyScreen(true)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEECEC', borderWidth: 1.5, borderColor: '#F71313', alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="alert-triangle" size={18} color="#F71313" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowNotificationScreen(true)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.iconBg, borderWidth: 1.2, borderColor: '#9098A2', alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="bell" size={18} color="#9098A2" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Status & Online Toggle Row */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'column', gap: 4 }}>
                  <Text style={{ fontFamily: 'sans-serif', fontSize: 12, color: colors.textMuted }}>Status</Text>
                  <Text style={{ fontFamily: 'sans-serif', fontSize: 20, color: colors.textPrimary }}>You're Offline</Text>
                  <Text style={{ fontFamily: 'sans-serif', fontSize: 14, color: colors.textMuted }}>Go Online to Receive Trips</Text>
                </View>
                <View style={{ justifyContent: 'center' }}>
                  <Switch 
                    value={isOnline} 
                    onValueChange={toggleOnline}
                    trackColor={{ false: '#DEE0E3', true: '#0053B3' }}
                    thumbColor={'#FCFCFC'}
                    style={Platform.OS === 'ios' ? { transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] } : undefined}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Scrollable Dashboard Content */}
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 30, paddingBottom: 100 }}>
            
            {/* Earnings & Wallet Row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <View style={{ flexDirection: 'column', gap: 8 }}>
                <Text style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#6F839A' }}>Today's Earnings</Text>
                <Text style={{ fontFamily: 'sans-serif', fontSize: 28, fontWeight: '500', color: colors.textPrimary }}>₹ {getTodayEarnings()}</Text>
              </View>
              <TouchableOpacity 
                style={{ backgroundColor: colors.bgPrimary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}
              >
                <Feather name="briefcase" size={18} color={earningsData?.walletBalance < 0 ? '#DC2626' : '#0053B3'} />
                <Text style={{ fontSize: 16, fontWeight: '600', color: earningsData?.walletBalance < 0 ? '#DC2626' : colors.textPrimary }}>
                  ₹ {earningsData?.walletBalance !== undefined ? earningsData.walletBalance.toFixed(2) : '0.00'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 3 Metrics Cards */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 10 }}>
              <View style={{ flex: 1, backgroundColor: colors.bgSecondary, borderWidth: 1, borderColor: colors.bgSecondary, borderRadius: 12, paddingVertical: 12, alignItems: 'center', gap: 8 }}>
                <Text style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#C0C2C4' }}>Trips</Text>
                <Text style={{ fontFamily: 'sans-serif', fontSize: 16, color: colors.textPrimary }}>{getTotalTrips()}</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: colors.bgSecondary, borderWidth: 1, borderColor: colors.bgSecondary, borderRadius: 12, paddingVertical: 12, alignItems: 'center', gap: 8 }}>
                <Text style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#C0C2C4' }}>Online hrs</Text>
                <Text style={{ fontFamily: 'sans-serif', fontSize: 16, color: colors.textPrimary }}>{getTripHours()}h</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: colors.bgSecondary, borderWidth: 1, borderColor: colors.bgSecondary, borderRadius: 12, paddingVertical: 12, alignItems: 'center', gap: 8 }}>
                <Text style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#C0C2C4' }}>Distance</Text>
                <Text style={{ fontFamily: 'sans-serif', fontSize: 16, color: colors.textPrimary }}>{getTotalTrips() * 5} km</Text>
              </View>
            </View>

            {/* Offers Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontFamily: 'sans-serif', fontSize: 14, color: colors.textPrimary }}>All Offers</Text>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#0053B3' }}>View All</Text>
                <Feather name="chevron-right" size={14} color="#0053B3" />
              </TouchableOpacity>
            </View>

            {/* Offer Card */}
            <View style={{ backgroundColor: colors.bgSecondary, borderWidth: 1, borderColor: colors.bgSecondary, borderRadius: 12, padding: 12, marginBottom: 24 }}>
              <Text style={{ fontFamily: 'sans-serif', fontSize: 14, color: colors.textMuted, letterSpacing: 0.5, marginBottom: 4 }}>Friday Full Offer</Text>
              <Text style={{ fontFamily: 'sans-serif', fontSize: 12, color: colors.textPrimary, letterSpacing: 0.5, marginBottom: 20 }}>12am - 12am</Text>

              {/* Targets */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'sans-serif', fontSize: 12, color: colors.textPrimary, letterSpacing: 0.5 }}>Incentive</Text>
                  <Text style={{ fontFamily: 'sans-serif', fontSize: 12, color: colors.textPrimary, letterSpacing: 0.5, marginTop: 40 }}>Order</Text>
                </View>
                
                <View style={{ flexDirection: 'row', gap: 24, flex: 3, justifyContent: 'space-around' }}>
                  {[{amt: 250, orders: 10}, {amt: 350, orders: 14}, {amt: 450, orders: 20}].map((target, idx) => (
                    <View key={idx} style={{ alignItems: 'center', gap: 16 }}>
                      <Text style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#0053B3', letterSpacing: 0.5 }}>₹ {target.amt}</Text>
                      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#9098A2', alignItems: 'center', justifyContent: 'center' }}>
                        <Feather name="check" size={14} color="#FCFCFC" />
                      </View>
                      <Text style={{ fontFamily: 'sans-serif', fontSize: 12, color: colors.textPrimary, letterSpacing: 0.5 }}>{target.orders}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Compulsory Login */}
              <View style={{ flexDirection: 'column', gap: 12 }}>
                <Text style={{ fontFamily: 'sans-serif', fontSize: 12, color: colors.textPrimary, letterSpacing: 0.5 }}>Compulsory login</Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgPrimary, padding: 8, borderRadius: 4, gap: 8 }}>
                    <Feather name="clock" size={16} color={colors.textPrimary} />
                    <Text style={{ fontFamily: 'sans-serif', fontSize: 12, color: colors.textPrimary, letterSpacing: 0.5 }}>7am - 10am</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgPrimary, padding: 8, borderRadius: 4, gap: 8 }}>
                    <Feather name="clock" size={16} color={colors.textPrimary} />
                    <Text style={{ fontFamily: 'sans-serif', fontSize: 12, color: colors.textPrimary, letterSpacing: 0.5 }}>7pm - 10pm</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* EV Banner Card */}
            <View style={{ backgroundColor: '#1A1919', borderRadius: 12, height: 162, padding: 16, overflow: 'hidden', position: 'relative', marginBottom: 16 }}>
              <View style={{ backgroundColor: colors.textPrimary, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 12 }}>
                <Text style={{ color: colors.borderGlass, fontSize: 8, letterSpacing: 1, textTransform: 'uppercase' }}>ATHER</Text>
              </View>
              <Text style={{ color: '#BCBEC0', fontSize: 16, letterSpacing: 0.5 }}>Rent EV.</Text>
              <Text style={{ color: '#00A7CC', fontSize: 18, letterSpacing: 0.5, marginBottom: 12, fontWeight: 'bold' }}>Earn More.</Text>
              
              <Text style={{ color: '#F6F8FE', fontSize: 8, letterSpacing: 0.5 }}>Ride the future</Text>
              <Text style={{ color: '#038CAB', fontSize: 12, letterSpacing: 0.5, marginBottom: 12 }}>₹ 141/day</Text>

              <TouchableOpacity style={{ backgroundColor: '#00A7CC', borderRadius: 4, paddingVertical: 4, paddingHorizontal: 12, alignSelf: 'flex-start' }}>
                <Text style={{ color: colors.textPrimary, fontSize: 10, letterSpacing: 0.5 }}>Know more</Text>
              </TouchableOpacity>

              <View style={{ position: 'absolute', right: -20, top: 10, width: 175, height: 163, alignItems: 'center', justifyContent: 'center' }}>
                 <Image source={require('./assets/icon.png')} style={{ width: 100, height: 100, opacity: 0.5 }} resizeMode="contain" />
              </View>
            </View>

            {/* Additional Ad Banner 1 */}
            <View style={{ backgroundColor: '#E0F2FE', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderWidth: 1, borderColor: '#BAE6FD' }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0369A1', marginBottom: 4 }}>Get Driver Insurance</Text>
                <Text style={{ fontSize: 12, color: '#0284C7', marginBottom: 10 }}>Protect yourself and your vehicle starting at ₹199/month.</Text>
                <TouchableOpacity style={{ backgroundColor: '#0284C7', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 }}>
                  <Text style={{ color: colors.bgSecondary, fontSize: 12, fontWeight: '600' }}>Apply Now</Text>
                </TouchableOpacity>
              </View>
              <View style={{ width: 60, height: 60, backgroundColor: '#BAE6FD', borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="shield" size={28} color="#0284C7" />
              </View>
            </View>

            {/* Additional Ad Banner 2 */}
            <View style={{ backgroundColor: '#FEF3C7', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, borderWidth: 1, borderColor: '#FDE68A' }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#B45309', marginBottom: 4 }}>Car Maintenance Offer</Text>
                <Text style={{ fontSize: 12, color: '#D97706', marginBottom: 10 }}>Flat 20% off on full service at partner garages this weekend.</Text>
                <TouchableOpacity style={{ backgroundColor: '#D97706', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 }}>
                  <Text style={{ color: colors.bgSecondary, fontSize: 12, fontWeight: '600' }}>Claim Offer</Text>
                </TouchableOpacity>
              </View>
              <View style={{ width: 60, height: 60, backgroundColor: '#FDE68A', borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="tool" size={28} color="#D97706" />
              </View>
            </View>

          </ScrollView>

          {/* Bottom Navigation */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, position: 'absolute', bottom: 16, left: 16, right: 16, borderRadius: 20, backgroundColor: colors.bgSecondary, shadowColor: colors.textPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
            <TouchableOpacity style={{ backgroundColor: '#0053B3', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather name="home" size={18} color="#FCFCFC" />
              <Text style={{ color: '#FCFCFC', fontSize: 14 }}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 8 }}>
              <Feather name="award" size={24} color="#9098A2" />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 8 }} onPress={onNavigateWallet}>
              <Feather name="briefcase" size={24} color="#9098A2" />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 8 }} onPress={onNavigateHistory}>
              <Feather name="clock" size={24} color="#9098A2" />
            </TouchableOpacity>
          </View>
        </View>
      )}




      {/* ── New Ride Request Overlay ── */}
      {incomingRequest && (
        <View style={styles.incomingOverlayLight}>
          <View style={styles.incomingSheetLight}>
            <Text style={styles.incomingTitleLight}>New Ride Request</Text>

            <View style={styles.incomingRouteCardLight}>
              <View style={styles.incomingRouteTimeline}>
                <View style={styles.incomingDotGreenLight} />
                <View style={styles.incomingDashedLine} />
                <View style={styles.incomingDotRedLight} />
              </View>
              <View style={styles.incomingRouteDetails}>
                <View style={styles.incomingRouteItem}>
                  <Text style={styles.incomingRouteLabelLight}>Pickup Location</Text>
                  <Text style={styles.incomingRouteTextLight} numberOfLines={2}>
                    {incomingRequest.pickup.address}
                  </Text>
                </View>
                <View style={styles.incomingRouteItemDrop}>
                  <Text style={styles.incomingRouteLabelLight}>Drop Location</Text>
                  <Text style={styles.incomingRouteTextLight} numberOfLines={2}>
                    {incomingRequest.drop.address}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.incomingStatsRowLight}>
              <View style={styles.incomingStatChipLight}>
                <Text style={styles.incomingStatLabelLight}>Distance</Text>
                <Text style={styles.incomingStatValLight}>{incomingRequest.route.distance} km</Text>
              </View>
              <View style={styles.incomingStatDividerLight} />
              <View style={styles.incomingStatChipLight}>
                <Text style={styles.incomingStatLabelLight}>Est. Earnings</Text>
                <Text style={styles.incomingStatValLight}>
                  {'₹'}{incomingRequest.estimatedEarnings}
                </Text>
              </View>
            </View>

            <View style={styles.incomingBtnRowLight}>
              <TouchableOpacity
                style={styles.incomingDeclineBtnLight}
                onPress={handleRejectRide}
                activeOpacity={0.85}
              >
                <Text style={styles.incomingDeclineBtnTextLight}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.incomingAcceptBtnLight}
                onPress={handleAcceptRide}
                activeOpacity={0.85}
              >
                <Text style={styles.incomingAcceptBtnTextLight}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

    </View>
  );
}

// ─── Navigation Helper Functions ────────────────────────────────────────────

/** Distance in metres between two lat/lon points (Haversine) */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // metres
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Bearing in degrees (0–360) from point A to point B */
function computeBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
  const x =
    Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
    Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
}

/** Map an OSRM maneuver type+modifier to a display icon and label */
function getManeuverIcon(type: string, modifier: string): { icon: string; label: string } {
  if (type === 'arrive') return { icon: '🏁', label: 'Arrive at destination' };
  if (type === 'depart') return { icon: '▶', label: 'Depart' };
  if (type === 'rotary' || type === 'roundabout') return { icon: '🔄', label: 'Take the roundabout' };

  switch (modifier) {
    case 'uturn':          return { icon: '↩', label: 'Make a U-turn' };
    case 'sharp right':   return { icon: '↱', label: 'Sharp right' };
    case 'right':         return { icon: '→', label: 'Turn right' };
    case 'slight right':  return { icon: '↗', label: 'Keep slight right' };
    case 'straight':      return { icon: '↑', label: 'Continue straight' };
    case 'slight left':   return { icon: '↖', label: 'Keep slight left' };
    case 'left':          return { icon: '←', label: 'Turn left' };
    case 'sharp left':    return { icon: '↰', label: 'Sharp left' };
    default:              return { icon: '↑', label: 'Continue' };
  }
}

/** Format metres into a human-readable distance string */
function formatDistance(metres: number): string {
  if (metres >= 1000) return `${(metres / 1000).toFixed(1)} km`;
  if (metres >= 100)  return `${Math.round(metres / 50) * 50} m`;
  return `${Math.round(metres)} m`;
}

/**
 * Walk through OSRM steps to find the current active step.
 * Returns the step index, distance to the maneuver point, and cumulative
 * remaining distance/duration from the driver's current position.
 */
function getActiveNavStep(
  steps: any[],
  driverLat: number,
  driverLon: number
): { stepIndex: number; distToTurn: number; remainingDist: number; remainingETA: number } {
  if (!steps || steps.length === 0) {
    return { stepIndex: 0, distToTurn: 0, remainingDist: 0, remainingETA: 0 };
  }

  let bestStep = 0;
  let bestDist = Infinity;

  // Find the closest step maneuver point to the driver's current location
  for (let i = 0; i < steps.length; i++) {
    const loc = steps[i].maneuver?.location; // [lng, lat]
    if (!loc) continue;
    const d = haversineDistance(driverLat, driverLon, loc[1], loc[0]);
    if (d < bestDist) {
      bestDist = d;
      bestStep = i;
    }
  }

  // The next step to execute is one ahead of the closest maneuver point
  const nextStep = Math.min(bestStep + 1, steps.length - 1);
  const nextLoc  = steps[nextStep]?.maneuver?.location;
  const distToTurn = nextLoc
    ? haversineDistance(driverLat, driverLon, nextLoc[1], nextLoc[0])
    : 0;

  // Sum remaining distance and duration from current step onwards
  let remainingDist = distToTurn;
  let remainingETA  = 0;
  for (let i = nextStep; i < steps.length; i++) {
    remainingDist += (steps[i].distance || 0);
    remainingETA  += (steps[i].duration || 0);
  }

  return {
    stepIndex: nextStep,
    distToTurn,
    remainingDist,
    remainingETA: Math.ceil(remainingETA / 60), // minutes
  };
}

// ─── Driver Active Ride Screen ────────────────────────────────────────────────

function DriverActiveRideScreen({ ride, onClose }: { ride: any; onClose: () => void }) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const { location } = useLocation();
  const { socket } = useSocket();
  
  const [rideData, setRideData] = useState(ride);
  const [rideStatus, setRideStatus] = useState(ride.status);
  const [otp, setOtp] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (!socket) return;
    
    const joinTracking = () => {
      if (rideData?._id) {
        socket.emit('tracking:join', { bookingId: rideData._id });
      }
    };
    joinTracking();
    socket.on('connect', joinTracking);

    const handlePaymentUpdate = (data: any) => {
      setRideData((prev: any) => ({
        ...prev,
        paymentMethod: data.paymentMethod,
        tipAmount: data.tipAmount
      }));
    };
    
    const handleBookingStatus = (data: any) => {
      if (data.status) setRideStatus(data.status);
    };

    socket.on('booking:payment_updated', handlePaymentUpdate);
    socket.on('booking:status', handleBookingStatus);
    socket.on('ride:completed', () => setRideStatus('completed'));

    return () => {
      socket.off('connect', joinTracking);
      socket.off('booking:payment_updated', handlePaymentUpdate);
      socket.off('booking:status', handleBookingStatus);
      socket.off('ride:completed');
    };
  }, [socket, rideData?._id]);

  // Navigation state
  const [navStepIndex, setNavStepIndex]       = useState(0);
  const [distToTurn, setDistToTurn]           = useState(0);
  const [remainingDist, setRemainingDist]     = useState((rideData.route?.distance || 0) * 1000);
  const [remainingETA, setRemainingETA]       = useState(rideData.route?.duration || 0);
  const [driverHeading, setDriverHeading]     = useState(0);
  const [routeProgress, setRouteProgress]     = useState(0); // 0–1

  // Decoded polyline points (memoised — only changes if ride changes)
  const polylinePoints = React.useMemo(
    () => (rideData.route?.polyline ? decodePolyline(rideData.route.polyline) : []),
    [rideData.route?.polyline]
  );

  const totalRouteDist = (rideData.route?.distance || 0) * 1000; // metres
  const steps: any[]  = rideData.route?.steps || [];

  // ── Live navigation computation ───────────────────────────────────────────
  useEffect(() => {
    if (!location || rideStatus !== 'in_progress') return;

    const { latitude, longitude, heading } = location.coords;

    // Update heading
    if (heading !== null && heading >= 0) setDriverHeading(heading);

    // If we have OSRM steps use them; otherwise derive from polyline bearing
    if (steps.length > 0) {
      const nav = getActiveNavStep(steps, latitude, longitude);
      setNavStepIndex(nav.stepIndex);
      setDistToTurn(nav.distToTurn);
      setRemainingDist(nav.remainingDist);
      setRemainingETA(nav.remainingETA);
    } else if (polylinePoints.length > 0) {
      // Fallback: find nearest polyline point and compute remaining path length
      let nearestIdx = 0;
      let nearestDist = Infinity;
      polylinePoints.forEach((pt: any, i: number) => {
        const d = haversineDistance(latitude, longitude, pt.latitude, pt.longitude);
        if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
      });

      // Remaining distance = sum of segments from nearest point to end
      let rem = 0;
      for (let i = nearestIdx; i < polylinePoints.length - 1; i++) {
        rem += haversineDistance(
          polylinePoints[i].latitude, polylinePoints[i].longitude,
          polylinePoints[i + 1].latitude, polylinePoints[i + 1].longitude
        );
      }
      setRemainingDist(rem);
      setRemainingETA(Math.ceil((rem / 1000 / 30) * 60)); // 30 km/h avg

      // Distance to next significant turn (bearing change > 25°)
      let turnDist = 0;
      let foundTurn = false;
      for (let i = nearestIdx; i < polylinePoints.length - 2 && !foundTurn; i++) {
        const b1 = computeBearing(
          polylinePoints[i].latitude, polylinePoints[i].longitude,
          polylinePoints[i + 1].latitude, polylinePoints[i + 1].longitude
        );
        const b2 = computeBearing(
          polylinePoints[i + 1].latitude, polylinePoints[i + 1].longitude,
          polylinePoints[i + 2].latitude, polylinePoints[i + 2].longitude
        );
        const diff = Math.abs(b2 - b1) % 360;
        const angle = diff > 180 ? 360 - diff : diff;
        turnDist += haversineDistance(
          polylinePoints[i].latitude, polylinePoints[i].longitude,
          polylinePoints[i + 1].latitude, polylinePoints[i + 1].longitude
        );
        if (angle > 25) { foundTurn = true; }
      }
      setDistToTurn(foundTurn ? turnDist : rem);
    }

    // Route progress
    if (totalRouteDist > 0) {
      const travelled = totalRouteDist - remainingDist;
      setRouteProgress(Math.min(Math.max(travelled / totalRouteDist, 0), 1));
    }

    // Auto-track camera while navigating
    if (mapRef.current) {
      mapRef.current.animateCamera(
        {
          center:  { latitude, longitude },
          heading: heading && heading >= 0 ? heading : driverHeading,
          pitch:   60,
          zoom:    18,
        },
        { duration: 800 }
      );
    }
  }, [location, rideStatus]);

  // ── Animate to pickup location when ride is first accepted ──────────────
  useEffect(() => {
    if (mapRef.current && ride.pickup?.location?.coordinates) {
      const pickupLat = ride.pickup.location.coordinates[1];
      const pickupLng = ride.pickup.location.coordinates[0];
      setTimeout(() => {
        mapRef.current?.animateToRegion(
          {
            latitude:      pickupLat,
            longitude:     pickupLng,
            latitudeDelta:  0.015,
            longitudeDelta: 0.015,
          },
          1200
        );
      }, 400);
    }
  }, []);

  // ── Initial camera tilt when trip starts ─────────────────────────────────
  useEffect(() => {
    if (rideStatus === 'in_progress' && mapRef.current) {
      setTimeout(() => {
        const lat = location?.coords.latitude  ?? ride.pickup.location.coordinates[1];
        const lng = location?.coords.longitude ?? ride.pickup.location.coordinates[0];
        mapRef.current?.animateCamera(
          { pitch: 60, heading: 0, zoom: 18, center: { latitude: lat, longitude: lng } },
          { duration: 2000 }
        );
      }, 300);
    }
  }, [rideStatus]);

  // ── Current step info ─────────────────────────────────────────────────────
  const currentStep = steps[navStepIndex] || null;
  const maneuver    = getManeuverIcon(
    currentStep?.maneuver?.type     || 'straight',
    currentStep?.maneuver?.modifier || 'straight'
  );
  const nextStreet = currentStep?.name || ride.drop?.address || 'Destination';

  // ── Status handlers ───────────────────────────────────────────────────────
  const handleArrived = async () => {
    setLoading(true);
    try {
      const response = await API.put(`/bookings/${ride._id}/arrived`, {});
      if (response.data.success) {
        setRideStatus('arrived');
        if (socket) socket.emit('ride:driverArrived', { bookingId: ride._id });
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update status');
    } finally { setLoading(false); }
  };

  const handleStartTrip = async (providedOtp?: string) => {
    const finalOtp = typeof providedOtp === 'string' ? providedOtp : otp;
    if (!finalOtp) return Alert.alert('OTP Required', 'Please enter verification OTP from rider');
    setLoading(true);
    try {
      const response = await API.put(`/bookings/${ride._id}/start`, { otp: finalOtp });
      if (response.data.success) {
        setRideStatus('in_progress');
        if (socket) socket.emit('ride:started', { bookingId: ride._id });
      }
    } catch (e: any) {
      Alert.alert('Error', 'Invalid OTP verification code');
    } finally { setLoading(false); }
  };

  const handleCompleteTrip = async () => {
    setLoading(true);
    try {
      const response = await API.put(`/bookings/${rideData._id}/complete`, {});
      if (response.data.success) {
        if (response.data.isPaymentPending) {
           setRideStatus('payment_pending');
           setRideData(response.data.data);
           return;
        }

        setRideStatus('completed');
        
        if (response.data.isWalletNegative) {
          Alert.alert(
            'Insufficient Balance',
            `Your wallet balance is ₹${response.data.walletBalance}. You cannot accept new rides until you add funds.`
          );
        }

        if (socket) socket.emit('ride:completed', {
          bookingId: rideData._id,
          driverId: rideData.driver,
          fare: response.data.data.fare.finalFare || rideData.fare.totalFare
        });
        
        // Update local state with the final booking from the server so the payment sheet shows the tip properly
        setRideData(response.data.data);
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to complete trip');
    } finally { setLoading(false); }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (rideStatus === 'arrived') {
    return (
      <View style={styles.container}>
        <MapView provider={PROVIDER_GOOGLE}
          ref={mapRef}
          style={styles.map}
          customMapStyle={LIGHT_MAP_STYLE}
          initialRegion={{
            latitude:      ride.pickup.location.coordinates[1],
            longitude:     ride.pickup.location.coordinates[0],
            latitudeDelta:  0.012,
            longitudeDelta: 0.012,
          }}
        >
{location && (
            <Marker
              coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.navDriverPin}><View style={styles.navDriverPinInner} /></View>
            </Marker>
          )}
          <Marker
            coordinate={{
              latitude:  ride.pickup.location.coordinates[1],
              longitude: ride.pickup.location.coordinates[0],
            }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[styles.olaPin, {backgroundColor: 'rgba(0,194,99,0.15)'}]}><View style={[styles.olaPinInner, {backgroundColor: colors.success}]} /></View>
          </Marker>

          {/* NEW: Show route and dropoff when OTP is verified */}
          {isOtpVerified && rideData.drop && (
            <Marker
              coordinate={{
                latitude: rideData.drop.location.coordinates[1],
                longitude: rideData.drop.location.coordinates[0],
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={[styles.olaPin, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
                <View style={[styles.olaPinInner, {backgroundColor: colors.danger}]} />
              </View>
            </Marker>
          )}
          {isOtpVerified && polylinePoints.length > 0 && (
            <Polyline coordinates={polylinePoints} strokeColor={colors.accent} strokeWidth={5} />
          )}
        </MapView>
        <SlideToStartScreen 
           onStart={handleStartTrip}
           onVerify={async (providedOtp) => {
             try {
               setLoading(true);
               const response = await API.post(`/bookings/${ride._id}/verify-otp`, { otp: providedOtp });
               if (response.data.success) {
                 setIsOtpVerified(true);
                 if (mapRef.current && ride.drop) {
                   mapRef.current.fitToCoordinates([
                     { latitude: ride.pickup.location.coordinates[1], longitude: ride.pickup.location.coordinates[0] },
                     { latitude: ride.drop.location.coordinates[1], longitude: ride.drop.location.coordinates[0] }
                   ], { edgePadding: { top: 50, right: 50, bottom: 400, left: 50 }, animated: true });
                 }
                 return true;
               }
             } catch (e: any) {
               Alert.alert('Error', 'Invalid OTP verification code');
             } finally {
               setLoading(false);
             }
             return false;
           }}
           pickupAddress={ride.pickup?.address || 'Pickup location'}
           customerName={ride.customer?.name}
           customerPhone={ride.customer?.phoneNumber}
        />
      </View>
    );
  }

  // ── Completed state: show payment collection screen ──
  if (rideStatus === 'completed' || rideStatus === 'payment_pending') {
    return (
      <View style={styles.container}>
        <MapView provider={PROVIDER_GOOGLE}
          ref={mapRef}
          style={styles.map}
          customMapStyle={LIGHT_MAP_STYLE}
          initialRegion={{
            latitude:  ride.drop.location.coordinates[1],
            longitude: ride.drop.location.coordinates[0],
            latitudeDelta:  0.015,
            longitudeDelta: 0.015,
          }}
        >
{location && (
            <Marker
              coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.navDriverPin}><View style={styles.navDriverPinInner} /></View>
            </Marker>
          )}
          <Marker
            coordinate={{
              latitude:  rideData.drop.location.coordinates[1],
              longitude: rideData.drop.location.coordinates[0],
            }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[styles.olaPin, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
              <View style={[styles.olaPinInner, {backgroundColor: colors.danger}]} />
            </View>
          </Marker>
        </MapView>
        <TripCompletedPaymentSheet
          ride={{...rideData, status: rideStatus}}
          driverId={rideData.driver?._id || rideData.driver}
          onComplete={onClose}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── MAP ── */}
      <MapView provider={PROVIDER_GOOGLE}
        ref={mapRef}
        style={styles.map}
        customMapStyle={rideStatus === 'in_progress' ? LIGHT_MAP_STYLE : mapStyle}
        initialRegion={{
          latitude:      ride.pickup.location.coordinates[1],
          longitude:     ride.pickup.location.coordinates[0],
          latitudeDelta:  0.03,
          longitudeDelta: 0.03,
        }}
      >
{/* Driver position */}
        {location && (
          <Marker
            coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.navDriverPin}>
              <View style={styles.navDriverPinInner} />
            </View>
          </Marker>
        )}

        {/* Pickup marker */}
        <Marker
          coordinate={{
            latitude:  ride.pickup.location.coordinates[1],
            longitude: ride.pickup.location.coordinates[0],
          }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={[styles.olaPin, {backgroundColor: 'rgba(0,194,99,0.15)'}]}><View style={[styles.olaPinInner, {backgroundColor: colors.success}]} /></View>
        </Marker>

        {/* Drop marker */}
        {rideStatus !== 'accepted' && (
          <Marker
            coordinate={{
              latitude:  ride.drop.location.coordinates[1],
              longitude: ride.drop.location.coordinates[0],
            }}
            pinColor="red"
            title="Dropoff"
          />
        )}

        {/* Route polyline — remaining portion highlighted */}
        {rideStatus !== 'accepted' && polylinePoints.length > 0 && (
          <Polyline
            coordinates={polylinePoints}
            strokeColor={rideStatus === 'in_progress' ? '#001456' : colors.accent}
            strokeWidth={rideStatus === 'in_progress' ? 6 : 4}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapView>

      {/* ── NAVIGATION HUD (only during active trip) ── */}
      {rideStatus === 'in_progress' && (
        <View style={styles.navHudWrapper} pointerEvents="none">

          {/* Top card: turn arrow + instruction */}
          <View style={styles.navHudCard}>
            <View style={styles.navArrowBox}>
              <Text style={styles.navArrowIcon}>{maneuver.icon}</Text>
            </View>
            <View style={styles.navInfoCol}>
              <Text style={styles.navDistText}>
                In {formatDistance(distToTurn)}
              </Text>
              <Text style={styles.navManeuverText} numberOfLines={1}>
                {maneuver.label}
              </Text>
              <Text style={styles.navStreetText} numberOfLines={1}>
                {nextStreet}
              </Text>
            </View>
          </View>

          {/* Progress + ETA strip */}
          <View style={styles.navEtaStrip}>
            <View style={styles.navProgressBar}>
              <View style={[styles.navProgressFill, { width: `${Math.round(routeProgress * 100)}%` }]} />
            </View>
            <View style={styles.navEtaRow}>
              <Text style={styles.navEtaText}>
                🕒 {remainingETA} min
              </Text>
              <Text style={styles.navEtaText}>
                📍 {formatDistance(remainingDist)}
              </Text>
              <Text style={styles.navEtaText}>
                ↓ {ride.drop?.address?.split(',')[0] || 'Destination'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* ── Heading to pickup top bar ── */}
      {rideStatus === 'accepted' && (
        <View style={{ position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
           <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.bgSecondary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.textPrimary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 }}>
              <Feather name="menu" size={20} color={colors.textPrimary} />
           </TouchableOpacity>
           <View style={{ backgroundColor: '#0053B3', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
              <Text style={{ color: colors.bgSecondary, fontSize: 14, fontWeight: '600' }}>Heading to pickup</Text>
           </View>
           <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.bgSecondary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.textPrimary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 }}>
              <Feather name="alert-circle" size={20} color="#F71313" />
           </TouchableOpacity>
        </View>
      )}

      {/* ── Pre-trip info header (arrived only) ── */}
      {rideStatus === 'arrived' && (
        <View style={styles.navPreTripHeader}>
          <View style={styles.navPreTripRow}>
            <View style={styles.dotGreen} />
            <Text style={styles.navPreTripAddr} numberOfLines={1}>{ride.pickup?.address}</Text>
          </View>
          <View style={[styles.navPreTripRow, { marginTop: 8 }]}>
            <View style={styles.dotRed} />
            <Text style={styles.navPreTripAddr} numberOfLines={1}>{ride.drop?.address}</Text>
          </View>
          <View style={styles.navPreTripMeta}>
            <Text style={styles.navPreTripMetaText}>📏 {ride.route?.distance || '—'} km</Text>
            <Text style={styles.navPreTripMetaText}>⏱ {ride.route?.duration ? `${Math.ceil(ride.route.duration)} min` : '—'}</Text>
            <Text style={[styles.navPreTripMetaText, { color: colors.success }]}>₹ {ride.fare?.driverShare || Math.round(ride.fare?.totalFare * 0.8) || '—'}</Text>
          </View>
        </View>
      )}

      {/* ── Bottom action sheet ── */}
      {rideStatus === 'accepted' ? (
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.bgSecondary,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
          paddingBottom: Platform.OS === 'ios' ? 40 : 24,
          shadowColor: colors.textPrimary,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 10,
        }}>
          <Text style={{ fontSize: 18, color: colors.textPrimary, fontWeight: '600', marginBottom: 16 }}>{ride.customer?.name || ride.user?.name || 'Customer'}</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#2ecc71', marginTop: 6, marginRight: 12 }} />
            <View style={{ flex: 1 }}>
               <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>Pickup Location</Text>
               <Text style={{ fontSize: 14, color: colors.textPrimary, fontWeight: '500' }}>{ride.pickup?.address}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingLeft: 22 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
              <Feather name="map-pin" size={14} color={colors.textMuted} style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 12, color: colors.textMuted }}>{ride.route?.distance ? (ride.route.distance / 2).toFixed(1) : '1.8'} km away</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="clock" size={14} color={colors.textMuted} style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 12, color: colors.textMuted }}>{ride.route?.duration ? Math.ceil(ride.route.duration / 2) : 4} mins</Text>
            </View>
          </View>

          <TouchableOpacity style={{ backgroundColor: '#0053B3', borderRadius: 12, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 24 }}>
            <Feather name="navigation" size={18} color={colors.bgSecondary} style={{ marginRight: 8, transform: [{ rotate: '45deg' }] }} />
            <Text style={{ color: colors.bgSecondary, fontSize: 16, fontWeight: '500' }}>Map Navigation</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 }}>
            <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => {
              if (ride.customer?.phone) {
                Linking.openURL(`tel:${ride.customer.phone}`);
              } else {
                Alert.alert('Error', 'Customer phone number not available');
              }
            }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.iconBg, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                 <Feather name="phone-call" size={20} color="#0053B3" />
              </View>
              <Text style={{ fontSize: 12, color: colors.textPrimary }}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => {
              if (ride.customer?.phone) {
                Linking.openURL(`sms:${ride.customer.phone}`);
              } else {
                Alert.alert('Error', 'Customer phone number not available');
              }
            }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.iconBg, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                 <Feather name="message-square" size={20} color="#0053B3" />
              </View>
              <Text style={{ fontSize: 12, color: colors.textPrimary }}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignItems: 'center' }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#FEECEC', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                 <Feather name="x" size={20} color="#F71313" />
              </View>
              <Text style={{ fontSize: 12, color: colors.textPrimary }}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={{ backgroundColor: colors.bgPrimary, borderRadius: 24, height: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 }}
            onPress={handleArrived}
            disabled={loading}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#0053B3', alignItems: 'center', justifyContent: 'center' }}>
              {loading ? <ActivityIndicator size="small" color={colors.bgSecondary} /> : <Feather name="chevron-right" size={24} color={colors.bgSecondary} />}
            </View>
            <Text style={{ flex: 1, textAlign: 'center', fontSize: 14, color: colors.textMuted, fontWeight: '500', paddingRight: 40 }}>Arrived at location</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.revampActiveRideSheet}>
          <View style={styles.sheetHandle} />

          {rideStatus !== 'in_progress' && (
            <Text style={styles.trackingTitle}>
              Active Job: {rideStatus.replace('_', ' ').toUpperCase()}
            </Text>
          )}

          {rideStatus === 'in_progress' && (
            <View style={styles.navBottomRow}>
              <View>
                <Text style={styles.navBottomLabel}>DESTINATION</Text>
                <Text style={styles.navBottomVal} numberOfLines={1}>
                  {rideData.drop?.address?.split(',')[0]}
                </Text>
              </View>
              <TouchableOpacity style={styles.navCompleteBtn} onPress={handleCompleteTrip} disabled={loading}>
                {loading
                  ? <ActivityIndicator color={colors.bgSecondary} />
                  : <Text style={styles.premiumButtonText}>Complete Trip</Text>
                }
              </TouchableOpacity>
            </View>
          )}

          {rideStatus === 'arrived' && (
            <View style={{ gap: 14 }}>
              <View style={styles.premiumInputWrapper}>
                <Text style={styles.premiumInputIcon}>🔑</Text>
                <TextInput
                  placeholder="Enter customer verification OTP"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.premiumInput, { textAlign: 'center', letterSpacing: 4 }]}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                />
              </View>
              <TouchableOpacity style={styles.premiumButton} onPress={() => handleStartTrip()} disabled={loading}>
                {loading ? <ActivityIndicator color={colors.bgSecondary} /> : <Text style={styles.premiumButtonText}>Verify & Start Trip</Text>}
              </TouchableOpacity>
            </View>
          )}


        </View>
      )}
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    color: colors.bgSecondary,
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.bgPrimary
  },
  authBadgeGlow: {
    position: 'absolute',
    top: '15%',
    left: '20%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  authCard: {
    padding: 28,
    borderRadius: 24,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10
  },
  brandIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  brandIconText: {
    fontSize: 28
  },
  authTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5
  },
  authSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 28
  },
  inputGroup: {
    gap: 16
  },
  premiumInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: colors.borderGlass,
    borderRadius: 12,
    paddingHorizontal: 16
  },
  premiumInputIcon: {
    fontSize: 16,
    marginRight: 10
  },
  premiumInput: {
    flex: 1,
    paddingVertical: 15,
    color: colors.textPrimary,
    fontSize: 15
  },
  premiumButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 8
  },
  premiumButtonText: {
    color: colors.bgSecondary,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5
  },
  otpLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4
  },
  backButton: {
    alignItems: 'center',
    marginTop: 12
  },
  backButtonText: {
    color: colors.accentCyan,
    fontSize: 14,
    fontWeight: '600'
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  floatingPremiumHeader: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: colors.bgGlass,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6
  },
  nearbyVehicleMarker: {
    backgroundColor: colors.bgSecondary,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.accent,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4
  },
  olaPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  olaPinInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.textPrimary,
    borderWidth: 2,
    borderColor: colors.bgSecondary
  },
  radarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  greetText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600'
  },
  greetName: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2
  },
  headerWalletCard: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: colors.borderGlass,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'flex-end'
  },
  walletLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.8
  },
  walletVal: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 1
  },
  revampBookingSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bgSecondary,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1,
    borderTopColor: colors.borderGlass,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 16
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: colors.textMuted,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginVertical: 12
  },
  sheetTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.2
  },
  searchContainer: {
    gap: 10
  },
  inputSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: colors.borderGlass,
    borderRadius: 12,
    paddingHorizontal: 16
  },
  circleIndicatorGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 12
  },
  circleIndicatorRed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    marginRight: 12
  },
  revampInput: {
    flex: 1,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontSize: 15
  },
  revampSearchResults: {
    maxHeight: 140,
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden'
  },
  revampResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGlass
  },
  pinIcon: {
    fontSize: 14,
    marginRight: 10
  },
  revampResultText: {
    color: colors.textPrimary,
    fontSize: 14,
    flex: 1
  },
  estimateLoaderWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    gap: 8
  },
  loaderLabel: {
    color: colors.textSecondary,
    fontSize: 13
  },
  estimatesContainer: {
    marginTop: 20
  },
  estimatesTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12
  },
  estimatesScroll: {
    paddingVertical: 4
  },
  estimatesCard: {
    width: 105,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderWidth: 1,
    borderColor: colors.borderGlass,
    borderRadius: 14,
    padding: 14,
    marginRight: 12,
    alignItems: 'center',
    gap: 4
  },
  estimatesCardActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentGlow
  },
  estEmoji: {
    fontSize: 24
  },
  estType: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  estFare: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800'
  },
  estTime: {
    color: colors.textSecondary,
    fontSize: 11
  },
  premiumBookBtn: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 16
  },
  premiumBookBtnText: {
    color: colors.bgSecondary,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5
  },
  revampTrackingSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bgSecondary,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1,
    borderTopColor: colors.borderGlass,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 16
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGlass,
    marginBottom: 20
  },
  timelineStep: {
    alignItems: 'center',
    gap: 6
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  stepDotActive: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6
  },
  activeCategoryIcon: {
    color: colors.accent,
    textShadowColor: colors.accentGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8
  },
  
  // End DRIVER SCREENS STYLES
  toggleContainer: {
    alignItems: 'flex-end',
    gap: 4
  },
  toggleText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  dashboardSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bgSecondary,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1,
    borderTopColor: colors.borderGlass,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 16
  },
  earningsTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 12
  },
  earningsCardRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  earningsBox: {
    flex: 1,
    alignItems: 'center'
  },
  boxLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '700'
  },
  boxVal: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4
  },
  verticalDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.borderGlass
  },
  vehicleInfoBar: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 16,
    lineHeight: 18
  },
  incomingModalContainer: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 24,
    zIndex: 40
  },
  incomingCard: {
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    borderRadius: 24,
    padding: 24,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20
  },
  incomingModalTitle: {
    color: colors.warning,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5
  },
  rideDetailBox: {
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24
  },
  addressLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  dotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success
  },
  dotRed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger
  },
  addressLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  addressText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2
  },
  rowDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: colors.borderGlass,
    paddingTop: 16
  },
  addressValText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16
  },
  modalBtn: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },

  // ── Light Theme Incoming Request (Figma) ──
  incomingOverlayLight: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  incomingSheetLight: {
    backgroundColor: colors.bgSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  incomingTitleLight: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 20,
  },
  incomingRouteCardLight: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  incomingRouteTimeline: {
    width: 24,
    alignItems: 'center',
    marginRight: 8,
  },
  incomingDotGreenLight: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2ecc71', // green dot
    marginTop: 4,
  },
  incomingDotRedLight: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#e74c3c', // hollow red dot
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  incomingDashedLine: {
    width: 1,
    flex: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#95a5a6',
    marginVertical: 4,
  },
  incomingRouteDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  incomingRouteItem: {
    marginBottom: 16,
  },
  incomingRouteItemDrop: {
    justifyContent: 'flex-end',
  },
  incomingRouteLabelLight: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  incomingRouteTextLight: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  incomingStatsRowLight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  incomingStatChipLight: {
    flex: 1,
  },
  incomingStatDividerLight: {
    width: 1,
    height: 24,
    backgroundColor: '#ecf0f1',
    marginHorizontal: 16,
  },
  incomingStatLabelLight: {
    fontSize: 12,
    color: '#bdc3c7',
    marginBottom: 4,
  },
  incomingStatValLight: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  incomingBtnRowLight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  incomingDeclineBtnLight: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  incomingDeclineBtnTextLight: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '500',
  },
  incomingAcceptBtnLight: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#005bb5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  incomingAcceptBtnTextLight: {
    color: colors.bgSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  revampActiveRideSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bgSecondary,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1,
    borderTopColor: colors.borderGlass,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 16
  },
  trackingTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20
  },
  earningsSummaryValBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  summaryBoxLabel: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  summaryBoxVal: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: '800',
    marginTop: 4
  },
  stepDotInactive: {
    backgroundColor: colors.textMuted
  },
  stepText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600'
  },
  timelineBar: {
    flex: 1,
    height: 2,
    backgroundColor: colors.borderGlass,
    marginHorizontal: 8,
    marginTop: -16
  },
  activeJobDetails: {
    gap: 10
  },
  driverProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderWidth: 1,
    borderColor: colors.borderGlass,
    borderRadius: 14,
    padding: 16,
    gap: 12
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  driverName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700'
  },
  vehiclePlate: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2
  },
  otpBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  otpVal: {
    color: colors.success,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 1
  },
  ratingSection: {
    alignItems: 'center',
    paddingVertical: 10
  },
  ratingTitleText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800'
  },
  ratingSubText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20
  },
  starsWrapper: {
    flexDirection: 'row',
    gap: 12
  },
  starEmoji: {
    fontSize: 36,
    color: colors.textMuted
  },
  // --- New Revamped Home styles ---
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgTertiary,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  greetingTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  floatingSOSButton: {
    position: 'absolute',
    top: 150,
    right: 16,
    zIndex: 20,
    backgroundColor: colors.danger,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  sosButtonText: {
    color: colors.bgSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
  
  // Drawer Styles
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContent: {
    width: '75%',
    height: '100%',
    backgroundColor: colors.bgSecondary,
    borderRightWidth: 1,
    borderRightColor: colors.borderGlass,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    zIndex: 10,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  drawerHeader: {
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGlass,
    paddingBottom: 24,
  },
  drawerAvatarBig: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  drawerAvatarBigText: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  drawerProfileName: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  drawerProfilePhone: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 6,
  },
  drawerProfileEmail: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  drawerRatingBadge: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 10,
  },
  drawerRatingText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  drawerMenuContainer: {
    flex: 1,
    marginTop: 24,
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.02)',
  },
  drawerMenuIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  drawerMenuText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  drawerLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderGlass,
    marginTop: 'auto',
  },
  drawerLogoutIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  drawerLogoutText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '700',
  },

  // Generic Modals Overlay Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalInnerContent: {
    backgroundColor: colors.bgSecondary,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderTopColor: colors.borderGlass,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingHorizontal: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGlass,
    marginBottom: 20,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  modalScrollView: {
    marginBottom: 10,
  },

  // Form Fields
  inputFormGroup: {
    gap: 14,
    marginBottom: 20,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderWidth: 1,
    borderColor: colors.borderGlass,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    justifyContent: 'center',
  },
  formInput: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    height: 52,
    backgroundColor: colors.accent,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  modalSubmitBtnText: {
    color: colors.bgSecondary,
    fontSize: 15,
    fontWeight: '700',
  },

  // Trips Modal Styles
  ridesLoader: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  ridesLoaderText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  ridesList: {
    paddingBottom: 24,
    gap: 16,
  },
  emptyRides: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyRidesText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  rideCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderWidth: 1,
    borderColor: colors.borderGlass,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rideVehicle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  statusCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  statusCancelled: {
    backgroundColor: 'rgba(239, 35, 60, 0.12)',
  },
  statusBadgeText: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '800',
  },
  rideDate: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  rideAddresses: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 10,
    padding: 10,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressLineText: {
    color: colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderGlass,
    paddingTop: 12,
  },
  rideDriver: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  ridePrice: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '800',
  },

  // Wallet Modal choice styles
  walletModalCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  walletBalanceLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  walletBalanceVal: {
    color: colors.success,
    fontSize: 32,
    fontWeight: '800',
    marginTop: 8,
  },
  quickAmountRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickAmountBtn: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAmountText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  authTabs: {
    flexDirection: 'row',
    backgroundColor: colors.bgTertiary,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  authTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  authTabActive: {
    backgroundColor: colors.bgSecondary,
  },
  authTabText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  authTabTextActive: {
    color: colors.textPrimary,
  },
  genderLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  genderBtn: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderBtnActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentGlow,
  },
  genderBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  genderBtnTextActive: {
    color: colors.accent,
  },

  // ─── Navigation HUD Styles ──────────────────────────────────────────────────

  /** Outer wrapper: sits at the top of the screen above the map */
  navHudWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 36,
    left: 12,
    right: 12,
    zIndex: 20,
  },

  /** Glassmorphism card — turn arrow + instruction text */
  navHudCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,           // Deep royal blue
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 10,
  },

  /** Square box that holds the arrow icon */
  navArrowBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  /** Large turn-direction icon (↑ → ← etc.) */
  navArrowIcon: {
    fontSize: 36,
    color: colors.bgSecondary,
    fontWeight: '700',
  },

  /** Column to the right of the arrow: distance, maneuver label, street */
  navInfoCol: {
    flex: 1,
  },

  /** "In 320 m" — main distance to the next turn */
  navDistText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.bgSecondary,
    letterSpacing: -0.3,
  },

  /** "Turn right" label */
  navManeuverText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },

  /** Street name — "onto Anna Salai" */
  navStreetText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
    fontWeight: '500',
  },

  /** ETA + progress strip below the HUD card */
  navEtaStrip: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },

  navProgressBar: {
    height: 5,
    backgroundColor: colors.bgTertiary,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },

  navProgressFill: {
    height: 5,
    backgroundColor: colors.accent,
    borderRadius: 3,
  },

  navEtaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  navEtaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  /** Pre-trip floating info header (accepted / arrived states) */
  navPreTripHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 36,
    left: 12,
    right: 12,
    zIndex: 20,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },

  navPreTripRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  navPreTripAddr: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  navPreTripMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderGlass,
  },

  navPreTripMetaText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },

  /** Live driver position marker on the map */
  navDriverPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: colors.bgSecondary,
  },

  navDriverPinInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bgSecondary,
  },

  /** Bottom action row during in_progress — compact layout */
  navBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  navBottomLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 2,
  },

  navBottomVal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    maxWidth: 160,
  },

  navCompleteBtn: {
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    flexShrink: 0,
  },

  // ─── Customer Navigation HUD Styles ─────────────────────────────────────────

  /** Outer wrapper sits at the top of the screen */
  custNavHudWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 36,
    left: 12,
    right: 12,
    zIndex: 20,
  },

  /** "You're on your way" green banner */
  custNavBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 10,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  custNavBannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bgSecondary,
    marginRight: 8,
  },

  custNavBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.bgSecondary,
  },

  custNavBannerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },

  /** Turn instruction card — cyan/teal theme for the customer */
  custNavHudCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentCyan,        // #00C896 — Mint green
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 10,
    marginBottom: 10,
  },

  custNavArrowBox: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  custNavArrowIcon: {
    fontSize: 32,
    color: colors.bgSecondary,
  },

  custNavDistText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.bgSecondary,
    letterSpacing: -0.2,
  },

  custNavManeuverText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },

  custNavStreetText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    fontWeight: '500',
  },

  /** ETA strip — white card with cyan progress bar */
  custNavEtaStrip: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },

  custNavProgressFill: {
    height: 5,
    backgroundColor: colors.accentCyan,
    borderRadius: 3,
  },

  custNavEtaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  /** Customer live position pin — teal themed */
  custNavPin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accentCyan,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accentCyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: colors.bgSecondary,
  },

  custNavPinInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bgSecondary,
  },

  /** Compact bottom sheet during in_progress — less height */
  custNavBottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bgSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: colors.borderGlass,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 14,
  },

  /** Compact row: driver mini-card + fare on the right */
  custNavInProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },

  custNavDriverMini: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  custNavDriverName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  custNavDriverSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },

  custNavFareBadge: {
    alignItems: 'flex-end',
  },

  custNavFareLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.8,
  },

  custNavFareVal: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.success,
  },

  /** "Driver has arrived" attention banner */
  arrivedBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
  },

  arrivedBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.success,
    textAlign: 'center',
  },

  // ─── Location Picker Styles ───────────────────────────────────────────────
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGlass,
  },
  pickerBackBtn: { padding: 8, marginLeft: -8 },
  pickerHeaderTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  
  pickerAddressBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 70,
    left: 20, right: 20,
    backgroundColor: colors.bgSecondary,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    shadowColor: colors.textPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
    zIndex: 10,
  },
  pickerAddressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginRight: 12 },
  pickerAddressText: { flex: 1, fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  
  pickerCrosshairWrapper: {
    position: 'absolute', top: '50%', left: '50%',
    marginLeft: -15, marginTop: -30, // center precisely
    alignItems: 'center', justifyContent: 'center',
  },
  pickerPinOuter: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  pickerPinInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.bgSecondary },
  pickerPinStem: { width: 3, height: 15, backgroundColor: colors.accent, marginTop: -2, zIndex: 1 },
  pickerPinShadow: { position: 'absolute', bottom: -4, width: 12, height: 6, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.3)' },

  pickerRecenterBtn: {
    position: 'absolute', bottom: 90, right: 20,
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.bgSecondary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.textPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  
  pickerFooter: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.bgSecondary, padding: 20, paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1, borderTopColor: colors.borderGlass,
  },
  pickerConfirmBtn: { backgroundColor: '#1A1A1A', borderRadius: 8, paddingVertical: 16, alignItems: 'center' },
  pickerConfirmText: { color: colors.bgSecondary, fontSize: 16, fontWeight: '700' },

  // ─── New Home Screen Styles ───────────────────────────────────────────────
  homeContainer: { flex: 1, backgroundColor: colors.bgPrimary },
  homeMapPreview: { height: '38%', width: '100%' },
  
  homePickupStrip: {
    position: 'absolute', bottom: 12, left: 16, right: 16,
    backgroundColor: colors.bgSecondary, borderRadius: 24,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
    shadowColor: colors.textPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  homePickupDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginRight: 12 },
  homePickupText: { flex: 1, fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  
  homeBottomCard: {
    flex: 1, backgroundColor: colors.bgSecondary,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 20, paddingTop: 8,
  },
  
  homeSearchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgPrimary, borderRadius: 30,
    paddingHorizontal: 16, paddingVertical: 14, marginTop: 12, marginBottom: 20,
  },
  homeSearchText: { flex: 1, fontSize: 16, color: colors.textSecondary, fontWeight: '500' },
  homeSearchTextFilled: { flex: 1, fontSize: 16, color: colors.textPrimary, fontWeight: '700' },

  // Home Quick Services
  homeServicesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  homeServiceChip: { alignItems: 'center', padding: 12, backgroundColor: colors.bgPrimary, borderRadius: 16, width: '22%' },
  homeServiceLabel: { fontSize: 12, fontWeight: '600', color: colors.textPrimary, marginTop: 6 },
  
  // Promos
  promoBanner1: {
    backgroundColor: '#0A2540', borderRadius: 12, padding: 20, marginBottom: 16,
    overflow: 'hidden', position: 'relative',
  },
  promoBannerTag: { color: colors.warning, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  promoBannerTitle: { color: colors.bgSecondary, fontSize: 22, fontWeight: '800' },
  promoBannerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4, marginBottom: 16 },
  promoBannerBtn: { alignSelf: 'flex-start', backgroundColor: colors.bgSecondary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  promoBannerBtnText: { color: '#0A2540', fontWeight: '700', fontSize: 12 },

  promoBanner2: {
    backgroundColor: colors.warning, borderRadius: 12, padding: 20, marginBottom: 24,
    flexDirection: 'row', alignItems: 'center', overflow: 'hidden'
  },
  promoBanner2Title: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
  promoBanner2Sub: { color: 'rgba(0,0,0,0.7)', fontSize: 13, marginTop: 4, fontWeight: '500' },

  homeTaglineRow: { alignItems: 'center', marginBottom: 40 },
  homeTagline: { fontSize: 24, fontWeight: '800', color: colors.borderGlass, fontStyle: 'italic' },
  homeTaglineSub: { fontSize: 12, color: colors.textMuted, fontWeight: '500', marginTop: 2 },

  // Bottom Tab Bar
  homeTabBar: {
    flexDirection: 'row', backgroundColor: colors.bgSecondary,
    borderTopWidth: 1, borderTopColor: colors.borderGlass,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12, paddingTop: 12,
  },
  homeTabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  homeTabLabel: { fontSize: 11, fontWeight: '500', color: colors.textMuted, marginTop: 4 },
  homeTabLabelActive: { color: colors.accent, fontWeight: '700' },
  homeTabActiveDot: { position: 'absolute', top: -12, width: 30, height: 3, backgroundColor: colors.accent, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 },

  // Estimates panel in Home
  homeEstimatesPanel: { 
    flex: 1,
    backgroundColor: colors.bgSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20
  },
  homeEstimatesRoute: { marginBottom: 16, backgroundColor: colors.bgPrimary, padding: 12, borderRadius: 12 },
  homeRouteRow: { flexDirection: 'row', alignItems: 'center' },
  homeDotGreen: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginRight: 12 },
  homeDotRed: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger, marginRight: 12 },
  homeRouteAddr: { flex: 1, fontSize: 13, color: colors.textPrimary, fontWeight: '500' },

  // Driver Overlay Styles
  overlayScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 9999
  },
  overlayTitle: {
    color: colors.bgSecondary,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 10
  },
  overlayText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40
  },
  logoutBtn: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: 'rgba(231, 76, 60, 0.1)'
  },
  logoutBtnText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '700'
  },

  // ─── Customer Home – Map Header ────────────────────────────────────────────
  custMapHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 36,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  custMapHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  custAvatarBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  custAvatarText: {
    color: colors.bgSecondary,
    fontSize: 16,
    fontWeight: '800',
  },
  custGreeting: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: 1,
  },
  custUserName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  custWalletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 5,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  custWalletText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },

  // ─── Search bar update ────────────────────────────────────────────────────
  homeSearchIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  homeRouteLine: {
    width: 2,
    height: 12,
    backgroundColor: '#D1D5DB',
    marginLeft: 3,
    marginVertical: 3,
  },

  // ─── Estimate cards update ────────────────────────────────────────────────
  estTypeActive: {
    color: colors.accent,
    fontWeight: '800',
  },
  estFareActive: {
    color: colors.accent,
  },

  // ─── Customer Tab Pages ───────────────────────────────────────────────────
  custTabPage: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
  },
  custTabHeader: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 8,
    backgroundColor: colors.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgPrimary,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  custTabTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },

  // ─── Profile Card ─────────────────────────────────────────────────────────
  custProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 18,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.bgPrimary,
    marginBottom: 16,
  },
  custProfileAvatarLarge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  custProfileAvatarText: {
    color: colors.bgSecondary,
    fontSize: 22,
    fontWeight: '800',
  },
  custProfileName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  custProfilePhone: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  custProfileEmail: {
    fontSize: 12,
    color: colors.textMuted,
  },
  custRatingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  custRatingChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },

  // ─── Wallet Card ──────────────────────────────────────────────────────────
  custWalletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.accent,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  custWalletCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  custWalletIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  custWalletCardLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    marginBottom: 3,
  },
  custWalletCardBal: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.bgSecondary,
    letterSpacing: -0.5,
  },
  custTopupBtn: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 9,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  custTopupBtnText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },

  // ─── Menu Card ────────────────────────────────────────────────────────────
  custMenuCard: {
    backgroundColor: colors.bgSecondary,
    marginHorizontal: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.bgPrimary,
  },
  custMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 18,
    gap: 14,
  },
  custMenuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.bgPrimary,
  },
  custMenuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  custMenuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  // ─── Edit Profile Card ────────────────────────────────────────────────────
  custEditCard: {
    backgroundColor: colors.bgSecondary,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.bgPrimary,
  },
  custEditCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 14,
  },

  // ─── Logout Button ────────────────────────────────────────────────────────
  custLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 20,
  },
  custLogoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },

  // ─── Trips / Ride Card ────────────────────────────────────────────────────
  custRideCard: {
    backgroundColor: colors.bgSecondary,
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 18,
    padding: 16,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.bgPrimary,
  },
  custRideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  custRideVehicleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  custRideVehicleText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  custRideRoute: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.bgPrimary,
  },
  custRideRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  custRideRouteLine: {
    width: 2,
    height: 12,
    backgroundColor: '#D1D5DB',
    marginLeft: 4,
    marginVertical: 3,
  },
  custRideDotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
  custRideDotRed: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
  },

  // ─── Services Grid ────────────────────────────────────────────────────────
  custServiceCard: {
    width: '47%',
    backgroundColor: colors.bgSecondary,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.bgPrimary,
  },
  custServiceLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  custServiceDesc: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

