/**
 * Casa Latina Ultra-Premium Typography System
 * Editorial-grade typography with generous spacing
 *
 * IMPORTANT: fontWeight is omitted because font files already contain the weight
 * (e.g., CormorantGaramond_700Bold.ttf is already bold). Adding fontWeight causes
 * Android to fail font rendering and fallback to system fonts.
 */

export const typography = {
  // Hero Titles - Cormorant Garamond / Fraunces
  heroTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 36,
    lineHeight: 50, // 1.39 ratio
    letterSpacing: -0.54, // -1.5% tracking
  },

  // Section Titles
  sectionTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 28,
    lineHeight: 40,
    letterSpacing: -0.42, // -1.5% tracking
  },

  // Subsection Titles
  subsectionTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 24,
    lineHeight: 34,
    letterSpacing: -0.36,
  },

  // Body - Inter / Work Sans
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 23, // 1.42 ratio
    letterSpacing: 0,
  },

  bodyMedium: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 23,
    letterSpacing: 0,
  },

  bodySmall: {
    fontFamily: 'Inter_300Light',
    fontSize: 14,
    lineHeight: 20, // 1.42 ratio
    letterSpacing: 0,
  },

  // Labels
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
  },

  labelSmall: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 0.2,
  },

  // Buttons - Not heavy
  button: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 23,
    letterSpacing: 0.3,
  },

  // Caption
  caption: {
    fontFamily: 'Inter_300Light',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.3,
  },

  // Legacy support
  headingXL: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 36,
    lineHeight: 50,
    letterSpacing: -0.54,
  },
  headingL: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 28,
    lineHeight: 40,
    letterSpacing: -0.42,
  },
  headingM: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 24,
    lineHeight: 34,
    letterSpacing: -0.36,
  },
};

export type TypographyVariant = keyof typeof typography;




