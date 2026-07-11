import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type ScreenHeaderProps = {
  title: string;
};

/**
 * The large top-of-screen title used identically across every tab screen —
 * a shared component (not copy-pasted per screen) so top padding and
 * horizontal margin never drift out of sync with each screen's own content.
 */
export function ScreenHeader({ title }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
      <ThemedText type="headlineMd">{title}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.containerMargin,
    paddingBottom: 16,
  },
});
