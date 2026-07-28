import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/colors';
import API from '../services/api';

interface CreateTicketModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTicketModal({ visible, onClose, onSuccess }: CreateTicketModalProps) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);

  const [type, setType] = useState('other');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const types = [
    { value: 'safety', label: 'Safety Issue' },
    { value: 'payment', label: 'Payment Issue' },
    { value: 'driver_behavior', label: 'Driver Behavior' },
    { value: 'vehicle_condition', label: 'Vehicle Condition' },
    { value: 'route_issue', label: 'Route Issue' },
    { value: 'fare_dispute', label: 'Fare Dispute' },
    { value: 'app_issue', label: 'App Issue' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert('Error', 'Please enter both subject and description.');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/users/complaints', {
        type,
        subject,
        description
      });
      if (response.data) {
        Alert.alert('Success', 'Ticket submitted successfully.');
        setSubject('');
        setDescription('');
        setType('other');
        onSuccess();
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create Support Ticket</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Issue Type</Text>
            <TouchableOpacity 
              style={styles.pickerBtn} 
              onPress={() => setShowTypePicker(!showTypePicker)}
            >
              <Text style={styles.pickerText}>
                {types.find(t => t.value === type)?.label}
              </Text>
              <Feather name={showTypePicker ? "chevron-up" : "chevron-down"} size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            {showTypePicker && (
              <View style={styles.pickerOptions}>
                {types.map(t => (
                  <TouchableOpacity 
                    key={t.value} 
                    style={styles.pickerOption}
                    onPress={() => {
                      setType(t.value);
                      setShowTypePicker(false);
                    }}
                  >
                    <Text style={type === t.value ? styles.pickerOptionTextActive : styles.pickerOptionText}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="Brief subject of the issue"
              placeholderTextColor={Colors.textSecondary}
              value={subject}
              onChangeText={setSubject}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Provide details about your issue..."
              placeholderTextColor={Colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity 
              style={styles.submitBtn} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Ticket</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Outfit',
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  formContainer: {
    gap: 16,
  },
  label: {
    fontFamily: 'Outfit',
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: -8,
  },
  pickerBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bgPrimary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 12,
    padding: 14,
  },
  pickerText: {
    fontFamily: 'Outfit',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  pickerOptions: {
    backgroundColor: Colors.bgPrimary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 12,
    marginTop: -8,
    maxHeight: 200,
  },
  pickerOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  pickerOptionText: {
    fontFamily: 'Outfit',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pickerOptionTextActive: {
    fontFamily: 'Outfit',
    fontSize: 14,
    color: '#0053B3',
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.bgPrimary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 12,
    padding: 14,
    fontFamily: 'Outfit',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  textArea: {
    height: 100,
  },
  submitBtn: {
    backgroundColor: '#0053B3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    fontFamily: 'Outfit',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  }
});
