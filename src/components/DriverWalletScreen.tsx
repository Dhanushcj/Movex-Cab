import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/colors';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import API from '../services/api';

interface DriverWalletScreenProps {
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateHistory: () => void;
}

export default function DriverWalletScreen({ onBack, onNavigateHome, onNavigateHistory }: DriverWalletScreenProps) {
    const { isDark } = useTheme();
    const styles = getStyles(Colors);

  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchWallet = useCallback(async () => {
    try {
      const res = await API.get('/drivers/wallet');
      if (res.data.success) {
        setWalletData(res.data);
      }
    } catch (e) {
      console.log('Failed to fetch wallet');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWallet();
  };

  const handleAddMoney = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid', 'Please enter a valid amount');
      return;
    }
    setProcessing(true);
    try {
      const res = await API.post('/drivers/wallet/add', { amount: amt });
      if (res.data.success) {
        Alert.alert('Success', res.data.message);
        setShowAddModal(false);
        setAmount('');
        fetchWallet();
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to add money');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid', 'Please enter a valid amount');
      return;
    }
    setProcessing(true);
    try {
      const res = await API.post('/drivers/wallet/withdraw', { amount: amt });
      if (res.data.success) {
        Alert.alert('Success', res.data.message);
        setShowWithdrawModal(false);
        setAmount('');
        fetchWallet();
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to withdraw');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0053B3" />
      </View>
    );
  }

  const balance = walletData?.walletBalance ?? 0;
  const availableLimit = walletData?.availableLimit ?? 0;
  const totalTips = walletData?.totalTips ?? 0;
  const weeklyEarnings = walletData?.weeklyEarnings ?? '0';
  const weekStart = walletData?.weekStart ?? '';
  const weekEnd = walletData?.weekEnd ?? '';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Blue Header ── */}
      <View style={styles.header}>
        {/* Top Row: Back & Share buttons */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={onBack}>
            <Feather name="chevron-left" size={20} color="#FCFCFC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Feather name="external-link" size={20} color="#FCFCFC" />
          </TouchableOpacity>
        </View>

        {/* Earnings Label */}
        <View style={styles.earningsRow}>
          <Feather name="briefcase" size={20} color="#C8CCD0" />
          <View style={styles.earningsTextWrap}>
            <Text style={styles.earningsLabel}>
              Earnings: {weekStart} - {weekEnd}
            </Text>
            <Text style={styles.earningsAmount}>₹{weeklyEarnings}</Text>
          </View>
        </View>
      </View>

      {/* ── Main Content ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0053B3']} />}
      >
        {/* Pocket Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Pocket Balance</Text>
            <Text style={[styles.balanceValue, balance < 0 && { color: '#DC2626' }]}>₹{balance.toFixed(0)}</Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Available limit</Text>
            <Text style={styles.balanceValue}>₹{availableLimit.toFixed(0)}</Text>
          </View>
        </View>

        {/* Withdraw & Add Money Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.withdrawBtn}
            onPress={() => { setAmount(''); setShowWithdrawModal(true); }}
          >
            <Feather name="external-link" size={18} color="#0053B3" />
            <Text style={styles.withdrawBtnText}>Withdraw</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addMoneyBtn}
            onPress={() => { setAmount(''); setShowAddModal(true); }}
          >
            <Feather name="plus" size={18} color="#FCFCFC" />
            <Text style={styles.addMoneyBtnText}>Add Money</Text>
          </TouchableOpacity>
        </View>

        {/* Customer Tips Balance Row */}
        <TouchableOpacity style={styles.tipsRow} activeOpacity={0.7}>
          <View style={styles.tipsRowLeft}>
            <MaterialCommunityIcons name="cash-multiple" size={22} color={Colors.textPrimary} />
            <Text style={styles.tipsLabel}>Customer tips balance</Text>
          </View>
          <View style={styles.tipsRowRight}>
            <Text style={styles.tipsAmount}>₹{totalTips}</Text>
            <Feather name="chevron-right" size={20} color={Colors.textPrimary} />
          </View>
        </TouchableOpacity>

        {/* Divider: "More Services" */}
        <View style={styles.moreDivider}>
          <View style={styles.moreLine} />
          <Text style={styles.moreText}>More Services</Text>
          <View style={styles.moreLine} />
        </View>

        {/* Service Cards Grid */}
        <View style={styles.serviceCardsGrid}>
          {/* Payout Card */}
          <View style={styles.serviceCard}>
            <View style={styles.serviceCardContent}>
              <View style={styles.serviceCardHeader}>
                <MaterialCommunityIcons name="cash-multiple" size={22} color={Colors.textPrimary} />
                <Text style={styles.serviceCardTitle}>Payout</Text>
              </View>
              <Text style={styles.serviceCardSub}>{weekStart} - {weekEnd}</Text>
            </View>
          </View>

          {/* Deduction Statement Card */}
          <View style={styles.serviceCard}>
            <View style={styles.serviceCardContent}>
              <View style={styles.serviceCardHeader}>
                <MaterialCommunityIcons name="cash-multiple" size={22} color={Colors.textPrimary} />
                <Text style={styles.serviceCardTitle}>Deduction{'\n'}Statement</Text>
              </View>
              <Text style={styles.serviceCardSub}>{weekStart} - {weekEnd}</Text>
            </View>
          </View>
        </View>

        {/* Customer Tips Statement Card */}
        <View style={[styles.serviceCard, { marginHorizontal: 16, marginBottom: 120 }]}>
          <View style={styles.serviceCardContent}>
            <View style={styles.serviceCardHeader}>
              <MaterialCommunityIcons name="cash-multiple" size={22} color={Colors.textPrimary} />
              <Text style={styles.serviceCardTitle}>Customer tips{'\n'}Statement</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Bottom Navigation ── */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItemInactive} onPress={onNavigateHome}>
          <Feather name="home" size={22} color="#8F98A2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemInactive}>
          <Feather name="award" size={22} color="#9098A2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemActive}>
          <Feather name="briefcase" size={18} color="#FCFCFC" />
          <Text style={styles.navItemActiveText}>Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemInactive} onPress={onNavigateHistory}>
          <Feather name="clock" size={22} color="#9098A2" />
        </TouchableOpacity>
      </View>

      {/* ── Add Money Modal ── */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Money to Wallet</Text>
            <Text style={styles.modalSub}>Enter the amount you want to add</Text>

            <View style={styles.modalInputRow}>
              <Text style={styles.modalCurrency}>₹</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                autoFocus
              />
            </View>

            {/* Quick Select */}
            <View style={styles.quickSelectRow}>
              {[100, 200, 500, 1000].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[styles.quickBtn, amount === String(val) && styles.quickBtnActive]}
                  onPress={() => setAmount(String(val))}
                >
                  <Text style={[styles.quickBtnText, amount === String(val) && styles.quickBtnTextActive]}>₹{val}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={handleAddMoney} disabled={processing}>
              {processing ? <ActivityIndicator color={Colors.bgSecondary} /> : <Text style={styles.modalPrimaryBtnText}>Add Money</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Withdraw Modal ── */}
      <Modal visible={showWithdrawModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Withdraw from Wallet</Text>
            <Text style={styles.modalSub}>
              Available: ₹{availableLimit.toFixed(0)}
            </Text>

            <View style={styles.modalInputRow}>
              <Text style={styles.modalCurrency}>₹</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.quickBtn, { alignSelf: 'flex-start', marginBottom: 20 }]}
              onPress={() => setAmount(String(Math.floor(availableLimit)))}
            >
              <Text style={styles.quickBtnText}>Max: ₹{Math.floor(availableLimit)}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modalPrimaryBtn, { backgroundColor: Colors.textPrimary }]} onPress={handleWithdraw} disabled={processing}>
              {processing ? <ActivityIndicator color={Colors.bgSecondary} /> : <Text style={styles.modalPrimaryBtnText}>Withdraw</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowWithdrawModal(false)}>
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bgPrimary,
  },

  // ── Header ──
  header: {
    backgroundColor: '#0053B3',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 44,
    paddingBottom: 50,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#0069E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
  },
  earningsTextWrap: {
    alignItems: 'center',
    gap: 8,
  },
  earningsLabel: {
    fontSize: 16,
    color: '#C8CCD0',
    fontWeight: '400',
  },
  earningsAmount: {
    fontSize: 24,
    color: '#FCFCFC',
    fontWeight: '400',
    textAlign: 'center',
  },

  // ── Scroll ──
  scrollView: {
    flex: 1,
    marginTop: -30,
  },
  scrollContent: {
    paddingTop: 0,
  },

  // ── Balance Card ──
  balanceCard: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 32,
    marginBottom: 20,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: Colors.textMuted,
    fontWeight: '400',
  },
  balanceValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },

  // ── Action Buttons ──
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 26,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  withdrawBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#0053B3',
    borderRadius: 12,
    width: 136,
    height: 40,
  },
  withdrawBtnText: {
    fontSize: 14,
    color: '#0053B3',
    fontWeight: '400',
    textAlign: 'center',
  },
  addMoneyBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 12,
    backgroundColor: '#0053B3',
    borderRadius: 12,
    width: 142,
    height: 40,
  },
  addMoneyBtnText: {
    fontSize: 14,
    color: '#FCFCFC',
    fontWeight: '400',
    textAlign: 'center',
  },

  // ── Tips Row ──
  tipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    backgroundColor: '#F6F8FE',
    borderRadius: 12,
    marginBottom: 24,
  },
  tipsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipsLabel: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '400',
  },
  tipsRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tipsAmount: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '400',
  },

  // ── More Services Divider ──
  moreDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  moreLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DEE0E3',
  },
  moreText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '400',
  },

  // ── Service Cards ──
  serviceCardsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  serviceCard: {
    flex: 1,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 12,
    height: 108,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceCardContent: {
    padding: 20,
    gap: 12,
  },
  serviceCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  serviceCardTitle: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '400',
    lineHeight: 19,
  },
  serviceCardSub: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '400',
  },

  // ── Bottom Navigation ──
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 20,
    backgroundColor: Colors.bgSecondary,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  navItemInactive: {
    padding: 8,
  },
  navItemActive: {
    backgroundColor: '#0053B3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navItemActiveText: {
    color: '#FCFCFC',
    fontSize: 14,
    fontWeight: '400',
  },

  // ── Modal ──
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.borderGlass,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.borderGlass,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  modalCurrency: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginRight: 8,
  },
  modalInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  quickSelectRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  quickBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.bgPrimary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderGlass,
  },
  quickBtnActive: {
    backgroundColor: '#0053B3',
    borderColor: '#0053B3',
  },
  quickBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  quickBtnTextActive: {
    color: Colors.bgSecondary,
  },
  modalPrimaryBtn: {
    backgroundColor: '#0053B3',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalPrimaryBtnText: {
    color: Colors.bgSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  modalCancelBtnText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
});
