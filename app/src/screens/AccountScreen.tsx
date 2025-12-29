/**
 * Account Screen - Hangover Shield
 * Premium account management screen with subscription, account, legal, and support sections
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { HANGOVER_GRADIENT } from '../theme/gradients';
import { LegalModal } from '../components/LegalModal';
import {
  TermsOfServiceContent,
  PrivacyPolicyContent,
} from '../components/LegalContent';
import { useAuth } from '../providers/AuthProvider';
import { AppHeader } from '../components/AppHeader';
import { APP_LINKS } from '../config/links';
import { deleteAccountAndData } from '../services/accountDeletion';
import {
  areNotificationsEnabled,
  updateNotificationSettings,
  cancelAllNotifications,
  scheduleAllNotifications,
  NotificationSettings,
} from '../services/notificationService';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AccountSectionProps {
  title: string;
  children: React.ReactNode;
}

interface AccountRowProps {
  icon: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  isDestructive?: boolean;
  badge?: string;
  showChevron?: boolean;
}

interface PremiumStatusCardProps {
  onRestorePurchases?: () => void;
}

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

interface PremiumFeaturesModalProps {
  visible: boolean;
  onClose: () => void;
}

interface MedicalDisclaimerModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenSources: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

const AccountSection: React.FC<AccountSectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const PremiumStatusCard: React.FC<PremiumStatusCardProps> = ({ onRestorePurchases }) => (
  <View style={styles.premiumStatusCard}>
    <View style={styles.premiumStatusHeader}>
      <Ionicons name="checkmark-circle" size={20} color="#0F4C44" />
      <Text style={styles.premiumStatusText}>Premium active</Text>
    </View>
    <Text style={styles.premiumStatusSubtext}>Next billing: Jan 13</Text>
    <TouchableOpacity
      style={styles.restoreButton}
      onPress={onRestorePurchases}
      activeOpacity={0.7}
    >
      <Text style={styles.restoreButtonText}>Restore purchases</Text>
    </TouchableOpacity>
  </View>
);

const AccountRow: React.FC<AccountRowProps> = ({
  icon,
  label,
  subtitle,
  onPress,
  isDestructive = false,
  badge,
  showChevron = true,
}) => (
  <TouchableOpacity
    style={[styles.row, isDestructive && styles.rowDestructive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.rowIcon, isDestructive && styles.rowIconDestructive]}>
      <Ionicons
        name={icon as any}
        size={20}
        color={isDestructive ? '#DC3545' : '#0F4C44'}
      />
    </View>
    <View style={styles.rowContent}>
      <View style={styles.rowLabelContainer}>
        <Text style={[styles.rowLabel, isDestructive && styles.rowLabelDestructive]}>
          {label}
        </Text>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      {subtitle && (
        <Text style={[styles.rowSubtitle, isDestructive && styles.rowSubtitleDestructive]}>
          {subtitle}
        </Text>
      )}
    </View>
    {showChevron && (
      <Ionicons
        name="chevron-forward"
        size={18}
        color={isDestructive ? 'rgba(220, 53, 69, 0.3)' : 'rgba(15, 76, 68, 0.3)'}
      />
    )}
  </TouchableOpacity>
);

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  visible,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [confirmText, setConfirmText] = useState('');

  const handleConfirm = () => {
    if (isLoading) {
      return;
    }
    if (confirmText.toUpperCase() === 'DELETE') {
      onConfirm();
      setConfirmText('');
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Delete account?</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={handleClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={24} color="rgba(15, 76, 68, 0.5)" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalBody}>
            This action cannot be undone. All your data, recovery plans, and progress will be permanently deleted.
          </Text>

          <View style={styles.modalInputContainer}>
            <Text style={styles.modalInputLabel}>
              Type "DELETE" to confirm:
            </Text>
            <TextInput
              style={styles.modalInput}
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder="DELETE"
              autoCapitalize="characters"
              maxLength={6}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.modalButtonDestructive,
                (confirmText.toUpperCase() !== 'DELETE' || isLoading) && styles.modalButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={confirmText.toUpperCase() !== 'DELETE' || isLoading}
              activeOpacity={confirmText.toUpperCase() === 'DELETE' && !isLoading ? 0.8 : 1}
            >
              <Text style={styles.modalButtonDestructiveText}>
                {isLoading ? 'Deleting…' : 'Delete Account'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const PremiumFeaturesModal: React.FC<PremiumFeaturesModalProps> = ({
  visible,
  onClose,
}) => {
  const features = [
    'Daily recovery plan',
    'Morning check-in',
    'Evening check-in',
    'Smart hydration tracking',
    'Progress & streak tracking',
    'Early access to new features',
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>What's included in Premium</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={24} color="rgba(15, 76, 68, 0.5)" />
            </TouchableOpacity>
          </View>

          <View style={styles.featuresList}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color="#0F4C44" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.modalSingleButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.modalSingleButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const MedicalDisclaimerModal: React.FC<MedicalDisclaimerModalProps> = ({
  visible,
  onClose,
  onOpenSources,
}) => {
  const disclaimerText = `Hangover Shield provides general wellness guidance and self-reflection tools.
It is not intended to diagnose, treat, cure, or prevent any medical condition.
If symptoms are severe, persistent, or concerning, seek professional medical help.`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Medical Disclaimer</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color="rgba(15, 76, 68, 0.5)" />
            </TouchableOpacity>
          </View>

          <View style={styles.disclaimerContent}>
            <Text style={styles.disclaimerText}>{disclaimerText}</Text>
          </View>

          <TouchableOpacity
            style={styles.modalSingleButton}
            onPress={onOpenSources}
            activeOpacity={0.8}
            accessibilityLabel="View sources"
            accessibilityRole="button"
          >
            <Text style={styles.modalSingleButtonText}>Sources</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalSingleButton}
            onPress={onClose}
            activeOpacity={0.8}
            accessibilityLabel="Got it"
            accessibilityRole="button"
          >
            <Text style={styles.modalSingleButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const AccountScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [medicalDisclaimerModalVisible, setMedicalDisclaimerModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Load notification status on mount
  React.useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    const enabled = await areNotificationsEnabled();
    setNotificationsEnabled(enabled);
  };

  // Subscription Management
  const handleManageSubscription = async () => {
    try {
      const supported = await Linking.canOpenURL(APP_LINKS.APPLE_SUBSCRIPTION_MANAGEMENT);
      if (supported) {
        await Linking.openURL(APP_LINKS.APPLE_SUBSCRIPTION_MANAGEMENT);
      } else {
        Alert.alert(
          'Unable to open subscriptions',
          'Please visit the App Store to manage your subscriptions.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error opening subscription management:', error);
      Alert.alert(
        'Error',
        'Unable to open subscription management. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Sign Out
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Auth state change will automatically navigate to AuthNavigator
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Delete Account
  const handleDeleteAccount = () => {
    setDeleteModalVisible(true);
  };

  const handleDeleteAccountConfirm = async () => {
    if (!user?.uid) {
      Alert.alert('Not signed in', 'Please sign in again to delete your account.');
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteAccountAndData();
      setDeleteModalVisible(false);

      if (result === 'reauth-required') {
        Alert.alert(
          'Please sign in again',
          'For security, please sign in again to delete your account.',
          [
            {
              text: 'Go to login',
              onPress: async () => {
                try {
                  await logout();
                } catch (err) {
                  console.error('[AccountScreen] Logout after reauth prompt failed:', err);
                }
              },
            },
          ],
        );
        return;
      }

      Alert.alert('Account deleted', 'Your account and data have been removed.', [
        {
          text: 'OK',
          onPress: async () => {
            try {
              await logout();
            } catch (err) {
              console.error('[AccountScreen] Logout after deletion failed:', err);
            }
          },
        },
      ]);
    } catch (error: any) {
      console.error('[AccountScreen] Delete account error:', error);
      Alert.alert('Error deleting account', 'Please try again or contact support.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Premium Features
  const handlePremiumFeatures = () => {
    setPremiumModalVisible(true);
  };

  // Restore Purchases
  const handleRestorePurchases = () => {
    // TODO: Implement restore purchases logic
    console.log('Restore purchases pressed');
    Alert.alert('Restore Purchases', 'Purchases have been restored successfully.');
  };

  // Legal Links - Open modals instead of external links
  const handlePrivacyPolicy = () => {
    setPrivacyModalVisible(true);
  };

  const handleTermsOfService = () => {
    setTermsModalVisible(true);
  };

  // Support
  const handleContactSupport = async () => {
    try {
      const target = APP_LINKS.SUPPORT_URL || APP_LINKS.SUPPORT_EMAIL;
      if (!target) {
        Alert.alert('Support unavailable', 'Support link is not configured yet.');
        return;
      }
      const supported = await Linking.canOpenURL(target);
      if (supported) {
        await Linking.openURL(target);
      } else if (APP_LINKS.SUPPORT_EMAIL) {
        await Linking.openURL(APP_LINKS.SUPPORT_EMAIL);
      } else {
        Alert.alert('Unable to open link', 'Please check your internet connection.');
      }
    } catch (error) {
      console.error('Error opening support URL:', error);
      Alert.alert('Error', 'Unable to open support page. Please try again.');
    }
  };

  // Notifications Management
  const handleManageNotifications = () => {
    Alert.alert(
      'Notification Settings',
      notificationsEnabled
        ? 'Manage notifications from your device settings or disable them below.'
        : 'Enable notifications to receive reminders for hydration, recovery steps, and evening check-ins.',
      notificationsEnabled
        ? [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Disable Notifications',
              style: 'destructive',
              onPress: async () => {
                try {
                  await cancelAllNotifications();
                  Alert.alert('Notifications Disabled', 'All notifications have been cancelled.');
                  checkNotificationStatus();
                } catch (error) {
                  console.error('Error disabling notifications:', error);
                  Alert.alert('Error', 'Failed to disable notifications. Please try again.');
                }
              },
            },
          ]
        : [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: async () => {
                try {
                  await Linking.openSettings();
                } catch (error) {
                  console.error('Error opening settings:', error);
                  Alert.alert('Error', 'Unable to open settings. Please open Settings app manually.');
                }
              },
            },
          ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={HANGOVER_GRADIENT}
        locations={[0, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <AppHeader
        title="Account"
        subtitle="Your plan, privacy & support."
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Status Card */}
        <PremiumStatusCard onRestorePurchases={handleRestorePurchases} />

        {/* Subscription Section */}
        <AccountSection title="Subscription">
          <AccountRow
            icon="card-outline"
            label="Premium Plan"
            subtitle="Monthly • Renews automatically"
            onPress={handleManageSubscription}
            badge="ACTIVE"
          />
          <View style={styles.separator} />
          <AccountRow
            icon="information-circle-outline"
            label="What's included in Premium"
            onPress={handlePremiumFeatures}
            showChevron={false}
          />
        </AccountSection>

        {/* Notifications Section */}
        <AccountSection title="Notifications">
          <AccountRow
            icon={notificationsEnabled ? 'notifications' : 'notifications-off-outline'}
            label="Push Notifications"
            subtitle={
              notificationsEnabled
                ? 'Hydration, recovery & evening reminders'
                : 'Enable to receive helpful reminders'
            }
            onPress={handleManageNotifications}
            badge={notificationsEnabled ? 'ON' : undefined}
          />
        </AccountSection>

        {/* Legal Section */}
        <AccountSection title="Legal">
          <AccountRow
            icon="document-text-outline"
            label="Privacy Policy"
            onPress={handlePrivacyPolicy}
          />
          <View style={styles.separator} />
          <AccountRow
            icon="document-outline"
            label="Terms of Service"
            onPress={handleTermsOfService}
          />
          <View style={styles.separator} />
          <AccountRow
            icon="medical-outline"
            label="Medical Disclaimer"
            subtitle="General wellness information. Not medical advice."
            onPress={() => setMedicalDisclaimerModalVisible(true)}
          />
        </AccountSection>

        {/* Support Section */}
        <AccountSection title="Support">
          <AccountRow
            icon="help-circle-outline"
            label="Contact Support"
            subtitle="Get help or send feedback"
            onPress={handleContactSupport}
          />
        </AccountSection>

        {/* Account Section */}
        <AccountSection title="Account">
          <AccountRow
            icon="log-out-outline"
            label="Sign Out"
            onPress={handleSignOut}
          />
          <View style={styles.separator} />
          <AccountRow
            icon="trash-outline"
            label="Delete Account"
            subtitle="Permanently delete your account and data"
            onPress={handleDeleteAccount}
          />
        </AccountSection>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Hangover Shield v1.0.0</Text>
          <Text style={styles.footerCopyright}>© 2025 Hangover Shield</Text>
        </View>
      </ScrollView>

      {/* Modals */}
      <DeleteAccountModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteAccountConfirm}
        isLoading={isDeleting}
      />

      <PremiumFeaturesModal
        visible={premiumModalVisible}
        onClose={() => setPremiumModalVisible(false)}
      />

      {/* Legal Modals */}
      <LegalModal
        visible={termsModalVisible}
        onClose={() => setTermsModalVisible(false)}
        title="Terms of Service"
        content={<TermsOfServiceContent />}
      />

      <LegalModal
        visible={privacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
        title="Privacy Policy"
        content={<PrivacyPolicyContent />}
      />

      <MedicalDisclaimerModal
        visible={medicalDisclaimerModalVisible}
        onClose={() => setMedicalDisclaimerModalVisible(false)}
        onOpenSources={() => {
          setMedicalDisclaimerModalVisible(false);
          navigation.navigate('Sources' as never);
        }}
      />
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 24,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.6)',
    textAlign: 'center',
  },

  // Premium Status Card
  premiumStatusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 2,
  },
  premiumStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  premiumStatusText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#0F3D3E',
    marginLeft: 8,
  },
  premiumStatusSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.6)',
    marginBottom: 16,
  },
  restoreButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    borderRadius: 8,
  },
  restoreButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#0F4C44',
  },

  // Sections
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.5)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 16,
  },

  // Rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 2,
  },
  rowDestructive: {
    backgroundColor: 'rgba(220, 53, 69, 0.05)',
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowIconDestructive: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
  },
  rowContent: {
    flex: 1,
  },
  rowLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  rowLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#0F3D3E',
  },
  badge: {
    backgroundColor: '#0F4C44',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  badgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  rowLabelDestructive: {
    color: '#DC3545',
  },
  rowSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.6)',
  },
  rowSubtitleDestructive: {
    color: 'rgba(220, 53, 69, 0.6)',
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    marginVertical: 8,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 16,
  },
  footerText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.5)',
    marginBottom: 4,
  },
  footerCopyright: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(15, 61, 62, 0.4)',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 61, 62, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 24,
    color: '#0F3D3E',
    flex: 1,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(15, 61, 62, 0.7)',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalInputContainer: {
    marginBottom: 24,
  },
  modalInputLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.6)',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 68, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#0F3D3E',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
  },
  modalButtonCancelText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#0F4C44',
  },
  modalButtonDestructive: {
    backgroundColor: '#DC3545',
  },
  modalButtonDestructiveText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalSingleButton: {
    backgroundColor: '#0F4C44',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSingleButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  featuresList: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#0F3D3E',
    marginLeft: 12,
  },
  modalOverlayTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  disclaimerContent: {
    marginBottom: 24,
  },
  disclaimerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(15, 61, 62, 0.7)',
  },
});

export default AccountScreen;
