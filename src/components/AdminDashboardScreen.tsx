import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import API from '../services/api';

import CustomersTab from './admin/CustomersTab';
import RidesTab from './admin/RidesTab';
import VehiclesTab from './admin/VehiclesTab';
import LiveMapTab from './admin/LiveMapTab';
import PaymentsTab from './admin/PaymentsTab';
import PayoutsTab from './admin/PayoutsTab';
import ComplaintsTab from './admin/ComplaintsTab';
import SettingsTab from './admin/SettingsTab';

export default function AdminDashboardScreen({ onNavigateLogout }: { onNavigateLogout?: () => void }) {
  const { user, logout } = useAuth();
  const [activeModule, setActiveModule] = useState<
    'overview' | 'drivers' | 'vehicles' | 'customers' | 'rides' | 'map' | 'payments' | 'payouts' | 'complaints' | 'settings'
  >('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [pendingDrivers, setPendingDrivers] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [dashRes, driversRes] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/admin/drivers?search=')
      ]);
      
      if (dashRes.data.success) setDashboardData(dashRes.data.data);
      if (driversRes.data.success) {
        setPendingDrivers(driversRes.data.data.filter((d: any) => d.approvalStatus === 'pending'));
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', e.response?.data?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleAction = async (driverId: string, status: 'approved' | 'rejected') => {
    try {
      const payload = { 
        approvalStatus: status,
        ...(status === 'rejected' ? { rejectionReason: 'Admin reviewed and rejected application', correctionFields: ['documents'] } : {})
      };
      
      const res = await API.put(`/admin/drivers/${driverId}`, payload);
      if (res.data.success) {
        Alert.alert('Success', `Driver successfully ${status}!`);
        fetchData();
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || `Failed to ${status} driver`);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await logout();
        if (onNavigateLogout) onNavigateLogout();
      }}
    ]);
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <TouchableOpacity onPress={() => setIsSidebarOpen(true)} style={{ paddingRight: 16 }}>
            <Feather name="menu" size={24} color={Colors.accent} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {activeModule.charAt(0).toUpperCase() + activeModule.slice(1)}
          </Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Feather name="log-out" size={20} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
        
      {/* Custom Sidebar Overlay */}
      {isSidebarOpen && (
        <View style={StyleSheet.absoluteFill}>
          <TouchableOpacity 
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} 
            activeOpacity={1} 
            onPress={() => setIsSidebarOpen(false)} 
          />
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>MoveX Admin</Text>
              <TouchableOpacity onPress={() => setIsSidebarOpen(false)}>
                <Feather name="x" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }}>
              {[
                { id: 'overview', icon: 'pie-chart', label: 'Dashboard Overview' },
                { id: 'drivers', icon: 'users', label: 'Driver Management' },
                { id: 'vehicles', icon: 'truck', label: 'Vehicle Management' },
                { id: 'customers', icon: 'user', label: 'Customer Management' },
                { id: 'rides', icon: 'map', label: 'Ride Management' },
                { id: 'map', icon: 'navigation', label: 'Live Location Map' },
                { id: 'payments', icon: 'credit-card', label: 'Payments / Wallet' },
                { id: 'payouts', icon: 'dollar-sign', label: 'Driver Payouts' },
                { id: 'complaints', icon: 'alert-triangle', label: 'Complaints' },
                { id: 'settings', icon: 'settings', label: 'Settings' }
              ].map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.sidebarItem, activeModule === item.id && styles.sidebarItemActive]}
                  onPress={() => {
                    setActiveModule(item.id);
                    setIsSidebarOpen(false);
                  }}
                >
                  <Feather name={item.icon} size={20} color={activeModule === item.id ? Colors.accent : '#fff'} />
                  <Text style={[styles.sidebarItemText, activeModule === item.id && styles.sidebarItemTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Main Content */}
      <View style={{ flex: 1 }}>
        {activeModule === 'overview' && (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {dashboardData && (
              <View style={styles.overviewGrid}>
                <View style={styles.statCard}>
                  <View style={[styles.statIconBox, { backgroundColor: 'rgba(0, 83, 179, 0.1)' }]}>
                    <Feather name="users" size={24} color={Colors.accent} />
                  </View>
                  <Text style={styles.statLabel}>Total Users</Text>
                  <Text style={styles.statValue}>{dashboardData.users?.customers || 0}</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={[styles.statIconBox, { backgroundColor: 'rgba(0, 200, 150, 0.1)' }]}>
                    <MaterialCommunityIcons name="car" size={24} color={Colors.success} />
                  </View>
                  <Text style={styles.statLabel}>Total Drivers</Text>
                  <Text style={styles.statValue}>{dashboardData.users?.drivers || 0}</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={[styles.statIconBox, { backgroundColor: 'rgba(255, 152, 0, 0.1)' }]}>
                    <Feather name="map" size={24} color="#FF9800" />
                  </View>
                  <Text style={styles.statLabel}>Active Rides</Text>
                  <Text style={styles.statValue}>{dashboardData.bookings?.active || 0}</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={[styles.statIconBox, { backgroundColor: 'rgba(229, 57, 53, 0.1)' }]}>
                    <Feather name="check-circle" size={24} color={Colors.danger} />
                  </View>
                  <Text style={styles.statLabel}>Completed</Text>
                  <Text style={styles.statValue}>{dashboardData.bookings?.completed || 0}</Text>
                </View>
                
                <View style={[styles.statCard, { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                  <View>
                    <Text style={styles.statLabel}>Total Platform Revenue</Text>
                    <Text style={[styles.statValue, { color: Colors.success }]}>₹{dashboardData.revenue?.total || 0}</Text>
                  </View>
                  <View style={[styles.statIconBox, { backgroundColor: 'rgba(0, 200, 150, 0.1)' }]}>
                    <Feather name="dollar-sign" size={24} color={Colors.success} />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {activeModule === 'drivers' && (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <View style={styles.listContainer}>
              {pendingDrivers.length === 0 ? (
                <View style={styles.emptyState}>
                  <Feather name="check-circle" size={48} color={Colors.success} style={{ marginBottom: 16 }} />
                  <Text style={styles.emptyTitle}>All Caught Up!</Text>
                  <Text style={styles.emptySubtitle}>There are no pending driver applications.</Text>
                </View>
              ) : (
                pendingDrivers.map(driver => (
                  <View key={driver._id} style={styles.driverCard}>
                    <View style={styles.driverCardHeader}>
                      <View style={styles.driverAvatar}>
                        <Text style={styles.driverAvatarText}>{driver.name.charAt(0)}</Text>
                      </View>
                      <View style={styles.driverInfo}>
                        <Text style={styles.driverName}>{driver.name}</Text>
                        <Text style={styles.driverPhone}>{driver.phone}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.vehicleInfo}>
                      <Text style={styles.vehicleText}>
                        <MaterialCommunityIcons name="car" size={16} /> {driver.vehicle?.color} {driver.vehicle?.make} {driver.vehicle?.model}
                      </Text>
                      <Text style={styles.plateText}>{driver.vehicle?.plateNumber}</Text>
                    </View>

                    <View style={styles.actionRow}>
                      <TouchableOpacity 
                        style={[styles.actionBtn, styles.rejectBtn]} 
                        onPress={() => handleAction(driver._id, 'rejected')}
                      >
                        <Text style={styles.rejectBtnText}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionBtn, styles.approveBtn]} 
                        onPress={() => handleAction(driver._id, 'approved')}
                      >
                        <Text style={styles.approveBtnText}>Approve</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        )}

        {/* --- LIVE MODULES --- */}
        {activeModule === 'vehicles' && <VehiclesTab />}
        {activeModule === 'customers' && <CustomersTab />}
        {activeModule === 'rides' && <RidesTab />}
        {activeModule === 'map' && <LiveMapTab />}
        {activeModule === 'payments' && <PaymentsTab />}
        {activeModule === 'payouts' && <PayoutsTab />}
        {activeModule === 'complaints' && <ComplaintsTab />}
        {activeModule === 'settings' && <SettingsTab />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.accent,
    flex: 1
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    borderRadius: 8,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#0053B3',
    zIndex: 100,
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sidebarTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sidebarItemActive: {
    backgroundColor: '#fff',
  },
  sidebarItemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sidebarItemTextActive: {
    color: Colors.accent,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  listContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  driverCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  driverCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 83, 179, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.accent,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  driverPhone: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  vehicleInfo: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  plateText: {
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  rejectBtnText: {
    color: Colors.danger,
    fontWeight: '600',
  },
  approveBtn: {
    backgroundColor: Colors.success,
  },
  approveBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
