import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView, Platform, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface HelpCentreScreenProps {
  visible: boolean;
  onClose: () => void;
}

const HelpCentreScreen: React.FC<HelpCentreScreenProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { user } = useAuth();

  const driverOptions = [
    { id: '1', title: 'Update Bank Details' },
    { id: '2', title: 'Change Vehicle Type' },
    { id: '3', title: 'Payout Issues' },
    { id: '4', title: 'About Insurance Policy' }
  ];

  const customerOptions = [
    { id: 'c1', title: 'Payment & Charges' },
    { id: 'c2', title: 'Ride Issues' },
    { id: 'c3', title: 'Lost Items' },
    { id: 'c4', title: 'App Feedback' }
  ];

  const helpOptions = user?.role === 'driver' ? driverOptions : customerOptions;

  const handleOptionPress = (option: { id: string, title: string }) => {
    Alert.alert(
      option.title,
      'To get help with this topic, please use the "Support Tickets" section to raise a ticket. Our support team will get back to you shortly.',
      [{ text: 'OK', onPress: () => {} }]
    );
  };

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
            <Feather name="arrow-left" size={20} color={colors.textPrimary} />
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
              onPress={() => handleOptionPress(option)}
            >
              <Text style={styles.optionText}>{option.title}</Text>
              <Feather name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </Modal>
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
    marginTop: Platform.OS === 'android' ? 20 : 10,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  card: {
    backgroundColor: colors.bgSecondary,
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
    borderBottomColor: colors.bgPrimary,
  },
  lastOptionRow: {
    borderBottomWidth: 0,
  },
  optionText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '400',
  }
});

export default HelpCentreScreen;
