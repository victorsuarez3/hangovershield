/**
 * Event Details Screen - Ultra-Premium Casa Latina
 * Luxury event details with editorial-grade design
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { EventDetailsScreenProps } from '../navigation/types';
import { useEvent } from '../hooks/useEvent';
import { reserveEvent, cancelReservation, CancelReservationResult } from '../services/events';
import { useAuth } from '../providers/AuthProvider';
import { showAlert } from '../utils/alert';
import { EventDoc } from '../models/firestore';
import { t } from '../i18n';
import { Timestamp } from 'firebase/firestore';


const CATEGORY_LABELS: Record<string, string> = {
  COCTEL_INTIMO: 'CÓCTEL ÍNTIMO',
  CENA_PRIVADA: 'CENA PRIVADA',
  ARTE_VINO: 'ARTE & VINO',
  NETWORKING: 'NETWORKING',
  MUSICA_EN_VIVO: 'MÚSICA EN VIVO',
  BRUNCH: 'BRUNCH',
};

export const EventDetailsScreen: React.FC<EventDetailsScreenProps> = ({ route, navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const styles = createStyles(theme, insets.bottom);

  const { eventId } = route.params;
  
  // Use real-time event hook with caching
  const { event, loading, status, isAttending, capacityLeft } = useEvent(eventId);

  // Fade in animation
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const imageOpacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (event && !loading) {
      // Animate in when event loads
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(imageOpacity, {
          toValue: 1,
          duration: 280,
          delay: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [event, loading]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="Events"
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <Header
          title="Events"
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event not found</Text>
        </View>
      </View>
    );
  }


  const handleEnroll = async () => {
    if (!user) {
      showAlert('Sign In Required', 'Please sign in to reserve a spot', 'info');
      return;
    }

    if (!event) {
      return;
    }

    // For featured events, show success without Firestore write
    if (event.isShowcase || event.id.startsWith('showcase-')) {
      showAlert('Reservation Confirmed', 'You have successfully reserved a spot for this experience.', 'success');
      return;
    }

    try {
      if (isAttending) {
        // Cancel reservation
        const result: CancelReservationResult = await cancelReservation(event.id, user.uid);
        if (result === 'canceled') {
          showAlert('Reservation Canceled', 'Your reservation has been canceled', 'success');
        } else if (result === 'not_attending') {
          showAlert('Not Attending', 'You are not registered for this event', 'info');
        } else {
          showAlert('Error', 'Failed to cancel reservation. Please try again.', 'error');
        }
      } else if (status === 'full') {
        showAlert('Event Full', 'This event is at capacity', 'info');
      } else {
        // Reserve spot with retry mechanism
        const result = await reserveEvent(event.id, user.uid);
        if (result === 'reserved') {
          showAlert('Reservation Confirmed', 'You have successfully reserved a spot', 'success');
        } else if (result === 'already_reserved') {
          showAlert('Already Reserved', 'You already have a reservation for this event', 'info');
        } else if (result === 'full') {
          showAlert('Event Full', 'This event is now at capacity', 'info');
        } else {
          showAlert('Error', 'Failed to reserve spot. Please try again.', 'error');
        }
      }
    } catch (error) {
      console.error('Error handling enrollment:', error);
      showAlert('Error', 'An unexpected error occurred. Please try again.', 'error');
    }
  };

  // Generate member avatars from attendees
  const attendeesCount = event.attendees?.length || 0;
  const memberAvatars = Array.from({ length: Math.min(attendeesCount, 5) }, (_, i) => ({
    id: i,
    initial: String.fromCharCode(65 + (i % 26)),
  }));

  // Format date and time
  const eventDate = event.date instanceof Timestamp 
    ? event.date.toDate() 
    : new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('es-ES', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  });
  const formattedTime = eventDate.toLocaleTimeString('es-ES', { 
    hour: 'numeric', 
    minute: '2-digit' 
  });

  // Clean category label
  const categoryType = event.type || '';
  const cleanCategory = categoryType.replace(/_+/g, ' ').trim();
  const categoryLabel = CATEGORY_LABELS[categoryType] || cleanCategory.toUpperCase();
  
  // Use capacityLeft from hook
  const spotsRemaining = capacityLeft;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Header
        title="Events"
        showBack
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Event Image - Premium */}
        <View style={styles.imageContainer}>
          <Animated.Image 
            source={{ uri: event.image || event.coverImageUrl || '' }} 
            style={[styles.image, { opacity: imageOpacity }]} 
            resizeMode="cover"
          />
          
          {/* Soft vignette overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.85)']}
            locations={[0, 0.5, 1]}
            style={styles.imageGradient}
          />
          
          {/* Category Pill */}
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{categoryLabel}</Text>
          </View>
          
          {/* Price/Members Badge */}
          {(event.membersOnly || spotsRemaining > 0) && (
            <View style={[
              styles.priceBadge,
              event.membersOnly && styles.priceBadgeMembersOnly
            ]}>
              <Text style={[
                styles.priceText,
                event.membersOnly && styles.priceTextMembersOnly
              ]}>
                {event.membersOnly ? t('event_members_only') : `${spotsRemaining} spots`}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Event Title - Premium typography */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Event Info */}
          <View style={styles.eventInfo}>
            <View style={styles.infoRow}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.infoText}>{formattedDate} · {formattedTime}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.infoText}>
                {event.city || 'Miami'} · {event.location}
              </Text>
            </View>
          </View>

          {/* Organizer Card - Premium */}
          <View style={styles.organizerCard}>
            <View style={styles.organizerAvatar}>
              <Text style={styles.organizerAvatarText}>A</Text>
            </View>
            <View style={styles.organizerInfo}>
              <Text style={styles.organizerName}>Andrew Ainsley</Text>
              <Text style={styles.organizerLocation}>
                {event.city || 'Miami'} · {event.location}
              </Text>
              <Text style={styles.organizerEvents}>25 Event</Text>
            </View>
          </View>


          {/* Description */}
          <View style={styles.description}>
            <Text style={styles.descriptionText}>
              {event.description || `Join us for an exclusive ${event.title} experience. Connect with fellow Casa Latina members in one of Miami's most sought-after venues. Limited spots available for this members-only gathering.`}
            </Text>
          </View>

          {/* Vibe & Dress Code - for featured events */}
          {(event.vibe || event.dressCode) && (
            <View style={styles.eventExtras}>
              {event.vibe && (
                <View style={styles.extraRow}>
                  <Ionicons name="sparkles-outline" size={16} color={theme.colors.softCream} />
                  <Text style={styles.extraText}>{event.vibe}</Text>
                </View>
              )}
              {event.dressCode && (
                <View style={styles.extraRow}>
                  <Ionicons name="shirt-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.extraText}>{event.dressCode}</Text>
                </View>
              )}
            </View>
          )}

          {/* Members Section - Premium */}
          <View style={styles.membersSection}>
            <Text style={styles.membersTitle}>{t('event_details_member')}</Text>
            <View style={styles.membersContainer}>
              <View style={styles.memberAvatars}>
                {memberAvatars.map((member) => (
                  <View key={member.id} style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>{member.initial}</Text>
                  </View>
                ))}
                {attendeesCount > 5 && (
                  <View style={styles.moreMembers}>
                    <Text style={styles.moreMembersText}>
                      {attendeesCount - 5}+
                    </Text>
                  </View>
                )}
              </View>
              <Button
                title={
                  isAttending 
                    ? 'Cancel Reservation' 
                    : status === 'full' 
                    ? 'Event Full' 
                    : t('event_details_enroll')
                }
                onPress={handleEnroll}
                variant={isAttending ? 'outline' : 'primary'}
                fullWidth={false}
                style={styles.enrollButton}
                disabled={status === 'full' && !isAttending}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const createStyles = (theme: any, bottomInset: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: bottomInset + 120,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 320, // Generous height
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  categoryPill: {
    position: 'absolute',
    top: theme.spacing.lg,
    left: theme.spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: theme.colors.warmGold,
    paddingHorizontal: theme.spacing.md + 2,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.borderRadius.round,
  },
  categoryPillText: {
    ...theme.typography.labelSmall,
    color: theme.colors.softCream,
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  priceBadge: {
    position: 'absolute',
    top: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.softCream,
    paddingHorizontal: theme.spacing.md + 2,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.borderRadius.round,
    ...theme.shadows.sm,
  },
  priceBadgeMembersOnly: {
    backgroundColor: theme.colors.darkGreen || '#0D2E1F', // Deep dark green background
    borderWidth: 1,
    borderColor: theme.colors.premiumGold || '#D4AF37', // Bright gold border
  },
  priceText: {
    ...theme.typography.label,
    color: theme.colors.pureBlack,
    fontSize: 12,
  },
  priceTextMembersOnly: {
    color: theme.colors.premiumGold || '#D4AF37', // Bright metallic gold text
  },
  content: {
    padding: theme.spacing.lg, // Premium padding
  },
  title: {
    ...theme.typography.sectionTitle,
    color: theme.colors.text,
    marginBottom: theme.spacing.titleMargin, // Editorial spacing
  },
  eventInfo: {
    gap: theme.spacing.sm + 2,
    marginBottom: theme.spacing.lg + 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  infoText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontSize: 15,
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg + 4,
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },
  organizerAvatar: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.softCream + '25',
    borderWidth: 1.5,
    borderColor: theme.colors.warmGold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  organizerAvatarText: {
    ...theme.typography.subsectionTitle,
    color: theme.colors.softCream,
    fontSize: 26,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    ...theme.typography.subsectionTitle,
    color: theme.colors.text,
    fontSize: 20,
    marginBottom: theme.spacing.xs,
  },
  organizerLocation: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs / 2,
  },
  organizerEvents: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
  },
  description: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl + 4,
  },
  descriptionText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 26,
  },
  eventExtras: {
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.sm + 2,
  },
  extraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  extraText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  membersSection: {
    marginTop: theme.spacing.md + 4,
    marginBottom: theme.spacing.xl,
  },
  membersTitle: {
    ...theme.typography.subsectionTitle,
    color: theme.colors.text,
    fontSize: 20,
    marginBottom: theme.spacing.lg,
  },
  membersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  memberAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: -theme.spacing.sm,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.softCream + '30',
    borderWidth: 1.5,
    borderColor: theme.colors.softCream + '50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -6,
  },
  memberAvatarText: {
    ...theme.typography.label,
    color: theme.colors.softCream,
    fontSize: 13,
    fontWeight: '600',
  },
  moreMembers: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    marginLeft: -6,
  },
  moreMembersText: {
    ...theme.typography.labelSmall,
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  enrollButton: {
    minWidth: 150,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
});
