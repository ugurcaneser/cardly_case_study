import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createCard, deleteCard, getCard, listCards } from '@/src/services/api/cardsClient';
import {
  addCardToCollection,
  createCollection,
  deleteCollection,
  getCollection,
  listCollections,
  removeCardFromCollection,
  renameCollection,
} from '@/src/services/api/collectionsClient';
import { enrichCardImage } from '@/src/services/api/enrichClient';
import { queryKeys } from '@/src/constants/query-keys';
import type { CardCreateInput } from '@/src/types/card';
import type { CollectionCreateInput } from '@/src/types/collection';

export function useCardsQuery() {
  return useQuery({ queryKey: queryKeys.cards, queryFn: listCards });
}

export function useCreateCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CardCreateInput) => createCard(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards });
    },
  });
}

export function useCardQuery(id: number) {
  return useQuery({ queryKey: queryKeys.card(id), queryFn: () => getCard(id) });
}

export function useDeleteCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards });
    },
  });
}

export function useEnrichMutation() {
  return useMutation({
    mutationFn: (localUri: string) => enrichCardImage(localUri),
  });
}

export function useCollectionsQuery() {
  return useQuery({ queryKey: queryKeys.collections, queryFn: listCollections });
}

export function useCollectionQuery(id: number) {
  return useQuery({ queryKey: queryKeys.collection(id), queryFn: () => getCollection(id) });
}

export function useCreateCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CollectionCreateInput) => createCollection(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections });
    },
  });
}

export function useRenameCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => renameCollection(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections });
    },
  });
}

export function useDeleteCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections });
    },
  });
}

export function useAddCardToCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, cardId }: { collectionId: number; cardId: number }) =>
      addCardToCollection(collectionId, cardId),
    // queryKeys.collections (['collections']) already prefix-matches every
    // queryKeys.collection(id) (['collections', id]) under React Query's
    // default non-exact invalidation, so a second explicit invalidate call
    // would just trigger a redundant duplicate refetch.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections });
    },
  });
}

export function useRemoveCardFromCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, cardId }: { collectionId: number; cardId: number }) =>
      removeCardFromCollection(collectionId, cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections });
    },
  });
}
