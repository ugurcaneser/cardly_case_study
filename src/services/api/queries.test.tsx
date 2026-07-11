import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import React from 'react';

import { createCard, listCards } from '@/src/services/api/cardsClient';
import { createCollection, listCollections } from '@/src/services/api/collectionsClient';
import { enrichCardImage } from '@/src/services/api/enrichClient';

import {
  useCardsQuery,
  useCollectionsQuery,
  useCreateCardMutation,
  useCreateCollectionMutation,
  useEnrichMutation,
} from './queries';

jest.mock('@/src/services/api/cardsClient');
jest.mock('@/src/services/api/collectionsClient');
jest.mock('@/src/services/api/enrichClient');

// Retries are disabled here so failure tests don't have to wait through the
// app's real retry/backoff policy — that policy itself is covered separately
// in queryClient.test.ts.
function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe('useCardsQuery', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('surfaces the cards list once the request resolves', async () => {
    (listCards as jest.Mock).mockResolvedValue([{ id: 1, status: 'pending' }]);

    const { result } = await renderHook(() => useCardsQuery(), { wrapper: createWrapper() });

    expect(result.current.isPending).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([{ id: 1, status: 'pending' }]);
    expect(listCards).toHaveBeenCalledTimes(1);
  });

  it('surfaces an error state when the request fails', async () => {
    (listCards as jest.Mock).mockRejectedValue(new Error('network down'));

    const { result } = await renderHook(() => useCardsQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useCreateCardMutation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls createCard and resolves with the created card', async () => {
    (createCard as jest.Mock).mockResolvedValue({ id: 1, status: 'pending' });

    const { result } = await renderHook(() => useCreateCardMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ status: 'pending', thumbnail_base64: 'BASE64' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(createCard).toHaveBeenCalledWith({ status: 'pending', thumbnail_base64: 'BASE64' });
    expect(result.current.data).toEqual({ id: 1, status: 'pending' });
  });

  it('surfaces an error when card creation fails', async () => {
    (createCard as jest.Mock).mockRejectedValue(new Error('network down'));

    const { result } = await renderHook(() => useCreateCardMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ status: 'pending' });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useEnrichMutation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls enrichCardImage with the local image URI and resolves with the result', async () => {
    const matched = { status: 'matched', ocr: {}, match: {}, timing: {} };
    (enrichCardImage as jest.Mock).mockResolvedValue(matched);

    const { result } = await renderHook(() => useEnrichMutation(), { wrapper: createWrapper() });

    result.current.mutate('file:///cards/card-1.jpg');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(enrichCardImage).toHaveBeenCalledWith('file:///cards/card-1.jpg');
    expect(result.current.data).toEqual(matched);
  });

  it('surfaces an error when enrichment fails', async () => {
    (enrichCardImage as jest.Mock).mockRejectedValue(new Error('OCR provider error'));

    const { result } = await renderHook(() => useEnrichMutation(), { wrapper: createWrapper() });

    result.current.mutate('file:///cards/card-1.jpg');

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useCollectionsQuery', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('surfaces the collections list once the request resolves', async () => {
    (listCollections as jest.Mock).mockResolvedValue([{ id: 1, name: 'Vintage', card_count: 0 }]);

    const { result } = await renderHook(() => useCollectionsQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([{ id: 1, name: 'Vintage', card_count: 0 }]);
    expect(listCollections).toHaveBeenCalledTimes(1);
  });
});

describe('useCreateCollectionMutation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls createCollection and resolves with the created collection', async () => {
    (createCollection as jest.Mock).mockResolvedValue({ id: 1, name: 'Vintage', card_count: 0 });

    const { result } = await renderHook(() => useCreateCollectionMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ name: 'Vintage' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(createCollection).toHaveBeenCalledWith({ name: 'Vintage' });
    expect(result.current.data).toEqual({ id: 1, name: 'Vintage', card_count: 0 });
  });

  it('surfaces an error when creation fails (e.g. duplicate name)', async () => {
    (createCollection as jest.Mock).mockRejectedValue(new Error('Collection name already exists'));

    const { result } = await renderHook(() => useCreateCollectionMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ name: 'Vintage' });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
