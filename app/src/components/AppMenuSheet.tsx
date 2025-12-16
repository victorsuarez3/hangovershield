/**
 * App Menu Sheet - Hangover Shield
 * Premium command center overlay menu
 * 
 * Menu items (in order):
 * 0. Home - Dashboard
 * 1. Today's recovery plan
 * 2. Progress & history
 * 3. Daily check-in
 * 4. Water log
 * 5. Evening check-in (always visible, locked for free users)
 * --- divider ---
 * 6. Upgrade to Premium / Subscription
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccessStatus } from '../hooks/useAccessStatus';
import { PaywallSource } from '../constants/paywallSources';
import { formatWelcomeUnlockTimeRemaining } from '../services/welcomeUnlock';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get dynamic subtitle for subscription menu item based on access status
 */
function getSubscriptionSubtitle(accessInfo: {
  status: 'free' | 'welcome' | 'premium';
  welcomeRemainingMs: number;
  isTrialActive: boolean;
}): string {
  switch (accessInfo.status) {
    case 'premium':
      return accessInfo.isTrialActive 
        ? 'Trial active. Manage subscription.' 
        : 'Premium active. Manage subscription.';
    case 'welcome':
      const timeLeft = formatWelcomeUnlockTimeRemaining(accessInfo.welcomeRemainingMs);
      return `Welcome access (${timeLeft} left)`;
    case 'free':
    default:
      return 'Unlock full recovery guidance.';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type CurrentScreen = 'home' | 'today' | 'progress' | 'checkin' | 'waterlog' | 'evening';

export interface AppMenuSheetProps {
  visible: boolean;
  onClose: () => void;
  // Navigation callbacks
  onGoToHome: () => void;
  onGoToToday: () => void;
  onGoToProgress: () => void;
  onGoToCheckIn: () => void;
  onGoToWaterLog: () => void;
  onGoToEveningCheckIn: () => void;
  onGoToEveningCheckInLocked: () => void;
  onGoToSubscription: (source: string) => void;
  // Current screen for "Current" badge
  currentScreen?: CurrentScreen;
}

// ─────────────────────────────────────────────────────────────────────────────
// Menu Item Component
// ─────────────────────────────────────────────────────────────────────────────

interface MenuItemProps {
  icon: string;
  label: string;
  subtitle: string;
  isActive?: boolean;
  onPress: () => void;
  isPremiumItem?: boolean;
  isLocked?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  subtitle,
  isActive = false,
  onPress,
  isPremiumItem = false,
  isLocked = false,
}) => (
  <TouchableOpacity
    style={[styles.menuItem, isActive && styles.menuItemActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[
      styles.menuItemIcon, 
      isPremiumItem && styles.menuItemIconPremium,
      isLocked && styles.menuItemIconLocked,
    ]}>
      <Ionicons
        name={icon as any}
        size={20}
        color={isLocked ? '#9CA3AF' : isPremiumItem ? '#E8A957' : '#0F4C44'}
      />
    </View>
    <View style={styles.menuItemContent}>
      <View style={styles.menuItemLabelRow}>
        <Text style={[
          styles.menuItemLabel, 
          isPremiumItem && styles.menuItemLabelPremium,
          isLocked && styles.menuItemLabelLocked,
        ]}>
          {label}
        </Text>
        {isLocked && (
          <Ionicons name="lock-closed" size={12} color="#9CA3AF" style={{ marginLeft: 6 }} />
        )}
      </View>
      <Text style={[styles.menuItemSubtitle, isLocked && styles.menuItemSubtitleLocked]}>
        {subtitle}
      </Text>
    </View>
    {isActive ? (
      <View style={styles.currentPill}>
        <Text style={styles.currentPillText}>Current</Text>
      </View>
    ) : (
      <Ionicons name="chevron-forward" size={18} color="rgba(15, 76, 68, 0.3)" />
    )}
  </TouchableOpacity>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const AppMenuSheet: React.FC<AppMenuSheetProps> = ({
  visible,
  onClose,
  onGoToHome,
  onGoToToday,
  onGoToProgress,
  onGoToCheckIn,
  onGoToWaterLog,
  onGoToEveningCheckIn,
  onGoToEveningCheckInLocked,
  onGoToSubscription,
  currentScreen,
}) => {
  const insets = useSafeAreaInsets();
  const accessInfo = useAccessStatus();
  const DEBUG_MENU_ALERTS = __DEV__ === true;
  
  // Animations
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(-20)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslateY, {
          toValue: 0,
          damping: 20,
          stiffness: 300,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          damping: 20,
          stiffness: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      backdropOpacity.setValue(0);
      cardTranslateY.setValue(-20);
      cardOpacity.setValue(0);
      cardScale.setValue(0.95);
    }
  }, [visible]);

  const handleClose = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: -10,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  // Helper to close menu then navigate
  const navigateAfterClose = (callback: () => void) => {
    handleClose();
    // Keep delay small so navigation feels responsive and doesn't get "lost"
    setTimeout(callback, 80);
  };

  // TEMP DEBUG: verify row presses are firing (dev-only)
  const debugNavigateAfterClose = (label: string, callback: () => void) => {
    if (DEBUG_MENU_ALERTS) {
      Alert.alert('Menu tap', label);
    }
    navigateAfterClose(callback);
  };

  // Handle Evening Check-in navigation - always navigate, but screen will show paywall if no access
  const handleEveningCheckIn = () => {
    // Always navigate to EveningCheckIn - the screen itself will redirect to paywall if needed
    debugNavigateAfterClose('Evening check-in', onGoToEveningCheckIn);
  };

  // Handle subscription/upgrade
  const handleSubscription = () => {
    debugNavigateAfterClose('Upgrade / Subscription', () =>
      onGoToSubscription(PaywallSource.MENU_SUBSCRIPTION)
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
      presentationStyle="overFullScreen"
      hardwareAccelerated
    >
      <View style={styles.root} pointerEvents="box-none">
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={handleClose} pointerEvents="auto">
          <Animated.View
            style={[
              styles.backdropInner,
              { opacity: backdropOpacity },
            ]}
            pointerEvents="none"
          />
        </Pressable>

        {/* Menu Card */}
        <Animated.View
          style={[
            styles.menuCard,
            {
              marginTop: insets.top + 60,
              opacity: cardOpacity,
              transform: [
                { translateY: cardTranslateY },
                { scale: cardScale },
              ],
            },
          ]}
          pointerEvents="auto"
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
        >
          <View
            style={styles.menuCardInner}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
          >
          {/* Header */}
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Quick Access</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={20} color="rgba(15, 76, 68, 0.5)" />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.menuItems}>
            {/* 0. Home */}
            <MenuItem
              icon="home-outline"
              label="Home"
              subtitle="Your dashboard for today."
              isActive={currentScreen === 'home'}
              onPress={() => debugNavigateAfterClose('Home', onGoToHome)}
            />

            {/* 1. Today's recovery plan */}
            <MenuItem
              icon="sunny-outline"
              label="Today's recovery plan"
              subtitle="See today's steps and hydration goals."
              isActive={currentScreen === 'today'}
              onPress={() => debugNavigateAfterClose("Today's recovery plan", onGoToToday)}
            />

            {/* 2. Daily check-in */}
            <MenuItem
              icon="clipboard-outline"
              label="Daily check-in"
              subtitle="Update how you're feeling today."
              isActive={currentScreen === 'checkin'}
              onPress={() => debugNavigateAfterClose('Daily check-in', onGoToCheckIn)}
            />

            {/* 4. Water log */}
            <MenuItem
              icon="water-outline"
              label="Water log"
              subtitle="Track your hydration progress."
              isActive={currentScreen === 'waterlog'}
              onPress={() => debugNavigateAfterClose('Water log', onGoToWaterLog)}
            />

            {/* 5. Evening check-in (always visible, always active) */}
            <MenuItem
              icon="moon-outline"
              label="Evening check-in"
              subtitle="Reflect on your day's recovery."
              isActive={currentScreen === 'evening'}
              onPress={handleEveningCheckIn}
            />
          </View>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Subscription Item */}
          <View style={styles.subscriptionSection}>
            <MenuItem
              icon={accessInfo.isPremium ? 'card-outline' : 'star-outline'}
              label={accessInfo.isPremium ? 'Subscription' : 'Upgrade to Premium'}
              subtitle={getSubscriptionSubtitle(accessInfo)}
              isPremiumItem={!accessInfo.isPremium}
              onPress={handleSubscription}
            />
          </View>
        </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  backdropInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 61, 62, 0.4)',
  },
  menuCard: {
    position: 'absolute',
    right: 16,
    left: 16,
    maxWidth: 380,
    alignSelf: 'flex-end',
    zIndex: 2,
    elevation: 50,
  },
  menuCardInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 8,
    shadowColor: 'rgba(15, 76, 68, 0.2)',
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 32,
    shadowOpacity: 1,
    elevation: 20,
  },

  // Header
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 76, 68, 0.06)',
  },
  menuTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.5)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 76, 68, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Menu Items
  menuItems: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuItemActive: {
    backgroundColor: 'rgba(15, 76, 68, 0.04)',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 76, 68, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuItemIconPremium: {
    backgroundColor: 'rgba(232, 169, 87, 0.12)',
  },
  menuItemIconLocked: {
    backgroundColor: 'rgba(156, 163, 175, 0.12)',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#0F3D3E',
    marginBottom: 2,
  },
  menuItemLabelPremium: {
    color: '#C4893D',
  },
  menuItemLabelLocked: {
    color: '#9CA3AF',
  },
  menuItemSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.5)',
  },
  menuItemSubtitleLocked: {
    color: 'rgba(156, 163, 175, 0.7)',
  },

  // Current Pill
  currentPill: {
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  currentPillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#0F4C44',
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    marginHorizontal: 20,
    marginVertical: 8,
  },

  // Subscription Section
  subscriptionSection: {
    paddingBottom: 8,
  },
});

export default AppMenuSheet;
