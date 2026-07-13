import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/colors';
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface CustomerBookedRideSheetProps {
  driverInfo: any;
  rideInfo: any;
  onCancel: () => void;
  onCall: () => void;
  onMessage: () => void;
  rideStatus: string; // 'accepted' | 'arrived'
}

export default function CustomerBookedRideSheet({
  driverInfo,
  rideInfo,
  onCancel,
  onCall,
  onMessage,
  rideStatus,
}: CustomerBookedRideSheetProps) {
    const { isDark } = useTheme();
    const styles = getStyles(Colors);

  const slideAnim  = useRef(new Animated.Value(300)).current;
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const isArrived  = rideStatus === 'arrived';

  // Slide up on mount and status change
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    slideAnim.setValue(60);
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 55,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, [rideStatus]);

  // Pulsing ring for arrived state
  useEffect(() => {
    if (isArrived) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 700, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isArrived]);

  const driverName = driverInfo?.name || 'Your Driver';
  const vehicleStr = driverInfo?.vehicle
    ? `${driverInfo.vehicle.make} ${driverInfo.vehicle.model}`
    : 'Vehicle';
  const plate  = driverInfo?.vehicle?.plateNumber || '—';
  const rating = driverInfo?.rating ? Number(driverInfo.rating).toFixed(1) : '4.8';
  const otp    = rideInfo?.rideOTP || '—';
  const fare   = rideInfo?.fare?.totalFare ? `₹${rideInfo.fare.totalFare}` : '₹—';
  const dist   = rideInfo?.route?.distance ? `${rideInfo.route.distance} km` : '—';
  const eta    = rideInfo?.route?.duration ? `${Math.ceil(rideInfo.route.duration)} min` : '—';
  const pickup = rideInfo?.pickup?.address || 'Pickup location';
  const drop   = rideInfo?.drop?.address || 'Destination';

  // ─── ARRIVED STATE: Full premium notification overlay ────────────────────
  if (isArrived) {
    return (
      <Animated.View
        style={[styles.arrivedOverlay, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        {/* Handle */}
        <View style={styles.handle} />

        {/* Arrival hero badge */}
        <View style={styles.arrivedHeroSection}>
          <Animated.View style={[styles.arrivedRingOuter, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.arrivedRingInner}>
              <View style={styles.arrivedIconCircle}>
                <Text style={styles.arrivedIconEmoji}>📍</Text>
              </View>
            </View>
          </Animated.View>

          <Text style={styles.arrivedTitle}>Driver Has Arrived!</Text>
          <Text style={styles.arrivedSubtitle}>
            Your driver is waiting at your pickup location
          </Text>
        </View>

        {/* Driver card */}
        <View style={styles.arrivedDriverCard}>
          <View style={styles.arrivedAvatarWrap}>
            <View style={styles.arrivedAvatar}>
              <Text style={{ fontSize: 28 }}>👨🏻‍✈️</Text>
            </View>
            <View style={styles.arrivedOnlineDot} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.arrivedDriverName}>{driverName}</Text>
            <Text style={styles.arrivedVehicleText}>{vehicleStr}</Text>
            <View style={styles.plateBadge}>
              <Text style={styles.plateBadgeText}>{plate}</Text>
            </View>
          </View>

          <View style={styles.arrivedRatingCol}>
            <View style={styles.ratingBadge}>
              <Feather name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          </View>
        </View>

        {/* OTP Section — prominently shown */}
        <View style={styles.arrivedOtpCard}>
          <View style={styles.arrivedOtpLeft}>
            <Feather name="shield" size={16} color="#6366F1" />
            <View>
              <Text style={styles.arrivedOtpHint}>Share this OTP with driver</Text>
              <Text style={styles.arrivedOtpHintSub}>to verify and start your trip</Text>
            </View>
          </View>
          <View style={styles.arrivedOtpRight}>
            <Text style={styles.arrivedOtpValue}>{otp}</Text>
          </View>
        </View>

        {/* Stats strip */}
        <View style={styles.arrivedStatsRow}>
          <View style={styles.arrivedStatItem}>
            <Feather name="navigation" size={14} color="#6366F1" />
            <Text style={styles.arrivedStatVal}>{dist}</Text>
            <Text style={styles.arrivedStatLabel}>Distance</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.arrivedStatItem}>
            <Feather name="clock" size={14} color="#6366F1" />
            <Text style={styles.arrivedStatVal}>{eta}</Text>
            <Text style={styles.arrivedStatLabel}>Est. Time</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.arrivedStatItem}>
            <Feather name="credit-card" size={14} color="#6366F1" />
            <Text style={styles.arrivedStatVal}>{fare}</Text>
            <Text style={styles.arrivedStatLabel}>Fare</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtnSmall} onPress={onCall}>
            <Feather name="phone" size={20} color={Colors.textPrimary} />
            <Text style={styles.actionBtnLabel}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnSmall} onPress={onMessage}>
            <Feather name="message-circle" size={20} color={Colors.textPrimary} />
            <Text style={styles.actionBtnLabel}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtnSmall, styles.cancelBtn]} onPress={onCancel}>
            <Feather name="x-circle" size={20} color="#EF4444" />
            <Text style={[styles.actionBtnLabel, { color: '#EF4444' }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  // ─── ON-THE-WAY STATE: Standard bottom sheet ─────────────────────────────
  return (
    <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
      {/* Handle */}
      <View style={styles.handle} />

      {/* Status Banner */}
      <View style={styles.statusBanner}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>🚗 Driver is on the way to pick you up</Text>
      </View>

      {/* Driver Card */}
      <View style={styles.driverCard}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            {driverInfo?.documents?.profilePhoto?.url ? (
              <Image 
                source={{ uri: driverInfo.documents.profilePhoto.url.startsWith('http') ? driverInfo.documents.profilePhoto.url : `https://movex-cab.onrender.com${driverInfo.documents.profilePhoto.url}` }}
                style={{ width: '100%', height: '100%', borderRadius: 28 }}
              />
            ) : (
              <Text style={styles.avatarEmoji}>👨🏻‍✈️</Text>
            )}
          </View>
          <View style={styles.onlineDot} />
        </View>

        <View style={styles.driverMeta}>
          <Text style={styles.driverName}>{driverName}</Text>
          <Text style={styles.vehicleText}>{vehicleStr}</Text>
          <View style={styles.plateWrap}>
            <Text style={styles.plateText}>{plate}</Text>
          </View>
        </View>

        <View style={styles.rightCol}>
          <View style={styles.ratingBadge}>
            <Feather name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
          <View style={styles.otpWrap}>
            <Text style={styles.otpLabel}>OTP</Text>
            <Text style={styles.otpValue}>{otp}</Text>
          </View>
        </View>
      </View>

      {/* Route Card */}
      <View style={styles.routeCard}>
        <View style={styles.routeRow}>
          <View style={styles.routeDot} />
          <Text style={styles.routeAddr} numberOfLines={1}>{pickup}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, styles.routeDotDest]} />
          <Text style={styles.routeAddr} numberOfLines={1}>{drop}</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Feather name="navigation" size={16} color="#6366F1" style={{ marginBottom: 4 }} />
          <Text style={styles.statValue}>{dist}</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Feather name="clock" size={16} color="#6366F1" style={{ marginBottom: 4 }} />
          <Text style={styles.statValue}>{eta}</Text>
          <Text style={styles.statLabel}>ETA</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Feather name="credit-card" size={16} color="#6366F1" style={{ marginBottom: 4 }} />
          <Text style={styles.statValue}>{fare}</Text>
          <Text style={styles.statLabel}>Fare</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onCall}>
          <Feather name="phone" size={20} color={Colors.textPrimary} />
          <Text style={styles.actionBtnLabel}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onMessage}>
          <Feather name="message-circle" size={20} color={Colors.textPrimary} />
          <Text style={styles.actionBtnLabel}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={onCancel}>
          <Feather name="x-circle" size={20} color="#EF4444" />
          <Text style={[styles.actionBtnLabel, { color: '#EF4444' }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({

  // ─── On-the-way sheet ────────────────────────────────────────────────────
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 24,
  },

  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.borderGlass,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },

  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  statusText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1D4ED8',
  },

  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.bgPrimary,
  },
  avatarWrap: { position: 'relative', marginRight: 14 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: { fontSize: 26 },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: Colors.bgSecondary,
  },
  driverMeta: { flex: 1 },
  driverName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 2 },
  vehicleText: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  plateWrap: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.borderGlass,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  plateText: { fontSize: 12, fontWeight: '700', color: '#374151', letterSpacing: 1 },
  rightCol: { alignItems: 'flex-end', gap: 8 },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  ratingText: { fontSize: 13, fontWeight: '700', color: '#92400E' },
  otpWrap: {
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  otpLabel: { fontSize: 9, fontWeight: '800', color: '#6366F1', letterSpacing: 1.2, marginBottom: 1 },
  otpValue: { fontSize: 18, fontWeight: '800', color: '#4338CA', letterSpacing: 3 },

  routeCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.bgPrimary,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#6366F1' },
  routeDotDest: { backgroundColor: '#EF4444' },
  routeLine: { width: 2, height: 14, backgroundColor: '#D1D5DB', marginLeft: 4, marginVertical: 4 },
  routeAddr: { flex: 1, fontSize: 13, fontWeight: '500', color: '#374151' },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.bgPrimary,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.borderGlass, marginVertical: 4 },
  statValue: { fontSize: 15, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2, fontWeight: '500' },

  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgPrimary,
    borderRadius: 14,
    paddingVertical: 13,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.borderGlass,
  },
  actionBtnSmall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgPrimary,
    borderRadius: 14,
    paddingVertical: 13,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.borderGlass,
  },
  cancelBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  actionBtnLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },

  // ─── ARRIVED overlay ─────────────────────────────────────────────────────
  arrivedOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 30,
  },

  arrivedHeroSection: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 18,
  },
  arrivedRingOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(34,197,94,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  arrivedRingInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(34,197,94,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrivedIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  arrivedIconEmoji: { fontSize: 28 },
  arrivedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  arrivedSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },

  arrivedDriverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.bgPrimary,
    gap: 14,
  },
  arrivedAvatarWrap: { position: 'relative' },
  arrivedAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrivedOnlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2.5,
    borderColor: Colors.bgSecondary,
  },
  arrivedDriverName: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 2 },
  arrivedVehicleText: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  plateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.textPrimary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  plateBadgeText: { fontSize: 12, fontWeight: '700', color: '#F9FAFB', letterSpacing: 1.5 },
  arrivedRatingCol: { alignItems: 'flex-end' },

  arrivedOtpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF2FF',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    gap: 12,
  },
  arrivedOtpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  arrivedOtpHint: { fontSize: 12, fontWeight: '700', color: '#4338CA', marginBottom: 2 },
  arrivedOtpHintSub: { fontSize: 11, color: '#6366F1' },
  arrivedOtpRight: {
    backgroundColor: '#4338CA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  arrivedOtpValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.bgSecondary,
    letterSpacing: 4,
  },

  arrivedStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.bgPrimary,
  },
  arrivedStatItem: { flex: 1, alignItems: 'center', gap: 4 },
  arrivedStatVal: { fontSize: 14, fontWeight: '700', color: '#111827' },
  arrivedStatLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
});
