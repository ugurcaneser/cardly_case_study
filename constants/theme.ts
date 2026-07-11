/**
 * "Emotional Utility" design system — a single, fixed dark UI style (no light mode).
 * Values mirror the design-token spec 1:1; see typography.ts for the paired text styles.
 */

import { Platform } from 'react-native';

export const Colors = {
  surface: '#0b1326',
  surfaceDim: '#0b1326',
  surfaceBright: '#31394d',
  surfaceContainerLowest: '#060e20',
  surfaceContainerLow: '#131b2e',
  surfaceContainer: '#171f33',
  surfaceContainerHigh: '#222a3d',
  surfaceContainerHighest: '#2d3449',
  onSurface: '#dae2fd',
  onSurfaceVariant: '#c7c4d7',
  inverseSurface: '#dae2fd',
  inverseOnSurface: '#283044',
  outline: '#908fa0',
  outlineVariant: '#464554',
  surfaceTint: '#c0c1ff',
  primary: '#c0c1ff',
  onPrimary: '#1000a9',
  primaryContainer: '#8083ff',
  onPrimaryContainer: '#0d0096',
  inversePrimary: '#494bd6',
  secondary: '#b9c8de',
  onSecondary: '#233143',
  secondaryContainer: '#39485a',
  onSecondaryContainer: '#a7b6cc',
  tertiary: '#4edea3',
  onTertiary: '#003824',
  tertiaryContainer: '#00885d',
  onTertiaryContainer: '#000703',
  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
  primaryFixed: '#e1e0ff',
  primaryFixedDim: '#c0c1ff',
  onPrimaryFixed: '#07006c',
  onPrimaryFixedVariant: '#2f2ebe',
  secondaryFixed: '#d4e4fa',
  secondaryFixedDim: '#b9c8de',
  onSecondaryFixed: '#0d1c2d',
  onSecondaryFixedVariant: '#39485a',
  tertiaryFixed: '#6ffbbe',
  tertiaryFixedDim: '#4edea3',
  onTertiaryFixed: '#002113',
  onTertiaryFixedVariant: '#005236',
  background: '#0b1326',
  onBackground: '#dae2fd',
  surfaceVariant: '#2d3449',
  surfaceSlate: '#1E293B',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  successEmerald: '#10B981',
  warningAmber: '#F59E0B',

  // Legacy aliases — kept so screens not yet migrated to the new token names
  // still resolve to sensible dark-theme values instead of breaking.
  text: '#dae2fd',
  tint: '#c0c1ff',
  icon: '#c7c4d7',
  tabIconDefault: '#908fa0',
  tabIconSelected: '#c0c1ff',
};

export const Radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const Spacing = {
  containerMargin: 20,
  gutterBento: 12,
  thumbZoneBottom: 80,
  stackSm: 8,
  stackMd: 16,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
