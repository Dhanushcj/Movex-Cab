import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import API from '../../services/api';

// Encode [lat, lng][] to Google polyline format
function encodePolyline(coordinates: number[][]): string {
  let result = '';
  let prevLat = 0;
  let prevLng = 0;
  for (let i = 0; i < coordinates.length; i++) {
    let lat = Math.round(coordinates[i][0] * 1e5);
    let lng = Math.round(coordinates[i][1] * 1e5);
    let dLat = lat - prevLat;
    let dLng = lng - prevLng;
    prevLat = lat;
    prevLng = lng;
    result += encodeValue(dLat) + encodeValue(dLng);
  }
  return result;
}
function encodeValue(value: number): string {
  value = value < 0 ? ~(value << 1) : value << 1;
  let result = '';
  while (value >= 0x20) {
    result += String.fromCharCode((0x20 | (value & 0x1f)) + 63);
    value >>= 5;
  }
  result += String.fromCharCode(value + 63);
  return result;
}

interface JunctionInput {
  name: string;
  lat: string;
  lng: string;
}

export default function RoutesTab() {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Create route modal
  const [showModal, setShowModal] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [junctions, setJunctions] = useState<JunctionInput[]>([
    { name: '', lat: '', lng: '' },
    { name: '', lat: '', lng: '' },
  ]);
  const [saving, setSaving] = useState(false);

  const fetchRoutes = async () => {
    try {
      const res = await API.get('/admin/routes');
      if (res.data?.data) setRoutes(res.data.data);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to load routes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchRoutes(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchRoutes(); };

  const handleDeleteRoute = (id: string, name: string) => {
    Alert.alert(
      'Deactivate Route',
      `Are you sure you want to deactivate "${name}"? It will no longer appear in the app.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate', style: 'destructive', onPress: async () => {
            try {
              await API.delete(`/admin/routes/${id}`);
              Alert.alert('Done', 'Route deactivated successfully.');
              fetchRoutes();
            } catch (e: any) {
              Alert.alert('Error', e.response?.data?.message || 'Failed to deactivate');
            }
          }
        }
      ]
    );
  };

  const addJunction = () => {
    setJunctions(prev => [...prev, { name: '', lat: '', lng: '' }]);
  };

  const removeJunction = (idx: number) => {
    setJunctions(prev => prev.filter((_, i) => i !== idx));
  };

  const updateJunction = (idx: number, field: keyof JunctionInput, value: string) => {
    setJunctions(prev => prev.map((j, i) => i === idx ? { ...j, [field]: value } : j));
  };

  const handleCreateRoute = async () => {
    if (!routeName.trim()) {
      Alert.alert('Validation', 'Please enter a route name.');
      return;
    }
    for (let i = 0; i < junctions.length; i++) {
      const j = junctions[i];
      if (!j.name.trim() || !j.lat.trim() || !j.lng.trim()) {
        Alert.alert('Validation', `Please fill all fields for Stop ${i + 1}.`);
        return;
      }
      if (isNaN(parseFloat(j.lat)) || isNaN(parseFloat(j.lng))) {
        Alert.alert('Validation', `Invalid coordinates for Stop ${i + 1}.`);
        return;
      }
    }

    setSaving(true);
    try {
      const junctionIds: string[] = [];
      const routeCoords: number[][] = [];

      for (const j of junctions) {
        const lat = parseFloat(j.lat);
        const lng = parseFloat(j.lng);
        const res = await API.post('/admin/junctions', {
          name: j.name.trim(),
          coordinates: [lng, lat], // [lng, lat] for GeoJSON
        });
        junctionIds.push(res.data.data._id);
        routeCoords.push([lat, lng]); // [lat, lng] for polyline encoder
      }

      const polyline = encodePolyline(routeCoords);

      await API.post('/admin/routes', {
        name: routeName.trim(),
        junctions: junctionIds,
        polyline,
      });

      Alert.alert('Success', `Route "${routeName}" created successfully! Pull down to refresh the customer map.`);
      setShowModal(false);
      setRouteName('');
      setJunctions([{ name: '', lat: '', lng: '' }, { name: '', lat: '', lng: '' }]);
      fetchRoutes();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create route');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
            Metro Routes ({routes.length})
          </Text>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}
          >
            <Feather name="plus" size={16} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Add Route</Text>
          </TouchableOpacity>
        </View>

        {routes.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Feather name="map" size={48} color={colors.textSecondary} style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 }}>
              No Routes Found
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center' }}>
              Tap "Add Route" and use the Quick Fill button to add Krishnagiri–Bargur.
            </Text>
          </View>
        ) : (
          routes.map((route: any, idx: number) => {
            const palette = ['#075AAA', '#D49F0C', '#10B981', '#EF4444', '#8B5CF6'];
            const routeColor = palette[idx % palette.length];
            return (
              <View key={route._id} style={styles.routeCard}>
                <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: routeColor, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }} />
                <View style={{ paddingLeft: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 }}>
                        {route.name}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: route.isActive ? '#10B981' : '#EF4444' }} />
                        <Text style={{ fontSize: 12, color: route.isActive ? '#10B981' : '#EF4444', fontWeight: '600' }}>
                          {route.isActive ? 'Active' : 'Inactive'}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.textMuted }}>•</Text>
                        <Text style={{ fontSize: 12, color: colors.textMuted }}>
                          {route.junctions?.length || 0} stops
                        </Text>
                      </View>
                    </View>
                    {route.isActive && (
                      <TouchableOpacity
                        onPress={() => handleDeleteRoute(route._id, route.name)}
                        style={{ padding: 6, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 8 }}
                      >
                        <Feather name="trash-2" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {route.junctions?.map((j: any, ji: number) => (
                    <View key={j._id || ji} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: routeColor + '20', borderWidth: 2, borderColor: routeColor, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 9, fontWeight: '700', color: routeColor }}>{ji + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, color: colors.textPrimary, fontWeight: '500' }}>{j.name}</Text>
                        {j.location?.coordinates && (
                          <Text style={{ fontSize: 11, color: colors.textMuted }}>
                            {j.location.coordinates[1].toFixed(4)}, {j.location.coordinates[0].toFixed(4)}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Create Route Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>Create New Route</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Feather name="x" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Route Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Krishnagiri - Bargur"
              placeholderTextColor={colors.textMuted}
              value={routeName}
              onChangeText={setRouteName}
            />

            <Text style={[styles.label, { marginTop: 20 }]}>Stops / Junctions *</Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 12 }}>
              Add stops in order from start to end. Coordinates: decimal lat/lng.
            </Text>

            {junctions.map((j, idx) => (
              <View key={idx} style={styles.junctionCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }}>Stop {idx + 1}</Text>
                  {junctions.length > 2 && (
                    <TouchableOpacity onPress={() => removeJunction(idx)}>
                      <Feather name="trash-2" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  style={[styles.input, { marginBottom: 8 }]}
                  placeholder="Stop name (e.g. Bargur Bus Stand)"
                  placeholderTextColor={colors.textMuted}
                  value={j.name}
                  onChangeText={v => updateJunction(idx, 'name', v)}
                />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Latitude"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                    value={j.lat}
                    onChangeText={v => updateJunction(idx, 'lat', v)}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Longitude"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                    value={j.lng}
                    onChangeText={v => updateJunction(idx, 'lng', v)}
                  />
                </View>
              </View>
            ))}

            <TouchableOpacity onPress={addJunction} style={styles.addStopBtn}>
              <Feather name="plus-circle" size={18} color={colors.accent} />
              <Text style={{ color: colors.accent, fontWeight: '600', fontSize: 14 }}>Add Another Stop</Text>
            </TouchableOpacity>

            {/* Quick Fill shortcut */}
            <TouchableOpacity
              onPress={() => {
                setRouteName('Krishnagiri - Bargur');
                setJunctions([
                  { name: 'Krishnagiri New Bus Stand', lat: '12.5273', lng: '78.2195' },
                  { name: 'Toll Gate', lat: '12.5401', lng: '78.2589' },
                  { name: 'Orappam', lat: '12.5520', lng: '78.3090' },
                  { name: 'Bargur Bus Stand', lat: '12.5510', lng: '78.3610' },
                ]);
              }}
              style={styles.quickFillBtn}
            >
              <Feather name="zap" size={15} color="#D49F0C" />
              <Text style={{ color: '#D49F0C', fontWeight: '600', fontSize: 13 }}>Quick Fill: Krishnagiri–Bargur Route</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCreateRoute}
              disabled={saving}
              style={[styles.submitBtn, saving && { opacity: 0.6 }]}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Create Route</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
  },
  junctionCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addStopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 8,
  },
  quickFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(212, 159, 12, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 159, 12, 0.3)',
  },
  submitBtn: {
    backgroundColor: '#075AAA',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  routeCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
});
