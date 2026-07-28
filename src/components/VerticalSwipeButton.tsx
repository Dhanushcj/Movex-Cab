import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/colors';
import React, { useRef } from 'react';
import { View, Animated, PanResponder, StyleSheet, Text, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface SwipeButtonProps {
  onSwipeComplete: () => void;
  label?: string;
}

export default function VerticalSwipeButton({
  onSwipeComplete,
  label = 'Start Ride',
}: SwipeButtonProps) {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors);

  const TRACK_HEIGHT = 56;
  const THUMB_SIZE = 48;
  const TRACK_WIDTH = SCREEN_WIDTH - 48;
  const SLIDE_DISTANCE = TRACK_WIDTH - THUMB_SIZE - 8;
  const THRESHOLD = SLIDE_DISTANCE * 0.65;

  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > Math.abs(gs.dy) && Math.abs(gs.dx) > 5,
      onPanResponderMove: (_, gs) => {
        if (gs.dx > 0) {
          pan.x.setValue(Math.min(gs.dx, SLIDE_DISTANCE));
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > THRESHOLD) {
          Animated.timing(pan, {
            toValue: { x: SLIDE_DISTANCE, y: 0 },
            duration: 200,
            useNativeDriver: true,
          }).start(() => onSwipeComplete());
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Fade out label as thumb slides
  const labelOpacity = pan.x.interpolate({
    inputRange: [0, SLIDE_DISTANCE * 0.4],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { height: TRACK_HEIGHT, width: TRACK_WIDTH }]}>  
      {/* Track background */}
      <View style={styles.track}>
        <Animated.Text style={[styles.trackLabel, { opacity: labelOpacity }]}>
          {label}
        </Animated.Text>
      </View>

      {/* Draggable thumb */}
      <Animated.View
        style={[
          styles.thumb,
          {
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            transform: [{ translateX: pan.x }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Feather name="chevron-right" size={24} color={Colors.bgSecondary} />
      </Animated.View>
    </View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    borderRadius: 30,
    backgroundColor: Colors.bgPrimary,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  track: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textMuted,
    marginLeft: 40,
  },
  thumb: {
    position: 'absolute',
    left: 4,
    backgroundColor: '#0053B3',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
