import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  color?: string;
};

export function ThemedView({ style, color, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor(color, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
