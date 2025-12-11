/**
 * Invite Landing Screen
 * Processes incoming invitation links and guides users through membership application
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../providers/AuthProvider';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { showAlert } from '../utils/alert';
import { getUserByInviteCode } from '../services/firebase/users';

interface InviteLandingScreenProps {
  inviteUrl: string;
  onClose: () => void;
}

export const InviteLandingScreen: React.FC<InviteLandingScreenProps> = ({
  inviteUrl,
  onClose,
}) => {
  const { theme } = useTheme();
  const { user, userDoc } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [inviter, setInviter] = useState<any>(null);
  const [inviteCode, setInviteCode] = useState<string>('');

  const styles = createStyles(theme, insets.top, insets.bottom);

  useEffect(() => {
    processInviteUrl();
  }, [inviteUrl]);

  const processInviteUrl = async () => {
    try {
      // Extract invite code from URL
      // URL format: https://casalatinaclub.com/invite/CL-ABC123 or casalatina://invite/CL-ABC123
      const urlParts = inviteUrl.split('/invite/');
      if (urlParts.length < 2) {
        throw new Error('Invalid invite URL');
      }

      const code = urlParts[1];
      setInviteCode(code);

      // Find the user who sent the invitation
      const inviterData = await getUserByInviteCode(code);
      if (!inviterData) {
        throw new Error('Invalid invite code');
      }

      setInviter(inviterData);
    } catch (error: any) {
      showAlert('Invalid Invitation', error.message || 'This invitation link is not valid.', 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleApplyWithInvite = () => {
    // Store the invite code for later use in the application process
    // Navigate to application start screen with invite code
    onClose();
    (navigation as any).navigate('ApplicationStart', { inviteCode });
  };

  const handleContinueAsGuest = () => {
    onClose();
    (navigation as any).navigate('ApplicationStart');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Processing invitation...</Text>
      </View>
    );
  }

  if (!inviter) {
    return null; // Error already handled
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exclusive Invitation</Text>
        <View style={styles.closeButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Inviter Info */}
        <View style={styles.inviterCard}>
          <View style={styles.inviterHeader}>
            <View style={styles.inviterAvatar}>
              <Text style={styles.inviterInitial}>
                {inviter.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.inviterInfo}>
              <Text style={styles.inviterName}>{inviter.name || 'Casa Latina Member'}</Text>
              <Text style={styles.inviterRole}>Member</Text>
            </View>
          </View>

          <View style={styles.inviteMessage}>
            <Ionicons name="mail-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.inviteMessageText}>
              {inviter.name || 'A Casa Latina member'} has invited you to join our exclusive community.
            </Text>
          </View>
        </View>

        {/* Premium Benefits */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>What awaits you:</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.benefitText}>Curated events for Latinos in Miami</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.benefitText}>Exclusive networking opportunities</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.benefitText}>Members-only experiences</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.benefitText}>Priority access to premium events</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleApplyWithInvite}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Apply with Invitation</Text>
            <Ionicons name="arrow-forward" size={20} color={theme.colors.pureBlack} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleContinueAsGuest}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>Apply Without Invitation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeTextButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeTextButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any, topInset: number, bottomInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: topInset + 16,
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    closeButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      ...theme.typography.sectionTitle,
      color: theme.colors.text,
      fontSize: 20,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.xl,
      paddingBottom: bottomInset + 120,
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    loadingText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.md,
    },
    inviterCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.softCream + '20',
      ...theme.shadows.lg,
    },
    inviterHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    inviterAvatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    inviterInitial: {
      ...theme.typography.heroTitle,
      color: theme.colors.pureBlack,
      fontSize: 24,
    },
    inviterInfo: {
      flex: 1,
    },
    inviterName: {
      ...theme.typography.subsectionTitle,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs / 2,
    },
    inviterRole: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    inviteMessage: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    },
    inviteMessageText: {
      ...theme.typography.body,
      color: theme.colors.text,
      flex: 1,
      lineHeight: 22,
    },
    benefitsCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    benefitsTitle: {
      ...theme.typography.subsectionTitle,
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
    },
    benefitsList: {
      gap: theme.spacing.md,
    },
    benefitItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    benefitText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    actionsContainer: {
      gap: theme.spacing.md,
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md + 4,
      paddingHorizontal: theme.spacing.xl,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.sm,
      ...theme.shadows.md,
    },
    primaryButtonText: {
      ...theme.typography.button,
      color: theme.colors.pureBlack,
      fontWeight: '600',
    },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md + 4,
      paddingHorizontal: theme.spacing.xl,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: theme.spacing.sm,
    },
    secondaryButtonText: {
      ...theme.typography.button,
      color: theme.colors.text,
      fontWeight: '600',
    },
    closeTextButton: {
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
    closeTextButtonText: {
      ...theme.typography.body,
      color: theme.colors.textTertiary,
      fontSize: 14,
    },
  });
