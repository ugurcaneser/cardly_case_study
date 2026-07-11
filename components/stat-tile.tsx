import { StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BentoCard } from '@/components/ui/bento-card';
import { Colors, Radii } from '@/constants/theme';

type StatTileProps = {
  emoji: string;
  value: string;
  label: string;
};

export function StatTile({ emoji, value, label }: StatTileProps) {
  return (
    <BentoCard style={styles.tile}>
      <View style={styles.iconCircle}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <ThemedText type="headlineSm" style={styles.value}>
        {value}
      </ThemedText>
      <ThemedText type="labelMd" style={{ color: Colors.onSurfaceVariant }}>
        {label}
      </ThemedText>
    </BentoCard>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    gap: 8,
    padding: 14,
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
  },
  emoji: {
    fontSize: 26,
    textAlign: 'center',
  },
  value: {
    marginTop: 4,
    textAlign: 'center',
  },
});
