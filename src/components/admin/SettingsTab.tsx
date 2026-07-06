import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Colors from '../../constants/colors';
import { Feather } from '@expo/vector-icons';

export default function SettingsTab() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Feather name="settings" size={24} color={Colors.accent} />
          <Text style={styles.title}>Platform Settings</Text>
        </View>
        <Text style={styles.description}>
          Global platform configurations are currently managed via the Web Dashboard. Please log in to the MoveX Admin web portal to update Fare Configs, Offers, and Platform variables.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, marginLeft: 12 },
  description: { fontSize: 16, color: Colors.textSecondary, lineHeight: 24 }
});
