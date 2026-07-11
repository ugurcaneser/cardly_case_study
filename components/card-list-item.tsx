import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { CardStateBadge } from '@/components/card-state-badge';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
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
    <TouchableOpacity style={styles.row} onPress={onPress} accessibilityRole="button">
      <View style={[styles.thumbnail, { backgroundColor: `${Colors.icon}22` }]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.thumbnailImage} onError={onError} />
        ) : null}
      </View>

      <View style={styles.info}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText style={[styles.subtitle, { color: Colors.icon }]} numberOfLines={1}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>

      <CardStateBadge status={card.status} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  subtitle: {
    fontSize: 13,
  },
});
