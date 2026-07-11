import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { CardListItem } from '@/components/card-list-item';
import { EmptyState } from '@/components/empty-state';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useCollectionQuery, useRemoveCardFromCollectionMutation } from '@/src/services/api/queries';
import type { Card } from '@/src/types/card';

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const collectionId = Number(id);

  const collectionQuery = useCollectionQuery(collectionId);
  const removeCardMutation = useRemoveCardFromCollectionMutation();

  if (collectionQuery.isPending) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator accessibilityLabel="Loading" />
      </ThemedView>
    );
  }

  if (collectionQuery.isError) {
    return (
      <EmptyState
        icon="folder.fill"
        title="Couldn't load this collection"
        description="Check your connection and try again."
        actionLabel="Retry"
        onAction={() => collectionQuery.refetch()}
      />
    );
  }

  const collection = collectionQuery.data;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: collection.name }} />

      {collection.cards.length === 0 ? (
        <EmptyState
          icon="folder.fill"
          title="No cards yet."
          description="Add cards to this collection from a card's detail screen."
        />
      ) : (
        <FlatList
          data={collection.cards}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }: { item: Card }) => {
            const cardTitle = item.matched_name ?? item.ocr_parsed_name ?? 'this card';
            return (
              <View style={styles.row}>
                <View style={styles.rowItem}>
                  <CardListItem card={item} onPress={() => router.push(`/card/${item.id}`)} />
                </View>
                <TouchableOpacity
                  onPress={() => removeCardMutation.mutate({ collectionId, cardId: item.id })}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${cardTitle} from collection`}
                  hitSlop={8}>
                  <IconSymbol name="trash" size={18} color={Colors.icon} />
                </TouchableOpacity>
              </View>
            );
          }}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowItem: {
    flex: 1,
  },
});
