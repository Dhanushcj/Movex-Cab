import Colors from '../constants/colors';
import React, { useState } from 'react';
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

interface NotificationScreenProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationScreen({ visible, onClose }: NotificationScreenProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Feather name="chevron-left" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>

        
        <View style={styles.tabsRow}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={filter === 'all' ? styles.tabActive : styles.tabInactive}
              onPress={() => setFilter('all')}
            >
              <Text style={filter === 'all' ? styles.tabActiveText : styles.tabInactiveText}>All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={filter === 'unread' ? styles.tabActive : styles.tabInactive}
              onPress={() => setFilter('unread')}
            >
              <Text style={filter === 'unread' ? styles.tabActiveText : styles.tabInactiveText}>Unread</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity>
            <Text style={styles.clearAllText}>Clear all</Text>
          </TouchableOpacity>
        </View>

        
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          
          {[1, 2, 3].map((item, index) => (
            <View key={index} style={styles.notificationCard}>
              <View style={styles.cardLeft}>
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons name="gift-outline" size={20} color="#0053B3" />
                </View>
                <View style={styles.textWrap}>
                  <Text style={styles.notifTitle}>Monday Full Day Offer</Text>
                  <Text style={styles.notifSubTitle}>Earn upto ₹7, 00 Incentive</Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.timeText}>2mins ago</Text>
                <View style={styles.unreadDot} />
              </View>
            </View>
          ))}

        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#DEE0E3',
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
    backgroundColor: '#0053B3',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabInactive: {
    backgroundColor: '#DEE0E3',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabActiveText: {
    color: '#FCFCFC',
    fontSize: 16,
    fontWeight: '400',
  },
  tabInactiveText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '400',
  },
  clearAllText: {
    color: '#0053B3',
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
    backgroundColor: '#F6F8FE',
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
    backgroundColor: '#E4E9FB',
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
    color: '#7C848D',
    fontWeight: '400',
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#7C848D',
    fontWeight: '400',
  },
  unreadDot: {
    width: 12,
    height: 12,
    backgroundColor: '#0053B3',
    borderRadius: 6,
  },
});
