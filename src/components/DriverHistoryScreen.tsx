import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/colors';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Platform, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import API from '../services/api';

type FilterType = 'All' | 'Completed' | 'Cancelled';

export default function DriverHistoryScreen({ onNavigateHome, onNavigateAchievements }: { onNavigateHome: () => void, onNavigateAchievements?: () => void }) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await API.get('/drivers/earnings');
      if (res.data.success) {
        const rides = [...(res.data.rides || []), ...(res.data.cancelledRides || [])];
        rides.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        const formattedData = rides.map((item: any) => {
          const isCancelled = item.status === 'cancelled';
          const fareAmount = typeof item.fare === 'object' 
            ? (item.fare?.finalFare || item.fare?.estimatedFare || 0) 
            : (item.fare || 0);
          
          const pickupStr = item.pickup?.address ? item.pickup.address.split(',')[0] : 'Unknown';
          const dropStr = item.dropoff?.address ? item.dropoff.address.split(',')[0] : (item.drop?.address ? item.drop.address.split(',')[0] : 'Unknown');
          
          const dateObj = new Date(item.createdAt);
          const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
          
          return {
            id: item._id || Math.random().toString(),
            route: `${pickupStr} - ${dropStr}`,
            time: `${dateStr} ${timeStr}`,
            price: `₹${fareAmount}`,
            status: isCancelled ? 'Cancelled' : 'Completed',
            statusColor: isCancelled ? '#F81215' : '#1FAD67'
          };
        });
        setHistoryData(formattedData);
      }
    } catch (e) {
      console.log('Failed to fetch history', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ride History</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="search by location or date"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {['All', 'Completed', 'Cancelled'].map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity 
                key={filter} 
                style={[styles.filterChip, isActive ? styles.filterActive : styles.filterInactive]}
                onPress={() => setActiveFilter(filter as FilterType)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterText, isActive ? styles.filterTextActive : styles.filterTextInactive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* List */}
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator size="large" color="#075AAA" style={{ marginTop: 40 }} />
          ) : historyData.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Feather name="inbox" size={40} color="#DEE0E3" />
              <Text style={{ marginTop: 12, color: Colors.textMuted, fontWeight: '600' }}>No history found</Text>
            </View>
          ) : (
            historyData
              .filter(item => activeFilter === 'All' || item.status === activeFilter)
              .map((item) => (
              <View key={item.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.routeText}>{item.route}</Text>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={[styles.priceText, item.status === 'Cancelled' ? { color: '#F81215' } : { color: '#075AAA' }]}>{item.price}</Text>
                <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
              </View>
            </View>
            ))
          )}
          <View style={{ height: 100 }} />
          {/* Bottom padding for nav bar */}
        </ScrollView>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={onNavigateHome}>
          <Feather name="home" size={24} color="#9098A2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={onNavigateAchievements}>
          <Feather name="award" size={24} color="#9098A2" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navItemActive]}>
          <Feather name="clock" size={18} color="#FCFCFC" />
          <Text style={styles.navTextActive}>History</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgPrimary
  },
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 40 : 60,
    paddingHorizontal: 16,
    marginBottom: 20
  },
  headerTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '400'
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DEE0E3',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 48,
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 8,
    backgroundColor: Colors.bgPrimary
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: Colors.textPrimary
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 20
  },
  filterChip: {
    height: 32,
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  filterActive: {
    backgroundColor: '#075AAA'
  },
  filterInactive: {
    backgroundColor: '#DEE0E3'
  },
  filterText: {
    fontSize: 14,
    fontWeight: '400'
  },
  filterTextActive: {
    color: '#FCFCFC'
  },
  filterTextInactive: {
    color: Colors.textSecondary
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F6F8FE',
    borderRadius: 16,
    marginBottom: 12
  },
  cardLeft: {
    flex: 1,
    gap: 8
  },
  routeText: {
    fontSize: 14,
    color: Colors.textPrimary
  },
  timeText: {
    fontSize: 12,
    color: Colors.textMuted
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 8
  },
  priceText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#075AAA'
  },
  statusText: {
    fontSize: 10,
    fontWeight: '400'
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 20,
    backgroundColor: Colors.bgSecondary,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10
  },
  navItem: {
    padding: 8
  },
  navItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#075AAA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6
  },
  navTextActive: {
    color: '#FCFCFC',
    fontSize: 14
  }
});
