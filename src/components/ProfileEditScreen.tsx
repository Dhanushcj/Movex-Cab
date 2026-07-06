import Colors from '../constants/colors';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Feather } from '@expo/vector-icons';

export default function ProfileEditScreen({ onBack, onSave }: { onBack: () => void, onSave: () => void }) {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || 'Sabari A');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changePasswordExpanded, setChangePasswordExpanded] = useState(false);
  const [phone, setPhone] = useState(user?.phone || '6382173293');
  const [city, setCity] = useState(user?.city || 'Krishnagiri');
  const [vehicleType, setVehicleType] = useState(user?.vehicle?.type || 'Car');
  const [plate, setPlate] = useState(user?.vehicle?.plateNumber || 'TNO2 BY 6518');

  const [bankName, setBankName] = useState(user?.bankDetails?.bankName || 'Indian Bank');
  const [accountNo, setAccountNo] = useState(user?.bankDetails?.accountNumber || '7088622124');
  const [ifsc, setIfsc] = useState(user?.bankDetails?.ifscCode || 'IDIB000G092');

  const [bankExpanded, setBankExpanded] = useState(true);

  const handleSave = async () => {
    try {
      if (newPassword || oldPassword || confirmNewPassword) {
        if (!oldPassword) return Alert.alert('Error', 'Please enter your old password');
        if (newPassword !== confirmNewPassword) return Alert.alert('Error', 'New passwords do not match');
      }
      
      const payload: any = { name, phone };
      if (user?.role === 'driver') {
        payload.city = city;
        payload.vehicleType = vehicleType;
        payload.plate = plate;
        payload.bankName = bankName;
        payload.accountNo = accountNo;
        payload.ifsc = ifsc;
      }
      if (oldPassword && newPassword) {
        payload.oldPassword = oldPassword;
        payload.newPassword = newPassword;
      }

      await updateProfile(payload);
      Alert.alert('Success', 'Profile updated successfully');
      onSave();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Feather name="chevron-left" size={24} color="#262D36" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={{ width: 40 }} />
            {/* Placeholder for flex balance */}
          </View>

          {/* Avatar Area */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarOuter}>
              <View style={styles.avatarInner}>
                <Text style={{ fontSize: 40 }}>👤</Text>
              </View>
              {/* Edit Icon Badge */}
              <View style={styles.editBadge}>
                <Feather name="camera" size={16} color="#0053B3" />
              </View>
            </View>
            {user?.role === 'driver' && <Text style={styles.plateId}>{plate}</Text>}
          </View>

          {/* User Details */}
          <Text style={styles.sectionTitle}>{user?.role === 'driver' ? 'Driver details' : 'Personal details'}</Text>
          <View style={styles.cardBlock}>
            <View style={styles.inputWrapper}>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full Name" placeholderTextColor="#7C848D" />
            </View>
            <View style={styles.inputWrapper}>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Mobile Number" placeholderTextColor="#7C848D" />
            </View>
            <TouchableOpacity style={styles.bankHeader} onPress={() => setChangePasswordExpanded(!changePasswordExpanded)} activeOpacity={0.8}>
              <Text style={styles.sectionTitle}>Change Password</Text>
              <Feather name={changePasswordExpanded ? 'chevron-down' : 'chevron-right'} size={24} color="#262D36" />
            </TouchableOpacity>

            {changePasswordExpanded && (
              <View style={[styles.cardBlock, { marginTop: -10, paddingTop: 10, backgroundColor: 'transparent' }]}>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} value={oldPassword} onChangeText={setOldPassword} placeholder="Old Password" placeholderTextColor="#7C848D" secureTextEntry />
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} placeholder="New Password" placeholderTextColor="#7C848D" secureTextEntry />
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} value={confirmNewPassword} onChangeText={setConfirmNewPassword} placeholder="Confirm New Password" placeholderTextColor="#7C848D" secureTextEntry />
                </View>
              </View>
            )}
            
            {user?.role === 'driver' && (
              <>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="City" placeholderTextColor="#7C848D" />
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} value={vehicleType} onChangeText={setVehicleType} placeholder="Vehicle Type" placeholderTextColor="#7C848D" />
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} value={plate} onChangeText={setPlate} placeholder="Plate Number" placeholderTextColor="#7C848D" />
                </View>
              </>
            )}
          </View>

          {/* Bank details header - Only for Drivers */}
          {user?.role === 'driver' && (
            <>
              <TouchableOpacity style={styles.bankHeader} onPress={() => setBankExpanded(!bankExpanded)} activeOpacity={0.8}>
                <Text style={styles.sectionTitle}>Bank details</Text>
                <Feather name={bankExpanded ? 'chevron-down' : 'chevron-right'} size={24} color="#262D36" />
              </TouchableOpacity>

              {/* Bank details card */}
              {bankExpanded && (
                <View style={styles.cardBlock}>
                  <Text style={styles.bankDetailText}>Bank Name: {bankName}</Text>
                  <Text style={styles.bankDetailText}>Account No: {accountNo}</Text>
                  <Text style={styles.bankDetailText}>IFSC Code : {ifsc}</Text>
                </View>
              )}
            </>
          )}
          
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footerContainer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onBack}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgPrimary
  },
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    paddingHorizontal: 16
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 40 : 60, // Increased top padding as requested
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DEE0E3',
    alignItems: 'center',
    justifyContent: 'center'
  },
  backButtonIcon: {
    fontSize: 18,
    color: '#262D36'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.textPrimary
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  avatarOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E8EAEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative'
  },
  avatarInner: {
    width: 73,
    height: 73,
    borderRadius: 36.5,
    borderWidth: 3,
    borderColor: '#0053B3',
    alignItems: 'center',
    justifyContent: 'center'
  },
  editBadge: {
    position: 'absolute',
    bottom: 5,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.75,
    borderColor: '#0053B3'
  },
  plateId: {
    fontSize: 16,
    color: Colors.textPrimary
  },
  sectionTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 12
  },
  cardBlock: {
    backgroundColor: '#FCFCFC',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 24
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#DEE0E3',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    justifyContent: 'center'
  },
  input: {
    fontSize: 14,
    color: '#262D36'
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },
  bankDetailText: {
    fontSize: 14,
    color: '#7C848D',
    marginBottom: 4
  },
  footerContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: Colors.bgPrimary,
    gap: 19,
    justifyContent: 'center'
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#0053B3',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelText: {
    color: '#0053B3',
    fontSize: 14
  },
  saveBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#0053B3',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  saveText: {
    color: '#FCFCFC',
    fontSize: 14
  }
});
