import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BentoCard } from '@/components/ui/bento-card';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Colors, Spacing } from '@/constants/theme';
import { getDeviceId } from '@/src/services/device/deviceId';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDeviceId().then((id) => {
      if (!cancelled) {
        setDeviceId(id);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="Settings" />
      <View style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <BentoCard style={styles.card}>
          <ThemedText type="labelMd" style={{ color: Colors.onSurfaceVariant }}>
            Device ID
          </ThemedText>
          <ThemedText type="bodyMd" selectable>
            {deviceId ?? 'Loading…'}
          </ThemedText>
        </BentoCard>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.stackSm,
  },
  card: {
    gap: 4,
  },
});
