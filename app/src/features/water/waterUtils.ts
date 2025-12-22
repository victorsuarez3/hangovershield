/**
 * Water Tracking Utilities - Hangover Shield
 * Helper functions for water logging
 */

import { WaterEntry, WaterLog } from './waterTypes';

// ─────────────────────────────────────────────────────────────────────────────
// Date Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get today's date key (YYYY-MM-DD)
 */
export const getTodayKey = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

/**
 * Format timestamp to time string (e.g., "2:30 PM")
 */
export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Calculation Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate total ml from an array of water entries
 */
export const calculateTotalMl = (entries: WaterEntry[]): number => {
  return entries.reduce((sum, entry) => sum + entry.amountMl, 0);
};

/**
 * Calculate progress percentage toward goal
 */
export const calculateProgress = (totalMl: number, goalMl: number): number => {
  return Math.min((totalMl / goalMl) * 100, 100);
};

/**
 * Get remaining ml to reach goal
 */
export const getRemainingMl = (totalMl: number, goalMl: number): number => {
  return Math.max(goalMl - totalMl, 0);
};

/**
 * Hydration relief milestone copy based on progress
 */
export const getHydrationMilestone = (totalMl: number, goalMl: number): string => {
  if (goalMl <= 0) return 'Start with a small sip.';
  const pct = totalMl / goalMl;
  if (pct <= 0) return 'Start with a small sip.';
  if (pct < 0.25) return 'Let’s bring some calm back in.';
  if (pct < 0.6) return 'Your system is starting to settle.';
  if (pct < 1) return 'You’re giving your body what it needs.';
  return "Nice. Your body's supported.";
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data (TODO: Remove when Firestore is fully integrated)
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_ENTRIES: WaterEntry[] = [
  {
    id: 'entry-1',
    amountMl: 250,
    timestamp: new Date().setHours(8, 30, 0, 0),
    note: 'Morning hydration',
  },
  {
    id: 'entry-2',
    amountMl: 500,
    timestamp: new Date().setHours(10, 15, 0, 0),
  },
  {
    id: 'entry-3',
    amountMl: 250,
    timestamp: new Date().setHours(12, 45, 0, 0),
    note: 'With lunch',
  },
];

/**
 * Get mock water log for today (for visual testing)
 */
export const getMockTodayWaterLog = (): WaterLog => {
  const todayKey = getTodayKey();
  const totalMl = calculateTotalMl(MOCK_ENTRIES);

  return {
    userId: 'mock-user',
    dateId: todayKey,
    entries: MOCK_ENTRIES,
    goalMl: 1500,
    totalMl,
    createdAt: MOCK_ENTRIES[0]?.timestamp || Date.now(),
    updatedAt: Date.now(),
  };
};

/**
 * Create a new water entry
 */
export const createWaterEntry = (amountMl: number, note?: string): WaterEntry => {
  return {
    id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    amountMl,
    timestamp: Date.now(),
    note,
  };
};
