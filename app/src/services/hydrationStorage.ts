/**
 * Local Hydration Storage (AsyncStorage)
 * Keeps hydration logs available when offline / no user.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { WaterEntry } from '../features/water/waterTypes';
import { getTodayId } from '../utils/dateUtils';

const getKey = (dateId: string) => `hydrationLog:${dateId}`;
const GOAL_KEY = 'hydrationGoalMl';

export const getLocalHydrationEntries = async (dateId?: string): Promise<WaterEntry[]> => {
  const target = dateId || getTodayId();
  try {
    const stored = await AsyncStorage.getItem(getKey(target));
    if (!stored) return [];
    return JSON.parse(stored) as WaterEntry[];
  } catch (error) {
    console.error('[hydrationStorage] getLocalHydrationEntries error:', error);
    return [];
  }
};

export const saveLocalHydrationEntries = async (
  dateId: string,
  entries: WaterEntry[]
): Promise<void> => {
  try {
    await AsyncStorage.setItem(getKey(dateId), JSON.stringify(entries));
  } catch (error) {
    console.error('[hydrationStorage] saveLocalHydrationEntries error:', error);
  }
};

export const addLocalHydrationEntry = async (
  dateId: string,
  entry: WaterEntry
): Promise<void> => {
  try {
    const current = await getLocalHydrationEntries(dateId);
    current.push(entry);
    await saveLocalHydrationEntries(dateId, current);
  } catch (error) {
    console.error('[hydrationStorage] addLocalHydrationEntry error:', error);
  }
};

export const getLocalHydrationGoal = async (): Promise<number | null> => {
  try {
    const stored = await AsyncStorage.getItem(GOAL_KEY);
    if (!stored) return null;
    return Number(stored);
  } catch (error) {
    console.error('[hydrationStorage] getLocalHydrationGoal error:', error);
    return null;
  }
};

export const saveLocalHydrationGoal = async (goalMl: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(GOAL_KEY, String(goalMl));
  } catch (error) {
    console.error('[hydrationStorage] saveLocalHydrationGoal error:', error);
  }
};

