/**
 * Mock Events Data for Casa Latina
 * Premium Latin social club signature experiences
 * 
 * These are showcase/seed events to ensure the app never looks empty.
 * All events are Miami-based in premium locations.
 */

export type RsvpStatus = 'none' | 'going' | 'went' | 'waitlist';

export interface EventData {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  city: string;
  neighborhood: string;
  venueName?: string;
  date: string; // Display format: "Fri, Dec 15 · 8:00 PM"
  type: string; // e.g. "Private Dinner", "Rooftop Soirée"
  membersCount: number;
  remainingSpots: number;
  capacity: number;
  isMembersOnly: boolean;
  rsvpStatus: RsvpStatus;
  imageUrl: string;
  // Showcase fields
  isShowcase: boolean;
  dressCode?: string;
  vibe?: string;
  priceRange?: string; // $, $$, $$$
}

/**
 * Casa Latina Signature Experiences
 * Premium showcase events in Miami's most aspirational locations
 */
export const showcaseEvents: EventData[] = [
  {
    id: 'showcase-1',
    title: 'Private Rooftop Dinner',
    subtitle: 'An intimate evening above the Brickell skyline',
    description: 'Join us for an exclusive multi-course dinner prepared by a renowned Latin chef, paired with curated wines from South America. Stunning views of Biscayne Bay as the sun sets over Miami.',
    city: 'Miami',
    neighborhood: 'Brickell',
    venueName: 'Private Penthouse · Brickell Heights',
    date: 'Sat, Jan 18 · 7:30 PM',
    type: 'Private Dinner',
    membersCount: 18,
    remainingSpots: 6,
    capacity: 24,
    isMembersOnly: true,
    rsvpStatus: 'none',
    imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
    isShowcase: true,
    dressCode: 'Elegant / Cocktail Attire',
    vibe: 'Intimate · Curated · Skyline Views',
    priceRange: '$$$',
  },
  {
    id: 'showcase-2',
    title: 'Wynwood Art & Wine Soirée',
    subtitle: 'Where Latin art meets fine wine',
    description: 'Explore a private gallery showcasing emerging Latin American artists while sipping premium wines from Argentina and Chile. Meet the artists and fellow members in the heart of Wynwood.',
    city: 'Miami',
    neighborhood: 'Wynwood',
    venueName: 'Galería Latina · Wynwood Arts District',
    date: 'Fri, Jan 24 · 8:00 PM',
    type: 'Art & Wine',
    membersCount: 32,
    remainingSpots: 8,
    capacity: 40,
    isMembersOnly: true,
    rsvpStatus: 'none',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80',
    isShowcase: true,
    dressCode: 'Smart Casual',
    vibe: 'Artistic · Social · Latin Vibes',
    priceRange: '$$',
  },
  {
    id: 'showcase-3',
    title: 'South Beach Sunset Yacht Gathering',
    subtitle: 'Sail into the Miami sunset',
    description: 'Board a luxury yacht for an unforgettable evening on Biscayne Bay. Champagne, canapés, and conversation as we watch the sun set over the Miami skyline.',
    city: 'Miami',
    neighborhood: 'South Beach',
    venueName: 'Private Yacht · Miami Beach Marina',
    date: 'Sun, Feb 2 · 5:00 PM',
    type: 'Yacht Experience',
    membersCount: 12,
    remainingSpots: 4,
    capacity: 16,
    isMembersOnly: true,
    rsvpStatus: 'none',
    imageUrl: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&q=80',
    isShowcase: true,
    dressCode: 'Resort Elegant',
    vibe: 'Exclusive · Scenic · Memorable',
    priceRange: '$$$',
  },
  {
    id: 'showcase-4',
    title: 'Design District Fashion & Cocktails',
    subtitle: 'Style meets substance',
    description: 'An exclusive evening at a private showroom in the Design District. Discover the latest collections from Latin designers while enjoying craft cocktails and networking with Miami\'s most stylish.',
    city: 'Miami',
    neighborhood: 'Design District',
    venueName: 'Private Showroom · Design District',
    date: 'Thu, Feb 6 · 7:00 PM',
    type: 'Fashion & Cocktails',
    membersCount: 28,
    remainingSpots: 12,
    capacity: 40,
    isMembersOnly: true,
    rsvpStatus: 'none',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
    isShowcase: true,
    dressCode: 'Fashion Forward',
    vibe: 'Chic · Trendy · Connected',
    priceRange: '$$',
  },
  {
    id: 'showcase-5',
    title: 'Coconut Grove Jazz & Wine Evening',
    subtitle: 'Live jazz under the stars',
    description: 'Relax in a historic Coconut Grove garden while a live jazz trio performs classics and Latin jazz fusion. Premium wines and gourmet bites in an enchanting setting.',
    city: 'Miami',
    neighborhood: 'Coconut Grove',
    venueName: 'Private Garden Estate · Coconut Grove',
    date: 'Sat, Feb 15 · 7:00 PM',
    type: 'Live Music',
    membersCount: 35,
    remainingSpots: 15,
    capacity: 50,
    isMembersOnly: true,
    rsvpStatus: 'none',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    isShowcase: true,
    dressCode: 'Smart Casual',
    vibe: 'Relaxed · Musical · Romantic',
    priceRange: '$$',
  },
  {
    id: 'showcase-6',
    title: 'Speakeasy Tasting Experience',
    subtitle: 'A hidden gem in Little Havana',
    description: 'Discover a secret speakeasy known only to locals. Our master mixologist guides you through a tasting of rare rums and classic Cuban cocktails in an intimate setting.',
    city: 'Miami',
    neighborhood: 'Little Havana',
    venueName: 'Hidden Speakeasy · Calle Ocho',
    date: 'Fri, Feb 21 · 9:00 PM',
    type: 'Speakeasy',
    membersCount: 16,
    remainingSpots: 4,
    capacity: 20,
    isMembersOnly: true,
    rsvpStatus: 'none',
    imageUrl: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&q=80',
    isShowcase: true,
    dressCode: 'Vintage / Cocktail',
    vibe: 'Mysterious · Authentic · Cuban Heritage',
    priceRange: '$$',
  },
];

/**
 * Legacy mock events (for backward compatibility)
 * @deprecated Use showcaseEvents instead
 */
export const mockEvents: EventData[] = showcaseEvents;

/**
 * Get all showcase events
 * These are signature experiences that show what Casa Latina is about
 */
export const getShowcaseEvents = (): EventData[] => {
  return showcaseEvents.map(event => ({
    ...event,
    rsvpStatus: 'none' as RsvpStatus, // Always reset RSVP status for display
  }));
};
