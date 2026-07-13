import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '../constants/colors';

interface HelpCentreScreenProps {
  visible: boolean;
  onClose: () => void;
}

const HelpCentreScreen: React.FC<HelpCentreScreenProps> = ({ visible, onClose }) => {
  const helpOptions = [
    { id: '1', title: 'Update Bank Details' },
    { id: '2', title: 'Change Vehicle Type' },
    { id: '3', title: 'Payout Issues' },
    { id: '4', title: 'About Insurance Policy' }
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Feather name="arrow-left" size={20} color="#262D36" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help Centre</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.card}>
          {helpOptions.map((option, index) => (
            <TouchableOpacity 
              key={option.id} 
              style={[
                styles.optionRow,
                index === helpOptions.length - 1 && styles.lastOptionRow
              ]}
              onPress={() => {
                // Future handling
              }}
            >
              <Text style={styles.optionText}>{option.title}</Text>
              <Feather name="chevron-right" size={20} color="#262D36" />
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: Platform.OS === 'android' ? 20 : 10,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E9EAEC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    // Removed fontFamily: 'Outfit' to prevent missing font issues if Outfit isn't loaded
  },
  headerRight: {
    width: 40,
  },
  card: {
    backgroundColor: '#FCFCFC',
    borderRadius: 16,
    marginHorizontal: 16,
    paddingVertical: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastOptionRow: {
    borderBottomWidth: 0,
  },
  optionText: {
    fontSize: 14,
    color: '#262D36',
    fontWeight: '400',
  }
});

export default HelpCentreScreen;
