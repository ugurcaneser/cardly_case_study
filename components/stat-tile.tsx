import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type StatTileProps = {
  icon: IconSymbolName;
  value: string;
  label: string;
};

export function StatTile({ icon, value, label }: StatTileProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.tile}>
      <IconSymbol name={icon} size={20} color={colors.tint} />
      <ThemedText type="defaultSemiBold" style={styles.value}>
        {value}
      </ThemedText>
      <ThemedText style={[styles.label, { color: colors.icon }]}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
  },
  value: {
    fontSize: 18,
  },
  label: {
    fontSize: 12,
  },
});
