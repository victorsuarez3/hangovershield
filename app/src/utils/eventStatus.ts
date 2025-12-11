/**
 * Event Status Utility
 * Computes event status for RSVP buttons and UI logic
 */

import { EventDoc } from '../models/firestore';
import { Timestamp } from 'firebase/firestore';

export type EventStatus = 'attending' | 'full' | 'available';

/**
 * Get event status based on capacity and user attendance
 */
export function getEventStatus(event: EventDoc, userId: string | null): EventStatus {
  if (!event) {
    return 'available';
  }

  const attendees = event.attendees || [];
  const isFull = attendees.length >= event.capacity;
  const isAttending = userId ? attendees.includes(userId) : false;

  if (isAttending) {
    return 'attending';
  }

  if (isFull) {
    return 'full';
  }

  return 'available';
}

/**
 * Check if an event has passed (date < now)
 */
export function isEventPast(event: EventDoc): boolean {
  if (!event.date) {
    return false;
  }

  const eventDate = event.date instanceof Timestamp 
    ? event.date.toDate() 
    : new Date(event.date);
  
  const now = new Date();
  return eventDate < now;
}

/**
 * Check if user is attending an event
 */
export function isUserAttending(event: EventDoc, userId: string | null): boolean {
  if (!userId || !event.attendees) {
    return false;
  }

  return event.attendees.includes(userId);
}



