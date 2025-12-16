/**
 * Daily Check-In Types - Hangover Shield
 * Data models for daily habit tracking and check-in system
 */

// ─────────────────────────────────────────────────────────────────────────────
// Core Types
// ─────────────────────────────────────────────────────────────────────────────

export type HangoverSeverity = 'mild' | 'moderate' | 'severe' | 'none';

export type DailyCheckIn = {
  id: string;
  userId: string;
  date: string; // 'YYYY-MM-DD', local user date
  createdAt: number; // timestamp (ms)
  severity: HangoverSeverity;
  symptoms: string[]; // ['Headache', 'Nausea', ...]
  notes?: string;
};

export type HabitStats = {
  userId: string;
  currentStreak: number; // consecutive days with a check-in up to today
  longestStreak: number;
  monthlyCheckIns: number; // for the current month
  lastCheckInDate?: string; // 'YYYY-MM-DD'
  updatedAt: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper Types
// ─────────────────────────────────────────────────────────────────────────────

export type CheckInMode = 'onboarding' | 'daily';

export interface DailyInsight {
  heading: string;
  subheading: string;
  severitySummary: string;
  symptomsSummary: string;
  bodyInsight: string;
  microStep: string;
}
