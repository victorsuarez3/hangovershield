/**
 * Local Hydration Storage (AsyncStorage)
 * Keeps hydration logs available when offline / no user.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { WaterEntry } from '../features/water/waterTypes';
import { getTodayId } from '../utils/dateUtils';
import { DEBUG_PERSISTENCE } from '../config/flags';

const getKey = (dateId: string) => `hydrationLog:${dateId}`;
const GOAL_KEY = 'hydrationGoalMl';

export const getLocalHydrationEntries = async (dateId?: string): Promise<WaterEntry[]> => {
  const target = dateId || getTodayId();
  try {
    const stored = await AsyncStorage.getItem(getKey(target));
    if (!stored) {
      if (DEBUG_PERSISTENCE) {
        console.log('[hydrationStorage] load miss', { key: getKey(target) });
      }
      return [];
    }
    if (DEBUG_PERSISTENCE) {
      console.log('[hydrationStorage] load hit', { key: getKey(target) });
    }
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
    if (DEBUG_PERSISTENCE) {
      console.log('[hydrationStorage] save', { key: getKey(dateId), count: entries.length });
    }
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
    if (DEBUG_PERSISTENCE) {
      console.log('[hydrationStorage] add entry', { key: getKey(dateId), total: current.length });
    }
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

