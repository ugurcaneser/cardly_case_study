import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CollectionTile } from '@/components/collection-tile';
import { EmptyState } from '@/components/empty-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TextInputModal } from '@/components/text-input-modal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { AnalyticsEvents } from '@/src/constants/analytics-events';
import { track } from '@/src/services/analytics/logger';
import { useCollectionsQuery, useCreateCollectionMutation } from '@/src/services/api/queries';
import type { Collection } from '@/src/types/collection';
import { getErrorMessage } from '@/src/utils/errors';

type GridItem = { kind: 'create' } | { kind: 'collection'; collection: Collection };

export default function CollectionsScreen() {
  const insets = useSafeAreaInsets();
  const collectionsQuery = useCollectionsQuery();
  const createCollectionMutation = useCreateCollectionMutation();

  const [isCreateModalVisible, setCreateModalVisible] = useState(false);

  function openCreateModal() {
    createCollectionMutation.reset();
    setCreateModalVisible(true);
  }

  function handleCreate(name: string) {
    createCollectionMutation.mutate(
      { name },
      {
        onSuccess: (collection) => {
          track(AnalyticsEvents.COLLECTION_CREATED, { collectionId: collection.id, name });
          setCreateModalVisible(false);
        },
      }
    );
  }

  if (collectionsQuery.isPending) {
    return (
      <ThemedView style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (collectionsQuery.isError) {
    return (
      <ThemedView style={[styles.centered, { paddingTop: insets.top }]}>
        <EmptyState
          icon="folder.fill"
          title="Couldn't load collections"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => collectionsQuery.refetch()}
        />
      </ThemedView>
    );
  }

  const collections = collectionsQuery.data;
  const gridData: GridItem[] = [
    { kind: 'create' },
    ...collections.map((collection): GridItem => ({ kind: 'collection', collection })),
  ];

  return (
    <ThemedView style={styles.container}>
      {collections.length === 0 ? (
        <ThemedView style={[styles.centered, { paddingTop: insets.top }]}>
          <EmptyState
            icon="folder.fill"
            title="No collections yet."
            description="Create a collection to start organizing your cards."
            actionLabel="Create Collection"
            onAction={openCreateModal}
          />
        </ThemedView>
      ) : (
        <FlatList
          data={gridData}
          keyExtractor={(item) => (item.kind === 'create' ? 'create' : String(item.collection.id))}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.gridContent,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
          ]}
          renderItem={({ item }) =>
            item.kind === 'create' ? (
              <TouchableOpacity
                style={[styles.tile, styles.createTile, { borderColor: Colors.tint }]}
                onPress={openCreateModal}
                accessibilityRole="button">
                <IconSymbol name="plus" size={28} color={Colors.tint} />
                <ThemedText style={[styles.createLabel, { color: Colors.tint }]}>
                  Create New
                </ThemedText>
              </TouchableOpacity>
            ) : (
              <CollectionTile
                collection={item.collection}
                onPress={() => router.push(`/collection/${item.collection.id}`)}
              />
            )
          }
        />
      )}

      <TextInputModal
        visible={isCreateModalVisible}
        title="New Collection"
        placeholder="Collection name"
        confirmLabel="Create"
        submittingLabel="Creating…"
        isSubmitting={createCollectionMutation.isPending}
        errorMessage={
          createCollectionMutation.isError ? getErrorMessage(createCollectionMutation.error) : null
        }
        onCancel={() => setCreateModalVisible(false)}
        onConfirm={handleCreate}
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
  row: {
    gap: 12,
    paddingHorizontal: 16,
  },
  gridContent: {
    paddingVertical: 16,
    gap: 12,
  },
  tile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 12,
  },
  createTile: {
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  createLabel: {
    fontWeight: '600',
  },
});
