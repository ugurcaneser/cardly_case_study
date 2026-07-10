import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { CollectionTile } from '@/components/collection-tile';
import { EmptyState } from '@/components/empty-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCollectionsQuery, useCreateCollectionMutation } from '@/src/services/api/queries';
import type { Collection } from '@/src/types/collection';
import { getErrorMessage } from '@/src/utils/errors';

type GridItem = { kind: 'create' } | { kind: 'collection'; collection: Collection };

export default function CollectionsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const collectionsQuery = useCollectionsQuery();
  const createCollectionMutation = useCreateCollectionMutation();

  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  function openCreateModal() {
    createCollectionMutation.reset();
    setNewCollectionName('');
    setCreateModalVisible(true);
  }

  function handleCreate() {
    const name = newCollectionName.trim();
    if (!name) {
      return;
    }
    createCollectionMutation.mutate(
      { name },
      { onSuccess: () => setCreateModalVisible(false) }
    );
  }

  if (collectionsQuery.isPending) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (collectionsQuery.isError) {
    return (
      <EmptyState
        icon="folder.fill"
        title="Couldn't load collections"
        description="Check your connection and try again."
        actionLabel="Retry"
        onAction={() => collectionsQuery.refetch()}
      />
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
          keyExtractor={(item) => (item.kind === 'create' ? 'create' : String(item.collection.id))}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContent}
          renderItem={({ item }) =>
            item.kind === 'create' ? (
              <TouchableOpacity
                style={[styles.tile, styles.createTile, { borderColor: colors.tint }]}
                onPress={openCreateModal}
                accessibilityRole="button">
                <IconSymbol name="plus" size={28} color={colors.tint} />
                <ThemedText style={[styles.createLabel, { color: colors.tint }]}>
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

      <Modal
        visible={isCreateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalCard, { borderColor: colors.icon }]}>
            <ThemedText type="subtitle">New Collection</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.icon, color: colors.text }]}
              placeholder="Collection name"
              placeholderTextColor={colors.icon}
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              autoFocus
            />
            {createCollectionMutation.isError ? (
              <ThemedText style={styles.errorText}>
                {getErrorMessage(createCollectionMutation.error)}
              </ThemedText>
            ) : null}
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setCreateModalVisible(false)}
                accessibilityRole="button">
                <ThemedText>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreate}
                disabled={createCollectionMutation.isPending || !newCollectionName.trim()}
                accessibilityRole="button">
                <ThemedText style={[styles.createLabel, { color: colors.tint }]}>
                  {createCollectionMutation.isPending ? 'Creating…' : 'Create'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 13,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 24,
    marginTop: 4,
  },
});
