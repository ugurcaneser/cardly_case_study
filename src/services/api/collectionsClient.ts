import { apiFetch } from '@/src/services/api/client';
import type { Collection, CollectionCreateInput, CollectionDetail } from '@/src/types/collection';

export function listCollections(): Promise<Collection[]> {
  return apiFetch<Collection[]>('/collections');
}

export function getCollection(id: number): Promise<CollectionDetail> {
  return apiFetch<CollectionDetail>(`/collections/${id}`);
}

export function createCollection(input: CollectionCreateInput): Promise<Collection> {
  return apiFetch<Collection>('/collections', { method: 'POST', body: input });
}

export function renameCollection(id: number, name: string): Promise<Collection> {
  return apiFetch<Collection>(`/collections/${id}`, { method: 'PATCH', body: { name } });
}

export function deleteCollection(id: number): Promise<void> {
  return apiFetch<void>(`/collections/${id}`, { method: 'DELETE' });
}

export function addCardToCollection(collectionId: number, cardId: number): Promise<CollectionDetail> {
  return apiFetch<CollectionDetail>(`/collections/${collectionId}/cards/${cardId}`, {
    method: 'POST',
  });
}

export function removeCardFromCollection(
  collectionId: number,
  cardId: number
): Promise<CollectionDetail> {
  return apiFetch<CollectionDetail>(`/collections/${collectionId}/cards/${cardId}`, {
    method: 'DELETE',
  });
}
