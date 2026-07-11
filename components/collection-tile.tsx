import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BentoCard } from '@/components/ui/bento-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import type { Collection } from '@/src/types/collection';

type CollectionTileProps = {
  collection: Collection;
  onPress?: () => void;
};

export function CollectionTile({ collection, onPress }: CollectionTileProps) {
  return (
    <TouchableOpacity style={styles.wrapper} onPress={onPress} accessibilityRole="button">
      <BentoCard style={styles.tile}>
        <IconSymbol name="folder.fill" size={26} color={Colors.tertiary} />
        <ThemedText type="titleLg" numberOfLines={1} style={styles.name}>
          {collection.name}
        </ThemedText>
        <ThemedText type="bodyMd" style={{ color: Colors.onSurfaceVariant }}>
          {collection.card_count} {collection.card_count === 1 ? 'card' : 'cards'}
        </ThemedText>
      </BentoCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    aspectRatio: 1,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  name: {
    textAlign: 'center',
  },
});
