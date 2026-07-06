import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import Colors from '../../constants/colors';
import API from '../../services/api';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function VehiclesTab() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await API.get('/admin/vehicles');
      if (res.data.success) {
        setVehicles(res.data.data);
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="car" size={24} color={Colors.accent} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{item.vehicle?.make} {item.vehicle?.model}</Text>
          <Text style={styles.subtitle}>Driven by: {item.name}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.vehicle?.type}</Text>
        </View>
      </View>
      <View style={styles.plateRow}>
        <Text style={styles.plateNumber}>{item.vehicle?.plateNumber}</Text>
        <Text style={styles.colorText}>{item.vehicle?.color}</Text>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color={Colors.accent} style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={vehicles}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No vehicles found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 8, backgroundColor: Colors.accentGlow, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  subtitle: { fontSize: 14, color: Colors.textSecondary },
  badge: { backgroundColor: '#E2E8F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: Colors.textSecondary, textTransform: 'uppercase' },
  plateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 12, borderRadius: 8 },
  plateNumber: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', letterSpacing: 1 },
  colorText: { fontSize: 14, color: Colors.textSecondary, textTransform: 'capitalize' },
  emptyText: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 }
});
