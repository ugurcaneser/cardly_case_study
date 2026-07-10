import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Collection } from '@/src/types/collection';

type CollectionTileProps = {
  collection: Collection;
  onPress?: () => void;
};

export function CollectionTile({ collection, onPress }: CollectionTileProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isEmpty = collection.card_count === 0;

  return (
    <TouchableOpacity
      style={[
        styles.tile,
        isEmpty
          ? { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.icon }
          : { backgroundColor: `${colors.icon}11` },
      ]}
      onPress={onPress}
      accessibilityRole="button">
      <IconSymbol name="folder.fill" size={28} color={colors.tint} />
      <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.name}>
        {collection.name}
      </ThemedText>
      <ThemedText style={[styles.count, { color: colors.icon }]}>
        {collection.card_count} {collection.card_count === 1 ? 'card' : 'cards'}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 12,
  },
  name: {
    textAlign: 'center',
  },
  count: {
    fontSize: 12,
  },
});
