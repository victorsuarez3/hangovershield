/**
 * Firebase Events Service
 * Typed Firestore operations for events
 */

import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Event } from './types';

const EVENTS_COLLECTION = 'events';

/**
 * Fetch events by city
 */
export const getEventsByCity = async (city: string): Promise<Event[]> => {
  try {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const q = query(
      eventsRef,
      where('city', '==', city),
      orderBy('date', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const events: Event[] = [];
    
    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data(),
      } as Event);
    });
    
    return events;
  } catch (error) {
    console.error('Error fetching events by city:', error);
    return [];
  }
};

/**
 * Fetch a single event by ID
 */
export const getEventById = async (eventId: string): Promise<Event | null> => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    const eventSnap = await getDoc(eventRef);
    
    if (eventSnap.exists()) {
      return {
        id: eventSnap.id,
        ...eventSnap.data(),
      } as Event;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    return null;
  }
};

/**
 * Fetch all events (for development/testing)
 */
export const getAllEvents = async (): Promise<Event[]> => {
  try {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const q = query(eventsRef, orderBy('date', 'asc'));
    
    const querySnapshot = await getDocs(q);
    const events: Event[] = [];
    
    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data(),
      } as Event);
    });
    
    return events;
  } catch (error) {
    console.error('Error fetching all events:', error);
    return [];
  }
};




