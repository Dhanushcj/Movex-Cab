import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Image, StyleSheet, Alert, Share } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/colors';
import AnimatedTouchable from './AnimatedTouchable';

const DashboardUI = ({
  user, 
  activePasses,
  onNotificationPress,
  onProfilePress,
  onBookRide, 
  onBuyPass, 
  onSearchClick,
  onTrackRide
}: any) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bgPrimary }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      
      {/* ── HEADER ── */}
      <View style={styles.headerContainer}>
        <AnimatedTouchable onPress={onProfilePress} style={styles.iconBtn}>
          <Feather name="menu" size={24} color={colors.textPrimary} />
        </AnimatedTouchable>
        
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/Frame 3.png')} 
            style={{ width: 180, height: 60, resizeMode: 'contain' }} 
          />
        </View>

        <AnimatedTouchable onPress={onNotificationPress} style={styles.iconBtn}>
          <Feather name="bell" size={24} color={colors.textPrimary} />
          <View style={styles.notificationBadge} />
        </AnimatedTouchable>
      </View>

      {/* ── HERO SECTION ── */}
      <View style={styles.heroSection}>
        <View style={styles.heroTextContainer}>
          <Text style={[styles.heroTitle, { color: colors.accent }]}>Book.</Text>
          <Text style={[styles.heroTitle, { color: colors.accent }]}>Ride.</Text>
          <Text style={[styles.heroTitle, { color: colors.accentSecondary }]}>Arrive Safely.</Text>
          
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Your trusted partner for city commutes, outstation trips, and more.
          </Text>

          <AnimatedTouchable style={[styles.heroBtn, { backgroundColor: colors.accent }]} onPress={onBookRide}>
            <Text style={styles.heroBtnText}>Book Now</Text>
            <Feather name="chevron-right" size={16} color="#FFF" />
          </AnimatedTouchable>
        </View>
        <Image 
          source={require('../../assets/scooter_hero.png')} 
          style={styles.heroImage} 
        />
      </View>

      {/* ── QUICK ACTIONS ── */}
      <View style={styles.quickActionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
          <Text style={styles.viewAllText}>View All <Feather name="chevron-right" size={12} /></Text>
        </View>
        
        <View style={styles.quickActionsGrid}>
          {/* Action 1 */}
          <AnimatedTouchable style={styles.quickActionCard} onPress={onBookRide}>
            <View style={styles.quickActionIconWrapper}>
              <Ionicons name="car-outline" size={26} color={colors.accent} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>Book Ride</Text>
          </AnimatedTouchable>

          {/* Action 2 */}
          <AnimatedTouchable style={styles.quickActionCard} onPress={onBuyPass}>
            <View style={styles.quickActionIconWrapper}>
              <Ionicons name="ticket-outline" size={26} color={colors.accent} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>Buy Pass</Text>
          </AnimatedTouchable>

          {/* Action 3 */}
          <AnimatedTouchable style={styles.quickActionCard} onPress={onTrackRide}>
            <View style={styles.quickActionIconWrapper}>
              <Ionicons name="map-outline" size={26} color={colors.accent} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>Track Ride</Text>
          </AnimatedTouchable>

          {/* Action 4 */}
          <AnimatedTouchable style={styles.quickActionCard} onPress={onProfilePress}>
            <View style={styles.quickActionIconWrapper}>
              <Ionicons name="calendar-outline" size={26} color={colors.accent} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>My Bookings</Text>
          </AnimatedTouchable>
        </View>
      </View>

      {/* ── PROMO BANNER ── */}
      <AnimatedTouchable style={styles.promoContainer} onPress={() => {
        Alert.alert('Promo Code Activated!', 'Use code MOVEX20 to get 20% off your first ride!');
        if (onBookRide) onBookRide();
      }}>
        <LinearGradient 
          colors={[colors.accent, '#0F3170']} 
          start={{x:0, y:0}} end={{x:1, y:1}} 
          style={styles.promoBanner}
        >
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>First time using MoveX?</Text>
            <Text style={styles.promoSubtitle}>Get <Text style={{ color: colors.accentSecondary, fontWeight: '800' }}>20% OFF</Text> on your first booking!</Text>
            
            <View style={styles.promoCodeBox}>
              <Feather name="percent" size={14} color="#FFF" />
              <Text style={styles.promoCodeText}>Use Code: MOVEX20</Text>
            </View>
          </View>
          <Feather name="gift" size={70} color="rgba(255,193,7, 0.2)" style={styles.promoIcon} />
        </LinearGradient>
      </AnimatedTouchable>

      {/* ── HOW IT WORKS ── */}
      <View style={styles.howItWorksSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>How it Works</Text>
        </View>

        <View style={styles.stepsRow}>
          
          <View style={styles.stepContainer}>
            <View style={[styles.stepIconCircle, { backgroundColor: colors.accent }]}>
              <Feather name="search" size={22} color="#FFF" />
              <View style={[styles.stepNumberBadge, { backgroundColor: colors.accentSecondary }]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
            </View>
            <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Search</Text>
            <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Choose a destination</Text>
          </View>

          <View style={styles.stepDottedLine} />

          <View style={styles.stepContainer}>
            <View style={[styles.stepIconCircle, { backgroundColor: colors.accent }]}>
              <Feather name="file-text" size={22} color="#FFF" />
              <View style={[styles.stepNumberBadge, { backgroundColor: colors.accentSecondary }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
            </View>
            <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Book</Text>
            <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Pick a cab & ride</Text>
          </View>

          <View style={styles.stepDottedLine} />

          <View style={styles.stepContainer}>
            <View style={[styles.stepIconCircle, { backgroundColor: colors.accent }]}>
              <Feather name="user" size={22} color="#FFF" />
              <View style={[styles.stepNumberBadge, { backgroundColor: colors.accentSecondary }]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
            </View>
            <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>We Connect</Text>
            <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Driver arrives</Text>
          </View>

          <View style={styles.stepDottedLine} />

          <View style={styles.stepContainer}>
            <View style={[styles.stepIconCircle, { backgroundColor: colors.accent }]}>
              <Feather name="check-circle" size={22} color="#FFF" />
              <View style={[styles.stepNumberBadge, { backgroundColor: colors.accentSecondary }]}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
            </View>
            <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Relax</Text>
            <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Safe & happy ride</Text>
          </View>

        </View>
      </View>

    </ScrollView>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  iconBtn: {
    padding: 8,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
  },
  logoSubtext: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: -2,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFC107',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  
  heroSection: {
    paddingHorizontal: 24,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 220,
  },
  heroTextContainer: {
    width: '60%',
    zIndex: 2,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 24,
    lineHeight: 20,
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#075AAA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  heroBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  heroImage: {
    position: 'absolute',
    right: -25,
    top: -5,
    width: 220,
    height: 190,
    resizeMode: 'contain',
    zIndex: 1,
    opacity: 1,
  },

  quickActionsSection: {
    marginTop: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  viewAllText: {
    fontSize: 12,
    color: '#075AAA',
    fontWeight: '600',
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
    backgroundColor: colors.bgTertiary, // Very light blue
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },

  promoContainer: {
    marginHorizontal: 24,
    marginTop: 32,
    borderRadius: 24,
    shadowColor: '#075AAA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  promoBanner: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
  },
  promoContent: {
    width: '75%',
    zIndex: 2,
  },
  promoTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
  },
  promoSubtitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 26,
  },
  promoCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  promoCodeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  promoIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -35 }],
    zIndex: 1,
  },

  howItWorksSection: {
    marginTop: 36,
    marginBottom: 40,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    marginTop: 10,
  },
  stepContainer: {
    alignItems: 'center',
    width: '23%',
  },
  stepIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  stepNumberBadge: {
    position: 'absolute',
    bottom: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  stepNumberText: {
    color: '#075AAA',
    fontSize: 10,
    fontWeight: '800',
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
  },
  stepDottedLine: {
    height: 1,
    width: 20,
    borderBottomWidth: 1,
    borderColor: colors.borderGlass,
    borderStyle: 'dashed',
    marginTop: 28,
  }
});

export default DashboardUI;
