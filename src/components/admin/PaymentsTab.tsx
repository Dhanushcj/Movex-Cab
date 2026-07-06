import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import Colors from '../../constants/colors';
import API from '../../services/api';
import { Feather } from '@expo/vector-icons';

export default function PaymentsTab() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await API.get('/admin/payments');
      if (res.data.success) {
        setPayments(res.data.data);
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', 'Failed to fetch payments');
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
          <Feather name="credit-card" size={20} color={Colors.accent} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>₹{item.amount}</Text>
          <Text style={styles.subtitle}>{item.method?.toUpperCase() || 'WALLET'}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Txn ID: {item.transactionId || item._id.substring(0, 10)}</Text>
        <Text style={styles.footerText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color={Colors.accent} style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={payments}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No payments found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  card: { backgroundColor: Colors.bgSecondary, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.accentGlow, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  info: { flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  subtitle: { fontSize: 12, color: Colors.textSecondary },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 },
  footerText: { fontSize: 12, color: Colors.textMuted },
  emptyText: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 }
});
