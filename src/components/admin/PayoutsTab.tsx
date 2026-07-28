import { useTheme } from '../../context/ThemeContext';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import Colors from '../../constants/colors';
import API from '../../services/api';
import { Feather } from '@expo/vector-icons';

export default function PayoutsTab() {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors);

  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      const res = await API.get('/admin/payouts');
      if (res.data.success) {
        setPayouts(res.data.data);
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', 'Failed to fetch payouts');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? Colors.success : status === 'failed' ? Colors.danger : Colors.warning;
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Feather name="dollar-sign" size={20} color={Colors.success} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>₹{item.amount}</Text>
          <Text style={styles.subtitle}>{item.driver?.name || 'Driver'}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Ref: {item.referenceId || 'N/A'}</Text>
        <Text style={styles.footerText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color={Colors.accent} style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={payouts}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No payouts found</Text>}
      />
    </View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  card: { backgroundColor: Colors.bgSecondary, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.success + '20', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  info: { flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  subtitle: { fontSize: 14, color: Colors.textSecondary },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 },
  footerText: { fontSize: 12, color: Colors.textMuted },
  emptyText: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 }
});
