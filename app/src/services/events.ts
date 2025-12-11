/**
 * Events Service - Casa Latina Premium
 * Firestore operations for events, reservations, and attendees
 */

import {
  collection,
  doc,
  query,
  orderBy,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { EventDoc, ReservationDoc } from '../models/firestore';

const EVENTS_COLLECTION = 'events';
const RESERVATIONS_COLLECTION = 'reservations';

export type ReservationResult = 'reserved' | 'already_reserved' | 'full' | 'error';
export type CancelReservationResult = 'canceled' | 'not_attending' | 'error';

// In-memory lock to prevent double-tap reservations
const reservationLocks = new Map<string, boolean>();

/**
 * Custom error for event full
 */
export class EventFullError extends Error {
  code = 'EVENT_FULL';
  constructor(message: string) {
    super(message);
    this.name = 'EventFullError';
  }
}

/**
 * Get all events ordered by date (ascending)
 * Returns a real-time stream using onSnapshot
 */
export const getEvents = (
  callback: (events: EventDoc[]) => void
): (() => void) => {
  const eventsRef = collection(db, EVENTS_COLLECTION);
  const q = query(eventsRef, orderBy('date', 'asc'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const events: EventDoc[] = [];
      snapshot.forEach((docSnap) => {
        events.push({
          id: docSnap.id,
          ...docSnap.data(),
        } as EventDoc);
      });
      callback(events);
    },
    (error) => {
      console.error('Error fetching events:', error);
      callback([]);
    }
  );

  return unsubscribe;
};

/**
 * Get a single event by ID
 */
export const getEventById = async (eventId: string): Promise<EventDoc | null> => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    const eventSnap = await getDoc(eventRef);

    if (eventSnap.exists()) {
      return {
        id: eventSnap.id,
        ...eventSnap.data(),
      } as EventDoc;
    }

    return null;
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    return null;
  }
};

/**
 * Subscribe to a single event by ID (real-time updates)
 */
export const subscribeToEvent = (
  eventId: string,
  callback: (event: EventDoc | null) => void
): (() => void) => {
  const eventRef = doc(db, EVENTS_COLLECTION, eventId);

  const unsubscribe = onSnapshot(
    eventRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({
          id: snapshot.id,
          ...snapshot.data(),
        } as EventDoc);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error subscribing to event:', error);
      callback(null);
    }
  );

  return unsubscribe;
};

/**
 * Reserve a spot for an event
 * Uses Firestore transactions to ensure atomicity
 * Includes double-tap prevention and retry mechanism
 */
export const reserveEvent = async (
  eventId: string,
  userId: string,
  retries: number = 3
): Promise<ReservationResult> => {
  const lockKey = `${eventId}:${userId}`;

  // Prevent double-tap
  if (reservationLocks.get(lockKey)) {
    return 'error';
  }

  try {
    reservationLocks.set(lockKey, true);

    const eventRef = doc(db, EVENTS_COLLECTION, eventId);

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < retries) {
      try {
        const result = await runTransaction(db, async (transaction) => {
          const eventSnap = await transaction.get(eventRef);

          if (!eventSnap.exists()) {
            throw new Error('Event not found');
          }

          const eventData = eventSnap.data() as EventDoc;
          const attendees = eventData.attendees || [];

          // Check if user is already attending
          if (attendees.includes(userId)) {
            return 'already_reserved' as ReservationResult;
          }

          // Check if event is full - throw custom error
          if (attendees.length >= eventData.capacity) {
            throw new EventFullError('Event is at capacity');
          }

          // Add user to attendees array
          const newAttendees = [...attendees, userId];

          // Update event document
          transaction.update(eventRef, {
            attendees: newAttendees,
            updatedAt: serverTimestamp(),
          });

          // Create reservation document
          const reservationRef = doc(collection(db, RESERVATIONS_COLLECTION));
          transaction.set(reservationRef, {
            id: reservationRef.id,
            userId,
            eventId,
            createdAt: serverTimestamp(),
          });

          return 'reserved' as ReservationResult;
        });

        reservationLocks.delete(lockKey);
        return result;
      } catch (error: any) {
        lastError = error;

        // If it's an EventFullError, don't retry
        if (error instanceof EventFullError || error.code === 'EVENT_FULL') {
          reservationLocks.delete(lockKey);
          throw error;
        }

        // Retry on transaction conflicts
        if (error.code === 'failed-precondition' || error.code === 'aborted') {
          attempt++;
          if (attempt < retries) {
            // Exponential backoff: wait 100ms * 2^attempt
            await new Promise((resolve) =>
              setTimeout(resolve, 100 * Math.pow(2, attempt))
            );
            continue;
          }
        }

        // For other errors, don't retry
        throw error;
      }
    }

    reservationLocks.delete(lockKey);
    return 'error';
  } catch (error: any) {
    reservationLocks.delete(lockKey);

    if (error instanceof EventFullError || error.code === 'EVENT_FULL') {
      return 'full';
    }

    console.error('Error reserving event:', error);
    return 'error';
  }
};

/**
 * Cancel a reservation for an event
 * Uses transactions to ensure atomicity
 * Returns detailed status
 */
export const cancelReservation = async (
  eventId: string,
  userId: string
): Promise<CancelReservationResult> => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);

    const result = await runTransaction(db, async (transaction) => {
      const eventSnap = await transaction.get(eventRef);

      if (!eventSnap.exists()) {
        throw new Error('Event not found');
      }

      const eventData = eventSnap.data() as EventDoc;
      const attendees = eventData.attendees || [];

      // Check if user is not attending
      if (!attendees.includes(userId)) {
        return 'not_attending' as CancelReservationResult;
      }

      // Remove user from attendees array
      const updatedAttendees = attendees.filter((uid) => uid !== userId);

      // Update event document
      transaction.update(eventRef, {
        attendees: updatedAttendees,
        updatedAt: serverTimestamp(),
      });

      // Find and delete reservation document
      const reservationsRef = collection(db, RESERVATIONS_COLLECTION);
      const reservationsQuery = query(
        reservationsRef,
        where('eventId', '==', eventId),
        where('userId', '==', userId)
      );
      const reservationsSnap = await getDocs(reservationsQuery);

      reservationsSnap.forEach((reservationDoc) => {
        transaction.delete(reservationDoc.ref);
      });

      return 'canceled' as CancelReservationResult;
    });

    return result;
  } catch (error) {
    console.error('Error canceling reservation:', error);
    return 'error';
  }
};

/**
 * Get reservations for a specific user
 */
export const getUserReservations = async (userId: string): Promise<ReservationDoc[]> => {
  try {
    const reservationsRef = collection(db, RESERVATIONS_COLLECTION);
    const q = query(reservationsRef, where('userId', '==', userId));

    const querySnapshot = await getDocs(q);
    const reservations: ReservationDoc[] = [];

    querySnapshot.forEach((docSnap) => {
      reservations.push({
        id: docSnap.id,
        ...docSnap.data(),
      } as ReservationDoc);
    });

    return reservations;
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    return [];
  }
};

