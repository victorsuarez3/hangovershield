/**
 * Firestore Data Models
 * 
 * TypeScript interfaces for all Firestore collections used in Casa Latina MVP
 */

export type MembershipStatus =
  | "not_applied"
  | "pending"
  | "approved"
  | "rejected";

export type MembershipType = "founding" | "standard";

export type UserRole = "member" | "admin";

export interface UserDoc {
  displayName: string | null;
  email: string | null;
  photoUrl?: string | null;
  createdAt: any; // Firestore Timestamp
  updatedAt?: any;
}

export interface ApplicationDoc {
  userId: string;
  positionTitle: string;
  company: string;
  industry: string;
  educationLevel: string;
  university?: string;
  annualIncomeRange: string;
  city: string;
  age: number;
  instagramHandle: string;
  heardAboutUs?: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: any;
  createdAt: any;
}

export interface EventDoc {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  date: any; // Firestore Timestamp
  location: string;
  price?: number;
  capacity: number;
  attendees: string[]; // Array of user UIDs
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  // Showcase/Signature events (seed data)
  isShowcase?: boolean;
  neighborhood?: string; // Brickell, Wynwood, etc.
  venueName?: string;
  dressCode?: string;
  vibe?: string;
  priceRange?: string; // $, $$, $$$
  // Legacy fields for backward compatibility
  city?: string;
  type?: string;
  dateTime?: any;
  locationName?: string;
  locationArea?: string;
  membersOnly?: boolean;
  coverImageUrl?: string;
  description?: string;
  attendeesCount?: number;
  isActive?: boolean;
}

export interface ReservationDoc {
  id: string;
  userId: string;
  eventId: string;
  createdAt: any; // Firestore Timestamp
}

export interface EventAttendeeDoc {
  userId: string;
  fullName: string;
  avatarInitial: string;
  reservedAt: any;
}

