import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/colors';
import React, { useRef, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  Image,
  NativeScrollEvent, 
  NativeSyntheticEvent 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

const SLIDES_DATA = [
  {
    title: 'Your ride, seconds away',
    description: 'Tap, confirm, go. Cabs, autos, and bikes — see all nearby vehicles on the map in real time.',
    image: require('../../assets/car_illustration.png'),
  },
  {
    title: 'Choose your ride',
    description: 'Compare live fares across all vehicle types before you confirm. No surprises, no surge shocks.',
    image: require('../../assets/bike_illustration.png'),
  },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors);

  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    if (index !== activeIndex && index >= 0 && index < SLIDES_DATA.length) {
      setActiveIndex(index);
    }
  };

  const handleNext = () => {
    if (activeIndex < SLIDES_DATA.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (activeIndex + 1) * width,
        animated: true,
      });
      setActiveIndex(activeIndex + 1);
    } else {
      onComplete();
    }
  };

  return (
    <View style={styles.container}>
      {/* Scrollable Area */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollContainer}
      >
        {SLIDES_DATA.map((slide, index) => (
          <View key={index} style={[styles.slide, { width }]}>
            {/* Background Image Area */}
            <View style={styles.imageContainer}>
              <Image 
                source={slide.image} 
                style={styles.image} 
                resizeMode="cover" 
              />
            </View>

            {/* Gradient Overlay */}
            <LinearGradient
              colors={['rgba(110, 131, 156, 0)', '#0A0A0B']}
              locations={[0.5, 0.92]}
              style={StyleSheet.absoluteFillObject}
            />

            {/* Text Content */}
            <View style={styles.textContainer}>
              {/* Pagination Dots */}
              <View style={styles.dotsContainer}>
                {SLIDES_DATA.map((_, dotIndex) => (
                  <View 
                    key={dotIndex} 
                    style={[
                      styles.dot, 
                      activeIndex === dotIndex ? styles.dotActive : styles.dotInactive
                    ]} 
                  />
                ))}
              </View>

              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Persistent Buttons at the bottom */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>
            {activeIndex === SLIDES_DATA.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>

        {activeIndex < SLIDES_DATA.length - 1 && (
          <TouchableOpacity style={styles.secondaryButton} onPress={onComplete} activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  scrollContainer: {
    flex: 1,
  },
  slide: {
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    position: 'absolute',
    bottom: 200, // Leave space for buttons
    left: 16,
    right: 16,
    gap: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  dot: {
    height: 8,
    borderRadius: 12,
  },
  dotActive: {
    width: 28,
    backgroundColor: '#0053B3',
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(150, 155, 164, 0.2)',
  },
  title: {
    fontFamily: 'sans-serif', // 'Outfit' if available, defaulting to sans-serif
    fontWeight: '500',
    fontSize: 28,
    lineHeight: 35,
    color: '#FCFCFC',
    width: 281, // Based on Figma specs
  },
  description: {
    fontFamily: 'sans-serif',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.28, // 0.02em roughly
    color: '#D3D6D9',
    width: 281, // Based on Figma specs
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    paddingHorizontal: 23, // to get to ~344px width centered on standard phone
    alignItems: 'center',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    maxWidth: 344,
    height: 44,
    backgroundColor: '#0053B3',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: 'sans-serif',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 18,
    color: '#FCFCFC',
  },
  secondaryButton: {
    width: '100%',
    maxWidth: 344,
    height: 44,
    borderWidth: 1,
    borderColor: '#0053B3',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'sans-serif',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 18,
    color: '#0053B3',
  },
});
