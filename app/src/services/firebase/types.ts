/**
 * Firebase Data Models - TypeScript Types
 * Production-ready type definitions for Firestore collections
 */

export type EventStatus = 'open' | 'waitlist' | 'closed';

export type EventCategory = 
  | 'COCTEL_INTIMO' 
  | 'CENA_PRIVADA' 
  | 'ARTE_VINO' 
  | 'NETWORKING' 
  | string;

export type RsvpStatus = 'going' | 'waitlist' | 'went';

export interface Event {
  id: string;
  title: string;
  city: string;
  neighborhood: string;
  category: EventCategory;
  date: string; // ISO date string
  time: string; // e.g. "8:00 PM"
  membersOnly: boolean;
  totalSpots: number;
  spotsRemaining: number;
  attendingCount: number;
  imageUrl: string;
  description?: string;
  organizerId?: string;
  createdAt?: string;
  updatedAt?: string;
  // Showcase/Signature experience fields
  isShowcase?: boolean;
  vibe?: string;
  dressCode?: string;
  venueName?: string;
  priceRange?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  city: string;
  inviteCode: string;
  isFoundingMember?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Rsvp {
  id: string;
  userId: string;
  eventId: string;
  status: RsvpStatus;
  createdAt: string;
  updatedAt?: string;
}




