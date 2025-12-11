/**
 * Onboarding Feeling Screen - Hangover Shield
 * Premium onboarding step: "How are you feeling today?"
 * Allows users to select their current state for personalized recovery
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HANGOVER_GRADIENT } from '../../theme/gradients';
import { typography } from '../../design-system/typography';
import { OnboardingStackParamList, FeelingOption } from '../../navigation/OnboardingNavigator';

type FeelingOptionWithNull = FeelingOption | null;

interface FeelingCardData {
  key: FeelingOptionWithNull;
  title: string;
  subtitle: string;
}

const FEELING_OPTIONS: FeelingCardData[] = [
  {
    key: 'mild',
    title: 'Mild hangover',
    subtitle: 'Slight headache, a bit tired.',
  },
  {
    key: 'moderate',
    title: 'Moderate hangover',
    subtitle: 'Heavy head, low energy, maybe nausea.',
  },
  {
    key: 'severe',
    title: 'Severe hangover',
    subtitle: 'Very rough morning. I need full guidance.',
  },
  {
    key: 'none',
    title: 'Not hungover today',
    subtitle: 'Just checking in and building healthy habits.',
  },
];

type OnboardingFeelingScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'OnboardingFeeling'
>;

/**
 * Feeling Card Component
 * Individual selectable card for each feeling option
 * Premium animations: micro-fade on selection, Apple-style radio
 */
const FeelingCard: React.FC<{
  data: FeelingCardData;
  isSelected: boolean;
  onPress: () => void;
}> = ({ data, isSelected, onPress }) => {
  // Animation for card fade on selection
  const fadeAnim = useRef(new Animated.Value(1)).current;
  // Animation for radio scale-in
  const radioScale = useRef(new Animated.Value(isSelected ? 1 : 0)).current;
  const radioOpacity = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    // Micro-fade animation when selected (90ms)
    Animated.timing(fadeAnim, {
      toValue: isSelected ? 1 : 0.95,
      duration: 90,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Radio scale-in animation (120ms) - Apple-style
    if (isSelected) {
      Animated.parallel([
        Animated.spring(radioScale, {
          toValue: 1,
          tension: 200,
          friction: 15,
          useNativeDriver: true,
        }),
        Animated.timing(radioOpacity, {
          toValue: 1,
          duration: 120,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(radioScale, {
          toValue: 0,
          duration: 100,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(radioOpacity, {
          toValue: 0,
          duration: 100,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSelected]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isSelected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
    >
      <Animated.View
        style={[
          styles.cardContent,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Inner shadow overlay for floating card effect - soft gradient */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.02)', 'rgba(0, 0, 0, 0)', 'transparent']}
          locations={[0, 0.3, 1]}
          style={styles.cardInnerShadow}
        />
        
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{data.title}</Text>
          <Text style={styles.cardSubtitle}>{data.subtitle}</Text>
        </View>
        <View style={styles.radioContainer}>
          <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
            <Animated.View
              style={[
                styles.radioInner,
                {
                  transform: [{ scale: radioScale }],
                  opacity: radioOpacity,
                },
              ]}
            />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

export const OnboardingFeelingScreen: React.FC<OnboardingFeelingScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedFeeling, setSelectedFeeling] = useState<FeelingOptionWithNull>(null);

  const handleContinue = async () => {
    if (!selectedFeeling) return;

    try {
      // TODO: Persist selectedFeeling to Firestore user document
      // Example: await updateUserDoc({ 
      //   currentFeeling: selectedFeeling, 
      //   feelingOnboardingCompleted: true 
      // });
      console.log('Selected feeling:', selectedFeeling);

      // Navigate to Step 2: Symptoms selection
      // selectedFeeling cannot be null here due to the check above
      navigation.navigate('OnboardingSymptoms', { feeling: selectedFeeling as FeelingOption });
    } catch (error) {
      console.error('Error navigating to symptoms screen:', error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={HANGOVER_GRADIENT}
        locations={[0, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>How are you feeling today?</Text>
          <Text style={styles.subtitle}>
            This helps us personalize your recovery for today.
          </Text>
        </View>

        {/* Feeling Cards */}
        <View style={styles.cardsContainer}>
          {FEELING_OPTIONS.map((option) => (
            <FeelingCard
              key={option.key}
              data={option}
              isSelected={selectedFeeling === option.key}
              onPress={() => setSelectedFeeling(option.key)}
            />
          ))}
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              !selectedFeeling && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedFeeling}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, !selectedFeeling && styles.buttonTextDisabled]}>
              Continue
            </Text>
          </TouchableOpacity>

          {/* Helper Text */}
          <Text style={styles.helperText}>
            You can update this later from your Daily Check-In.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 48,
    paddingHorizontal: 16,
  },
  title: {
    ...typography.sectionTitle,
    fontSize: 32,
    color: 'rgba(0, 0, 0, 0.9)', // Almost black for maximum contrast, premium feel
    textAlign: 'center',
    marginBottom: 18, // Increased from 12 (+6px) for better breathing room
  },
  subtitle: {
    ...typography.body,
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.85)', // 5% more contrast for better readability on bright screens
    textAlign: 'center',
    lineHeight: 24,
  },
  cardsContainer: {
    gap: 14,
    marginBottom: 32,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // More opaque for better glass effect and visibility
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)', // More visible border for glass effect
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6, // More elevation for Android - better glass effect
  },
  cardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)', // Even more opaque when selected - premium glass
    borderColor: 'rgba(255, 255, 255, 1)', // Solid white border when selected
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10, // Higher elevation when selected - more prominent
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  cardInnerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 12, // Soft gradient fade for light inner shadow effect
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    pointerEvents: 'none',
  },
  cardTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  cardTitle: {
    ...typography.bodyMedium,
    fontSize: 17,
    color: 'rgba(0, 0, 0, 0.9)', // Almost black for maximum contrast
    marginBottom: 4,
  },
  cardSubtitle: {
    ...typography.bodySmall,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.8)', // Darker for better readability
    lineHeight: 20,
  },
  radioContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5, // Thinner border - more Apple-like
    borderColor: 'rgba(0, 0, 0, 0.4)', // Darker for better visibility
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: 'rgba(0, 0, 0, 0.8)', // Almost black when selected
  },
  radioInner: {
    width: 13, // 2-3px larger for more presence - premium UI kit feel (was 10)
    height: 13,
    borderRadius: 6.5,
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Almost black for premium feel
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingTop: 24,
  },
  button: {
    backgroundColor: '#0F3F46',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F3F46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)', // More translucent - Calm style
    borderRadius: 28, // Increased rounded corners
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    ...typography.button,
    fontSize: 17,
    color: '#FFFFFF',
  },
  buttonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.7)', // More visible disabled text
  },
  helperText: {
    ...typography.labelSmall,
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.75)', // Darker for better readability
    textAlign: 'center',
    lineHeight: 18,
  },
});

