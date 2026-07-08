import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator, Switch, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '../constants/colors';
import API from '../services/api';

interface CommutePassConfigScreenProps {
  onBack: () => void;
  pickupAddr: string;
  dropAddr: string;
  pickupCoords: number[] | null;
  dropCoords: number[] | null;
  onPickLocation: (mode: 'pickup' | 'drop') => void;
  onPassPurchased: () => void;
}

export default function CommutePassConfigScreen({
  onBack,
  pickupAddr,
  dropAddr,
  pickupCoords,
  dropCoords,
  onPickLocation,
  onPassPurchased
}: CommutePassConfigScreenProps) {
  const [vehicleType, setVehicleType] = useState('mini');
  const [isReturnTrip, setIsReturnTrip] = useState(false);
  const [pickupTime, setPickupTime] = useState('09:00');
  const [returnTime, setReturnTime] = useState('18:00');

  const [estimate, setEstimate] = useState<any>(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const handleEstimate = async () => {
    if (!pickupCoords || !dropCoords) {
      Alert.alert('Missing Info', 'Please select both pickup and drop locations.');
      return;
    }
    setLoadingEstimate(true);
    try {
      const res = await API.post('/subscriptions/estimate', {
        pickup: { address: pickupAddr, coordinates: pickupCoords },
        drop: { address: dropAddr, coordinates: dropCoords },
        vehicleType,
        isReturnTrip
      });
      if (res.data.success) {
        setEstimate(res.data.data);
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to estimate pass');
    } finally {
      setLoadingEstimate(false);
    }
  };

  const handlePurchase = async () => {
    if (!estimate || !pickupCoords || !dropCoords) return;
    setPurchasing(true);
    try {
      const res = await API.post('/subscriptions/purchase', {
        pickup: { address: pickupAddr, coordinates: pickupCoords },
        drop: { address: dropAddr, coordinates: dropCoords },
        vehicleType,
        totalRides: estimate.totalRides,
        pricePerRide: estimate.pricePerRide,
        totalPrice: estimate.totalPrice,
        isReturnTrip,
        pickupTime,
        returnTime: isReturnTrip ? returnTime : undefined
      });
      if (res.data.success) {
        Alert.alert('Success', 'Commute Pass purchased successfully!');
        onPassPurchased();
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to purchase pass');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configure Commute Pass</Text>
      </View>
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
        
        <Text style={styles.sectionTitle}>Route</Text>
        <TouchableOpacity style={styles.locationBox} onPress={() => onPickLocation('pickup')}>
          <View style={[styles.dot, { backgroundColor: Colors.accent }]} />
          <Text style={styles.locationText} numberOfLines={1}>{pickupAddr || 'Set Pickup Location'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.locationBox, { marginBottom: 24 }]} onPress={() => onPickLocation('drop')}>
          <View style={[styles.dot, { backgroundColor: Colors.accent }]} />
          <Text style={styles.locationText} numberOfLines={1}>{dropAddr || 'Set Drop Location'}</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Vehicle Type</Text>
        <View style={styles.vehicleOptions}>
          {['mini', 'sedan', 'suv', 'auto', 'bike'].map(v => (
            <TouchableOpacity 
              key={v} 
              style={[styles.vehicleBtn, vehicleType === v && styles.vehicleBtnActive]}
              onPress={() => { setVehicleType(v); setEstimate(null); }}
            >
              <Text style={[styles.vehicleBtnText, vehicleType === v && styles.vehicleBtnTextActive]}>
                {v.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Trip Settings</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Include Return Trip</Text>
          <Switch 
            value={isReturnTrip} 
            onValueChange={v => { setIsReturnTrip(v); setEstimate(null); }} 
            trackColor={{ true: Colors.accent }}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Pickup Time (HH:MM)</Text>
          <TextInput 
            style={styles.timeInput}
            value={pickupTime}
            onChangeText={setPickupTime}
            placeholder="09:00"
            keyboardType="numbers-and-punctuation"
          />
        </View>

        {isReturnTrip && (
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Return Time (HH:MM)</Text>
            <TextInput 
              style={styles.timeInput}
              value={returnTime}
              onChangeText={setReturnTime}
              placeholder="18:00"
              keyboardType="numbers-and-punctuation"
            />
          </View>
        )}

        <View style={styles.divider} />

        {!estimate ? (
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={handleEstimate}
            disabled={loadingEstimate}
          >
            {loadingEstimate ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionBtnText}>Get Estimate (30 Days)</Text>}
          </TouchableOpacity>
        ) : (
          <View style={styles.estimateCard}>
            <Text style={styles.estimateTitle}>Pass Estimate</Text>
            <View style={styles.estimateRow}>
              <Text style={styles.estimateLabel}>Total Rides</Text>
              <Text style={styles.estimateValue}>{estimate.totalRides}</Text>
            </View>
            <View style={styles.estimateRow}>
              <Text style={styles.estimateLabel}>Price Per Ride</Text>
              <Text style={styles.estimateValue}>₹{estimate.pricePerRide}</Text>
            </View>
            <View style={styles.estimateRow}>
              <Text style={styles.estimateLabel}>Standard Total</Text>
              <Text style={[styles.estimateValue, { textDecorationLine: 'line-through', color: Colors.textSecondary }]}>₹{estimate.standardTotal}</Text>
            </View>
            <View style={styles.estimateRow}>
              <Text style={styles.estimateLabel}>Discounted Total</Text>
              <Text style={[styles.estimateValue, { color: Colors.accent, fontSize: 20 }]}>₹{estimate.totalPrice}</Text>
            </View>
            <View style={styles.estimateRow}>
              <Text style={styles.estimateLabel}>Your Savings</Text>
              <Text style={[styles.estimateValue, { color: Colors.success }]}>₹{estimate.savings}</Text>
            </View>

            <TouchableOpacity 
              style={[styles.actionBtn, { marginTop: 16 }]} 
              onPress={handlePurchase}
              disabled={purchasing}
            >
              {purchasing ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionBtnText}>Purchase Pass</Text>}
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  container: { flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.textSecondary, marginBottom: 12, marginTop: 8 },
  locationBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgSecondary, padding: 16, borderRadius: 12, marginBottom: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  locationText: { flex: 1, fontSize: 16, color: Colors.textPrimary },
  vehicleOptions: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24, gap: 8 },
  vehicleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgSecondary },
  vehicleBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  vehicleBtnText: { color: Colors.textPrimary, fontWeight: '600' },
  vehicleBtnTextActive: { color: '#fff' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, backgroundColor: Colors.bgSecondary, padding: 16, borderRadius: 12 },
  settingLabel: { fontSize: 16, color: Colors.textPrimary, fontWeight: '500' },
  timeInput: { fontSize: 16, color: Colors.accent, fontWeight: '600', backgroundColor: Colors.bgPrimary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, width: 80, textAlign: 'center' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 24 },
  actionBtn: { backgroundColor: Colors.accent, padding: 16, borderRadius: 12, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  estimateCard: { backgroundColor: Colors.bgSecondary, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: Colors.border },
  estimateTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 },
  estimateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  estimateLabel: { color: Colors.textSecondary, fontSize: 16 },
  estimateValue: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
});
