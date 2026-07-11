import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RecentCardTile } from '@/components/recent-card-tile';
import { StatTile } from '@/components/stat-tile';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BentoCard } from '@/components/ui/bento-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Colors, Spacing } from '@/constants/theme';
import { useCardsQuery, useCollectionsQuery } from '@/src/services/api/queries';
import { calculateEstimatedValueUsd } from '@/src/utils/cardStats';

const RECENT_CARDS_LIMIT = 8;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const cardsQuery = useCardsQuery();
  const collectionsQuery = useCollectionsQuery();

  const cardCount = cardsQuery.data?.length ?? 0;
  const collectionCount = collectionsQuery.data?.length ?? 0;
  const estimatedValue = calculateEstimatedValueUsd(cardsQuery.data ?? []);
  // Backend already returns cards newest-first.
  const recentCards = (cardsQuery.data ?? []).slice(0, RECENT_CARDS_LIMIT);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}>
        <ThemedText type="headlineMd">Cardly</ThemedText>

        <BentoCard style={styles.heroCard}>
          <View style={styles.heroIconRow}>
            <IconSymbol name="camera.fill" size={20} color={Colors.tertiary} />
            <ThemedText type="titleLg">Scan a Card</ThemedText>
          </View>
          <ThemedText type="bodyMd" style={{ color: Colors.onSurfaceVariant }}>
            Identify it and add it to your collection in seconds.
          </ThemedText>
          <PrimaryButton label="Scan Now" onPress={() => router.push('/capture')} style={styles.heroButton} />
        </BentoCard>

        <View style={styles.statsRow}>
          <StatTile emoji="🃏" value={String(cardCount)} label="Cards" />
          <StatTile emoji="💰" value={`$${estimatedValue.toFixed(2)}`} label="Est. Value" />
          <StatTile emoji="📚" value={String(collectionCount)} label="Collections" />
        </View>

        {recentCards.length > 0 ? (
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <ThemedText type="titleLg">Recent Cards</ThemedText>
              <ThemedText
                type="bodyMd"
                style={{ color: Colors.primary }}
                onPress={() => router.push('/history')}>
                See All
              </ThemedText>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentRow}>
              {recentCards.map((card) => (
                <RecentCardTile key={card.id} card={card} onPress={() => router.push(`/card/${card.id}`)} />
              ))}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.containerMargin,
    gap: Spacing.gutterBento,
  },
  heroCard: {
    gap: Spacing.stackSm,
  },
  heroIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroButton: {
    marginTop: Spacing.stackSm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.gutterBento,
  },
  recentSection: {
    gap: Spacing.stackMd,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentRow: {
    gap: Spacing.gutterBento,
  },
});
