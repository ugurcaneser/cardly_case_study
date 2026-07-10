import { apiFetch } from '@/src/services/api/client';
import type { Card, CardCreateInput } from '@/src/types/card';

export function listCards(): Promise<Card[]> {
  return apiFetch<Card[]>('/cards');
}

export function getCard(id: number): Promise<Card> {
  return apiFetch<Card>(`/cards/${id}`);
}

export function createCard(input: CardCreateInput): Promise<Card> {
  return apiFetch<Card>('/cards', { method: 'POST', body: input });
}

export function deleteCard(id: number): Promise<void> {
  return apiFetch<void>(`/cards/${id}`, { method: 'DELETE' });
}
