/**
 * User Data Store - Hangover Shield
 * Zustand store for hydration, check-ins, and recovery tracking
 */

import { create } from 'zustand';
import { WaterEntry } from '../features/water/waterTypes';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CheckInData {
  symptoms: string[];
  microStep: string;
  energy: string;
  completed: boolean;
  severity?: 'mild' | 'moderate' | 'severe' | 'none';
  timestamp?: number;
}

export interface HydrationLog {
  [dateId: string]: WaterEntry[];
}

export interface UserDataState {
  // Hydration
  hydrationGoal: number;
  hydrationLogs: HydrationLog;
  todayHydrationTotal: number;
  yesterdayHydrationTotal: number;

  // Check-ins
  checkInToday: CheckInData | null;
  checkInYesterday: CheckInData | null;

  // Streak & Progress
  streak: number;
  microStepToday: string | null;

  // UI
  motivationalHeader: string;

  // Actions
  setHydrationGoal: (goal: number) => void;
  addHydrationEntry: (dateId: string, entry: WaterEntry) => void;
  setHydrationLogs: (logs: HydrationLog) => void;
  setCheckInToday: (checkIn: CheckInData | null) => void;
  setCheckInYesterday: (checkIn: CheckInData | null) => void;
  setStreak: (streak: number) => void;
  pickMotivationalHeader: () => void;
  computeRecoveryScore: () => number;
  calculateTodayTotal: () => void;
  calculateYesterdayTotal: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Motivational Headers
// ─────────────────────────────────────────────────────────────────────────────

const MOTIVATIONAL_HEADERS = [
  "You're doing better than you think.",
  "One small step today is enough.",
  "You're healing — keep going softly.",
  "Consistency beats intensity.",
  "Every choice you make today matters.",
  "You showed up — that already counts.",
  "You're building a stronger you.",
  "Today is a fresh start.",
  "Your body is grateful for your effort.",
  "Hydration is healing — keep going.",
];

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

const getTodayId = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getYesterdayId = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

const calculateTotalMl = (entries: WaterEntry[]): number => {
  return entries.reduce((sum, entry) => sum + entry.amountMl, 0);
};

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

export const useUserDataStore = create<UserDataState>((set, get) => ({
  // Initial State
  hydrationGoal: 1500,
  hydrationLogs: {},
  todayHydrationTotal: 0,
  yesterdayHydrationTotal: 0,
  checkInToday: null,
  checkInYesterday: null,
  streak: 0,
  microStepToday: null,
  motivationalHeader: MOTIVATIONAL_HEADERS[0],

  // Actions
  setHydrationGoal: (goal: number) => {
    set({ hydrationGoal: goal });
  },

  addHydrationEntry: (dateId: string, entry: WaterEntry) => {
    set((state) => {
      const updatedLogs = { ...state.hydrationLogs };
      if (!updatedLogs[dateId]) {
        updatedLogs[dateId] = [];
      }
      updatedLogs[dateId] = [...updatedLogs[dateId], entry];

      return { hydrationLogs: updatedLogs };
    });

    // Recalculate totals
    get().calculateTodayTotal();
    get().calculateYesterdayTotal();
  },

  setHydrationLogs: (logs: HydrationLog) => {
    set({ hydrationLogs: logs });
    get().calculateTodayTotal();
    get().calculateYesterdayTotal();
  },

  setCheckInToday: (checkIn: CheckInData | null) => {
    set({
      checkInToday: checkIn,
      microStepToday: checkIn?.microStep || null,
    });
  },

  setCheckInYesterday: (checkIn: CheckInData | null) => {
    set({ checkInYesterday: checkIn });
  },

  setStreak: (streak: number) => {
    set({ streak });
  },

  pickMotivationalHeader: () => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_HEADERS.length);
    set({ motivationalHeader: MOTIVATIONAL_HEADERS[randomIndex] });
  },

  calculateTodayTotal: () => {
    const state = get();
    const todayId = getTodayId();
    const todayEntries = state.hydrationLogs[todayId] || [];
    const total = calculateTotalMl(todayEntries);
    set({ todayHydrationTotal: total });
  },

  calculateYesterdayTotal: () => {
    const state = get();
    const yesterdayId = getYesterdayId();
    const yesterdayEntries = state.hydrationLogs[yesterdayId] || [];
    const total = calculateTotalMl(yesterdayEntries);
    set({ yesterdayHydrationTotal: total });
  },

  computeRecoveryScore: () => {
    const state = get();
    let score = 60; // Base score

    // Completed today's check-in
    if (state.checkInToday?.completed) {
      score += 20;
    }

    // Logged at least 50% hydration
    const halfGoal = state.hydrationGoal * 0.5;
    if (state.todayHydrationTotal >= halfGoal) {
      score += 10;
    }

    // Reached daily hydration goal
    if (state.todayHydrationTotal >= state.hydrationGoal) {
      score += 10;
    }

    // Streak ≥ 2
    if (state.streak >= 2) {
      score += 3;
    }

    return Math.min(score, 100); // Cap at 100
  },
}));
