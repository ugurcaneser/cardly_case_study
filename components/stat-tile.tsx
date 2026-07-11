import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BentoCard } from '@/components/ui/bento-card';
import { Colors, Radii } from '@/constants/theme';

type StatTileProps = {
  emoji: string;
  value: string;
  label: string;
  onPress?: () => void;
};

export function StatTile({ emoji, value, label, onPress }: StatTileProps) {
  const content = (
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

  // The flex:1 that shares the row's width equally must live on this outer
  // wrapper, not on BentoCard itself — nesting it one level deeper would put
  // it inside a (default column-flex) Pressable, where flex:1 governs height
  // instead of width, sizing pressable tiles differently from plain ones.
  if (!onPress) {
    return <View style={styles.wrapper}>{content}</View>;
  }

  return (
    <Pressable style={styles.wrapper} onPress={onPress} accessibilityRole="button">
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  tile: {
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
