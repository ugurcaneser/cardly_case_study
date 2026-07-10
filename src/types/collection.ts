import type { Card } from '@/src/types/card';

export type Collection = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  card_count: number;
};

export type CollectionDetail = Collection & {
  cards: Card[];
};

export type CollectionCreateInput = {
  name: string;
};
