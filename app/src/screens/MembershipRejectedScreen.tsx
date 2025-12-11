/**
 * Membership Rejected Screen
 * Shown when user's membership application has been rejected
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../providers/AuthProvider';
import { Button } from '../components/Button';
import { Ionicons } from '@expo/vector-icons';

export const MembershipRejectedScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const styles = createStyles(theme, insets.bottom);

  const handleSignOut = async () => {
    await logout();
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
                  name="close-circle-outline"
                  size={64}
                  color={theme.colors.errorRed || '#CC5C6C'}
                />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>
              En este momento no podemos aprobar tu membresía
            </Text>

            {/* Message */}
            <Text style={styles.message}>
              Gracias por tu interés en Casa Latina.
            </Text>

            {/* Additional context */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Nuestro equipo ha revisado tu solicitud cuidadosamente. 
                En este momento, no podemos ofrecerte una membresía.
              </Text>
            </View>

            {/* Sign out button */}
            <View style={styles.buttonContainer}>
              <Button
                title="Cerrar sesión"
                onPress={handleSignOut}
                variant="outline"
                fullWidth={true}
              />
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
      backgroundColor: theme.colors.background,
    },
    gradient: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xxxl * 2,
      paddingBottom: bottomInset + theme.spacing.xl,
      justifyContent: 'center',
    },
    content: {
      alignItems: 'center',
      maxWidth: 400,
      alignSelf: 'center',
      width: '100%',
    },
    iconContainer: {
      marginBottom: theme.spacing.xl,
    },
    iconCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.errorRed + '30' || 'rgba(204, 92, 108, 0.3)',
    },
    title: {
      ...theme.typography.sectionTitle,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
      fontSize: 28,
      lineHeight: 36,
    },
    message: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
      fontSize: 18,
      lineHeight: 26,
    },
    infoBox: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    infoText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    buttonContainer: {
      width: '100%',
      marginTop: theme.spacing.lg,
    },
  });



