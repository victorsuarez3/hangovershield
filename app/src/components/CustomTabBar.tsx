/**
 * Custom Tab Bar - Ultra-Premium Glassmorphism
 * Luxury floating element with soft cream accents
 */

import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { t } from '../i18n';

interface TabBarItem {
  name: string;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
}

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const tabs: TabBarItem[] = [
  {
    name: 'Home',
    labelKey: 'tab_home',
    icon: 'home-outline',
    iconFocused: 'home',
  },
  {
    name: 'SmartPlan',
    labelKey: 'tab_smart_plan',
    icon: 'calendar-outline',
    iconFocused: 'calendar',
  },
  {
    name: 'Tools',
    labelKey: 'tab_tools',
    icon: 'fitness-outline',
    iconFocused: 'fitness',
  },
  {
    name: 'Progress',
    labelKey: 'tab_progress',
    icon: 'stats-chart-outline',
    iconFocused: 'stats-chart',
  },
  {
    name: 'Settings',
    labelKey: 'tab_settings',
    icon: 'settings-outline',
    iconFocused: 'settings',
  },
];

export const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.bottom);

  return (
    <View style={styles.container}>
      {/* Premium glassmorphism background */}
      <View style={styles.blurWrapper}>
        <LinearGradient
          colors={['rgba(15, 15, 15, 0.95)', 'rgba(15, 15, 15, 0.95)']}
          locations={[0, 1]}
          style={styles.blurContainer}
        >
          <View style={styles.tabBar}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const tab = tabs.find((t) => t.name === route.name);

            if (!tab) return null;

            const scaleAnim = useRef(new Animated.Value(1)).current;
            const opacityAnim = useRef(new Animated.Value(isFocused ? 1 : 0.7)).current;

            const handlePressIn = () => {
              Animated.spring(scaleAnim, {
                toValue: 0.92,
                useNativeDriver: true,
                damping: 15,
                stiffness: 300,
              }).start();
            };

            const handlePressOut = () => {
              Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                damping: 15,
                stiffness: 300,
              }).start();
            };

            const onPress = () => {
              handlePressIn();
              setTimeout(() => handlePressOut(), 150);
              
              // Smooth tab transition
              Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 120,
                useNativeDriver: true,
              }).start();
              
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            // Update opacity for inactive tabs
            React.useEffect(() => {
              Animated.timing(opacityAnim, {
                toValue: isFocused ? 1 : 0.7,
                duration: 120,
                useNativeDriver: true,
              }).start();
            }, [isFocused]);

            // All tabs - Circular with deep teal when active
            return (
              <Animated.View
                key={route.key}
                style={[{ transform: [{ scale: scaleAnim }] }]}
              >
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  style={styles.tabButton}
                  activeOpacity={1}
                >
                  <View
                    style={[
                      styles.circularButton,
                      isFocused && styles.circularButtonFocused,
                    ]}
                  >
                    <Ionicons
                      name={isFocused ? tab.iconFocused : tab.icon}
                      size={20}
                      color={isFocused ? theme.colors.deepTeal : theme.colors.textSecondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.tabLabel,
                      isFocused && styles.tabLabelFocused,
                    ]}
                  >
                    {tab.labelKey.replace('tab_', '').replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};

const createStyles = (theme: any, bottomInset: number) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'transparent',
      borderTopWidth: 0,
      borderWidth: 0,
      shadowOpacity: 0,
      elevation: 0,
    },
    blurWrapper: {
      overflow: 'hidden',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderTopWidth: 0,
      borderWidth: 0,
      backgroundColor: 'transparent',
    },
    blurContainer: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderTopWidth: 0,
      borderWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
      shadowColor: 'transparent',
    },
    tabBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: theme.spacing.sm,
      paddingTop: theme.spacing.md + 6,
      paddingBottom: Math.max(bottomInset + theme.spacing.sm, theme.spacing.md),
      minHeight: 74,
    },
    tabButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      maxWidth: 80,
    },
    circularButton: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.round,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xs / 2 + 1, // Increase icon + label spacing by 1-2px
    },
    circularButtonFocused: {
      backgroundColor: theme.colors.deepTeal + '20',
      borderRadius: theme.borderRadius.round,
    },
    tabLabel: {
      ...theme.typography.labelSmall,
      color: theme.colors.textSecondary,
      fontSize: 10,
      textAlign: 'center',
      marginTop: 4,
      textTransform: 'capitalize',
    },
    tabLabelFocused: {
      ...theme.typography.labelSmall,
      color: theme.colors.deepTeal,
      fontWeight: '600',
    },
  });
