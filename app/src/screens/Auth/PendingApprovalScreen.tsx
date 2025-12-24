/**
 * Pending Approval Screen - Casa Latina
 * Shown after user submits membership application
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export const PendingApprovalScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.bottom);

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
                  name="time-outline"
                  size={64}
                  color={theme.colors.primary}
                />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Application Submitted</Text>

            {/* Description */}
            <Text style={styles.description}>
              Thank you for submitting your membership application. Our team is currently reviewing it, and we'll notify you once a decision has been made.
            </Text>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.infoText}>
                This process typically takes 2-3 business days. You'll receive an email notification when your application status changes.
              </Text>
            </View>
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
    infoBox: {
      flexDirection: 'row',
      backgroundColor: theme.colors.primary + '15',
      padding: 16,
      borderRadius: 12,
      width: '100%',
    },
    infoText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginLeft: 12,
      flex: 1,
      lineHeight: 20,
    },
  });






