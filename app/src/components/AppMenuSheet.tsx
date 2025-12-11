/**
 * App Menu Sheet - Hangover Shield
 * Premium command center overlay menu
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type CurrentScreen = 'today' | 'progress' | 'checkin';

export interface AppMenuSheetProps {
  visible: boolean;
  onClose: () => void;
  onGoToToday: () => void;
  onGoToProgress: () => void;
  onGoToCheckIn: () => void;
  onGoToSubscription: () => void;
  isPremium?: boolean;
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
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  subtitle,
  isActive = false,
  onPress,
  isPremiumItem = false,
}) => (
  <TouchableOpacity
    style={[styles.menuItem, isActive && styles.menuItemActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.menuItemIcon, isPremiumItem && styles.menuItemIconPremium]}>
      <Ionicons
        name={icon as any}
        size={20}
        color={isPremiumItem ? '#E8A957' : '#0F4C44'}
      />
    </View>
    <View style={styles.menuItemContent}>
      <Text style={[styles.menuItemLabel, isPremiumItem && styles.menuItemLabelPremium]}>
        {label}
      </Text>
      <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
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
  onGoToToday,
  onGoToProgress,
  onGoToCheckIn,
  onGoToSubscription,
  isPremium = false,
  currentScreen,
}) => {
  const insets = useSafeAreaInsets();
  
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

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Animated.View
          style={[
            styles.backdropInner,
            { opacity: backdropOpacity },
          ]}
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
        pointerEvents="box-none"
      >
        <View style={styles.menuCardInner}>
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
            <MenuItem
              icon="sunny-outline"
              label="Today's recovery plan"
              subtitle="See today's steps and hydration goals."
              isActive={currentScreen === 'today'}
              onPress={() => {
                handleClose();
                setTimeout(onGoToToday, 200);
              }}
            />

            <MenuItem
              icon="stats-chart-outline"
              label="Progress & history"
              subtitle="Track your streak and recent days."
              isActive={currentScreen === 'progress'}
              onPress={() => {
                handleClose();
                setTimeout(onGoToProgress, 200);
              }}
            />

            <MenuItem
              icon="clipboard-outline"
              label="Daily check-in"
              subtitle="Update how you're feeling today."
              isActive={currentScreen === 'checkin'}
              onPress={() => {
                handleClose();
                setTimeout(onGoToCheckIn, 200);
              }}
            />
          </View>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Subscription Item */}
          <View style={styles.subscriptionSection}>
            <MenuItem
              icon={isPremium ? 'settings-outline' : 'star-outline'}
              label={isPremium ? 'Manage subscription' : 'Upgrade to Premium'}
              subtitle={isPremium ? 'View or update your plan.' : 'Unlock full recovery guidance.'}
              isPremiumItem={!isPremium}
              onPress={() => {
                handleClose();
                setTimeout(onGoToSubscription, 200);
              }}
            />
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
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
  menuItemContent: {
    flex: 1,
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
  menuItemSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.5)',
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

