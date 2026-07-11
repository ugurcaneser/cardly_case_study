import { router } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardListItem } from '@/components/card-list-item';
import { FAB_CLEARANCE_ABOVE_TAB_BAR } from '@/components/capture-tab-button';
import { EmptyState } from '@/components/empty-state';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useCardsQuery } from '@/src/services/api/queries';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const cardsQuery = useCardsQuery();

  if (cardsQuery.isPending) {
    return (
      <ThemedView style={styles.container}>
        <ScreenHeader title="History" />
        <ActivityIndicator style={styles.centered} color={Colors.primary} />
      </ThemedView>
    );
  }

  if (cardsQuery.isError) {
    return (
      <ThemedView style={styles.container}>
        <ScreenHeader title="History" />
        <EmptyState
          icon="clock.fill"
          title="Couldn't load history"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => cardsQuery.refetch()}
        />
      </ThemedView>
    );
  }

  const cards = cardsQuery.data;

  if (cards.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ScreenHeader title="History" />
        <EmptyState
          icon="clock.fill"
          title="History is empty."
          description="Scan your first card to get started"
          actionLabel="Start Scanning"
          onAction={() => router.push('/capture')}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="History" />
      <FlatList
        data={cards}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <CardListItem card={item} onPress={() => router.push(`/card/${item.id}`)} />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + FAB_CLEARANCE_ABOVE_TAB_BAR },
        ]}
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
  },
  listContent: {
    paddingHorizontal: Spacing.containerMargin,
    gap: Spacing.stackSm,
  },
});
