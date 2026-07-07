import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/colors';
import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

interface NotificationScreenProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationScreen({ visible, onClose }: NotificationScreenProps) {
    const { isDark } = useTheme();
    const { t } = useLanguage();
    const styles = getStyles(Colors);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      API.get('/public/notifications?targetAudience=customer')
        .then(res => setNotifications(res.data.data || []))
        .catch(err => console.error('Failed to fetch notifications:', err));
    }
  }, [visible]);

  const filteredNotifs = filter === 'all' ? notifications : notifications.filter(n => !n.read); // Add read logic later if needed

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Feather name="chevron-left" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        
        <View style={styles.tabsRow}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={filter === 'all' ? styles.tabActive : styles.tabInactive}
              onPress={() => setFilter('all')}
            >
              <Text style={filter === 'all' ? styles.tabActiveText : styles.tabInactiveText}>{t('notifications.all')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={filter === 'unread' ? styles.tabActive : styles.tabInactive}
              onPress={() => setFilter('unread')}
            >
              <Text style={filter === 'unread' ? styles.tabActiveText : styles.tabInactiveText}>{t('notifications.unread')}</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity>
            <Text style={styles.clearAllText}>{t('notifications.clearAll')}</Text>
          </TouchableOpacity>
        </View>

        
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          
          {filteredNotifs.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 40, color: Colors.textMuted }}>
              {t('notifications.noData') || 'No notifications'}
            </Text>
          ) : filteredNotifs.map((item, index) => (
            <View key={item._id || index} style={styles.notificationCard}>
              <View style={styles.cardLeft}>
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons name="bell-outline" size={20} color={Colors.accent} />
                </View>
                <View style={styles.textWrap}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.notifSubTitle}>{item.message}</Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.timeText}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                {/* <View style={styles.unreadDot} /> */}
              </View>
            </View>
          ))}

        </ScrollView>
      </View>
    </Modal>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 44,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tabActive: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabInactive: {
    backgroundColor: Colors.bgTertiary,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabActiveText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '400',
  },
  tabInactiveText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '400',
  },
  clearAllText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '400',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.iconBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: Colors.bgTertiary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flexDirection: 'column',
    gap: 4,
  },
  notifTitle: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '400',
  },
  notifSubTitle: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '400',
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '400',
  },
  unreadDot: {
    width: 12,
    height: 12,
    backgroundColor: Colors.accent,
    borderRadius: 6,
  },
});
