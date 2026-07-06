import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import Colors from '../../constants/colors';
import API from '../../services/api';
import { Feather } from '@expo/vector-icons';

export default function RidesTab() {
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const res = await API.get('/admin/bookings');
      if (res.data.success) {
        setRides(res.data.data);
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', 'Failed to fetch rides');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return Colors.success;
      case 'cancelled': return Colors.danger;
      case 'in_progress': case 'arrived': case 'accepted': return Colors.warning;
      default: return Colors.accent;
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.rideId}>ID: {item.shortId || item._id.substring(0, 8).toUpperCase()}</Text>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>
            {item.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.locationContainer}>
        <View style={styles.dotLine}>
          <View style={[styles.dot, { backgroundColor: Colors.success }]} />
          <View style={styles.line} />
          <View style={[styles.dot, { backgroundColor: Colors.danger }]} />
        </View>
        <View style={styles.addresses}>
          <Text style={styles.addressText} numberOfLines={1}>{item.pickup?.address}</Text>
          <Text style={[styles.addressText, { marginTop: 16 }]} numberOfLines={1}>{item.dropoff?.address}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        <Text style={styles.fare}>₹{item.fare?.estimated || item.fare?.actual || 0}</Text>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color={Colors.accent} style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={rides}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No rides found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  card: { backgroundColor: Colors.bgSecondary, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  rideId: { fontSize: 14, fontWeight: 'bold', color: Colors.textSecondary },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  locationContainer: { flexDirection: 'row', marginVertical: 8 },
  dotLine: { width: 20, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  line: { width: 2, height: 20, backgroundColor: Colors.border, marginVertical: 4 },
  addresses: { flex: 1, paddingLeft: 8 },
  addressText: { fontSize: 14, color: Colors.textPrimary },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  date: { fontSize: 12, color: Colors.textMuted },
  fare: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  emptyText: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 }
});
