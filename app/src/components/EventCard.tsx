/**
 * EventCard Component - Ultra-Premium Casa Latina
 * Luxury event card with cinematic vignette and premium animations
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Event } from '../services/firebase/types';
import { t } from '../i18n';

interface EventCardProps extends Event {
  rsvpStatus?: 'going' | 'waitlist' | 'went' | null;
  onPress?: () => void;
  onRsvpPress?: () => void;
  isShowcase?: boolean;
  vibe?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  COCTEL_INTIMO: 'CÓCTEL ÍNTIMO',
  CENA_PRIVADA: 'CENA PRIVADA',
  ARTE_VINO: 'ARTE & VINO',
  NETWORKING: 'NETWORKING',
  MUSICA_EN_VIVO: 'MÚSICA EN VIVO',
  BRUNCH: 'BRUNCH',
};

export const EventCard: React.FC<EventCardProps> = ({
  title,
  city,
  neighborhood,
  category,
  date,
  time,
  membersOnly,
  spotsRemaining,
  attendingCount,
  imageUrl,
  rsvpStatus,
  onPress,
  onRsvpPress,
  isShowcase,
  vibe,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  // Premium animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(12)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;

  // Staggered fade-in animation
  useEffect(() => {
    theme.animations.cardFadeIn(opacityAnim, translateYAnim, 0).start();
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 280,
      delay: 50,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    theme.animations.buttonPress(scaleAnim).start();
  };

  const handlePressOut = () => {
    // Already handled by buttonPress animation
  };

  const getRsvpButtonText = (): string => {
    if (rsvpStatus === 'going') return t('rsvp_going');
    if (rsvpStatus === 'waitlist') return t('rsvp_waitlist');
    if (rsvpStatus === 'went') return t('rsvp_went');
    return t('rsvp_reserve');
  };

  const getRsvpButtonStyle = () => {
    if (rsvpStatus === 'went') {
      return [styles.rsvpButton, styles.rsvpButtonWent];
    }
    if (rsvpStatus === 'waitlist') {
      return [styles.rsvpButton, styles.rsvpButtonWaitlist];
    }
    return styles.rsvpButton;
  };

  const getRsvpButtonTextStyle = () => {
    if (rsvpStatus === 'went') {
      return [styles.rsvpButtonText, styles.rsvpButtonTextWent];
    }
    if (rsvpStatus === 'waitlist') {
      return [styles.rsvpButtonText, styles.rsvpButtonTextWaitlist];
    }
    return styles.rsvpButtonText;
  };

  // Generate member avatars
  const memberAvatars = Array.from({ length: Math.min(attendingCount, 5) }, (_, i) => ({
    id: i,
    initial: String.fromCharCode(65 + (i % 26)),
  }));

  // Clean category label
  const cleanCategory = category.replace(/_+/g, ' ').trim();
  const categoryLabel = CATEGORY_LABELS[category] || cleanCategory.toUpperCase();

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Event Image with Cinematic Vignette */}
        <View style={styles.imageContainer}>
          <Animated.Image 
            source={{ uri: imageUrl }} 
            style={[styles.image, { opacity: imageOpacity }]} 
            resizeMode="cover"
          />
          
          {/* Premium vertical vignette gradient - Enhanced for text legibility */}
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.35)', 'rgba(0, 0, 0, 0.65)']}
            locations={[0, 1]}
            style={styles.vignetteOverlay}
          />
          
          {/* Category Pill - Golden ring outline */}
          <View style={styles.categoryPill}>
            <View style={styles.categoryPillRing} />
            <Text style={styles.categoryPillText}>{categoryLabel}</Text>
          </View>
          
          {/* Title - Inside vignette zone */}
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>{title}</Text>
          </View>
        </View>

        {/* Event Details - Premium spacing */}
        <View style={styles.detailsContainer}>
          {/* Location */}
          <View style={styles.detailRow}>
            <Ionicons name="location" size={13} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>
              {neighborhood}
            </Text>
          </View>

          {/* Date & Time */}
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={13} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{date} · {time}</Text>
          </View>

          {/* Info Row - Premium spacing */}
          <View style={styles.infoRow}>
            {isShowcase && (
              <View style={styles.showcaseBadge}>
                <Text style={styles.showcaseBadgeText}>Featured</Text>
              </View>
            )}
            {membersOnly && !isShowcase && (
              <View style={styles.membersOnlyBadge}>
                <Text style={styles.membersOnlyText}>{t('event_members_only')}</Text>
              </View>
            )}
            {spotsRemaining > 0 ? (
              <Text style={styles.spotsText}>
                {t('event_spots_remaining', { count: spotsRemaining.toString() })}
              </Text>
            ) : (
              <Text style={styles.spotsText}>{t('event_full')}</Text>
            )}
          </View>

          {/* Vibe text for showcase events */}
          {isShowcase && vibe && (
            <Text style={styles.vibeText}>{vibe}</Text>
          )}

          {/* Member Avatars - Cleaner with more contrast */}
          {attendingCount > 0 && (
            <View style={styles.membersRow}>
              <View style={styles.avatarsContainer}>
                {memberAvatars.map((member) => (
                  <View key={member.id} style={styles.avatar}>
                    <Text style={styles.avatarText}>{member.initial}</Text>
                  </View>
                ))}
                {attendingCount > 5 && (
                  <View style={styles.moreAvatars}>
                    <Text style={styles.moreAvatarsText}>+{attendingCount - 5}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.membersText}>
                {t('event_members_count', { count: attendingCount.toString() })}
              </Text>
            </View>
          )}

          {/* RSVP Button - Soft cream */}
          <TouchableOpacity
            style={getRsvpButtonStyle()}
            onPress={onRsvpPress || onPress}
            activeOpacity={0.85}
          >
            <Text style={getRsvpButtonTextStyle()}>{getRsvpButtonText()}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl, // Refined corners consistent with global design
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.cardGap, // 20px gap
    overflow: 'hidden',
    ...theme.shadows.md, // Soft shadow
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  vignetteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  categoryPill: {
    position: 'absolute',
    top: theme.spacing.lg,
    left: theme.spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(243, 232, 209, 0.40)',
    paddingHorizontal: theme.spacing.md + 4,
    paddingVertical: theme.spacing.xs + 4,
    borderRadius: theme.borderRadius.round,
    overflow: 'hidden',
  },
  categoryPillRing: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 0.5,
    borderColor: theme.colors.warmGold + '40',
    borderRadius: theme.borderRadius.round,
  },
  categoryPillText: {
    ...theme.typography.labelSmall,
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  titleContainer: {
    position: 'absolute',
    bottom: theme.spacing.lg + 4,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  title: {
    ...theme.typography.subsectionTitle,
    color: theme.colors.text,
    fontSize: 24,
    lineHeight: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  detailsContainer: {
    padding: theme.spacing.lg + 4, // Premium padding
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.metadataGap, // 12px gap
    gap: theme.spacing.sm,
  },
  detailText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs + 4,
    marginBottom: theme.spacing.md + 4,
    gap: theme.spacing.sm + 2,
    flexWrap: 'wrap',
  },
  membersOnlyBadge: {
    backgroundColor: theme.colors.darkGreen || '#0D2E1F', // Deep dark green background
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.premiumGold || '#D4AF37', // Bright gold border
    ...theme.shadows.sm,
  },
  membersOnlyText: {
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.premiumGold || '#D4AF37', // Bright metallic gold text
    fontSize: 11,
    fontWeight: '600',
  },
  showcaseBadge: {
    backgroundColor: 'rgba(213, 196, 161, 0.15)', // Soft cream background
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.softCream + '40',
  },
  showcaseBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.softCream,
    fontSize: 11,
    fontWeight: '600',
  },
  vibeText: {
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: theme.spacing.sm,
  },
  spotsText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm + 4,
    marginBottom: theme.spacing.lg + 4,
    gap: theme.spacing.sm + 2,
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.primary + '40',
    borderWidth: 2,
    borderColor: theme.colors.primary + '60',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  avatarText: {
    ...theme.typography.labelSmall,
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  moreAvatars: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  moreAvatarsText: {
    ...theme.typography.labelSmall,
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '500',
  },
  membersText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  rsvpButton: {
    backgroundColor: theme.colors.primary, // Original Champagne Gold
    paddingVertical: theme.spacing.md + 4,
    paddingHorizontal: theme.spacing.lg + 4,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xs + 4,
    ...theme.shadows.sm,
  },
  rsvpButtonWent: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rsvpButtonWaitlist: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.softCream + '60',
  },
  rsvpButtonText: {
    ...theme.typography.button,
    color: theme.colors.background,
    fontSize: 15,
  },
  rsvpButtonTextWent: {
    color: theme.colors.textSecondary,
  },
  rsvpButtonTextWaitlist: {
    color: theme.colors.primary,
  },
});
