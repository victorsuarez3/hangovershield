/**
 * Events Hook
 * Fetches and manages events data with real-time Firestore updates
 */

import { useState, useEffect } from 'react';
import { getEvents, getEventById, subscribeToEvent } from '../services/events';
import { EventDoc } from '../models/firestore';
import { useAuth } from '../providers/AuthProvider';
import { getEventStatus, isEventPast, isUserAttending } from '../utils/eventStatus';
import { Timestamp } from 'firebase/firestore';

export type EventWithStatus = EventDoc & {
  eventStatus: 'attending' | 'full' | 'available';
  rsvpStatus?: 'going' | 'went' | null;
};

/**
 * Hook to get all events with real-time updates
 * Filters events based on RSVP status (Going/Went)
 */
export const useEventsWithRsvp = (city?: string) => {
  const [events, setEvents] = useState<EventWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);

    // Subscribe to real-time events
    const unsubscribe = getEvents((firestoreEvents) => {
      // Filter by city if provided
      let filteredEvents = firestoreEvents;
      if (city) {
        filteredEvents = firestoreEvents.filter(
          (event) => event.city === city || !event.city
        );
      }

      // Enrich events with status and RSVP info
      const enrichedEvents: EventWithStatus[] = filteredEvents.map((event) => {
        const eventStatus = getEventStatus(event, user?.uid || null);
        const isPast = isEventPast(event);
        const isAttending = isUserAttending(event, user?.uid || null);

        // Determine RSVP status for filtering
        let rsvpStatus: 'going' | 'went' | null = null;
        if (isAttending) {
          rsvpStatus = isPast ? 'went' : 'going';
        }

        return {
          ...event,
          eventStatus,
          rsvpStatus,
        };
      });

      setEvents(enrichedEvents);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [city, user?.uid]);

  return { events, loading };
};

/**
 * Hook to get a single event by ID with real-time updates
 */
export const useEventById = (eventId: string) => {
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to real-time event updates
    const unsubscribe = subscribeToEvent(eventId, (firestoreEvent) => {
      setEvent(firestoreEvent);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [eventId]);

  // Compute event status
  const eventStatus = event ? getEventStatus(event, user?.uid || null) : 'available';
  const isAttending = event ? isUserAttending(event, user?.uid || null) : false;

  return {
    event,
    loading,
    eventStatus,
    isAttending,
  };
};

/**
 * Hook to filter events by RSVP status
 * Used in HomeScreen for "Going" and "Went" filters
 */
export const useFilteredEvents = (
  events: EventWithStatus[],
  filter: 'all' | 'going' | 'went'
) => {
  const now = new Date();

  return events.filter((event) => {
    if (filter === 'all') {
      return true;
    }

    if (filter === 'going') {
      return event.rsvpStatus === 'going';
    }

    if (filter === 'went') {
      return event.rsvpStatus === 'went';
    }

    return true;
  });
};
