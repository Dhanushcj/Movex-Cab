import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/colors';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  StatusBar,
  Linking,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface EmergencyScreenProps {
  visible: boolean;
  onClose: () => void;
}

export default function EmergencyScreen({ visible, onClose }: EmergencyScreenProps) {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Feather name="chevron-left" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emergency</Text>
          <View style={{ width: 40 }} />
        </View>

        
        <View style={styles.sosContainer}>
          <View style={styles.sosCircleOuter}>
            <TouchableOpacity style={styles.sosCircleInner} activeOpacity={0.8}>
              <Feather name="shield" size={32} color="#D60B0B" />
              
            </TouchableOpacity>
          </View>
          <Text style={styles.sosTitle}>Are you in danger?</Text>
          <Text style={styles.sosSubTitle}>
            Press and hold the button to alert emergency services{'\n'}and share your live location.
          </Text>
        </View>

        
        <View style={styles.actionsList}>
          
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={() => Linking.openURL('tel:108')}>
            <View style={styles.actionIconWrap}>
              <MaterialCommunityIcons name="ambulance" size={20} color="#075AAA" />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>Call ambulance</Text>
              <Text style={styles.actionSubTitle}>For medical emergencies</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>

          
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={() => Linking.openURL('tel:100')}>
            <View style={styles.actionIconWrap}>
              <MaterialCommunityIcons name="car-emergency" size={20} color="#075AAA" />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>Call Police</Text>
              <Text style={styles.actionSubTitle}>Report a crime</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>

          
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={() => Linking.openURL('tel:1073')}>
            <View style={styles.actionIconWrap}>
              <MaterialCommunityIcons name="car-wrench" size={20} color="#075AAA" />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>Call accident help</Text>
              <Text style={styles.actionSubTitle}>Talk to our emergency team</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>

          
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
            <View style={styles.actionIconWrap}>
              <MaterialCommunityIcons name="card-account-details-outline" size={20} color="#075AAA" />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>Insurance card</Text>
              <Text style={styles.actionSubTitle}>View your insurance details</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 44,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DEE0E3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  sosContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  sosCircleOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FDE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  sosCircleInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FDE2E2', // matching the outer bg so it looks hollow with just border in design?
    borderWidth: 4.5,
    borderColor: '#D60B0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosTitle: {
    fontSize: 20,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginBottom: 12,
  },
  sosSubTitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F8FE',
    borderRadius: 16,
    padding: 16,
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E4EFFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionTextWrap: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginBottom: 4,
  },
  actionSubTitle: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});
