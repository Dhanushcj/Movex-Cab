import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Image, Switch, ActivityIndicator, Alert, Animated } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { useSocket } from '../context/SocketContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import API from '../services/api';
import { mapStyle } from '../constants/mapStyles';
import EmergencyScreen from './EmergencyScreen';
import NotificationScreen from './NotificationScreen';
import { AnimatedTouchable } from './AnimatedTouchable';

const decodePolyline = (t: string, e: number = 5) => {
  let n = 0, o = 0, r = 0, l = [], h = 0, i = 0, a = null, c = Math.pow(10, e || 5);
  for (; n < t.length;) {
    a = null, h = 0, i = 0;
    do a = t.charCodeAt(n++) - 63, i |= (31 & a) << h, h += 5; while (a >= 32);
    o += 1 & i ? ~(i >> 1) : i >> 1, h = i = 0;
    do a = t.charCodeAt(n++) - 63, i |= (31 & a) << h, h += 5; while (a >= 32);
    r += 1 & i ? ~(i >> 1) : i >> 1, l.push({ latitude: o / c, longitude: r / c });
  }
  return l;
};

export default function DriverHomeScreen({
  onRideAccepted,
  onNavigateProfile,
  onNavigateHistory,
  onNavigateAchievements
}: {
  onRideAccepted: (ride: any) => void;
  onNavigateProfile: () => void;
  onNavigateHistory: () => void;
  onNavigateAchievements: () => void;
}) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const insets = useSafeAreaInsets();
  const { user, updateOnlineStatus } = useAuth();
  const { t } = useLanguage();
  const { location } = useLocation();
  const { socket, connected } = useSocket();
  const [isOnline, setIsOnline] = useState(user?.isOnline || false);
  const [showEmergencyScreen, setShowEmergencyScreen] = useState(false);
  const [showNotificationScreen, setShowNotificationScreen] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState<any>(null);
  const [scanAnim] = useState(new Animated.Value(0));

  const [earningsData, setEarningsData] = useState<any>(null);
  const [driverRouteData, setDriverRouteData] = useState<any>(null);

  useEffect(() => {
    fetchEarnings();
    fetchDriverRoute();
    const intervalId = setInterval(() => {
      fetchEarnings();
    }, 15000);
    return () => clearInterval(intervalId);
  }, [user?.assignedRoute]);

  const fetchDriverRoute = async () => {
    if (!user?.assignedRoute) return;
    try {
      const routeId = typeof user.assignedRoute === 'object' ? user.assignedRoute._id : user.assignedRoute;
      const res = await API.get('/route-manager/routes');
      if (res.data && res.data.data) {
        let found = res.data.data.find((r: any) => String(r._id) === String(routeId));
        if (!found && typeof user.assignedRoute === 'object') {
          found = user.assignedRoute;
        }
        if (found) {
          let decoded: any[] = [];
          if (found.polyline) {
            try { decoded = decodePolyline(found.polyline); } catch (e) { console.log('Decode error', e); }
          }
          setDriverRouteData({
            ...found,
            decodedPolyline: decoded
          });
        }
      }
    } catch (e) {
      console.error('Failed to fetch route', e);
    }
  };

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

  const getTotalTrips = () => {
    if (!earningsData?.rides) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return earningsData.rides.filter((r: any) => new Date(r.completedAt) >= today).length;
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
          API.put('/drivers/location', {
            latitude: currLoc.coords.latitude,
            longitude: currLoc.coords.longitude
          }).catch(() => { });
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

      {/* â”€â”€ UNIFIED HEADER â”€â”€ */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 50 : 30) }]}>
        <AnimatedTouchable onPress={onNavigateProfile} style={styles.iconBtn}>
          <Feather name="menu" size={24} color={colors.textPrimary} />
        </AnimatedTouchable>

        <View style={styles.logoContainer}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' }}>Forge India
            Connect</Text>
        </View>

        <AnimatedTouchable onPress={() => setShowNotificationScreen(true)} style={styles.iconBtn}>
          <Feather name="bell" size={24} color={colors.textPrimary} />
          <View style={styles.notificationBadge} />
        </AnimatedTouchable>
      </View>

      {isOnline ? (
        /* â”€â”€ ONLINE DASHBOARD â”€â”€ */
        <View style={{ flex: 1 }}>
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
                {driverRouteData && (driverRouteData.decodedPolyline?.length > 0 || driverRouteData.junctions?.length > 0) && (
                  <Polyline
                    coordinates={driverRouteData.decodedPolyline?.length > 0 ? driverRouteData.decodedPolyline : driverRouteData.junctions.map((j: any) => ({
                      latitude: j.location?.coordinates?.[1] || 0,
                      longitude: j.location?.coordinates?.[0] || 0
                    }))}
                    strokeColor={colors.accent}
                    strokeWidth={6}
                    lineCap="round"
                  />
                )}
              </MapView>
            </View>
          )}

          <View style={styles.onlineStatusOverlay}>
            <View style={styles.onlineStatusPill}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.onlineStatusText}>Waiting for rides...</Text>
              </View>
              <AnimatedTouchable style={styles.goOfflineBtn} onPress={() => toggleOnline(false)}>
                <Text style={styles.goOfflineBtnText}>Go Offline</Text>
              </AnimatedTouchable>
            </View>
          </View>
        </View>
      ) : (
        /* â”€â”€ OFFLINE DASHBOARD â”€â”€ */
        <ScrollView style={{ flex: 1, backgroundColor: colors.bgPrimary }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

          {/* ── HERO SECTION ── */}
          <View style={styles.heroSection}>
            <View style={styles.heroTextContainer}>
              <Text style={[styles.heroTitle, { color: colors.accent }]}>Drive.</Text>
              <Text style={[styles.heroTitle, { color: colors.accent }]}>Earn.</Text>
              <Text style={[styles.heroTitle, { color: '#FFC107' }]}>Succeed.</Text>

              <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                Your trusted partner for moving people.
              </Text>

              <AnimatedTouchable style={[styles.heroBtn, { backgroundColor: colors.accent }]} onPress={() => toggleOnline(true)}>
                <Text style={styles.heroBtnText}>Go Online</Text>
                <Feather name="chevron-right" size={16} color="#FFF" />
              </AnimatedTouchable>
            </View>
            <View style={styles.heroGraphicContainer}>
              <View style={styles.heroCircle} />
              <Image
                source={require('../../assets/scooter_hero.png')}
                style={styles.heroImage}
              />
            </View>
          </View>

          {/* ── STATS ROW ── */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Feather name="users" size={16} color="#FFF" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Trips Completed</Text>
                <Text style={styles.statVal}>12</Text>
                <Text style={styles.statCompare}><Text style={{ color: colors.success }}>▲ 2</Text> vs yesterday</Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Feather name="star" size={16} color="#FFF" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Rating</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.statVal}>4.8</Text>
                  <MaterialCommunityIcons name="star" size={14} color="#FFC107" />
                </View>
                <Text style={[styles.statCompare, { color: colors.success }]}>Great job!</Text>
              </View>
            </View>
          </View>

          {/* ── QUICK ACTIONS ── */}
          <View style={styles.quickActionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
            </View>

            <View style={styles.quickActionsGrid}>

              <AnimatedTouchable style={styles.quickActionCard} onPress={onNavigateAchievements}>
                <View style={styles.quickActionIconWrapper}>
                  <Feather name="award" size={26} color={colors.accent} />
                </View>
                <Text style={[styles.quickActionTitle, { color: colors.textPrimary }]}>Achievements</Text>
                <Text style={styles.quickActionDesc}>View your progress and badges</Text>
                
              </AnimatedTouchable>

              <AnimatedTouchable style={styles.quickActionCard} onPress={onNavigateHistory}>
                <View style={styles.quickActionIconWrapper}>
                  <Feather name="clock" size={26} color={colors.accent} />
                </View>
                <Text style={[styles.quickActionTitle, { color: colors.textPrimary }]}>History</Text>
                <Text style={styles.quickActionDesc}>See your past trips and earnings</Text>
                
              </AnimatedTouchable>

              <AnimatedTouchable style={styles.quickActionCard} onPress={onNavigateProfile}>
                <View style={styles.quickActionIconWrapper}>
                  <Feather name="user" size={26} color={colors.accent} />
                </View>
                <Text style={[styles.quickActionTitle, { color: colors.textPrimary }]}>Profile</Text>
                <Text style={styles.quickActionDesc}>Manage your profile and documents</Text>
                
              </AnimatedTouchable>
            </View>
          </View>

          {/* ── BANNER SECTION ── */}
          <View style={styles.bannerSection}>
            <View style={styles.bannerCard}>
              <View style={styles.bannerIconWrap}>
                <MaterialCommunityIcons name="shield-check" size={32} color="#FFC107" />
              </View>
              <View style={styles.bannerInfo}>
                <Text style={styles.bannerTitle}>Drive Safe, Earn More!</Text>
                <Text style={styles.bannerDesc}>Keep your rating high and unlock more rewards.</Text>
              </View>
              <TouchableOpacity style={styles.bannerBtn}>
                <Text style={styles.bannerBtnText}>Know More</Text>
                <Feather name="chevron-right" size={16} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      )}

      {/* Floating Bottom Navigation */}
      <View style={[styles.floatingDock, { bottom: Math.max(insets.bottom + 16, 24) }]}>
        <AnimatedTouchable style={styles.navItemActive}>
          <Feather name="home" size={20} color={colors.white} />
          <Text style={styles.navItemActiveText}>Home</Text>
        </AnimatedTouchable>
        <AnimatedTouchable style={styles.navItem} onPress={onNavigateAchievements}>
          <Feather name="award" size={22} color={colors.textMuted} />
        </AnimatedTouchable>
        <AnimatedTouchable style={styles.navItem} onPress={onNavigateHistory}>
          <Feather name="clock" size={22} color={colors.textMuted} />
        </AnimatedTouchable>
      </View>

      {/* New Ride Request Overlay */}
      {incomingRequest && (
        <View style={styles.incomingOverlay}>
          <View style={styles.incomingSheet}>
            <Text style={styles.incomingTitle}>New Ride Request</Text>
            <View style={styles.incomingRouteCard}>
              <View style={styles.incomingRouteItem}>
                <View style={styles.dotGreen} />
                <Text style={styles.incomingRouteText} numberOfLines={2}>{incomingRequest.pickup.address}</Text>
              </View>
              <View style={styles.dashedLine} />
              <View style={styles.incomingRouteItem}>
                <View style={styles.dotRed} />
                <Text style={styles.incomingRouteText} numberOfLines={2}>{incomingRequest.drop.address}</Text>
              </View>
            </View>
            <View style={styles.incomingStatsRow}>
              <View style={styles.incomingStatChip}>
                <Text style={styles.incomingStatLabel}>Distance</Text>
                <Text style={styles.incomingStatVal}>{incomingRequest.route?.distance || 0} km</Text>
              </View>
            </View>
            <View style={styles.incomingBtnRow}>
              <TouchableOpacity style={styles.incomingDeclineBtn} onPress={handleRejectRide}>
                <Text style={styles.incomingDeclineBtnText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.incomingAcceptBtn} onPress={handleAcceptRide}>
                <Text style={styles.incomingAcceptBtnText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  heroGraphicContainer: {
    position: 'absolute',
    right: -40,
    top: 0,
    width: 200,
    height: 200,
    zIndex: 1,
  },
  heroCircle: {
    position: 'absolute',
    right: 0,
    top: 20,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFC107',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgSecondary,
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 2,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statCompare: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.borderGlass,
    marginHorizontal: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  quickActionDesc: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 14,
  },
  quickActionArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  bannerCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bannerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerInfo: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    marginBottom: 4,
  },
  bannerDesc: {
    fontSize: 12,
    color: '#555',
    lineHeight: 16,
  },
  bannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC107',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  bannerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },


  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.bgPrimary,
    zIndex: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1,
    borderColor: colors.bgSecondary,
  },

  heroSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    justifyContent: 'space-between',
    backgroundColor: colors.bgPrimary,
  },
  heroTextContainer: {
    flex: 1,
    paddingRight: 16,
    zIndex: 2,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '800',
    lineHeight: 46,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 24,
    lineHeight: 20,
    fontWeight: '500',
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  heroBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  heroImage: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
    position: 'absolute',
    right: 0,
    top: 40,
    opacity: 0.9,
    zIndex: 1,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },

  quickActionsSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    gap: 8,
  },
  quickActionCard: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 2,
  },
  quickActionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },

  offersSection: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  offerCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  offerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  offerTime: {
    fontSize: 12,
    color: colors.textMuted,
  },
  targetsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  targetLabels: {
    flex: 1,
    justifyContent: 'space-between',
    height: 80,
  },
  targetLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  targetValues: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  targetCol: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 80,
  },
  targetAmt: {
    fontSize: 14,
    fontWeight: '700',
  },
  targetCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetOrders: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  loginDivider: {
    height: 1,
    backgroundColor: colors.borderGlass,
    marginBottom: 16,
  },
  loginReqTitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
  },
  loginReqRow: {
    flexDirection: 'row',
    gap: 12,
  },
  loginReqChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgTertiary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  loginReqText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '500',
  },

  onlineStatusOverlay: {
    position: 'absolute',
    top: 16,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  onlineStatusPill: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  onlineStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  goOfflineBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  goOfflineBtnText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },

  incomingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  incomingSheet: {
    backgroundColor: colors.bgSecondary,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
  },
  incomingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  incomingRouteCard: {
    backgroundColor: colors.bgTertiary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  incomingRouteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  incomingRouteText: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  dotGreen: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success,
  },
  dotRed: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: colors.danger,
  },
  dashedLine: {
    width: 2, height: 20, backgroundColor: colors.borderGlass, marginLeft: 4, marginVertical: 4,
  },
  incomingStatsRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  incomingStatChip: {
    flex: 1,
    backgroundColor: colors.bgTertiary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  incomingStatLabel: {
    fontSize: 12, color: colors.textMuted, marginBottom: 4,
  },
  incomingStatVal: {
    fontSize: 18, fontWeight: '700', color: colors.textPrimary,
  },
  incomingBtnRow: {
    flexDirection: 'row',
    gap: 16,
  },
  incomingDeclineBtn: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomingDeclineBtnText: {
    fontSize: 16, fontWeight: '600', color: colors.textPrimary,
  },
  incomingAcceptBtn: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomingAcceptBtnText: {
    fontSize: 16, fontWeight: '600', color: colors.white,
  },
  floatingDock: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 64,
    backgroundColor: colors.bgSecondary,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 50,
  },
  navItem: {
    padding: 12,
  },
  navItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  navItemActiveText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});


