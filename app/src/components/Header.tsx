/**
 * Header component for screens
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  showGreeting?: boolean;
  userName?: string;
  userImage?: string;
  onNotificationPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBackPress,
  rightAction,
  showGreeting = false,
  userName,
  userImage,
  onNotificationPress,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.top);

  if (showGreeting) {
    return (
      <View style={styles.greetingContainer}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.greetingContent}>
          <View style={styles.userInfo}>
            {userImage && (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {userName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.userName}>{userName || 'User'}</Text>
              <Text style={styles.greeting}>Good Morning</Text>
            </View>
          </View>
          {onNotificationPress && (
            <TouchableOpacity
              onPress={onNotificationPress}
              style={styles.notificationButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.content}>
        {showBack && (
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        )}
        {title && (
          <Text style={styles.title}>{title}</Text>
        )}
        {rightAction && (
          <View style={styles.rightAction}>
            {rightAction}
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: any, topInset: number) => StyleSheet.create({
  container: {
    paddingTop: topInset + theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
    flex: 1,
    textAlign: 'center',
  },
  rightAction: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  greetingContainer: {
    paddingTop: topInset + theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  greetingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.softCream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...theme.typography.h4,
    color: theme.colors.pureBlack,
  },
  userName: {
    ...theme.typography.h4,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  greeting: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  notificationButton: {
    padding: theme.spacing.xs,
  },
});

