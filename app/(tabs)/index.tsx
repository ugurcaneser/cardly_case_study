import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { StatTile } from '@/components/stat-tile';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCardsQuery, useCollectionsQuery } from '@/src/services/api/queries';
import { calculateEstimatedValueUsd } from '@/src/utils/cardStats';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const cardsQuery = useCardsQuery();
  const collectionsQuery = useCollectionsQuery();

  const cardCount = cardsQuery.data?.length ?? 0;
  const collectionCount = collectionsQuery.data?.length ?? 0;
  const estimatedValue = calculateEstimatedValueUsd(cardsQuery.data ?? []);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.hero}>
        <ThemedText type="title">Cardly</ThemedText>
        <ThemedText style={[styles.heroSubtitle, { color: colors.icon }]}>
          Scan a card to identify it and track your collection.
        </ThemedText>
        <TouchableOpacity
          style={[styles.scanButton, { backgroundColor: colors.tint }]}
          onPress={() => router.push('/capture')}
          accessibilityRole="button">
          <ThemedText style={styles.scanButtonText} lightColor="#fff" darkColor="#fff">
            Scan Now
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <StatTile icon="square.stack.fill" value={String(cardCount)} label="Cards" />
        <StatTile
          icon="dollarsign.circle.fill"
          value={`$${estimatedValue.toFixed(2)}`}
          label="Est. Value"
        />
        <StatTile icon="folder.fill" value={String(collectionCount)} label="Collections" />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  hero: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  heroSubtitle: {
    textAlign: 'center',
  },
  scanButton: {
    marginTop: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
  },
  scanButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
  },
});
