import * as React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, StyleSheet, Modal, Image, Dimensions } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const CardBackground = ({ primaryColor, secondaryColor }: { primaryColor: string, secondaryColor: string }) => (
  <Svg width="100%" height="100%" viewBox="0 0 350 220" preserveAspectRatio="none">
    <Defs>
      <SvgLinearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor={primaryColor} />
        <Stop offset="1" stopColor={primaryColor} stopOpacity="0.8" />
      </SvgLinearGradient>
    </Defs>
    <Rect x="0" y="0" width="350" height="220" fill="#FFFFFF" />
    
    {/* Yellow Ribbon */}
    <Path d="M220,0 L270,0 C270,110 180,110 180,220 L130,220 C130,110 220,110 220,0 Z" fill={secondaryColor} />
    
    {/* Blue Main Area (1px overlap for gapless rendering) */}
    <Path d="M0,0 L221,0 C221,110 131,110 131,220 L0,220 Z" fill="url(#blueGrad)" />
  </Svg>
);

const SmartChip = ({ color }: { color: string }) => (
  <Svg width="40" height="30" viewBox="0 0 42 32">
    <Rect x="2" y="2" width="38" height="28" rx="6" fill="none" stroke={color} strokeWidth="2" />
    <Path d="M2,10 L14,10 M2,16 L12,16 M2,22 L14,22 M40,10 L28,10 M40,16 L30,16 M40,22 L28,22 M14,10 Q21,20 28,10 M14,22 Q21,12 28,22 M21,2 L21,8 M21,30 L21,24" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
  </Svg>
);

const DocumentIcon = ({ primaryColor, secondaryColor }: { primaryColor: string, secondaryColor: string }) => (
  <View style={styles.noInvoicesIconWrapper}>
    <Feather name="file-text" size={32} color={primaryColor} />
    <View style={[styles.noInvoicesBadge, { backgroundColor: secondaryColor }]}>
      <Feather name="x" size={14} color="#FFF" />
    </View>
  </View>
);

