import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FAB_CLEARANCE_ABOVE_TAB_BAR } from '@/components/capture-tab-button';
import { CollectionTile } from '@/components/collection-tile';
import { EmptyState } from '@/components/empty-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TextInputModal } from '@/components/text-input-modal';
import { BentoCard } from '@/components/ui/bento-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Colors, Spacing } from '@/constants/theme';
import { AnalyticsEvents } from '@/src/constants/analytics-events';
import { track } from '@/src/services/analytics/logger';
import { useCollectionsQuery, useCreateCollectionMutation } from '@/src/services/api/queries';
import type { Collection } from '@/src/types/collection';
import { getErrorMessage } from '@/src/utils/errors';

type GridItem = { kind: 'create' } | { kind: 'collection'; collection: Collection } | { kind: 'filler' };

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
      <ThemedView style={styles.container}>
        <ScreenHeader title="Collections" />
        <ActivityIndicator style={styles.centered} color={Colors.primary} />
      </ThemedView>
    );
  }

  if (collectionsQuery.isError) {
    return (
      <ThemedView style={styles.container}>
        <ScreenHeader title="Collections" />
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
  // A lone item in the last row of a 2-column FlatList has no flex:1 sibling
  // to share the row with, so it stretches to fill the whole row (and, via
  // aspectRatio:1, grows just as tall). An invisible filler keeps every row
  // at exactly 2 cells so real tiles never stretch.
  if (gridData.length % 2 !== 0) {
    gridData.push({ kind: 'filler' });
  }

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="Collections" />

      {collections.length === 0 ? (
        <EmptyState
          icon="folder.fill"
          title="No collections yet."
          description="Create a collection to start organizing your cards."
          actionLabel="Create Collection"
          onAction={openCreateModal}
        />
      ) : (
        <FlatList
          data={gridData}
          keyExtractor={(item, index) =>
            item.kind === 'collection' ? String(item.collection.id) : `${item.kind}-${index}`
          }
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.gridContent,
            { paddingBottom: insets.bottom + FAB_CLEARANCE_ABOVE_TAB_BAR },
          ]}
          renderItem={({ item }) => {
            if (item.kind === 'filler') {
              return <View style={styles.tileWrapper} />;
            }
            return item.kind === 'create' ? (
              <TouchableOpacity style={styles.tileWrapper} onPress={openCreateModal} accessibilityRole="button">
                <BentoCard style={[styles.tile, styles.createTile]}>
                  <IconSymbol name="plus" size={26} color={Colors.primary} />
                  <ThemedText type="titleLg" style={{ color: Colors.primary }}>
                    Create New
                  </ThemedText>
                </BentoCard>
              </TouchableOpacity>
            ) : (
              <CollectionTile
                collection={item.collection}
                onPress={() => router.push(`/collection/${item.collection.id}`)}
              />
            );
          }}
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
  },
  row: {
    gap: Spacing.gutterBento,
    paddingHorizontal: Spacing.containerMargin,
  },
  gridContent: {
    gap: Spacing.gutterBento,
    paddingTop: Spacing.stackSm,
  },
  // Mirrors CollectionTile's own wrapper/tile shape exactly (same two-layer
  // flex+aspectRatio-then-BentoCard structure) so the "Create New" tile and
  // real collection tiles are pixel-identical in size — they previously
  // used two different structures and rendered as different-sized boxes.
  tileWrapper: {
    flex: 1,
    aspectRatio: 1,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  createTile: {
    borderStyle: 'dashed',
    borderColor: Colors.outlineVariant,
  },
});
