/**
 * Paywall Copy System - Hangover Shield
 * A++ conversion copy mapped by paywall source
 * 
 * Focus: Outcome-driven, contextual, urgent (not feature-driven)
 */

import { PaywallSourceType } from '../constants/paywallSources';

export interface PaywallCopy {
  headline: string;
  subheadline: string;
  urgencyLine: string;
  primaryCTAOverride?: string; // Optional override for CTA text
}

const COPY_MAP: Record<PaywallSourceType | 'default', PaywallCopy> = {
  evening_checkin_locked: {
    headline: 'Protect your night. Improve tomorrow.',
    subheadline: 'Evening habits make the biggest difference.',
    urgencyLine: 'Evening reset is locked without Premium.',
    primaryCTAOverride: 'Unlock Evening Reset',
  },
  recovery_plan_soft_gate: {
    headline: "Finish today's recovery properly",
    subheadline: 'Your body responds best to a complete plan.',
    urgencyLine: "You're missing part of today's recovery.",
  },
  progress_overview_soft_gate: {
    headline: 'Understand your recovery patterns',
    subheadline: 'Long-term insight creates better decisions.',
    urgencyLine: 'Trends only appear over time.',
  },
  progress_trends_soft_gate: {
    headline: 'Understand your recovery patterns',
    subheadline: 'Long-term insight creates better decisions.',
    urgencyLine: 'Trends only appear over time.',
  },
  progress_history_soft_gate: {
    headline: 'Understand your recovery patterns',
    subheadline: 'Long-term insight creates better decisions.',
    urgencyLine: 'Trends only appear over time.',
  },
  menu_subscription: {
    headline: 'Recover properly. Every time.',
    subheadline: 'The difference between getting through it and actually recovering.',
    urgencyLine: 'Unlock the full recovery system.',
  },
  welcome_banner: {
    headline: 'Recover properly. Every time.',
    subheadline: 'The difference between getting through it and actually recovering.',
    urgencyLine: 'Your welcome access ends soon.',
  },
  home_upgrade_banner: {
    headline: 'Recover properly. Every time.',
    subheadline: 'The difference between getting through it and actually recovering.',
    urgencyLine: 'Unlock the full recovery system.',
  },
  default: {
    headline: 'Recover properly. Every time.',
    subheadline: 'The difference between getting through it and actually recovering.',
    urgencyLine: 'Unlock the full recovery system.',
  },
};

/**
 * Get paywall copy for a given source
 */
export function getPaywallCopy(source?: PaywallSourceType): PaywallCopy {
  if (!source || !COPY_MAP[source]) {
    return COPY_MAP.default;
  }
  return COPY_MAP[source];
}

/**
 * Feature list copy (outcome-driven)
 */
export const PAYWALL_FEATURES = [
  {
    title: 'Wake up feeling better tomorrow',
    subtitle: 'Not just "less bad"',
  },
  {
    title: 'Protect your sleep & recovery rhythm',
    subtitle: 'Even after a long night',
  },
  {
    title: 'See patterns your body repeats',
    subtitle: 'So you don't guess anymore',
  },
  {
    title: 'Hydrate with intention, not hope',
    subtitle: '',
  },
] as const;

/**
 * Get CTA text based on selected plan and source
 */
export function getCTAText(
  isYearly: boolean,
  source?: PaywallSourceType
): string {
  // Source-specific override takes priority
  const copy = getPaywallCopy(source);
  if (copy.primaryCTAOverride) {
    return copy.primaryCTAOverride;
  }

  // Plan-based CTAs
  if (isYearly) {
    return 'Start Full Recovery';
  }
  return 'Recover Properly';
}

/**
 * Calculate daily price from yearly price
 */
export function calculateDailyPrice(yearlyPrice: number, currencyCode: string = 'USD'): string {
  const daily = (yearlyPrice / 365).toFixed(2);
  
  // Simple currency formatting (can be enhanced later)
  if (currencyCode === 'USD') {
    return `$${daily}`;
  }
  
  // For other currencies, use the number with currency symbol
  // This is a simple fallback - can be enhanced with proper i18n
  return `${daily} ${currencyCode}`;
}