const MyPassScreen = ({ user, activePasses, onBack, onNavigateHome, onNavigateHistory, onUpgradePlan }: any) => {
  const { colors, isDark } = useTheme();
  const [showQR, setShowQR] = React.useState(false);
  const passName = activePasses && activePasses.length > 0 
    ? String(activePasses[0].pass?.name || activePasses[0].vehicleType || 'Diamond').toUpperCase() 
    : 'DIAMOND';
  
  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.bgSecondary }]} onPress={onBack}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.accent }]}>My Membership</Text>
        <TouchableOpacity style={styles.notificationBtn}>
          <Feather name="bell" size={22} color={colors.textPrimary} />
          <View style={[styles.notificationBadge, { backgroundColor: colors.accentSecondary, borderColor: colors.bgPrimary }]} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* MEMBERSHIP CARD */}
        <View style={[styles.cardContainer, { shadowColor: colors.accent }]}>
          <View style={StyleSheet.absoluteFill}>
            <CardBackground primaryColor={colors.accent} secondaryColor={colors.accentSecondary} />
          </View>
          
          <View style={styles.watermarkContainer}>
            <Image 
              source={require('../../assets/app-icon.png')} 
              style={{width: 250, height: 250, opacity: 0.05, tintColor: '#FFF'}} 
              resizeMode="contain" 
            />
          </View>
          
          {/* Top Badge */}
          <View style={[styles.badgeWrapper, { backgroundColor: colors.accentSecondary }]}>
            <MaterialCommunityIcons name="diamond-outline" size={24} color={colors.accent} />
          </View>

          <View style={styles.cardContent}>
            {/* Left Content (Blue area) */}
            <View style={styles.leftContent}>
              <Text style={styles.cardProviderLogo}>Movex<Text style={{color: colors.accentSecondary}}>Cab</Text></Text>
              
              <View style={styles.chipWrapper}>
                <SmartChip color={colors.accentSecondary} />
              </View>
              
              <Text style={styles.cardNumber}>
                ••••  ••••  ••••  {user?.empId ? user.empId.slice(-4) : '1234'}
              </Text>
              
              <View style={styles.cardHolderWrapper}>
                <Text style={styles.cardLabel}>CARDHOLDER NAME</Text>
                <Text style={styles.cardValue} numberOfLines={1} adjustsFontSizeToFit>
                  {(user?.name || 'DHANUSH CHAKRAVARTHY').toUpperCase()}
                </Text>
              </View>
            </View>
            
            {/* Right Content (White area) */}
            <View style={styles.rightContent}>
              <View style={styles.tierNameWrapper}>
                <Text style={[styles.cardTierName, { color: colors.accent }]}>{passName} PASS</Text>
                <View style={[styles.tierUnderline, { backgroundColor: colors.accentSecondary }]} />
              </View>
              
              <View style={styles.carImageContainer}>
                <Image 
                  source={require('../../assets/cab_hero.jpg')} 
                  style={styles.carImage} 
                  resizeMode="contain" 
                />
              </View>
              
              <View style={styles.expiryWrapper}>
                <Text style={styles.expiryLabel}>VALID THRU</Text>
                <Text style={[styles.expiryValue, { color: colors.accent }]}>
                  {activePasses && activePasses.length > 0 && activePasses[0].validUntil 
                    ? (() => {
                        const d = new Date(activePasses[0].validUntil);
                        return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
                      })()
                    : '09/26'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.accent, shadowColor: colors.accent }]} activeOpacity={0.8} onPress={onUpgradePlan}>
            <MaterialCommunityIcons name="crown-outline" size={24} color={colors.accentSecondary} />
            <Text style={styles.btnPrimaryText}>{activePasses && activePasses.length > 0 ? 'Upgrade Plan' : 'View Plans'}</Text>
            <View style={{flex: 1}} />
            <Feather name="chevron-right" size={20} color="#FFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.btnOutline, { borderColor: colors.accent }]} activeOpacity={0.8} onPress={() => setShowQR(true)}>
            <MaterialCommunityIcons name="view-grid-outline" size={24} color={colors.accent} />
            <Text style={[styles.btnOutlineText, { color: colors.accent }]}>View QR</Text>
            <View style={{flex: 1}} />
            <Feather name="chevron-right" size={20} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* RECENT INVOICES */}
        <View style={styles.invoicesSection}>
          <View style={styles.invoicesHeader}>
            <Text style={[styles.invoicesTitle, { color: colors.accent }]}>Recent invoices</Text>
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: colors.accent }]}>View All <Feather name="chevron-right" size={14} /></Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.noInvoicesBox}>
            <DocumentIcon primaryColor={colors.accent} secondaryColor={colors.accentSecondary} />
            <Text style={styles.noInvoicesTitle}>No recent invoices found.</Text>
            <Text style={styles.noInvoicesSubtitle}>Your recent invoices will appear here.</Text>
          </View>
        </View>

      </ScrollView>

      {/* QR Code Modal */}
      <Modal visible={showQR} transparent={true} animationType="fade" onRequestClose={() => setShowQR(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: colors.bgSecondary, padding: 32, borderRadius: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 24 }}>Scan to Verify</Text>
            <View style={{ padding: 16, backgroundColor: '#FFF', borderRadius: 16 }}>
              <QRCode
                value={activePasses && activePasses.length > 0 ? activePasses[0]._id : (user?.empId || 'MOVE-X-CAB')}
                size={200}
                color="#000"
                backgroundColor="#FFF"
              />
            </View>
            <Text style={{ marginTop: 24, color: colors.textMuted, fontSize: 14 }}>{passName} PASS</Text>
            <Text style={{ marginTop: 4, color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>{user?.empId || 'No ID available'}</Text>
            <TouchableOpacity 
              style={{ marginTop: 32, backgroundColor: colors.accent, paddingVertical: 12, paddingHorizontal: 40, borderRadius: 12 }}
              onPress={() => setShowQR(false)}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontFamily: 'sans-serif',
    fontSize: 18,
    fontWeight: '700',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  cardContainer: {
    height: 220,
    borderRadius: 24,
    marginTop: 10,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    position: 'relative',
  },
  watermarkContainer: {
    position: 'absolute',
    left: '10%',
    top: -15,
    zIndex: 1,
  },
  badgeWrapper: {
    width: 36,
    height: 44,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    right: 89, // Precisely aligned with the straight vertical part of yellow ribbon
    zIndex: 10,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    zIndex: 5,
  },
  leftContent: {
    flex: 0.6,
    padding: 24,
    paddingRight: 0,
    justifyContent: 'space-between',
  },
  rightContent: {
    flex: 0.4,
    paddingVertical: 20,
    paddingRight: 16,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  cardProviderLogo: {
    fontFamily: 'sans-serif',
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  chipWrapper: {
    marginTop: 8,
  },
  cardNumber: {
    fontFamily: 'sans-serif',
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 2.5,
    marginTop: 12,
  },
  cardHolderWrapper: {
    marginTop: 16,
    width: '95%',
  },
  cardLabel: {
    fontFamily: 'sans-serif',
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardValue: {
    fontFamily: 'sans-serif',
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  tierNameWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },
  cardTierName: {
    fontFamily: 'sans-serif',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tierUnderline: {
    width: 24,
    height: 2,
    marginTop: 4,
  },
  carImageContainer: {
    width: 140,
    height: 70,
    marginRight: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  expiryWrapper: {
    alignItems: 'flex-end',
  },
  expiryLabel: {
    fontFamily: 'sans-serif',
    fontSize: 9,
    color: '#9098A2',
    letterSpacing: 0.5,
  },
  expiryValue: {
    fontFamily: 'sans-serif',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 16,
  },
  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  btnPrimaryText: {
    fontFamily: 'sans-serif',
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 12,
  },
  btnOutline: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  btnOutlineText: {
    fontFamily: 'sans-serif',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  invoicesSection: {
    marginTop: 40,
  },
  invoicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  invoicesTitle: {
    fontFamily: 'sans-serif',
    fontSize: 16,
    fontWeight: '700',
  },
  viewAllText: {
    fontFamily: 'sans-serif',
    fontSize: 13,
    fontWeight: '700',
  },
  noInvoicesBox: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  noInvoicesIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  noInvoicesBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  noInvoicesTitle: {
    fontFamily: 'sans-serif',
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  noInvoicesSubtitle: {
    fontFamily: 'sans-serif',
    fontSize: 13,
    color: '#9098A2',
  }
});

export default MyPassScreen;
