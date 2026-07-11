import { StyleSheet, View, type ViewProps } from 'react-native';

import { Colors, Radii } from '@/constants/theme';

/**
 * The "Bento Card" building block of the design system: a modular,
 * glass-bordered container used to group dense data into digestible units.
 */
export function BentoCard({ style, children, ...rest }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: 16,
  },
});
