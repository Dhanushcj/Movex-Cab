import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/colors';
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
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors);

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
      </View>

      <View style={styles.divider} />

      {/* Payment Selection & Tip removed per request */}

    </View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
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
    color: Colors.textPrimary,
  },
  vehiclePlate: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  fareBadge: {
    backgroundColor: Colors.bgPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'flex-end',
  },
  fareLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  fareVal: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderGlass,
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
    borderColor: Colors.borderGlass,
    gap: 8,
  },
  payOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0053B3',
  },
  payOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
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
    borderColor: Colors.borderGlass,
  },
  tipButtonActive: {
    backgroundColor: '#0053B3',
    borderColor: '#0053B3',
  },
  tipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tipTextActive: {
    color: Colors.bgSecondary,
  },
});
