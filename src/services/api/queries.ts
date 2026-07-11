import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createCard, listCards } from '@/src/services/api/cardsClient';
import { createCollection, listCollections } from '@/src/services/api/collectionsClient';
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

export function useEnrichMutation() {
  return useMutation({
    mutationFn: (localUri: string) => enrichCardImage(localUri),
  });
}

export function useCollectionsQuery() {
  return useQuery({ queryKey: queryKeys.collections, queryFn: listCollections });
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
