/**
 * Welcome Unlock Service - Hangover Shield
 * Manages 24h welcome unlock stored in Firestore
 *
 * Grant timing: First completion of feeling onboarding
 * Duration: Exactly 24 hours from grant timestamp
 * Storage: Firestore users/{uid}.welcomeUnlock
 */

import { doc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserDoc } from '../models/firestore';

const WELCOME_UNLOCK_MS = 24 * 60 * 60 * 1000; // 24 hours exact

/**
 * Grant 24h welcome unlock (idempotent)
 * Only grants if not already granted
 */
export async function grantWelcomeUnlock(uid: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error('[WelcomeUnlock] User document does not exist:', uid);
      return;
    }

    const userData = userSnap.data() as UserDoc;

    // Idempotency check - only grant once
    if (userData.welcomeUnlock?.granted === true) {
      console.log('[WelcomeUnlock] Already granted, skipping');
      return;
    }

    // Calculate expiry (24h from now)
    const expiresAt = Timestamp.fromMillis(Date.now() + WELCOME_UNLOCK_MS);

    // Grant unlock
    await updateDoc(userRef, {
      'welcomeUnlock.granted': true,
      'welcomeUnlock.startedAt': serverTimestamp(),
      'welcomeUnlock.expiresAt': expiresAt,
      'welcomeUnlock.version': 1,
    });

    console.log('[WelcomeUnlock] Granted successfully', {
      expiresAt: expiresAt.toDate(),
      durationMs: WELCOME_UNLOCK_MS,
    });
  } catch (error) {
    console.error('[WelcomeUnlock] Error granting unlock:', error);
    throw error;
  }
}

/**
 * Check if welcome unlock is currently active
 */
export function isWelcomeUnlockActive(userDoc: UserDoc | null): boolean {
  if (!userDoc?.welcomeUnlock?.granted) {
    return false;
  }

  const now = Date.now();
  const expiresMs = userDoc.welcomeUnlock.expiresAt?.toMillis?.() ?? 0;

  return now < expiresMs;
}

/**
 * Get time remaining for welcome unlock in milliseconds
 * Returns 0 if not active or expired
 */
export function getWelcomeUnlockTimeRemaining(userDoc: UserDoc | null): number {
  if (!userDoc?.welcomeUnlock?.granted || !userDoc.welcomeUnlock.expiresAt) {
    return 0;
  }

  const now = Date.now();
  const expiresMs = userDoc.welcomeUnlock.expiresAt.toMillis();
  const remaining = expiresMs - now;

  return Math.max(0, remaining);
}

/**
 * Get expiry timestamp for welcome unlock
 */
export function getWelcomeUnlockExpiresAt(userDoc: UserDoc | null): number | null {
  if (!userDoc?.welcomeUnlock?.expiresAt) {
    return null;
  }

  return userDoc.welcomeUnlock.expiresAt.toMillis();
}

/**
 * Format time remaining as "HHh MMm"
 */
export function formatWelcomeUnlockTimeRemaining(ms: number): string {
  if (ms <= 0) {
    return 'Expired';
  }

  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return 'Less than 1m';
  }
}

/**
 * Check if user has been granted welcome unlock (even if expired)
 */
export function hasBeenGrantedWelcomeUnlock(userDoc: UserDoc | null): boolean {
  return userDoc?.welcomeUnlock?.granted === true;
}
