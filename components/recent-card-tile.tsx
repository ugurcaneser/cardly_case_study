import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radii } from '@/constants/theme';
import { useCardImageUri } from '@/hooks/use-card-image-uri';
import type { Card } from '@/src/types/card';

type RecentCardTileProps = {
  card: Card;
  onPress: () => void;
};

const TILE_WIDTH = 140;

export function RecentCardTile({ card, onPress }: RecentCardTileProps) {
  const title = card.matched_name ?? card.ocr_parsed_name ?? 'Unrecognized card';
  const { uri: imageUri, onError } = useCardImageUri(card);

  return (
    <TouchableOpacity style={styles.tile} onPress={onPress} accessibilityRole="button">
      <View style={styles.imageWrapper}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" onError={onError} />
        ) : null}
      </View>
      <ThemedText type="bodyMd" numberOfLines={1} style={styles.title}>
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: TILE_WIDTH,
    gap: 6,
  },
  imageWrapper: {
    width: TILE_WIDTH,
    aspectRatio: 5 / 7,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    marginTop: 2,
  },
});
