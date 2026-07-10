import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { CardStateBadge } from '@/components/card-state-badge';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Card } from '@/src/types/card';

type CardListItemProps = {
  card: Card;
  onPress?: () => void;
};

export function CardListItem({ card, onPress }: CardListItemProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const title = card.matched_name ?? card.ocr_parsed_name ?? 'Unrecognized card';
  const subtitle = card.matched_set_name;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} accessibilityRole="button">
      <View style={[styles.thumbnail, { backgroundColor: `${colors.icon}22` }]}>
        {card.thumbnail_base64 ? (
          <Image
            source={{ uri: `data:image/jpeg;base64,${card.thumbnail_base64}` }}
            style={styles.thumbnailImage}
          />
        ) : null}
      </View>

      <View style={styles.info}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText style={[styles.subtitle, { color: colors.icon }]} numberOfLines={1}>
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
