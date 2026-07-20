import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '../constants/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSchedule: (pickup: any, drop: any) => void;
  onSelectLocation: (field: 'pickup' | 'drop') => void;
  pickupAddress: string;
  dropAddress: string;
}

export default function ScheduleConfirmScreen({ visible, onClose, onSchedule, onSelectLocation, pickupAddress, dropAddress }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose} activeOpacity={0.8}>
            <Feather name="chevron-left" size={24} color="#262D36" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirm Details</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Route Summary</Text>
          
          <View style={styles.routeCard}>
            {/* Pickup */}
            <View style={styles.routeRow}>
              <View style={[styles.iconBox, { backgroundColor: '#EFFAF0' }]}>
                <Feather name="home" size={20} color="#198E1E" />
              </View>
              <TouchableOpacity style={styles.addressBox} onPress={() => onSelectLocation('pickup')} activeOpacity={0.7}>
                <Text style={styles.addressLabel}>Pickup Location</Text>
                <Text style={styles.addressText} numberOfLines={2}>
                  {pickupAddress || 'Tap to select pickup location'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Dotted Line */}
            <View style={styles.dottedLine} />

            {/* Drop */}
            <View style={styles.routeRow}>
              <View style={[styles.iconBox, { backgroundColor: '#FEF2EB' }]}>
                <Feather name="map-pin" size={20} color="#F85300" />
              </View>
              <TouchableOpacity style={styles.addressBox} onPress={() => onSelectLocation('drop')} activeOpacity={0.7}>
                <Text style={styles.addressLabel}>Drop Location</Text>
                <Text style={styles.addressText} numberOfLines={2}>
                  {dropAddress || 'Tap to select drop location'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.confirmBtn, (!pickupAddress || !dropAddress) && { opacity: 0.5 }]} 
            onPress={() => onSchedule(pickupAddress, dropAddress)}
            disabled={!pickupAddress || !dropAddress}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmText}>Schedule Ride</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
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
    fontWeight: '600',
    color: '#262D36',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: 'sans-serif',
    fontSize: 16,
    fontWeight: '600',
    color: '#262D36',
    marginBottom: 16,
    marginLeft: 4,
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    zIndex: 2,
  },
  addressBox: {
    flex: 1,
    justifyContent: 'center',
  },
  addressLabel: {
    fontSize: 12,
    color: '#7C848D',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#262D36',
    fontWeight: '500',
  },
  dottedLine: {
    width: 1,
    height: 30,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginLeft: 18,
    marginVertical: 4,
    zIndex: 1,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  confirmBtn: {
    backgroundColor: '#0053B3',
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  }
});
