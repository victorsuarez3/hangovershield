/**
 * Application Start Screen
 * Shown when user has not yet applied for membership
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Ionicons } from '@expo/vector-icons';

export const ApplicationStartScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const styles = createStyles(theme, insets.bottom);

  const handleStartApplication = () => {
    // Navigate to application form in AuthNavigator
    // Since we're outside AuthNavigator, we need to handle this differently
    // For now, we'll use a workaround by navigating to a route that doesn't exist
    // The user should be redirected to AuthNavigator which has ApplicationForm
    navigation.navigate('ApplicationForm' as any);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.richBlack]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="document-text-outline"
                  size={64}
                  color={theme.colors.primary}
                />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Start Your Application</Text>

            {/* Description */}
            <Text style={styles.description}>
              Join Casa Latina and become part of an exclusive community of Latin creators and professionals.
            </Text>

            {/* Features */}
            <View style={styles.featuresContainer}>
              <View style={styles.feature}>
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                <Text style={styles.featureText}>Exclusive events and networking</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                <Text style={styles.featureText}>Access to premium content</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                <Text style={styles.featureText}>Connect with like-minded professionals</Text>
              </View>
            </View>

            {/* CTA Button */}
            <Button
              label="Start Application"
              onPress={handleStartApplication}
              style={styles.button}
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const createStyles = (theme: any, bottomInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    gradient: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: bottomInset + 32,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 60,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconContainer: {
      marginBottom: 32,
    },
    iconCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    description: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
    },
    featuresContainer: {
      width: '100%',
      marginBottom: 32,
    },
    feature: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    featureText: {
      fontSize: 16,
      color: theme.colors.text,
      marginLeft: 12,
    },
    button: {
      width: '100%',
    },
  });

