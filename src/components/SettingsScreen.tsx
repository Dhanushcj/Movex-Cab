import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  Modal,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../services/api';
import Colors from '../constants/colors';

interface SettingsScreenProps {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsScreen({ visible, onClose }: SettingsScreenProps) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const { user, logout } = useAuth();
  const [pushNotification, setPushNotification] = useState(false);
  const [biometricLock, setBiometricLock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Determine API base path based on user role
  const settingsEndpoint = user?.role === 'driver' ? '/drivers/settings' : '/users/me/settings';
  const deleteEndpoint = user?.role === 'driver' ? '/drivers/me' : '/users/me';

  // Fetch settings when screen becomes visible
  useEffect(() => {
    if (visible) {
      fetchSettings();
    }
  }, [visible]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await API.get(settingsEndpoint);
      if (res.data.success) {
        setPushNotification(res.data.data.pushNotification ?? false);
        setBiometricLock(res.data.data.biometricLock ?? false);
      }
    } catch (e: any) {
      // Use defaults if endpoint not available yet
      setPushNotification(false);
      setBiometricLock(false);
    } finally {
      setLoading(false);
    }
  };

  const togglePushNotification = async () => {
    const newValue = !pushNotification;
    setPushNotification(newValue);
    try {
      await API.put(settingsEndpoint, { pushNotification: newValue });
    } catch (e: any) {
      // Revert on failure
      setPushNotification(!newValue);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    }
  };

  const toggleBiometricLock = async () => {
    const newValue = !biometricLock;
    setBiometricLock(newValue);
    try {
      await API.put(settingsEndpoint, { biometricLock: newValue });
    } catch (e: any) {
      // Revert on failure
      setBiometricLock(!newValue);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const res = await API.delete(deleteEndpoint);
              if (res.data.success) {
                Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
                await logout();
                onClose();
              }
            } catch (e: any) {
              Alert.alert('Error', e.response?.data?.message || 'Failed to delete account. Please try again.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handlePrivacyPermission = () => {
    Linking.openSettings();
  };

  const handleAboutApp = () => {
    Alert.alert(
      'About MoveX',
      'MoveX Cab Application\nVersion 1.0.0\n\nA modern ride-hailing platform connecting riders with drivers seamlessly.\n\n© 2025 MoveX. All rights reserved.',
      [{ text: 'OK' }]
    );
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Feather name="chevron-left" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settings</Text>
            <View style={{ width: 40 }} />
          </View>

          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#0053B3" />
            </View>
          ) : (
            <>
              {/* Push Notification Row */}
              <View style={styles.toggleSection}>
                <TouchableOpacity
                  style={styles.toggleRow}
                  onPress={togglePushNotification}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconCircle}>
                    <Feather name="bell" size={18} color="#0053B3" />
                  </View>
                  <Text style={styles.toggleLabel}>Push Notification</Text>
                  <View style={{ flex: 1 }} />
                  <View style={[styles.toggleTrack, pushNotification && styles.toggleTrackActive]}>
                    <View
                      style={[
                        styles.toggleThumb,
                        pushNotification && styles.toggleThumbActive,
                      ]}
                    />
                  </View>
                </TouchableOpacity>

                <View style={styles.divider} />

                {/* Bio Metric Lock Row */}
                <TouchableOpacity
                  style={styles.toggleRow}
                  onPress={toggleBiometricLock}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconCircle}>
                    <Feather name="lock" size={18} color="#0053B3" />
                  </View>
                  <Text style={styles.toggleLabel}>Bio Metric Lock</Text>
                  <View style={{ flex: 1 }} />
                  <View style={[styles.toggleTrack, biometricLock && styles.toggleTrackActive]}>
                    <View
                      style={[
                        styles.toggleThumb,
                        biometricLock && styles.toggleThumbActive,
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Links Card */}
              <View style={styles.linksCard}>
                <TouchableOpacity style={styles.linkRow} activeOpacity={0.7} onPress={handlePrivacyPermission}>
                  <Text style={styles.linkLabel}>Privacy & Permission</Text>
                  <Feather name="chevron-right" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.linkDivider} />
                <TouchableOpacity style={styles.linkRow} activeOpacity={0.7} onPress={handleAboutApp}>
                  <Text style={styles.linkLabel}>About App</Text>
                  <Feather name="chevron-right" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Delete Account Button */}
              <View style={styles.deleteContainer}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? (
                    <ActivityIndicator size="small" color="#DA0707" />
                  ) : (
                    <>
                      <Feather name="trash-2" size={20} color="#DA0707" />
                      <Text style={styles.deleteText}>Delete Account</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
  },
  toggleSection: {
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6F8FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textPrimary,
  },
  toggleTrack: {
    width: 56,
    height: 28,
    backgroundColor: colors.border,
    borderRadius: 16,
    justifyContent: 'center',
  },
  toggleTrackActive: {
    backgroundColor: '#0053B3',
  },
  toggleThumb: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FAFAFA',
    left: -3,
    top: -3,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  toggleThumbActive: {
    left: 25,
    backgroundColor: '#FCFCFC',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 50,
  },
  linksCard: {
    backgroundColor: '#FCFCFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  linkDivider: {
    height: 1,
    backgroundColor: colors.bgPrimary,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textPrimary,
  },
  deleteContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: '#DA0707',
    borderRadius: 16,
    minWidth: 216,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#DA0707',
  },
});
