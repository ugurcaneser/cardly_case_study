import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { listCards } from '@/src/services/api/cardsClient';
import { createCollection, listCollections } from '@/src/services/api/collectionsClient';
import { queryKeys } from '@/src/constants/query-keys';
import type { CollectionCreateInput } from '@/src/types/collection';

export function useCardsQuery() {
  return useQuery({ queryKey: queryKeys.cards, queryFn: listCards });
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
