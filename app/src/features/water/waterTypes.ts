/**
 * Water Tracking Types - Hangover Shield
 * Types for daily water/hydration logging
 */

// ─────────────────────────────────────────────────────────────────────────────
// Core Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single water entry (one log event)
 */
export interface WaterEntry {
  id: string; // Unique identifier for this entry
  amountMl: number; // Amount in milliliters
  timestamp: number; // Unix timestamp (milliseconds)
  note?: string; // Optional note (e.g., "Morning coffee", "Post-workout")
}

/**
 * Daily water log for a specific date
 */
export interface WaterLog {
  userId: string; // User ID
  dateId: string; // YYYY-MM-DD format
  entries: WaterEntry[]; // Array of water entries for this day
  goalMl: number; // Daily goal in milliliters (default: 1500ml)
  totalMl: number; // Computed total for the day
  createdAt: number; // First entry timestamp
  updatedAt: number; // Last modified timestamp
}
