import { useTheme } from '../../context/ThemeContext';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Colors from '../../constants/colors';
import API from '../../services/api';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function LiveMapTab() {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors);

  const [onlineDrivers, setOnlineDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrivers();
    // Poll every 10 seconds
    const interval = setInterval(fetchDrivers, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await API.get('/admin/map');
      if (res.data.success) {
        setOnlineDrivers(res.data.data.onlineDrivers || []);
      }
    } catch (e: any) {
      console.error(e);
      // Don't alert on polling errors
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color={Colors.accent} style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.headerBox}>
          <Text style={styles.activeCount}>{onlineDrivers.length}</Text>
          <Text style={styles.headerLabel}>Drivers Online</Text>
        </View>
      </View>
      
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 28.7041,
          longitude: 77.1025,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        }}
      >
        {onlineDrivers.map(driver => {
          if (!driver.location?.coordinates) return null;
          return (
            <Marker
              key={driver._id}
              coordinate={{
                latitude: driver.location.coordinates[1],
                longitude: driver.location.coordinates[0]
              }}
              title={driver.name}
              description={driver.isAvailable ? 'Available' : 'On Trip'}
            >
              <View style={[styles.markerBadge, { backgroundColor: driver.isAvailable ? Colors.success : Colors.warning }]}>
                <MaterialCommunityIcons name="car-side" size={16} color={Colors.bgSecondary} />
              </View>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  map: { width: '100%', height: '100%' },
  overlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    backgroundColor: Colors.bgSecondary,
    padding: 12,
    borderRadius: 12,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerBox: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeCount: { fontSize: 24, fontWeight: '900', color: Colors.accent },
  headerLabel: { fontSize: 12, fontWeight: 'bold', color: Colors.textSecondary, textTransform: 'uppercase' },
  markerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.bgSecondary,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3
  }
});
