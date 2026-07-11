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
const TAB_BAR_CONTENT_HEIGHT = 76;
const GAP_ABOVE_TAB_BAR = 12;
const FAB_SIZE = 60;

// How far the FAB's top edge sits above the tab-bar-reserved content area —
// list/scroll screens need at least this much of their own bottom padding
// (on top of insets.bottom) so their last item never renders underneath it.
export const FAB_CLEARANCE_ABOVE_TAB_BAR = GAP_ABOVE_TAB_BAR + FAB_SIZE;

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
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
