import { useQuery } from '@tanstack/react-query';

import { listCards } from '@/src/services/api/cardsClient';
import { listCollections } from '@/src/services/api/collectionsClient';
import { queryKeys } from '@/src/constants/query-keys';

export function useCardsQuery() {
  return useQuery({ queryKey: queryKeys.cards, queryFn: listCards });
}

export function useCollectionsQuery() {
  return useQuery({ queryKey: queryKeys.collections, queryFn: listCollections });
}
