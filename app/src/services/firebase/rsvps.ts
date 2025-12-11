/**
 * Firebase RSVPs Service
 * Typed Firestore operations for RSVPs
 */

import { collection, query, where, getDocs, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Rsvp, RsvpStatus } from './types';

const RSVPS_COLLECTION = 'rsvps';

/**
 * Get user's RSVPs
 */
export const getUserRsvps = async (userId: string): Promise<Rsvp[]> => {
  try {
    const rsvpsRef = collection(db, RSVPS_COLLECTION);
    const q = query(rsvpsRef, where('userId', '==', userId));
    
    const querySnapshot = await getDocs(q);
    const rsvps: Rsvp[] = [];
    
    querySnapshot.forEach((doc) => {
      rsvps.push({
        id: doc.id,
        ...doc.data(),
      } as Rsvp);
    });
    
    return rsvps;
  } catch (error) {
    console.error('Error fetching user RSVPs:', error);
    return [];
  }
};

/**
 * Get RSVPs for an event
 */
export const getEventRsvps = async (eventId: string): Promise<Rsvp[]> => {
  try {
    const rsvpsRef = collection(db, RSVPS_COLLECTION);
    const q = query(rsvpsRef, where('eventId', '==', eventId));
    
    const querySnapshot = await getDocs(q);
    const rsvps: Rsvp[] = [];
    
    querySnapshot.forEach((doc) => {
      rsvps.push({
        id: doc.id,
        ...doc.data(),
      } as Rsvp);
    });
    
    return rsvps;
  } catch (error) {
    console.error('Error fetching event RSVPs:', error);
    return [];
  }
};

/**
 * Get user's RSVP for a specific event
 */
export const getUserEventRsvp = async (userId: string, eventId: string): Promise<Rsvp | null> => {
  try {
    const rsvpsRef = collection(db, RSVPS_COLLECTION);
    const q = query(
      rsvpsRef,
      where('userId', '==', userId),
      where('eventId', '==', eventId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as Rsvp;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user event RSVP:', error);
    return null;
  }
};

/**
 * Create or update RSVP
 */
export const createOrUpdateRsvp = async (
  userId: string,
  eventId: string,
  status: RsvpStatus
): Promise<void> => {
  try {
    // Check if RSVP already exists
    const existingRsvp = await getUserEventRsvp(userId, eventId);
    
    if (existingRsvp) {
      // Update existing RSVP
      const rsvpRef = doc(db, RSVPS_COLLECTION, existingRsvp.id);
      await updateDoc(rsvpRef, {
        status,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Create new RSVP
      const rsvpsRef = collection(db, RSVPS_COLLECTION);
      const newRsvpRef = doc(rsvpsRef);
      await setDoc(newRsvpRef, {
        userId,
        eventId,
        status,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error creating/updating RSVP:', error);
    throw error;
  }
};




