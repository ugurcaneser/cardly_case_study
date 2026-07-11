import type { TextStyle } from 'react-native';

/**
 * Inter is loaded per-weight (Inter_400Regular, Inter_600SemiBold, ...) via
 * @expo-google-fonts/inter in app/_layout.tsx — RN can't fake a weight on a
 * custom font by pairing `fontFamily` with `fontWeight`, so each preset here
 * points at the exact loaded family name for its weight instead.
 */
export const Typography: Record<string, TextStyle> = {
  displaySm: {
    fontFamily: 'Inter_700Bold',
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.6,
  },
  headlineMd: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.24,
  },
  headlineSm: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
  },
  titleLg: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
  },
  bodyLg: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  labelMd: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  monoLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.22,
  },
};
