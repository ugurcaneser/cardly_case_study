import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardListItem } from '@/components/card-list-item';
import { EmptyState } from '@/components/empty-state';
import { TextInputModal } from '@/components/text-input-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { AnalyticsEvents } from '@/src/constants/analytics-events';
import { track } from '@/src/services/analytics/logger';
import {
  useCollectionQuery,
  useDeleteCollectionMutation,
  useRenameCollectionMutation,
} from '@/src/services/api/queries';
import type { Card } from '@/src/types/card';
import { getErrorMessage } from '@/src/utils/errors';

export default function CollectionDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const collectionId = Number(id);

  const collectionQuery = useCollectionQuery(collectionId);
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
      {
        onSuccess: () => {
          track(AnalyticsEvents.COLLECTION_RENAMED, { collectionId, name });
          setRenameModalVisible(false);
        },
      }
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
          track(AnalyticsEvents.COLLECTION_DELETED, { collectionId });
          router.back();
        },
      },
    ]);
  }

  if (collectionQuery.isPending) {
    return (
      <ThemedView style={styles.centered}>
        <Stack.Screen options={{ title: 'Collection' }} />
        <ActivityIndicator accessibilityLabel="Loading" />
      </ThemedView>
    );
  }

  if (collectionQuery.isError) {
    return (
      <>
        <Stack.Screen options={{ title: 'Collection' }} />
        <EmptyState
          icon="folder.fill"
          title="Couldn't load this collection"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => collectionQuery.refetch()}
        />
      </>
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
          <ThemedText style={[styles.actionText, { color: Colors.error }]}>Delete Collection</ThemedText>
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
          renderItem={({ item }: { item: Card }) => (
            <CardListItem card={item} onPress={() => router.push(`/card/${item.id}`)} />
          )}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 16 }]}
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
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: 12,
  },
  actionText: {
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.stackSm,
    gap: Spacing.stackSm,
  },
});
