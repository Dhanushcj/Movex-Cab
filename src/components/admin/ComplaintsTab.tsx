import { useTheme } from '../../context/ThemeContext';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import Colors from '../../constants/colors';
import API from '../../services/api';
import { Feather } from '@expo/vector-icons';

export default function ComplaintsTab() {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors);

  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await API.get('/admin/complaints');
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'resolved' ? Colors.success : status === 'in_progress' ? Colors.warning : Colors.danger;
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.subject}>{item.subject}</Text>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{item.status.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.description}>{item.description}</Text>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>By: {item.user?.name || 'User'} ({item.userModel})</Text>
        <Text style={styles.footerText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color={Colors.accent} style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={complaints}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No complaints found</Text>}
      />
    </View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  card: { backgroundColor: Colors.bgSecondary, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  subject: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  description: { fontSize: 14, color: Colors.textSecondary, marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 },
  footerText: { fontSize: 12, color: Colors.textMuted },
  emptyText: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 }
});
