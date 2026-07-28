import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, SafeAreaView, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import Colors from '../constants/colors';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ScheduleRideScreen = ({ visible, onClose, onContinue }: any) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const [showPicker, setShowPicker] = useState<'time' | 'date' | 'startMonth' | 'returnTime' | null>(null);
  const [scheduleType, setScheduleType] = useState<'today' | 'monthly'>('today');
  
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [tripType, setTripType] = useState<'single' | 'round'>('single');
  const [returnTime, setReturnTime] = useState(new Date());
  
  // Monthly
  const [repeatDay, setRepeatDay] = useState('1');
  const [startMonth, setStartMonth] = useState(new Date());
  const [numMonths, setNumMonths] = useState(1);
  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };

  const onChangePicker = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(null);
    }
    if (selectedDate) {
      if (showPicker === 'time') {
        setScheduledTime(selectedDate);
      } else if (showPicker === 'returnTime') {
        setReturnTime(selectedDate);
      } else if (showPicker === 'date') {
        setScheduledDate(selectedDate);
      } else if (showPicker === 'startMonth') {
        setStartMonth(selectedDate);
      }
    }
  };

  const handleContinue = () => {
    // Pass data back up
    const payload = scheduleType === 'today' ? {
      scheduleType,
      tripType,
      scheduledDate,
      scheduledTime,
      returnTime
    } : {
      scheduleType,
      tripType,
      repeatDay,
      startMonth,
      numMonths,
      scheduledTime,
      returnTime
    };
    onContinue(payload);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule a Trip</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Schedule Type Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="calendar" size={20} color={colors.textPrimary} />
            <Text style={styles.cardTitle}>Schedule For</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity 
              style={[styles.typeBtn, scheduleType === 'today' && styles.typeBtnSelected]} 
              onPress={() => setScheduleType('today')}
            >
              <Text style={[styles.typeBtnText, scheduleType === 'today' && styles.typeBtnTextSelected]}>Just Today</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.typeBtn, scheduleType === 'monthly' && styles.typeBtnSelected]} 
              onPress={() => setScheduleType('monthly')}
            >
              <Text style={[styles.typeBtnText, scheduleType === 'monthly' && styles.typeBtnTextSelected]}>Entire Month</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Single Ride Fields */}
        {scheduleType === 'today' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="calendar" size={20} color={colors.textPrimary} />
              <Text style={styles.cardTitle}>Date & Time</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <TouchableOpacity 
                style={[styles.typeBtn, tripType === 'single' && styles.typeBtnSelected]} 
                onPress={() => setTripType('single')}
              >
                <Text style={[styles.typeBtnText, tripType === 'single' && styles.typeBtnTextSelected]}>Single Trip</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeBtn, tripType === 'round' && styles.typeBtnSelected]} 
                onPress={() => setTripType('round')}
              >
                <Text style={[styles.typeBtnText, tripType === 'round' && styles.typeBtnTextSelected]}>Round Trip</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timingRow}>
              <View style={styles.timingBox}>
                <Text style={styles.timingLabel}>Date</Text>
                <TouchableOpacity style={styles.timeSelectBtn} onPress={() => setShowPicker('date')}>
                  <Text style={styles.timeText}>{formatDate(scheduledDate)}</Text>
                  <Feather name="chevron-down" size={16} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
              <View style={styles.timingBox}>
                <Text style={styles.timingLabel}>Pickup Time</Text>
                <TouchableOpacity style={styles.timeSelectBtn} onPress={() => setShowPicker('time')}>
                  <Text style={styles.timeText}>{formatTime(scheduledTime)}</Text>
                  <Feather name="chevron-down" size={16} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {tripType === 'round' && (
              <View style={[styles.timingRow, { marginTop: 16 }]}>
                <View style={styles.timingBox}>
                  <Text style={styles.timingLabel}>Return Pickup Time</Text>
                  <TouchableOpacity style={styles.timeSelectBtn} onPress={() => setShowPicker('returnTime')}>
                    <Text style={styles.timeText}>{formatTime(returnTime)}</Text>
                    <Feather name="chevron-down" size={16} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Monthly Ride Fields */}
        {scheduleType === 'monthly' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="repeat" size={20} color={colors.textPrimary} />
              <Text style={styles.cardTitle}>Monthly Schedule</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <TouchableOpacity 
                style={[styles.typeBtn, tripType === 'single' && styles.typeBtnSelected]} 
                onPress={() => setTripType('single')}
              >
                <Text style={[styles.typeBtnText, tripType === 'single' && styles.typeBtnTextSelected]}>Single Trip</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeBtn, tripType === 'round' && styles.typeBtnSelected]} 
                onPress={() => setTripType('round')}
              >
                <Text style={[styles.typeBtnText, tripType === 'round' && styles.typeBtnTextSelected]}>Round Trip</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timingRow}>
              <View style={styles.timingBox}>
                  <Text style={styles.timingLabel}>Pickup Time</Text>
                  <TouchableOpacity style={[styles.timeSelectBtn, { marginBottom: 16 }]} onPress={() => setShowPicker('time')}>
                    <Text style={styles.timeText}>{formatTime(scheduledTime)}</Text>
                    <Feather name="chevron-down" size={16} color={colors.textPrimary} />
                  </TouchableOpacity>
              </View>
              {tripType === 'round' && (
                <View style={styles.timingBox}>
                  <Text style={styles.timingLabel}>Return Pickup Time</Text>
                  <TouchableOpacity style={[styles.timeSelectBtn, { marginBottom: 16 }]} onPress={() => setShowPicker('returnTime')}>
                    <Text style={styles.timeText}>{formatTime(returnTime)}</Text>
                    <Feather name="chevron-down" size={16} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.timingRow}>
              <View style={styles.timingBox}>
                <Text style={styles.timingLabel}>Repeat Every (Day)</Text>
                <View style={styles.timeSelectBtn}>
                  <Text style={styles.timeText}>{repeatDay}</Text>
                  <View style={{flexDirection: 'row', gap:8}}>
                    <TouchableOpacity onPress={() => setRepeatDay(String(Math.max(1, parseInt(repeatDay) - 1)))}><Feather name="minus" size={16}/></TouchableOpacity>
                    <TouchableOpacity onPress={() => setRepeatDay(String(Math.min(31, parseInt(repeatDay) + 1)))}><Feather name="plus" size={16}/></TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={styles.timingBox}>
                <Text style={styles.timingLabel}>Start Month</Text>
                <TouchableOpacity style={styles.timeSelectBtn} onPress={() => setShowPicker('startMonth')}>
                  <Text style={styles.timeText}>{formatMonthYear(startMonth)}</Text>
                  <Feather name="chevron-down" size={16} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.timingLabel, {marginTop: 16, marginBottom: 8}]}>Number of Months</Text>
            <View style={{flexDirection: 'row', gap: 12}}>
              {[1, 3, 6, 12].map(m => (
                <TouchableOpacity key={m} style={[styles.typeBtn, numMonths === m && styles.typeBtnSelected]} onPress={() => setNumMonths(m)}>
                  <Text style={[styles.typeBtnText, numMonths === m && styles.typeBtnTextSelected]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Fare Notice */}
            <View style={styles.fareSummaryBox}>
              <Text style={styles.fareLabel}>Fare will be calculated on the next screen based on your pickup and drop locations.</Text>
              <Text style={styles.discountText}>You Save 10% on Monthly Schedules!</Text>
            </View>
          </View>
        )}

      </ScrollView>

      {/* Time Picker */}
      {showPicker && (
        <DateTimePicker
          value={showPicker === 'time' ? scheduledTime : (showPicker === 'returnTime' ? returnTime : (showPicker === 'date' ? scheduledDate : startMonth))}
          mode={(showPicker === 'time' || showPicker === 'returnTime') ? 'time' : 'date'}
          is24Hour={false}
          display="default"
          onChange={onChangePicker}
        />
      )}
      
      {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.8}>
            <Text style={styles.continueText}>{scheduleType === 'today' ? 'Continue' : 'Pay & Schedule'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontFamily: 'sans-serif',
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  cardTitle: {
    fontFamily: 'sans-serif',
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
  },
  typeBtnSelected: {
    backgroundColor: '#0053B3',
    borderColor: '#0053B3',
  },
  typeBtnText: {
    fontFamily: 'sans-serif',
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  typeBtnTextSelected: {
    color: '#FFF',
  },
  timingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  timingBox: {
    flex: 1,
    gap: 16,
  },
  timingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timingLabel: {
    fontFamily: 'sans-serif',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  fareSummaryBox: {
    marginTop: 20,
    backgroundColor: colors.bgTertiary,
    padding: 16,
    borderRadius: 12,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fareLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  fareVal: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  discountText: {
    color: '#198E1E',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
  },
  timeSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
  },
  timeText: {
    fontFamily: 'sans-serif',
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  daysRow: {
    gap: 16,
    paddingRight: 20,
  },
  dayBox: {
    alignItems: 'center',
    gap: 12,
  },
  dayText: {
    fontFamily: 'sans-serif',
    fontSize: 14,
    color: colors.textPrimary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgSecondary,
  },
  checkboxSelected: {
    backgroundColor: '#0053B3',
    borderColor: '#0053B3',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: colors.bgPrimary,
  },
  continueBtn: {
    backgroundColor: '#0053B3',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#0053B3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  continueText: {
    fontFamily: 'sans-serif',
    fontSize: 16,
    fontWeight: '600',
    color: colors.bgSecondary,
  },
});

export default ScheduleRideScreen;
