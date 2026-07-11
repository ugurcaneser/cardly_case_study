import { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { AnalyticsEvents } from '@/src/constants/analytics-events';
import { track } from '@/src/services/analytics/logger';
import {
  useAddCardToCollectionMutation,
  useCollectionsQuery,
  useRemoveCardFromCollectionMutation,
} from '@/src/services/api/queries';

type CollectionPickerSheetProps = {
  visible: boolean;
  cardId: number;
  onClose: () => void;
};

/**
 * There's no "which collections is this card already in" endpoint, so this
 * sheet doesn't pre-check anything - it tracks only what's toggled during
 * this open session. Re-adding an already-member card (or removing a
 * non-member) is a safe no-op on the backend either way.
 */
export function CollectionPickerSheet({ visible, cardId, onClose }: CollectionPickerSheetProps) {
  const collectionsQuery = useCollectionsQuery();
  const addMutation = useAddCardToCollectionMutation();
  const removeMutation = useRemoveCardFromCollectionMutation();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  function toggle(collectionId: number) {
    const next = new Set(selectedIds);
    if (next.has(collectionId)) {
      next.delete(collectionId);
      removeMutation.mutate(
        { collectionId, cardId },
        { onSuccess: () => track(AnalyticsEvents.CARD_REMOVED_FROM_COLLECTION, { collectionId, cardId }) }
      );
    } else {
      next.add(collectionId);
      addMutation.mutate(
        { collectionId, cardId },
        { onSuccess: () => track(AnalyticsEvents.CARD_ADDED_TO_COLLECTION, { collectionId, cardId }) }
      );
    }
    setSelectedIds(next);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ThemedView style={[styles.sheet, { borderColor: Colors.icon }]}>
          <ThemedText type="subtitle" style={styles.title}>
            Add to Collection
          </ThemedText>

          {collectionsQuery.isPending ? (
            <ActivityIndicator accessibilityLabel="Loading" style={styles.loading} />
          ) : collectionsQuery.isError ? (
            <ThemedText style={styles.errorText}>Couldn&apos;t load collections.</ThemedText>
          ) : collectionsQuery.data.length === 0 ? (
            <ThemedText style={[styles.emptyText, { color: Colors.icon }]}>
              You don&apos;t have any collections yet.
            </ThemedText>
          ) : (
            <View style={styles.list}>
              {collectionsQuery.data.map((collection) => {
                const isSelected = selectedIds.has(collection.id);
                return (
                  <TouchableOpacity
                    key={collection.id}
                    style={styles.row}
                    onPress={() => toggle(collection.id)}
                    accessibilityRole="button">
                    <ThemedText style={styles.rowName}>{collection.name}</ThemedText>
                    <IconSymbol
                      name={isSelected ? 'checkmark' : 'plus'}
                      size={20}
                      color={isSelected ? Colors.tint : Colors.icon}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: Colors.tint }]}
            onPress={onClose}
            accessibilityRole="button">
            <ThemedText style={styles.doneButtonText} color="#fff">
              Done
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 20,
    gap: 12,
    maxHeight: '70%',
  },
  title: {
    textAlign: 'center',
  },
  loading: {
    marginVertical: 24,
  },
  errorText: {
    color: '#991B1B',
    textAlign: 'center',
    marginVertical: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 16,
  },
  list: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowName: {
    fontSize: 16,
  },
  doneButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 28,
    marginTop: 8,
  },
  doneButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});
