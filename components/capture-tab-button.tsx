import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii } from '@/constants/theme';

// Matches the explicit height set on the tab bar in app/(tabs)/_layout.tsx —
// kept in sync there since this button floats independently above it rather
// than being one of its icons.
const TAB_BAR_CONTENT_HEIGHT = 64;
const GAP_ABOVE_TAB_BAR = 20;

/**
 * A floating action button rendered above the tab bar — not one of its
 * icons. The tab bar only shows Home/History/Collections; this is the sole
 * entry point to the capture modal from within the tab screens.
 */
export function CaptureTabButton() {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Scan a card"
      style={[styles.wrapper, { bottom: TAB_BAR_CONTENT_HEIGHT + insets.bottom + GAP_ABOVE_TAB_BAR }]}
      onPress={() => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        router.push('/capture');
      }}>
      <LinearGradient
        colors={[Colors.primaryContainer, Colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fab}>
        <IconSymbol name="camera.fill" size={26} color={Colors.onPrimary} />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    alignSelf: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
