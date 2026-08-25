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
  ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../services/api';
import { ThemeSelector } from './ThemeSelector';

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

  const settingsEndpoint = user?.role === 'driver' ? '/drivers/settings' : '/users/me/settings';
  const deleteEndpoint = user?.role === 'driver' ? '/drivers/me' : '/users/me';

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

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Feather name="chevron-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={{ marginTop: 40, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : (
            <>
              {/* Premium Theme Selector */}
              <View style={styles.sectionContainer}>
                <ThemeSelector />
              </View>

              {/* Preferences Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Preferences</Text>
                <View style={styles.card}>
                  <TouchableOpacity style={styles.toggleRow} onPress={togglePushNotification} activeOpacity={0.7}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.accentGlow }]}>
                      <Feather name="bell" size={20} color={colors.accent} />
                    </View>
                    <Text style={styles.toggleLabel}>Push Notifications</Text>
                    <View style={{ flex: 1 }} />
                    <View style={[styles.toggleTrack, pushNotification && { backgroundColor: colors.accent }]}>
                      <View style={[styles.toggleThumb, pushNotification && styles.toggleThumbActive]} />
                    </View>
                  </TouchableOpacity>

                  <View style={styles.divider} />

                  <TouchableOpacity style={styles.toggleRow} onPress={toggleBiometricLock} activeOpacity={0.7}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.accentGlow }]}>
                      <Feather name="lock" size={20} color={colors.accent} />
                    </View>
                    <Text style={styles.toggleLabel}>Biometric Lock</Text>
                    <View style={{ flex: 1 }} />
                    <View style={[styles.toggleTrack, biometricLock && { backgroundColor: colors.accent }]}>
                      <View style={[styles.toggleThumb, biometricLock && styles.toggleThumbActive]} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Links Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>More Options</Text>
                <View style={styles.card}>
                  <TouchableOpacity style={styles.linkRow} activeOpacity={0.7} onPress={() => Linking.openSettings()}>
                    <View style={styles.linkLeft}>
                      <View style={[styles.iconCircle, { backgroundColor: colors.bgTertiary }]}>
                        <Feather name="shield" size={20} color={colors.textSecondary} />
                      </View>
                      <Text style={styles.linkLabel}>Privacy & Permission</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                  
                  <View style={styles.divider} />
                  
                  <TouchableOpacity style={styles.linkRow} activeOpacity={0.7} onPress={() => Alert.alert('About MoveX', 'MoveX Cab Application\nVersion 1.0.0\n\nA modern ride-hailing platform connecting riders with drivers seamlessly.\n\n© 2025 MoveX. All rights reserved.', [{ text: 'OK' }])}>
                    <View style={styles.linkLeft}>
                      <View style={[styles.iconCircle, { backgroundColor: colors.bgTertiary }]}>
                        <Feather name="info" size={20} color={colors.textSecondary} />
                      </View>
                      <Text style={styles.linkLabel}>About App</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Danger Zone */}
              <View style={styles.deleteContainer}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? (
                    <ActivityIndicator size="small" color={colors.danger} />
                  ) : (
                    <>
                      <Feather name="trash-2" size={18} color={colors.danger} />
                      <Text style={styles.deleteText}>Delete Account</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 10 : 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.bgPrimary,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    paddingHorizontal: 20,
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 20,
    marginHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12, // slightly square but very rounded
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  toggleTrack: {
    width: 52,
    height: 28,
    backgroundColor: colors.border,
    borderRadius: 14,
    justifyContent: 'center',
  },
  toggleThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    left: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleThumbActive: {
    left: 26,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderGlass,
    marginLeft: 70, // Align with text
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  deleteContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.2)', // Soft red border
    borderRadius: 16,
    minWidth: '80%',
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.danger,
    letterSpacing: -0.2,
  },
});
