/**
 * Settings Screen - Hangover Shield
 * Settings placeholder with basic options
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../providers/AuthProvider';
import { SettingsScreenProps } from '../navigation/types';
import { deleteAccount } from '../services/auth';
import { showAlert } from '../utils/alert';
import { AppHeader } from '../components/AppHeader';

interface SettingsItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.top, insets.bottom);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteModal(false);

    if (!user) {
      showAlert('Error', 'No user session found', 'error');
      return;
    }

    try {
      await deleteAccount(user);
    } catch (error: any) {
      showAlert(
        'Delete Account Failed',
        error?.message || 'Could not delete your account. Please try again.',
        'error'
      );
    }
  };

  const settingsItems: SettingsItem[] = [
    {
      id: 'notifications',
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => {
        showAlert('Coming Soon', 'Notification settings will be available soon', 'info');
      },
    },
    {
      id: 'subscription',
      icon: 'card-outline',
      label: 'Subscription & Billing',
      onPress: () => {
        showAlert('Coming Soon', 'Subscription management will be available soon', 'info');
      },
    },
    {
      id: 'about',
      icon: 'information-circle-outline',
      label: 'About Hangover Shield',
      onPress: () => {
        showAlert(
          'About',
          'Hangover Shield\nVersion 1.0.0\n\nYour intelligent recovery companion.',
          'info'
        );
      },
    },
    {
      id: 'support',
      icon: 'help-circle-outline',
      label: 'Support',
      onPress: () => {
        showAlert('Support', 'Contact support at support@hangovershield.co', 'info');
      },
    },
    {
      id: 'privacy',
      icon: 'shield-outline',
      label: 'Privacy Policy',
      onPress: () => {
        showAlert('Privacy Policy', 'View our privacy policy at hangovershield.co/privacy', 'info');
      },
    },
    {
      id: 'terms',
      icon: 'document-text-outline',
      label: 'Terms & Conditions',
      onPress: () => {
        showAlert('Terms', 'View our terms at hangovershield.co/terms', 'info');
      },
    },
    {
      id: 'logout',
      icon: 'log-out-outline',
      label: 'Log Out',
      onPress: () => setShowLogoutModal(true),
      danger: true,
    },
    {
      id: 'delete',
      icon: 'trash-outline',
      label: 'Delete Account',
      onPress: () => setShowDeleteModal(true),
      danger: true,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <AppHeader
            title="Settings"
            showBackButton
            onBackPress={() => navigation.goBack()}
          />
        </View>

        <View style={styles.settingsList}>
          {settingsItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.settingsItem,
                { backgroundColor: theme.colors.surface },
                item.danger && styles.dangerItem,
              ]}
              onPress={item.onPress}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={item.danger ? theme.colors.errorRed : theme.colors.text}
              />
              <Text
                style={[
                  styles.settingsItemLabel,
                  { color: item.danger ? theme.colors.errorRed : theme.colors.text },
                ]}
              >
                {item.label}
              </Text>
              {item.value && (
                <Text style={[styles.settingsItemValue, { color: theme.colors.textSecondary }]}>
                  {item.value}
                </Text>
              )}
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Log Out
            </Text>
            <Text style={[styles.modalMessage, { color: theme.colors.textSecondary }]}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.surfaceElevated }]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.errorRed }]}
                onPress={handleLogout}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.pureWhite }]}>
                  Log Out
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.errorRed }]}>
              Delete Account
            </Text>
            <Text style={[styles.modalMessage, { color: theme.colors.textSecondary }]}>
              This action cannot be undone. All your data will be permanently deleted.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.surfaceElevated }]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.errorRed }]}
                onPress={handleDeleteAccount}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.pureWhite }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (theme: any, topInset: number, bottomInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingBottom: bottomInset + 100,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    backButton: {
      marginRight: 16,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
    },
    settingsList: {
      paddingHorizontal: 24,
      marginTop: 24,
      gap: 12,
    },
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      gap: 12,
    },
    dangerItem: {
      borderWidth: 1,
      borderColor: theme.colors.errorRed + '30',
    },
    settingsItemLabel: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
    },
    settingsItemValue: {
      fontSize: 14,
      marginRight: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    modalContent: {
      width: '100%',
      maxWidth: 400,
      borderRadius: 16,
      padding: 24,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 12,
    },
    modalMessage: {
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 24,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });
