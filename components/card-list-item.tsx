import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { CardStateBadge } from '@/components/card-state-badge';
import { ThemedText } from '@/components/themed-text';
import { BentoCard } from '@/components/ui/bento-card';
import { Colors, Radii } from '@/constants/theme';
import { useCardImageUri } from '@/hooks/use-card-image-uri';
import type { Card } from '@/src/types/card';

type CardListItemProps = {
  card: Card;
  onPress?: () => void;
};

export function CardListItem({ card, onPress }: CardListItemProps) {
  const title = card.matched_name ?? card.ocr_parsed_name ?? 'Unrecognized card';
  const subtitle = card.matched_set_name;
  const { uri: imageUri, onError } = useCardImageUri(card);

  return (
    <TouchableOpacity onPress={onPress} accessibilityRole="button">
      <BentoCard style={styles.row}>
        <View style={styles.thumbnail}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.thumbnailImage} contentFit="cover" onError={onError} />
          ) : null}
        </View>

        <View style={styles.info}>
          <ThemedText type="titleLg" numberOfLines={1}>
            {title}
          </ThemedText>
          {subtitle ? (
            <ThemedText type="bodyMd" style={{ color: Colors.onSurfaceVariant }} numberOfLines={1}>
              {subtitle}
            </ThemedText>
          ) : null}
        </View>

        <CardStateBadge status={card.status} />
      </BentoCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceContainerHigh,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    gap: 2,
  },
});
