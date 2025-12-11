/**
 * Event Utilities
 * Sorting, filtering, and helper functions for events
 */

import { EventDoc } from '../models/firestore';
import { Timestamp } from 'firebase/firestore';
import { isEventPast, isUserAttending } from './eventStatus';

/**
 * Sort upcoming events by date (ascending - soonest first)
 */
export function sortUpcoming(events: EventDoc[]): EventDoc[] {
  const now = new Date();

  return events
    .filter((event) => {
      if (!event.date) return false;
      const eventDate = event.date instanceof Timestamp 
        ? event.date.toDate() 
        : new Date(event.date);
      return eventDate >= now;
    })
    .sort((a, b) => {
      const dateA = a.date instanceof Timestamp 
        ? a.date.toDate() 
        : new Date(a.date);
      const dateB = b.date instanceof Timestamp 
        ? b.date.toDate() 
        : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
}

/**
 * Sort past events by date (descending - most recent first)
 */
export function sortPast(events: EventDoc[]): EventDoc[] {
  const now = new Date();

  return events
    .filter((event) => {
      if (!event.date) return false;
      const eventDate = event.date instanceof Timestamp 
        ? event.date.toDate() 
        : new Date(event.date);
      return eventDate < now;
    })
    .sort((a, b) => {
      const dateA = a.date instanceof Timestamp 
        ? a.date.toDate() 
        : new Date(a.date);
      const dateB = b.date instanceof Timestamp 
        ? b.date.toDate() 
        : new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
}

/**
 * Filter events where user is attending (going)
 * Returns only upcoming events where user is in attendees array
 */
export function filterGoing(events: EventDoc[], userId: string | null): EventDoc[] {
  if (!userId) return [];

  const now = new Date();

  return events.filter((event) => {
    // Must be upcoming
    if (!event.date) return false;
    const eventDate = event.date instanceof Timestamp 
      ? event.date.toDate() 
      : new Date(event.date);
    if (eventDate < now) return false;

    // User must be in attendees
    return isUserAttending(event, userId);
  });
}

/**
 * Filter events where user attended (went)
 * Returns only past events where user is in attendees array
 */
export function filterWent(events: EventDoc[], userId: string | null): EventDoc[] {
  if (!userId) return [];

  const now = new Date();

  return events.filter((event) => {
    // Must be past
    if (!event.date) return false;
    const eventDate = event.date instanceof Timestamp 
      ? event.date.toDate() 
      : new Date(event.date);
    if (eventDate >= now) return false;

    // User must be in attendees
    return isUserAttending(event, userId);
  });
}

/**
 * Get all upcoming events (future events only)
 */
export function getUpcomingEvents(events: EventDoc[]): EventDoc[] {
  return sortUpcoming(events);
}

/**
 * Get all past events
 */
export function getPastEvents(events: EventDoc[]): EventDoc[] {
  return sortPast(events);
}



