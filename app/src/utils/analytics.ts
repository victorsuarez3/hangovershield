/**
 * Analytics Utility - Hangover Shield
 * Lightweight logging for monetization events
 *
 * Current implementation: console logging with structured data
 * Future: Plug in Mixpanel, Firebase Analytics, or Amplitude
 */

// Event types for type safety
export type AnalyticsEvent =
  | 'paywall_shown'
  | 'paywall_cta_clicked'
  | 'paywall_dismissed'
  | 'premium_feature_locked_tapped'
  | 'welcome_unlock_granted'
  | 'welcome_unlock_expired'
  | 'purchase_initiated'
  | 'purchase_completed'
  | 'purchase_failed'
  | 'soft_gate_shown'
  | 'soft_gate_cta_clicked'
  | 'locked_section_shown'
  | 'locked_section_tapped'
  | 'home_widget_clicked'
  | 'paywall_opened'
  | 'evening_checkin_completed'
  | 'evening_closure_viewed'
  | 'evening_home_state_closed';

export interface PaywallShownProperties {
  source: string;
  contextScreen?: string;
  accessStatus: string;
}

export interface PaywallCTAClickedProperties {
  source: string;
  contextScreen?: string;
  ctaType: 'upgrade' | 'restore' | 'close';
}

export interface PremiumFeatureLockedProperties {
  feature: string;
  contextScreen: string;
  accessStatus: string;
}

export interface WelcomeUnlockGrantedProperties {
  userId: string;
  expiresAt: number;
}

export interface PurchaseProperties {
  plan?: string;
  source?: string;
  error?: string;
}

type AnalyticsProperties =
  | PaywallShownProperties
  | PaywallCTAClickedProperties
  | PremiumFeatureLockedProperties
  | WelcomeUnlockGrantedProperties
  | PurchaseProperties
  | Record<string, any>;

/**
 * Log an analytics event
 * Currently logs to console with structured format
 */
export function logAnalyticsEvent(
  event: AnalyticsEvent,
  properties?: AnalyticsProperties
): void {
  const timestamp = new Date().toISOString();
  const payload = {
    event,
    timestamp,
    ...properties,
  };

  // Console log with clear formatting
  console.log(
    `[Analytics] ${event}`,
    JSON.stringify(payload, null, 2)
  );

  // TODO: Integrate with actual analytics service
  // Examples:
  // - Mixpanel.track(event, properties);
  // - analytics().logEvent(event, properties);
  // - Amplitude.logEvent(event, properties);
}

/**
 * Paywall tracking helpers
 */
export const Analytics = {
  paywallShown: (source: string, contextScreen?: string, accessStatus?: string) => {
    logAnalyticsEvent('paywall_shown', {
      source,
      contextScreen,
      accessStatus: accessStatus || 'unknown',
    });
  },

  paywallCTAClicked: (
    source: string,
    ctaType: 'upgrade' | 'restore' | 'close',
    contextScreen?: string
  ) => {
    logAnalyticsEvent('paywall_cta_clicked', {
      source,
      ctaType,
      contextScreen,
    });
  },

  paywallDismissed: (source: string, method: 'back' | 'close' | 'background') => {
    logAnalyticsEvent('paywall_dismissed', {
      source,
      method,
    });
  },

  premiumFeatureLockedTapped: (
    feature: string,
    contextScreen: string,
    accessStatus: string
  ) => {
    logAnalyticsEvent('premium_feature_locked_tapped', {
      feature,
      contextScreen,
      accessStatus,
    });
  },

  welcomeUnlockGranted: (userId: string, expiresAt: number) => {
    logAnalyticsEvent('welcome_unlock_granted', {
      userId,
      expiresAt,
    });
  },

  welcomeUnlockExpired: (userId: string) => {
    logAnalyticsEvent('welcome_unlock_expired', {
      userId,
    });
  },

  purchaseInitiated: (plan: string, source: string) => {
    logAnalyticsEvent('purchase_initiated', {
      plan,
      source,
    });
  },

  purchaseCompleted: (plan: string, source: string) => {
    logAnalyticsEvent('purchase_completed', {
      plan,
      source,
    });
  },

  purchaseFailed: (plan: string, source: string, error: string) => {
    logAnalyticsEvent('purchase_failed', {
      plan,
      source,
      error,
    });
  },

  homeWidgetClicked: (
    widget: string,
    accessStatus: string,
    contextScreen?: string
  ) => {
    logAnalyticsEvent('home_widget_clicked', {
      widget,
      accessStatus,
      contextScreen: contextScreen || 'HomeScreen',
    });
  },

  paywallOpened: (
    source: string,
    contextScreen?: string,
    accessStatus?: string
  ) => {
    logAnalyticsEvent('paywall_opened', {
      source,
      contextScreen: contextScreen || 'unknown',
      accessStatus: accessStatus || 'unknown',
    });
  },

  // Evening check-in events
  eveningCheckInCompleted: (userId: string) => {
    logAnalyticsEvent('evening_checkin_completed', {
      userId,
    });
  },

  eveningClosureViewed: (userId: string) => {
    logAnalyticsEvent('evening_closure_viewed', {
      userId,
    });
  },

  eveningHomeStateClosed: (userId: string) => {
    logAnalyticsEvent('evening_home_state_closed', {
      userId,
    });
  },
};
