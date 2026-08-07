import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import API from '../services/api';

const RouteBookingSheet = ({ onRouteSelected, onCancel }: any) => {
  const { colors } = useTheme();
  
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await API.get('/route-manager/routes');
        if (res.data && res.data.data) {
          setRoutes(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch routes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, []);
  
  const routeColors = ['#0053B3', '#D49F0C', '#10B981', '#EF4444', '#8B5CF6'];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 }}>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textPrimary }}>Select Route to View</Text>
        <TouchableOpacity onPress={onCancel} style={{ padding: 8 }}>
          <Feather name="x" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ gap: 12, paddingBottom: 24 }}>
          {loading && <ActivityIndicator size="large" color="#0053B3" />}
          {!loading && routes.length === 0 && <Text style={{ color: colors.textSecondary }}>No active routes available.</Text>}
          {routes.map((route, idx) => {
            const baseColor = routeColors[idx % routeColors.length];
            return (
            <TouchableOpacity 
              key={route._id}
              onPress={() => onRouteSelected(route, baseColor)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                backgroundColor: colors.bgSecondary,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12
              }}
            >
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: baseColor, marginRight: 12 }} />
              <Text style={{ flex: 1, fontSize: 16, fontWeight: '500', color: colors.textPrimary }}>
                {route.name}
              </Text>
              <Feather name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default RouteBookingSheet;
