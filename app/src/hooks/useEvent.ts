/**
 * useEvent Hook
 * Real-time subscription to a single event with local caching
 * Supports both Firestore events and local featured events
 */

import { useState, useEffect, useRef } from 'react';
import { subscribeToEvent } from '../services/events';
import { EventDoc } from '../models/firestore';
import { getEventStatus, isUserAttending } from '../utils/eventStatus';
import { useAuth } from '../providers/AuthProvider';
import { showcaseEvents } from '../data/mockEvents';

export interface UseEventReturn {
  event: EventDoc | null;
  attendees: string[];
  capacityLeft: number;
  isAttending: boolean;
  status: 'attending' | 'full' | 'available';
  loading: boolean;
  error: Error | null;
}

/**
 * Convert showcase event to EventDoc format
 */
const convertShowcaseToEventDoc = (showcaseEvent: typeof showcaseEvents[0]): EventDoc => {
  // Parse date string to create a future date
  const now = new Date();
  const eventDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  
  return {
    id: showcaseEvent.id,
    title: showcaseEvent.title,
    subtitle: showcaseEvent.subtitle,
    image: showcaseEvent.imageUrl,
    date: eventDate,
    location: showcaseEvent.neighborhood,
    price: 0,
    capacity: showcaseEvent.capacity,
    attendees: [], // Featured events start with no attendees for the user
    createdAt: new Date(),
    updatedAt: new Date(),
    city: showcaseEvent.city,
    type: showcaseEvent.type,
    membersOnly: showcaseEvent.isMembersOnly,
    coverImageUrl: showcaseEvent.imageUrl,
    description: showcaseEvent.description,
    isShowcase: true,
    neighborhood: showcaseEvent.neighborhood,
    venueName: showcaseEvent.venueName,
    dressCode: showcaseEvent.dressCode,
    vibe: showcaseEvent.vibe,
    priceRange: showcaseEvent.priceRange,
  };
};

/**
 * Hook to subscribe to a single event in real-time
 * Includes local caching for instant display
 * Supports featured events from local data
 */
export const useEvent = (eventId: string | null): UseEventReturn => {
  const { user } = useAuth();
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Local cache ref for instant display
  const cacheRef = useRef<EventDoc | null>(null);

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Check if this is a featured/showcase event
    if (eventId.startsWith('showcase-')) {
      const showcaseEvent = showcaseEvents.find(e => e.id === eventId);
      if (showcaseEvent) {
        const eventDoc = convertShowcaseToEventDoc(showcaseEvent);
        cacheRef.current = eventDoc;
        setEvent(eventDoc);
        setLoading(false);
      } else {
        setEvent(null);
        setLoading(false);
        setError(new Error('Event not found'));
      }
      return;
    }

    // Subscribe to real-time updates for Firestore events
    const unsubscribe = subscribeToEvent(
      eventId,
      (firestoreEvent) => {
        if (firestoreEvent) {
          // Update cache
          cacheRef.current = firestoreEvent;
          setEvent(firestoreEvent);
        } else {
          setEvent(null);
        }
        setLoading(false);
      }
    );

    // If we have cached data, show it immediately
    if (cacheRef.current && cacheRef.current.id === eventId) {
      setEvent(cacheRef.current);
      setLoading(false);
    }

    return () => {
      unsubscribe();
    };
  }, [eventId]);

  // Compute derived values
  const attendees = event?.attendees || [];
  const capacity = event?.capacity || 0;
  const capacityLeft = Math.max(0, capacity - attendees.length);
  const isAttending = user && event ? isUserAttending(event, user.uid) : false;
  const status = event ? getEventStatus(event, user?.uid || null) : 'available';

  return {
    event,
    attendees,
    capacityLeft,
    isAttending,
    status,
    loading,
    error,
  };
};
