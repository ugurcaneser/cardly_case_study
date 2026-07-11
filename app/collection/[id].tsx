import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { CardListItem } from '@/components/card-list-item';
import { EmptyState } from '@/components/empty-state';
import { TextInputModal } from '@/components/text-input-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import {
  useCollectionQuery,
  useDeleteCollectionMutation,
  useRemoveCardFromCollectionMutation,
  useRenameCollectionMutation,
} from '@/src/services/api/queries';
import type { Card } from '@/src/types/card';
import { getErrorMessage } from '@/src/utils/errors';

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const collectionId = Number(id);

  const collectionQuery = useCollectionQuery(collectionId);
  const removeCardMutation = useRemoveCardFromCollectionMutation();
  const renameCollectionMutation = useRenameCollectionMutation();
  const deleteCollectionMutation = useDeleteCollectionMutation();

  const [isRenameModalVisible, setRenameModalVisible] = useState(false);

  function openRenameModal() {
    renameCollectionMutation.reset();
    setRenameModalVisible(true);
  }

  function handleRename(name: string) {
    renameCollectionMutation.mutate(
      { id: collectionId, name },
      { onSuccess: () => setRenameModalVisible(false) }
    );
  }

  function handleDelete() {
    Alert.alert('Delete this collection?', "This won't delete the cards inside it.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteCollectionMutation.mutateAsync(collectionId);
          router.back();
        },
      },
    ]);
  }

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

      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={openRenameModal} accessibilityRole="button">
          <ThemedText style={[styles.actionText, { color: Colors.tint }]}>Rename</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} accessibilityRole="button">
          <ThemedText style={[styles.actionText, { color: '#991B1B' }]}>Delete Collection</ThemedText>
        </TouchableOpacity>
      </View>

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

      <TextInputModal
        visible={isRenameModalVisible}
        title="Rename Collection"
        placeholder="Collection name"
        initialValue={collection.name}
        confirmLabel="Save"
        submittingLabel="Saving…"
        isSubmitting={renameCollectionMutation.isPending}
        errorMessage={
          renameCollectionMutation.isError ? getErrorMessage(renameCollectionMutation.error) : null
        }
        onCancel={() => setRenameModalVisible(false)}
        onConfirm={handleRename}
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
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  actionText: {
    fontWeight: '600',
    fontSize: 14,
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
