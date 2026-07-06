import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Feather } from '@expo/vector-icons';

export default function ProfileScreen({ onBack, onEditProfile, onNavigateLanguage }: { onBack: () => void, onEditProfile?: () => void, onNavigateLanguage?: () => void }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const getIconName = (title: string): keyof typeof Feather.glyphMap => {
    switch(title) {
      case 'Dark theme': return 'moon';
      case 'App language': return 'globe';
      case 'Order alert sound': return 'volume-2';
      case 'Help Centre': return 'help-circle';
      case 'Support tickets': return 'message-square';
      case 'Settings': return 'settings';
      default: return 'circle';
    }
  };

  const renderOptionRow = (titleKey: string, showToggle: boolean = false, onPress?: () => void) => (
    <TouchableOpacity style={styles.optionRow} onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
      <View style={styles.iconCircle}>
        <Feather name={getIconName(titleKey)} size={18} color="#0053B3" />
      </View>
      <Text style={styles.optionText}>{t(`profile.${titleKey}`)}</Text>
      <View style={{ flex: 1 }} />
      {showToggle ? (
        <View style={styles.toggleTrack}>
          <View style={styles.toggleThumb} />
        </View>
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Feather name="chevron-left" size={24} color="#262D36" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <TouchableOpacity style={styles.profileCard} onPress={onEditProfile} activeOpacity={0.9}>
          <View style={styles.profileInfoRow}>
            <View style={styles.avatarCircle}>
              <Text style={{ fontSize: 24 }}>👤</Text>
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>{user?.name || 'Raja'}</Text>
              <Text style={styles.profileId}>{user?.vehicle?.plateNumber || 'FE2889108'}</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.starIcon}>⭐</Text>
                <Text style={styles.starIcon}>⭐</Text>
                <Text style={styles.starIcon}>⭐</Text>
                <Text style={styles.starIcon}>⭐</Text>
                <Text style={styles.starIconGray}>⭐</Text>
                <Text style={styles.ratingText}>4.9</Text>
              </View>
            </View>
            <View style={{ flex: 1 }} />
            <Feather name="edit-2" size={24} color="#FCFCFC" style={{ opacity: 0.8 }} />
          </View>
        </TouchableOpacity>

        {/* Referral Card */}
        <View style={styles.referralCard}>
          <Text style={styles.referralTitle}>{t('profile.referralTitle')}</Text>
          <Text style={styles.referralSubtitle}>{t('profile.referralSub')}</Text>
        </View>

        {/* First Options Block */}
        <View style={styles.optionsBlock}>
          {renderOptionRow('darkTheme', true)}
          <View style={styles.divider} />
          {renderOptionRow('appLanguage', false, onNavigateLanguage)}
          <View style={styles.divider} />
          {renderOptionRow('alertSound')}
        </View>

        {/* Second Options Block */}
        <View style={styles.optionsBlock}>
          {renderOptionRow('helpCentre')}
          <View style={styles.divider} />
          {renderOptionRow('supportTickets')}
          <View style={styles.divider} />
          {renderOptionRow('settings')}
        </View>

        {/* Log out */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6'
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16
  },
  header: {
    marginTop: 20,
    marginBottom: 20
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
  profileCard: {
    backgroundColor: '#0053B3',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#005FCC',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileDetails: {
    justifyContent: 'center'
  },
  profileName: {
    color: '#FCFCFC',
    fontSize: 16,
    fontWeight: '600'
  },
  profileId: {
    color: '#A1A3A6',
    fontSize: 14,
    marginTop: 4
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4
  },
  starIcon: {
    color: '#FED101',
    fontSize: 12
  },
  starIconGray: {
    color: '#8DABCE',
    fontSize: 12,
    opacity: 0.5
  },
  ratingText: {
    color: '#FCFCFC',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4
  },
  referralCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    justifyContent: 'center'
  },
  referralTitle: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500'
  },
  referralSubtitle: {
    color: '#7C848D',
    fontSize: 12,
    marginTop: 4
  },
  optionsBlock: {
    backgroundColor: '#FCFCFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6F8FE',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 83, 179, 0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  optionText: {
    fontSize: 14,
    color: '#262D36',
    fontWeight: '500'
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: -16
  },
  chevron: {
    fontSize: 20,
    color: '#262D36',
    opacity: 0.5
  },
  toggleTrack: {
    width: 56,
    height: 28,
    backgroundColor: '#DEE0E3',
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 2
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F5F5F5'
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#F52F14',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40
  },
  logoutText: {
    color: '#F52F14',
    fontSize: 14,
    fontWeight: '500'
  }
});
