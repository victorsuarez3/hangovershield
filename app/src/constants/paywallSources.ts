/**
 * Paywall Source Constants - Hangover Shield
 * Centralized source tracking for paywall attribution
 *
 * CRITICAL: Never use ad-hoc strings for paywall navigation.
 * All analytics and conversion tracking depends on these values.
 */

export const PaywallSource = {
  // Soft gates (in-context conversion)
  RECOVERY_PLAN_SOFT_GATE: 'recovery_plan_soft_gate',
  PROGRESS_OVERVIEW_SOFT_GATE: 'progress_overview_soft_gate',
  PROGRESS_TRENDS_SOFT_GATE: 'progress_trends_soft_gate',
  PROGRESS_HISTORY_SOFT_GATE: 'progress_history_soft_gate',
  PROGRESS_RHYTHM_SOFT_GATE: 'progress_rhythm_soft_gate',
  PROGRESS_REFLECTION_SOFT_GATE: 'progress_reflection_soft_gate',

  // Hard gates (locked screens)
  EVENING_CHECKIN_LOCKED: 'evening_checkin_locked',

  // Banners and CTAs
  WELCOME_BANNER: 'welcome_banner',
  HOME_UPGRADE_BANNER: 'home_upgrade_banner',
  PROGRESS_INSIGHTS_CTA: 'progress_insights_cta',

  // Menu actions
  MENU_SUBSCRIPTION: 'menu_subscription',
} as const;

export type PaywallSourceType = typeof PaywallSource[keyof typeof PaywallSource];

/**
 * Helper to ensure type-safe paywall navigation
 */
export interface PaywallNavigationParams {
  source: PaywallSourceType;
  contextScreen: string;
}
