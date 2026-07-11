import { Text, type TextProps } from 'react-native';

import { Colors } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  color?: string;
  type?:
    | 'default'
    | 'title'
    | 'defaultSemiBold'
    | 'subtitle'
    | 'link'
    | 'displaySm'
    | 'headlineMd'
    | 'headlineSm'
    | 'titleLg'
    | 'bodyLg'
    | 'bodyMd'
    | 'labelMd'
    | 'monoLabel';
};

// Legacy names kept working (many screens still pass them) but repointed at
// the new type scale so every call site restyles for free.
const TYPE_STYLES: Record<NonNullable<ThemedTextProps['type']>, object> = {
  default: Typography.bodyLg,
  defaultSemiBold: Typography.titleLg,
  title: Typography.displaySm,
  subtitle: Typography.headlineSm,
  link: { ...Typography.bodyLg, color: Colors.primary },
  displaySm: Typography.displaySm,
  headlineMd: Typography.headlineMd,
  headlineSm: Typography.headlineSm,
  titleLg: Typography.titleLg,
  bodyLg: Typography.bodyLg,
  bodyMd: Typography.bodyMd,
  labelMd: Typography.labelMd,
  monoLabel: Typography.monoLabel,
};

export function ThemedText({ style, color, type = 'default', ...rest }: ThemedTextProps) {
  const resolvedColor = useThemeColor(color, 'text');

  return <Text style={[{ color: resolvedColor }, TYPE_STYLES[type], style]} {...rest} />;
}
