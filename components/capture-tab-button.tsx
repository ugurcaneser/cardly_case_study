import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * A custom `tabBarButton` for the tab bar's center slot. It never lets React
 * Navigation's default `onPress` run (which would switch to this tab's own,
 * unreachable-by-design screen) — pressing it always opens the capture modal
 * instead, so the underlying tab route is just a placeholder target.
 */
export function CaptureTabButton() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <Pressable
        onPress={() => router.push('/capture')}
        style={[styles.button, { backgroundColor: colors.tint }]}
        accessibilityRole="button"
        accessibilityLabel="Scan a card">
        <IconSymbol name="camera.fill" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});
