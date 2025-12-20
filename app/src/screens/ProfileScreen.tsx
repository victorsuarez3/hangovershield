/**
 * Profile Screen - Hangover Shield
 * User profile placeholder
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../providers/AuthProvider';
import { ProfileDetailsSection } from '../components/ProfileDetailsSection';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { ProfileScreenProps } from '../navigation/types';
import { uploadProfilePhoto } from '../services/storageService';
import { showAlert } from '../utils/alert';

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, userDoc, updateUser } = useAuth();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.top, insets.bottom);

  // Handle profile photo upload
  const handleImageSelected = async (uri: string) => {
    if (!user?.uid) {
      showAlert('Error', 'You must be logged in to change your profile photo', 'error');
      return;
    }

    try {
      const oldPhotoUrl = userDoc?.photoUrl;
      const downloadUrl = await uploadProfilePhoto(user.uid, uri, oldPhotoUrl);
      await updateUser({ photoUrl: downloadUrl });
      showAlert('Success', 'Profile photo updated successfully', 'success');
    } catch (error) {
      console.error('Error updating profile photo:', error);
      throw error;
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Profile
        </Text>
      </View>

      <View style={styles.profileSection}>
        <ProfileAvatar
          imageUrl={userDoc?.photoUrl}
          name={userDoc?.displayName || user?.email || 'User'}
          onImageSelected={handleImageSelected}
          size={100}
          editable
          theme={theme}
        />
        <Text style={[styles.name, { color: theme.colors.text }]}>
          {userDoc?.displayName || user?.email || 'User'}
        </Text>
        {userDoc?.email && (
          <Text style={[styles.email, { color: theme.colors.textSecondary }]}>
            {userDoc.email}
          </Text>
        )}
      </View>

      <View style={styles.detailsSection}>
        <ProfileDetailsSection user={userDoc} />
      </View>

      <TouchableOpacity
        style={[styles.settingsButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => navigation.navigate('Settings')}
      >
        <Ionicons name="settings-outline" size={20} color={theme.colors.text} />
        <Text style={[styles.settingsButtonText, { color: theme.colors.text }]}>
          Settings
        </Text>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </ScrollView>
  );
};

const createStyles = (theme: any, topInset: number, bottomInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      paddingBottom: bottomInset + 100, // Space for tab bar
    },
    header: {
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
    },
    profileSection: {
      alignItems: 'center',
      paddingVertical: 32,
      paddingHorizontal: 24,
    },
    name: {
      fontSize: 24,
      fontWeight: '600',
      marginTop: 16,
    },
    email: {
      fontSize: 16,
      marginTop: 4,
    },
    detailsSection: {
      paddingHorizontal: 24,
      marginBottom: 24,
    },
    settingsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      marginHorizontal: 24,
      borderRadius: 12,
      gap: 12,
    },
    settingsButtonText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
    },
  });
