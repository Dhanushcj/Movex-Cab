import { useTheme } from '../context/ThemeContext';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import VerticalSwipeButton from './VerticalSwipeButton';
import Colors from '../constants/colors';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const OTP_LENGTH = 4;

interface SlideToStartScreenProps {
  onStart: (otp: string) => void;
  onVerify?: (otp: string) => Promise<boolean> | void;
  pickupAddress: string;
  customerName?: string;
  customerPhone?: string;
}

export default function SlideToStartScreen({ onStart, onVerify, pickupAddress, customerName, customerPhone }: SlideToStartScreenProps) {
    const { isDark } = useTheme();
    const styles = getStyles(Colors);

  const [otp, setOtp] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const unlockAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isOtpComplete = otp.length === OTP_LENGTH;

  React.useEffect(() => {
    // Slide up on mount
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
    }).start();

    // Fade in background overlay
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Animate unlock state when OTP is complete
  React.useEffect(() => {
    if (isOtpComplete) {
      Animated.spring(unlockAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 7,
      }).start();
    } else {
      Animated.spring(unlockAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }).start();
    }
  }, [isOtpComplete]);

  const shakeOnError = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const sliderScale = unlockAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  const sliderOpacity = unlockAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });

  return (
    <KeyboardAvoidingView
      style={styles.overlayContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      pointerEvents="box-none"
    >
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} pointerEvents="none" />

      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.successBadge}>
            <Feather name="check" size={28} color={Colors.bgSecondary} />
          </View>
          <Text style={styles.arrivedTitle}>You have Arrived</Text>
          <Text style={styles.arrivedSubtitle}>Waiting for {customerName || 'customer'}</Text>
          {customerPhone && (
            <Text style={styles.customerPhoneText}>{customerPhone}</Text>
          )}
        </View>

        {/* Location Row */}
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={18} color={Colors.textSecondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {pickupAddress}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.outlineButton}>
            <Feather name="phone" size={16} color="#0053B3" />
            <Text style={styles.outlineButtonText}>Call Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineButton}>
            <Feather name="message-square" size={16} color="#0053B3" />
            <Text style={styles.outlineButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Waiting Time */}
        <View style={styles.waitingTimeRow}>
          <Feather name="clock" size={14} color={Colors.textSecondary} />
          <Text style={styles.waitingTimeText}>Waiting Time 4 mins</Text>
        </View>

        {/* Phase 1: Enter OTP */}
        {!isVerified && (
          <>
            <View style={styles.otpSection}>
              <View style={styles.otpLabelRow}>
                <Feather name="shield" size={16} color="#6366F1" />
                <Text style={styles.otpLabel}>
                  Ask customer for 4-digit OTP
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={1}
                onPress={() => inputRef.current?.focus()}
                style={styles.otpBoxesRow}
              >
                <Animated.View style={[styles.otpBoxesInner, { transform: [{ translateX: shakeAnim }] }]}>
                  {Array.from({ length: OTP_LENGTH }).map((_, i) => {
                    const filled = i < otp.length;
                    const isActive = i === otp.length;
                    return (
                      <View
                        key={i}
                        style={[
                          styles.otpBox,
                          filled && styles.otpBoxFilled,
                          isActive && styles.otpBoxActive,
                        ]}
                      >
                        <Text style={styles.otpDigit}>
                          {filled ? otp[i] : ''}
                        </Text>
                      </View>
                    );
                  })}
                </Animated.View>
              </TouchableOpacity>

              <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                keyboardType="number-pad"
                value={otp}
                onChangeText={(text) => {
                  if (text.length <= OTP_LENGTH) setOtp(text);
                }}
                maxLength={OTP_LENGTH}
                caretHidden
              />
            </View>
            <TouchableOpacity 
              style={[styles.validateBtn, isOtpComplete ? styles.validateBtnActive : {}]}
              disabled={!isOtpComplete}
              onPress={async () => {
                if (onVerify) {
                  const success = await onVerify(otp);
                  if (success !== false) setIsVerified(true);
                } else {
                  setIsVerified(true);
                }
              }}
            >
              <Text style={styles.validateBtnText}>Validate OTP</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Phase 2: Slide to Start Ride */}
        {isVerified && (
          <View style={styles.slideRow}>
            <VerticalSwipeButton
              onSwipeComplete={() => {
                onStart(otp);
              }}
              label="Start Ride"
            />
          </View>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 24,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.borderGlass,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  arrivedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  arrivedSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  customerPhoneText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '400',
    maxWidth: '85%',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  outlineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    gap: 8,
  },
  outlineButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0053B3',
  },
  waitingTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    gap: 6,
  },
  waitingTimeText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  otpSection: {
    marginBottom: 32,
  },
  otpLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  otpLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366F1',
  },
  otpLabelUnlocked: {
    color: '#22C55E',
  },
  otpBoxesRow: {
    alignItems: 'center',
  },
  otpBoxesInner: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  otpBox: {
    width: 65,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: Colors.borderGlass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxActive: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  otpBoxFilled: {
    borderColor: '#4338CA',
    backgroundColor: '#EEF2FF',
  },
  otpBoxComplete: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  otpDigit: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4338CA',
    letterSpacing: 2,
  },
  otpDigitComplete: {
    color: '#16A34A',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },

  slideRow: {
    alignItems: 'center',
    marginTop: 8,
  },
  validateBtn: {
    backgroundColor: Colors.borderGlass,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  validateBtnActive: {
    backgroundColor: '#0053B3',
  },
  validateBtnText: {
    color: Colors.bgSecondary,
    fontSize: 16,
    fontWeight: '600',
  }
});
