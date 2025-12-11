/**
 * User Events Hook
 * Fetches user's upcoming and past events
 */

import { useState, useEffect } from 'react';
import { getUserRsvps } from '../services/firebase/rsvps';
import { getEventById } from '../services/firebase/events';
import { Event, RsvpStatus } from '../services/firebase/types';
import { useAuth } from '../providers/AuthProvider';

export const useUserEvents = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const rsvps = await getUserRsvps(user.uid);
        
        const upcoming: Event[] = [];
        const past: Event[] = [];
        
        // Fetch event details for each RSVP
        for (const rsvp of rsvps) {
          const event = await getEventById(rsvp.eventId);
          if (event) {
            if (rsvp.status === 'went') {
              past.push(event);
            } else if (rsvp.status === 'going' || rsvp.status === 'waitlist') {
              upcoming.push(event);
            }
          }
        }
        
        setUpcomingEvents(upcoming);
        setPastEvents(past);
      } catch (error) {
        console.error('Error fetching user events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, [user]);

  return { upcomingEvents, pastEvents, loading };
};




