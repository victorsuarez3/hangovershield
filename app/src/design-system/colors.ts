/**
 * Hangover Shield Color System
 * Colors matching the premium landing page design
 */

export const colors = {
  dark: {
    // Core Brand Colors
    deepTeal: '#0F3F46', // Primary brand color - calm, modern teal
    deepTealDark: '#0D2E33', // Darker variant
    serenityMint: '#D6F5EA', // Soft mint green - freshness and recovery
    softSkyBlue: '#CFE8FF', // Calm sky blue - clarity
    glowCoral: '#FF9A8B', // Warm accent - emotional highlight
    limeMist: '#E9FFCC', // Fresh lime - vitality
    
    // Neutrals
    pureBlack: '#000000',
    richBlack: '#0B0B0B',
    pureWhite: 'rgba(255, 255, 255, 0.95)',
    softWhite: '#F3F1EC',
    softCream: '#F5EFE6',
    
    // Status Colors
    errorRed: '#CC5C6C',
    successGreen: '#7AB48B',
    warningAmber: '#D4AF37',
    
    // Legacy primary (mapped to deepTeal for consistency)
    primary: '#0F3F46', // Deep Teal
    primaryDark: '#0D2E33', // Darker Teal
    
    // Background Hierarchy
    background: '#000000', // Pure black
    surface: '#0B0B0B', // Rich black
    surfaceElevated: '#151515',
    
    // Text Hierarchy (WCAG AA compliant)
    text: '#F3F1EC', // Soft white
    textSecondary: '#B9B2A3', // Warm stone
    textTertiary: '#8A8578', // Muted
    
    // Borders
    border: '#2A2824',
    divider: '#1F1F1F',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.75)',
    shadow: 'rgba(0, 0, 0, 0.4)',
  },
  
  light: {
    // Core Brand Colors
    deepTeal: '#0F3F46',
    deepTealDark: '#0D2E33',
    serenityMint: '#D6F5EA',
    softSkyBlue: '#CFE8FF',
    glowCoral: '#FF9A8B',
    limeMist: '#E9FFCC',
    
    // Neutrals
    pureBlack: '#000000',
    richBlack: '#0B0B0B',
    pureWhite: '#FFFFFF',
    softWhite: '#F3F1EC',
    softCream: '#F5EFE6',
    
    // Status Colors
    errorRed: '#CC5C6C',
    successGreen: '#7AB48B',
    warningAmber: '#D4AF37',
    
    // Legacy primary (mapped to deepTeal)
    primary: '#0F3F46', // Deep Teal
    primaryDark: '#0D2E33', // Darker Teal
    
    // Background Hierarchy - Light mode uses soft gradients
    background: '#F3F1EC', // Soft white
    surface: '#FFFFFF',
    surfaceElevated: '#FAFAF8',
    
    // Text Hierarchy
    text: '#0F3F46', // Deep Teal for primary text
    textSecondary: '#5A5750', // Neutral gray
    textTertiary: '#8A8578', // Muted
    
    // Borders
    border: '#E5E0D8',
    divider: '#D5D0C8',
    
    // Overlays
    overlay: 'rgba(243, 241, 236, 0.95)',
    shadow: 'rgba(15, 63, 70, 0.08)', // Deep teal shadow
  },
};

export type ColorScheme = 'dark' | 'light';
export type ThemeColors = typeof colors.dark;
