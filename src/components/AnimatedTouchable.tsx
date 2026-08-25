import React, { useRef } from 'react';
import { TouchableOpacity, TouchableOpacityProps, Animated, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface AnimatedTouchableProps extends TouchableOpacityProps {
  children: React.ReactNode;
  activeScale?: number;
  style?: StyleProp<ViewStyle>;
}

export const AnimatedTouchable: React.FC<AnimatedTouchableProps> = ({ 
  children, 
  activeScale = 0.95, 
  style, 
  onPressIn, 
  onPressOut, 
  ...props 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    Animated.spring(scaleAnim, {
      toValue: activeScale,
      useNativeDriver: true,
      speed: 20,
      bounciness: 5,
    }).start();
    if (onPressIn) onPressIn(e);
  };

  const handlePressOut = (e: any) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 5,
    }).start();
    if (onPressOut) onPressOut(e);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default AnimatedTouchable;
