export const queryKeys = {
  cards: ['cards'] as const,
  card: (id: number) => ['cards', id] as const,
  collections: ['collections'] as const,
  collection: (id: number) => ['collections', id] as const,
};
