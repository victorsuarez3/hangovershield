/**
 * Date Utilities - Hangover Shield
 * Helper functions for date handling
 */

/**
 * Get today's date ID in YYYY-MM-DD format using user's local timezone
 * Used as document ID for daily check-ins
 */
export const getTodayId = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get a date ID for a specific Date object
 */
export const getDateId = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Check if a date string is today
 */
export const isToday = (dateId: string): boolean => {
  return dateId === getTodayId();
};

/**
 * Format a date ID for display (e.g., "Wed, Dec 11")
 */
export const formatDateForDisplay = (dateId: string): string => {
  const [year, month, day] = dateId.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

