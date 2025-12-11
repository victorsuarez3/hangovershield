/**
 * RSVP Filter Chips Component - Premium Design
 * Filters events by RSVP status with micro-interactions
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { t } from '../i18n';

export type RsvpFilter = 'all' | 'going' | 'went';

interface RsvpFilterChipsProps {
  selectedFilter: RsvpFilter;
  onFilterChange: (filter: RsvpFilter) => void;
}

const filters: { id: RsvpFilter; labelKey: string }[] = [
  { id: 'all', labelKey: 'filter_all' },
  { id: 'going', labelKey: 'filter_going' },
  { id: 'went', labelKey: 'filter_went' },
];

export const RsvpFilterChips: React.FC<RsvpFilterChipsProps> = ({
  selectedFilter,
  onFilterChange,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {filters.map((filter) => {
        const isSelected = filter.id === selectedFilter;
        const scaleAnim = React.useRef(new Animated.Value(1)).current;

        const handlePressIn = () => {
          Animated.spring(scaleAnim, {
            toValue: isSelected ? 0.98 : 1.02,
            useNativeDriver: true,
            damping: 15,
            stiffness: 200,
          }).start();
        };

        const handlePressOut = () => {
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            damping: 15,
            stiffness: 200,
          }).start();
        };

        return (
          <Animated.View
            key={filter.id}
            style={[{ transform: [{ scale: scaleAnim }] }]}
          >
            <TouchableOpacity
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
              ]}
              onPress={() => onFilterChange(filter.id)}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={1}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                ]}
              >
                {t(filter.labelKey)}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md + 4, // More breathing room
    paddingBottom: theme.spacing.lg, // Larger bottom margin
    gap: theme.spacing.sm + 2,
  },
  chip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
  },
  chipSelected: {
    backgroundColor: theme.colors.primary + 'E6', // Lighter gold (230/255 opacity)
    borderWidth: 1,
    borderColor: 'rgba(243, 232, 209, 0.15)', // Softer border
    shadowColor: 'rgba(243, 232, 209, 0.25)', // Ultra-soft shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  chipText: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    fontSize: 14,
    opacity: 0.65, // Lower contrast for unselected
  },
  chipTextSelected: {
    ...theme.typography.label,
    color: theme.colors.background,
    fontWeight: '500', // Not heavy
    opacity: 1,
  },
});
