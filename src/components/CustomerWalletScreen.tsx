import React, { useState } from 'react';
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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

interface CustomerWalletScreenProps {
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateHistory: () => void;
}

export default function CustomerWalletScreen({ onBack, onNavigateHome, onNavigateHistory }: CustomerWalletScreenProps) {
  const { user, updateUserWallet } = useAuth();
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('gpay');

  const balance = user?.wallet?.balance || 0;

  const handleAddMoney = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid', 'Please enter a valid amount');
      return;
    }
    setProcessing(true);
    try {
      await updateUserWallet(amt);
      Alert.alert('Success', 'Money added successfully');
      setShowAddModal(false);
      setAmount('');
    } catch (e: any) {
      Alert.alert('Error', 'Failed to add money');
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
    if (amt > balance) {
      Alert.alert('Invalid', 'Insufficient balance');
      return;
    }
    setProcessing(true);
    try {
      await updateUserWallet(-amt);
      Alert.alert('Success', 'Money withdrawn successfully');
      setShowWithdrawModal(false);
      setAmount('');
    } catch (e: any) {
      Alert.alert('Error', 'Failed to withdraw');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Blue Header ── */}
      <View style={styles.header}>
        {/* Top Row */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={onBack}>
            <Feather name="chevron-left" size={20} color="#FCFCFC" />
          </TouchableOpacity>
          {/* Removed arrow/external-link icon in the right corner */}
        </View>

        {/* Removed Earnings Label as it applies to drivers */}
      </View>

      {/* ── Main Content ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Pocket Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={[styles.balanceValue, balance < 0 && { color: '#DC2626' }]}>₹{balance.toFixed(0)}</Text>
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
      </ScrollView>

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
                placeholderTextColor="#9CA3AF"
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

            {/* Payment Methods */}
            <Text style={{ marginTop: 20, marginBottom: 12, fontSize: 14, color: '#262D36', fontWeight: '600' }}>Select Payment Method</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
              {['gpay', 'phonepe', 'paytm'].map((method) => (
                <TouchableOpacity
                  key={method}
                  style={{
                    flex: 1,
                    marginHorizontal: 4,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor: paymentMethod === method ? '#0053B3' : '#E5E7EB',
                    borderRadius: 8,
                    backgroundColor: paymentMethod === method ? '#EBF4FF' : '#FFFFFF',
                    alignItems: 'center'
                  }}
                  onPress={() => setPaymentMethod(method)}
                  activeOpacity={0.7}
                >
                  <Text style={{ 
                    fontSize: 13, 
                    fontWeight: '600', 
                    color: paymentMethod === method ? '#0053B3' : '#4B5563'
                  }}>
                    {method === 'gpay' ? 'GPay' : method === 'phonepe' ? 'PhonePe' : 'Paytm'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={handleAddMoney} disabled={processing}>
              {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalPrimaryBtnText}>Add Money</Text>}
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
              Available: ₹{balance.toFixed(0)}
            </Text>

            <View style={styles.modalInputRow}>
              <Text style={styles.modalCurrency}>₹</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.quickBtn, { alignSelf: 'flex-start', marginBottom: 20 }]}
              onPress={() => setAmount(String(Math.floor(balance)))}
            >
              <Text style={styles.quickBtnText}>Max: ₹{Math.floor(balance)}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modalPrimaryBtn, { backgroundColor: '#262D36' }]} onPress={handleWithdraw} disabled={processing}>
              {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalPrimaryBtnText}>Withdraw</Text>}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#0069E0',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 32,
    marginBottom: 20,
    shadowColor: '#000',
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
    color: '#7C848D',
    fontWeight: '400',
  },
  balanceValue: {
    fontSize: 20,
    color: '#262D36',
    fontWeight: '700',
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

  // ── Modal ──
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  modalCurrency: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  modalInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '500',
    color: '#1F2937',
  },
  quickSelectRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  quickBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickBtnActive: {
    backgroundColor: '#0053B3',
    borderColor: '#0053B3',
  },
  quickBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  quickBtnTextActive: {
    color: '#FFFFFF',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  modalCancelBtnText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
});
