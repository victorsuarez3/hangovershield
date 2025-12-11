/**
 * Casa Latina Ultra-Premium Theme System
 * Complete design token system
 */

import { colors, ColorScheme, ThemeColors } from './colors';
import { typography, TypographyVariant } from './typography';
import { spacing, borderRadius } from './spacing';
import { shadows } from './shadows';
import { animations } from './animations';

export interface Theme {
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  animations: typeof animations;
  isDark: boolean;
}

export const createTheme = (scheme: ColorScheme = 'dark'): Theme => ({
  colors: colors[scheme],
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  isDark: scheme === 'dark',
});

export const darkTheme = createTheme('dark');
export const lightTheme = createTheme('light');

export type { TypographyVariant, ColorScheme };




