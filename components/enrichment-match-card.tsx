import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import type { EnrichMatch } from '@/src/types/enrichment';
import { capitalize, formatUsdPrice } from '@/src/utils/enrichmentCopy';

type EnrichmentMatchCardProps = {
  match: EnrichMatch;
};

export function EnrichmentMatchCard({ match }: EnrichmentMatchCardProps) {
  const price = formatUsdPrice(match.prices);

  return (
    <View style={styles.container}>
      <View style={[styles.imageWrapper, { backgroundColor: `${Colors.icon}22` }]}>
        {match.imageUrl ? (
          <Image source={{ uri: match.imageUrl }} style={styles.image} contentFit="contain" />
        ) : null}
      </View>

      <ThemedText type="subtitle" style={styles.name}>
        {match.name}
      </ThemedText>
      <ThemedText style={[styles.meta, { color: Colors.icon }]}>
        {match.setName} · #{match.collectorNumber} · {capitalize(match.rarity)}
      </ThemedText>

      <ThemedText style={styles.typeLine}>
        {match.manaCost ? `${match.typeLine}  ${match.manaCost}` : match.typeLine}
      </ThemedText>

      {match.oracleText ? <ThemedText style={styles.oracleText}>{match.oracleText}</ThemedText> : null}

      {price ? <ThemedText style={[styles.price, { color: Colors.tint }]}>{price}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  imageWrapper: {
    width: 200,
    aspectRatio: 5 / 7,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    textAlign: 'center',
  },
  meta: {
    fontSize: 13,
    textAlign: 'center',
  },
  typeLine: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  oracleText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
});
