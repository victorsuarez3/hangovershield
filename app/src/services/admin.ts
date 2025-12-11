/**
 * Admin Services
 * Firestore operations for admin panel
 */

import {
  collection,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { EventDoc, UserDoc } from '../models/firestore';

type UserDocWithId = UserDoc & { id: string };

const EVENTS_COLLECTION = 'events';
const USERS_COLLECTION = 'users';

export interface CreateEventData {
  title: string;
  subtitle?: string;
  image: string;
  date: Date | Timestamp;
  location: string;
  price?: number;
  capacity: number;
  city?: string;
  type?: string;
  membersOnly?: boolean;
  description?: string;
}

export interface UpdateEventData {
  title?: string;
  subtitle?: string;
  image?: string;
  date?: Date | Timestamp;
  location?: string;
  price?: number;
  capacity?: number;
  city?: string;
  type?: string;
  membersOnly?: boolean;
  description?: string;
}

/**
 * Create a new event
 */
export const createEvent = async (eventData: CreateEventData): Promise<string> => {
  try {
    const eventRef = collection(db, EVENTS_COLLECTION);
    
    const docData = {
      title: eventData.title,
      subtitle: eventData.subtitle || '',
      image: eventData.image,
      date: eventData.date instanceof Date 
        ? Timestamp.fromDate(eventData.date) 
        : eventData.date,
      location: eventData.location,
      price: eventData.price || null,
      capacity: eventData.capacity,
      attendees: [],
      city: eventData.city || '',
      type: eventData.type || '',
      membersOnly: eventData.membersOnly || false,
      description: eventData.description || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(eventRef, docData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

/**
 * Update an existing event
 */
export const updateEvent = async (
  eventId: string,
  data: UpdateEventData
): Promise<void> => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.date !== undefined) {
      updateData.date = data.date instanceof Date 
        ? Timestamp.fromDate(data.date) 
        : data.date;
    }
    if (data.location !== undefined) updateData.location = data.location;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.capacity !== undefined) updateData.capacity = data.capacity;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.membersOnly !== undefined) updateData.membersOnly = data.membersOnly;
    if (data.description !== undefined) updateData.description = data.description;

    await updateDoc(eventRef, updateData);
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

/**
 * Delete an event
 */
export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    await deleteDoc(eventRef);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

/**
 * Get all events (admin view - no date filtering)
 */
export const getAllEventsAdmin = async (): Promise<EventDoc[]> => {
  try {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const querySnapshot = await getDocs(eventsRef);
    
    const events: EventDoc[] = [];
    querySnapshot.forEach((docSnap) => {
      events.push({
        id: docSnap.id,
        ...docSnap.data(),
      } as EventDoc);
    });

    // Sort by date descending (newest first)
    return events.sort((a, b) => {
      const dateA = a.date instanceof Timestamp 
        ? a.date.toDate() 
        : new Date(a.date);
      const dateB = b.date instanceof Timestamp 
        ? b.date.toDate() 
        : new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error fetching all events:', error);
    return [];
  }
};

/**
 * Get pending members (users with membershipStatus "pending")
 */
export const getPendingMembers = async (): Promise<UserDocWithId[]> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('membershipStatus', '==', 'pending'));
    const querySnapshot = await getDocs(q);
    
    const users: UserDocWithId[] = [];
    querySnapshot.forEach((docSnap) => {
      users.push({
        id: docSnap.id,
        ...docSnap.data(),
      } as UserDocWithId);
    });

    // Sort by createdAt descending (newest first)
    return users.sort((a, b) => {
      const dateA = a.createdAt instanceof Timestamp 
        ? a.createdAt.toDate() 
        : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Timestamp 
        ? b.createdAt.toDate() 
        : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error fetching pending members:', error);
    return [];
  }
};

/**
 * Approve a member
 */
export const approveMember = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      membershipStatus: 'approved',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error approving member:', error);
    throw error;
  }
};

/**
 * Reject a member
 */
export const rejectMember = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      membershipStatus: 'rejected',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error rejecting member:', error);
    throw error;
  }
};

/**
 * Get event by ID (admin view)
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
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<UserDoc | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserDoc;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
};

