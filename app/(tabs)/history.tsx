import { router } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';

import { CardListItem } from '@/components/card-list-item';
import { EmptyState } from '@/components/empty-state';
import { ThemedView } from '@/components/themed-view';
import { useCardsQuery } from '@/src/services/api/queries';

export default function HistoryScreen() {
  const cardsQuery = useCardsQuery();

  if (cardsQuery.isPending) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (cardsQuery.isError) {
    return (
      <EmptyState
        icon="clock.fill"
        title="Couldn't load history"
        description="Check your connection and try again."
        actionLabel="Retry"
        onAction={() => cardsQuery.refetch()}
      />
    );
  }

  const cards = cardsQuery.data;

  if (cards.length === 0) {
    return (
      <EmptyState
        icon="clock.fill"
        title="History is empty."
        description="Scan your first card to get started"
        actionLabel="Start Scanning"
        onAction={() => router.push('/capture')}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={cards}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <CardListItem card={item} onPress={() => router.push(`/card/${item.id}`)} />
        )}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});
