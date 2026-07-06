import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import API from '../services/api';

interface CustomerInRideOptionsProps {
  rideId: string;
  initialPaymentMethod: string;
  driverName?: string;
  vehiclePlate?: string;
  fare: number;
}

export default function CustomerInRideOptions({
  rideId,
  initialPaymentMethod,
  driverName,
  vehiclePlate,
  fare
}: CustomerInRideOptionsProps) {
  const [paymentMethod, setPaymentMethod] = useState(initialPaymentMethod || 'cash');
  const [tip, setTip] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (method: string, tipAmount: number) => {
    setLoading(true);
    try {
      await API.put(`/bookings/${rideId}/payment-method`, {
        paymentMethod: method,
        tipAmount
      });
      setPaymentMethod(method);
      setTip(tipAmount);
    } catch (e) {
      console.log('Failed to update payment preferences', e);
    } finally {
      setLoading(false);
    }
  };

  const renderTipOption = (amount: number) => {
    const isSelected = tip === amount;
    return (
      <TouchableOpacity
        key={amount}
        style={[styles.tipButton, isSelected && styles.tipButtonActive]}
        onPress={() => handleUpdate(paymentMethod, amount)}
        disabled={loading}
      >
        <Text style={[styles.tipText, isSelected && styles.tipTextActive]}>
          +₹{amount}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Driver Info & Fare */}
      <View style={styles.driverRow}>
        <View style={styles.driverInfo}>
          <Text style={styles.emoji}>👨🏻‍✈️</Text>
          <View style={styles.driverTextWrap}>
            <Text style={styles.driverName}>{driverName || 'Your Driver'}</Text>
            <Text style={styles.vehiclePlate}>{vehiclePlate || 'Vehicle'}</Text>
          </View>
        </View>
        <View style={styles.fareBadge}>
          <Text style={styles.fareLabel}>FARE</Text>
          <Text style={styles.fareVal}>₹{fare}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Payment Selection */}
      <Text style={styles.sectionTitle}>Payment Mode</Text>
      <View style={styles.paymentModesRow}>
        <TouchableOpacity
          style={[styles.payOption, paymentMethod === 'cash' && styles.payOptionActive]}
          onPress={() => handleUpdate('cash', tip)}
          disabled={loading}
        >
          <Feather name="dollar-sign" size={18} color={paymentMethod === 'cash' ? '#0053B3' : '#6B7280'} />
          <Text style={[styles.payOptionText, paymentMethod === 'cash' && styles.payOptionTextActive]}>Cash</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.payOption, paymentMethod === 'qr' && styles.payOptionActive]}
          onPress={() => handleUpdate('qr', tip)}
          disabled={loading}
        >
          <MaterialCommunityIcons name="qrcode-scan" size={18} color={paymentMethod === 'qr' ? '#0053B3' : '#6B7280'} />
          <Text style={[styles.payOptionText, paymentMethod === 'qr' && styles.payOptionTextActive]}>QR / Online</Text>
        </TouchableOpacity>
      </View>

      {/* Tip Selection */}
      <View style={styles.tipSectionHeader}>
        <Text style={styles.sectionTitle}>Add a Tip (100% goes to driver)</Text>
        {loading && <ActivityIndicator size="small" color="#0053B3" />}
      </View>
      
      <View style={styles.tipsRow}>
        {[10, 20, 50, 100].map(renderTipOption)}
        <TouchableOpacity
          style={[styles.tipButton, tip === 0 && styles.tipButtonActive]}
          onPress={() => handleUpdate(paymentMethod, 0)}
          disabled={loading}
        >
          <Text style={[styles.tipText, tip === 0 && styles.tipTextActive]}>No Tip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  driverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  driverTextWrap: {
    marginLeft: 12,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  vehiclePlate: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  fareBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'flex-end',
  },
  fareLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  fareVal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  paymentModesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  payOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  payOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0053B3',
  },
  payOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  payOptionTextActive: {
    color: '#0053B3',
  },
  tipSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tipButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tipButtonActive: {
    backgroundColor: '#0053B3',
    borderColor: '#0053B3',
  },
  tipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  tipTextActive: {
    color: '#FFFFFF',
  },
});
