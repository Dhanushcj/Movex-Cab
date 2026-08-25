import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/colors';
import React, { useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  Animated,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TripCompletedPaymentSheetProps {
  ride: any;
  onComplete: () => void;
  driverId?: string;
}

export default function TripCompletedPaymentSheet({
  ride,
  onComplete,
  driverId,
}: TripCompletedPaymentSheetProps) {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors);

  const slideAnim = useRef(new Animated.Value(600)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fare = ride.fare?.finalFare || ride.fare?.totalFare || 0;
  const tip = ride.tipAmount || 0;
  const totalCollected = fare;
  const distance = ride.route?.distance
    ? (ride.route.distance).toFixed(1)
    : '4.2';
  const duration = ride.route?.duration
    ? Math.ceil(ride.route.duration)
    : 15;

  const completedDate = ride.completedAt
    ? new Date(ride.completedAt)
    : new Date();
  const dateStr = completedDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = completedDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).toUpperCase();

  // Generate a unique QR string to the Company UPI, encoding the driver and booking
  const qrValue = useMemo(() => {
    const dId = driverId || ride.driver?._id || ride.driver || 'unknown';
    const bId = ride._id || 'booking';
    const ts = Date.now();
    return `upi://pay?pa=movex.company@cabapp&pn=MoveX Cabs&am=${fare}&tn=Ride-${bId}-Driver-${dId}&cu=INR&ref=${ts}`;
  }, [driverId, ride, fare]);

  const isCash = ride.paymentMethod === 'cash';
  const isQR = ride.paymentMethod === 'qr' || ride.paymentMethod === 'upi';

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.fullScreen, { opacity: fadeAnim }]}>
      <StatusBar barStyle="dark-content" />
      <Animated.View
        style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* Top action bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topBarBtn}>
            <Feather name="sliders" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBarBtnDanger}>
            <Feather name="alert-circle" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── Payment Collected Section ── */}
          <View style={styles.paymentSection}>
            {/* Green Check Icon */}
            {ride.status === 'payment_pending' ? (
              <View style={[styles.checkCircleOuter, { backgroundColor: '#FEF9C3' }]}>
                <View style={[styles.checkCircleInner, { backgroundColor: '#FEF08A' }]}>
                  <ActivityIndicator size="large" color="#CA8A04" />
                </View>
              </View>
            ) : (
              <View style={styles.checkCircleOuter}>
                <View style={styles.checkCircleInner}>
                  <MaterialCommunityIcons name="check-decagram" size={40} color="#16A34A" />
                </View>
              </View>
            )}

            <Text style={styles.collectedTitle}>
              Trip Completed
            </Text>
          </View>

          {/* ── Divider ── */}
          <View style={styles.divider} />

          {/* ── Trip Details ── */}
          <View style={styles.tripDetailsSection}>
            <Text style={styles.tripDetailsTitle}>Trip Details</Text>

            <View style={styles.tripRow}>
              <Text style={styles.tripRowLabel}>Distance</Text>
              <Text style={styles.tripRowValue}>{distance}km</Text>
            </View>

            <View style={styles.tripRow}>
              <Text style={styles.tripRowLabel}>Duration</Text>
              <Text style={styles.tripRowValue}>{duration} min</Text>
            </View>

            <View style={styles.tripRow}>
              <Text style={styles.tripRowLabel}>Date & Time</Text>
              <Text style={styles.tripRowValue}>{dateStr}, {timeStr}</Text>
            </View>
          </View>

          {/* QR payment removed */}

          {/* ── Action ── */}
          <View style={{ marginTop: 24, marginBottom: 40 }}>
            {ride.status === 'payment_pending' ? (
              <TouchableOpacity 
                style={[styles.nextOrderBtn, { backgroundColor: Colors.textMuted }]} 
                disabled={true}
              >
                <Text style={styles.nextOrderBtnText}>Waiting for Customer...</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.nextOrderBtn} onPress={onComplete}>
                <Text style={styles.nextOrderBtnText}>Go to Next Order</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.bgPrimary,
    zIndex: 100,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 40) + 10,
    paddingBottom: 12,
  },
  topBarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  topBarBtnDanger: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#DC2626',
  },

  // Scroll
  scrollContent: {
    paddingBottom: 40,
  },

  // Payment Section
  paymentSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
  },
  checkCircleOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  checkCircleInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectedTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  collectedAmount: {
    fontSize: 32,
    fontWeight: '500',
    color: '#075AAA',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: Colors.borderGlass,
    marginHorizontal: 24,
    marginBottom: 24,
  },

  // Trip Details
  tripDetailsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  tripDetailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  tripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tripRowLabel: {
    fontSize: 15,
    color: Colors.textMuted,
    fontWeight: '400',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationColor: '#D1D5DB',
  },
  tripRowValue: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },

  // QR Section
  qrSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  qrSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  qrSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 16,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  paymentLogosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 8,
  },
  paymentLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  paymentLogoSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4285F4',
  },
  paymentLogoPaytm: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00BAF2',
  },
  paymentLogoCred: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },

  // Go Next Order Button
  nextOrderBtn: {
    marginHorizontal: 24,
    backgroundColor: '#075AAA',
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#075AAA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextOrderBtnText: {
    color: Colors.bgSecondary,
    fontSize: 17,
    fontWeight: '600',
  },
});
