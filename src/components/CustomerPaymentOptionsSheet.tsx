import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/colors';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CustomerPaymentOptionsSheet({ amount, onSelect, processing, onCancel }: any) {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors);

  return (
    <View style={styles.sheetContainer}>
      <Text style={styles.title}>Payment Details</Text>
      <Text style={styles.amount}>₹{amount}</Text>

      <Text style={styles.subtitle}>Select Payment Method</Text>

      <View style={styles.optionsRow}>
        <TouchableOpacity style={styles.optionBtn} onPress={() => onSelect('wallet')} disabled={processing}>
          <MaterialCommunityIcons name="wallet-outline" size={24} color="#075AAA" />
          <Text style={styles.optionText}>Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionBtn} onPress={() => onSelect('gpay')} disabled={processing}>
          <MaterialCommunityIcons name="google" size={24} color="#DB4437" />
          <Text style={styles.optionText}>GPay</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionBtn} onPress={() => onSelect('phonepe')} disabled={processing}>
          <MaterialCommunityIcons name="cellphone-nfc" size={24} color="#6739B7" />
          <Text style={styles.optionText}>PhonePe</Text>
        </TouchableOpacity>
      </View>

      {processing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="small" color="#075AAA" />
          <Text style={styles.processingText}>Processing Payment...</Text>
        </View>
      )}

      <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={processing}>
        <Text style={styles.cancelBtnText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    elevation: 20,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  title: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  optionBtn: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.borderGlass
  },
  optionText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary
  },
  processingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  processingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#075AAA',
    fontWeight: '500'
  },
  cancelBtn: {
    padding: 16,
    alignItems: 'center'
  },
  cancelBtnText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600'
  }
});
