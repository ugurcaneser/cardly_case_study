import { Colors } from '@/constants/theme';

/** Resolves a themed color, letting a caller-supplied override win. */
export function useThemeColor(colorOverride: string | undefined, colorName: keyof typeof Colors) {
  return colorOverride ?? Colors[colorName];
}
