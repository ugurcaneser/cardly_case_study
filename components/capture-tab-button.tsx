import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';

/**
 * Renders exactly like any other tab (via `HapticTab`, using the icon/label
 * `props.children` React Navigation already built from this Tabs.Screen's
 * `tabBarIcon`/`title`) but overrides `onPress` so it never switches to this
 * tab's own, unreachable-by-design screen — it always opens the capture
 * modal instead.
 */
export function CaptureTabButton(props: BottomTabBarButtonProps) {
  return <HapticTab {...props} onPress={() => router.push('/capture')} />;
}
