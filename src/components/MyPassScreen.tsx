import * as React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, StyleSheet, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/colors';

const MyPassScreen = ({ user, activePasses, onBack, onNavigateHome, onNavigateHistory, onUpgradePlan }: any) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const [showQR, setShowQR] = React.useState(false);
  const passName = activePasses && activePasses.length > 0 
    ? String(activePasses[0].pass?.name || activePasses[0].vehicleType || 'Gold').toLowerCase() 
    : 'gold';
  const isDiamond = passName === 'diamond';
  const themeColor = isDiamond ? '#007BFF' : '#D49F0C';
  const themeBg = isDiamond ? '#E6F2FF' : '#FFF8E1';
  
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="chevron-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Membership</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* MEMBERSHIP CARD */}
        {activePasses && activePasses.length > 0 ? (
          <LinearGradient 
            colors={isDiamond ? ['#1A2980', '#26D0CE'] : passName === 'silver' ? ['#757F9A', '#D7DDE8'] : ['#BF953F', '#FCF6BA', '#B38728']} 
            style={styles.cardContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Top Row: Provider & Tier */}
            <View style={styles.cardTopRow}>
              <Text style={styles.cardProviderLogo}>Movex<Text style={{fontWeight: '300'}}>Cab</Text></Text>
              <Text style={styles.cardTierName}>{passName.toUpperCase()} PASS</Text>
            </View>

            {/* Middle Row: Chip & Card Number */}
            <View style={styles.cardMiddleRow}>
              <Feather name="cpu" size={32} color={isDiamond ? "rgba(255,255,255,0.9)" : passName === 'silver' ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.7)"} style={styles.chipIcon} />
              <Text style={[styles.cardNumber, (passName === 'silver' || !isDiamond && passName !== 'silver') && { color: colors.textPrimary }]}>
                {user?.empId ? user.empId.replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
              </Text>
            </View>

            {/* Bottom Row: Name & Expiry */}
            <View style={styles.cardBottomRow}>
              <View>
                <Text style={[styles.cardLabel, (passName === 'silver' || !isDiamond && passName !== 'silver') && { color: 'rgba(0,0,0,0.5)' }]}>CARDHOLDER NAME</Text>
                <Text style={[styles.cardValue, (passName === 'silver' || !isDiamond && passName !== 'silver') && { color: colors.textPrimary }]}>{(user?.name || 'Sabari').toUpperCase()}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.cardLabel, (passName === 'silver' || !isDiamond && passName !== 'silver') && { color: 'rgba(0,0,0,0.5)' }]}>VALID THRU</Text>
                <Text style={[styles.cardValue, (passName === 'silver' || !isDiamond && passName !== 'silver') && { color: colors.textPrimary }]}>
                  {activePasses && activePasses.length > 0 && activePasses[0].validUntil 
                    ? (() => {
                        const d = new Date(activePasses[0].validUntil);
                        return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
                      })()
                    : '08/26'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        ) : (
          <View style={[styles.cardContainer, { backgroundColor: colors.bgTertiary, justifyContent: 'center', alignItems: 'center' }]}>
            <Feather name="credit-card" size={48} color={colors.textMuted} style={{ marginBottom: 16 }} />
            <Text style={{ fontFamily: 'sans-serif', fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 }}>No Active Pass</Text>
            <Text style={{ fontFamily: 'sans-serif', fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 20 }}>Subscribe to a pass to enjoy discounted rides and premium benefits.</Text>
          </View>
        )}

        {/* ACTION BUTTONS */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.8} onPress={onUpgradePlan}>
            <Feather name="settings" size={20} color="#FCFCFC" />
            <Text style={styles.btnPrimaryText}>{activePasses && activePasses.length > 0 ? 'Upgrade Plan' : 'View Plans'}</Text>
          </TouchableOpacity>
          
          {activePasses && activePasses.length > 0 && (
            <TouchableOpacity style={styles.btnOutline} activeOpacity={0.8} onPress={() => setShowQR(true)}>
              <Feather name="grid" size={20} color="#0053B3" />
              <Text style={styles.btnOutlineText}>View QR</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* RECENT INVOICES */}
        <View style={styles.invoicesSection}>
          <Text style={styles.invoicesTitle}>Recent invoices</Text>
          
          {/* Placeholder for no invoices */}
          <View style={styles.noInvoicesBox}>
            <Feather name="file-text" size={32} color="#9098A2" />
            <Text style={styles.noInvoicesText}>No recent invoices found.</Text>
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
            
            <Text style={{ marginTop: 24, color: colors.textMuted, fontSize: 14 }}>{passName.toUpperCase()} PASS</Text>
            <Text style={{ marginTop: 4, color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>{user?.empId || 'No ID available'}</Text>
            
            <TouchableOpacity 
              style={{ marginTop: 32, backgroundColor: '#0053B3', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 12 }}
              onPress={() => setShowQR(false)}
            >
              <Text style={{ color: '#FCFCFC', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'sans-serif',
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // space for bottom tab bar
  },
  cardContainer: {
    borderRadius: 16,
    padding: 20,
    height: 185,
    marginTop: 10,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardProviderLogo: {
    fontFamily: 'sans-serif',
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 1,
  },
  cardTierName: {
    fontFamily: 'sans-serif',
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
  },
  cardMiddleRow: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  chipIcon: {
    marginBottom: 4,
  },
  cardNumber: {
    fontFamily: 'monospace',
    fontSize: 22,
    color: colors.white,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontFamily: 'sans-serif',
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardValue: {
    fontFamily: 'sans-serif',
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    backgroundColor: '#0053B3',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnPrimaryText: {
    fontFamily: 'sans-serif',
    fontSize: 16,
    color: colors.white,
    fontWeight: '500',
  },
  btnOutline: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#0053B3',
    gap: 8,
  },
  btnOutlineText: {
    fontFamily: 'sans-serif',
    fontSize: 16,
    color: '#0053B3',
    fontWeight: '500',
  },
  invoicesSection: {
    marginTop: 40,
  },
  invoicesTitle: {
    fontFamily: 'sans-serif',
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  noInvoicesBox: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    gap: 12,
  },
  noInvoicesText: {
    fontFamily: 'sans-serif',
    fontSize: 14,
    color: colors.textSecondary,
  }
});

export default MyPassScreen;
