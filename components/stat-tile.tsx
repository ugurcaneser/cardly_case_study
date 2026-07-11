import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BentoCard } from '@/components/ui/bento-card';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors, Radii } from '@/constants/theme';

type StatTileProps = {
  icon: IconSymbolName;
  value: string;
  label: string;
};

export function StatTile({ icon, value, label }: StatTileProps) {
  return (
    <BentoCard style={styles.tile}>
      <View style={styles.iconCircle}>
        <IconSymbol name={icon} size={18} color={Colors.primary} />
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
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
  },
  value: {
    marginTop: 4,
  },
});
