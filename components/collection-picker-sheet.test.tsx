import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import React from 'react';

import { addCardToCollection, listCollections, removeCardFromCollection } from '@/src/services/api/collectionsClient';

import { CollectionPickerSheet } from './collection-picker-sheet';

jest.mock('@/src/services/api/collectionsClient');

async function renderSheet(props: Partial<React.ComponentProps<typeof CollectionPickerSheet>> = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const onClose = jest.fn();
  const utils = await render(
    <CollectionPickerSheet visible cardId={7} onClose={onClose} {...props} />,
    { wrapper }
  );
  return { onClose, ...utils };
}

describe('CollectionPickerSheet', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('shows the empty message when there are no collections', async () => {
    (listCollections as jest.Mock).mockResolvedValue([]);

    await renderSheet();

    await waitFor(() => expect(screen.getByText("You don't have any collections yet.")).toBeTruthy());
  });

  it('shows the error message when the collections fail to load', async () => {
    (listCollections as jest.Mock).mockRejectedValue(new Error('network down'));

    await renderSheet();

    await waitFor(() => expect(screen.getByText("Couldn't load collections.")).toBeTruthy());
  });

  it('lists collections and adds the card to one when tapped', async () => {
    (listCollections as jest.Mock).mockResolvedValue([
      { id: 1, name: 'Vintage', card_count: 2, created_at: '', updated_at: '' },
      { id: 2, name: 'Modern', card_count: 0, created_at: '', updated_at: '' },
    ]);
    (addCardToCollection as jest.Mock).mockResolvedValue({});

    await renderSheet();

    await waitFor(() => expect(screen.getByText('Vintage')).toBeTruthy());

    await fireEvent.press(screen.getByText('Vintage'));

    await waitFor(() => expect(addCardToCollection).toHaveBeenCalledWith(1, 7));
    await waitFor(() => expect(listCollections).toHaveBeenCalledTimes(2));
    // React Query's notifyManager batches the resulting state update via a
    // real setTimeout(0), one tick after the refetch promise itself
    // resolves - flush it here so it lands before cleanup, not after.
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
  });

  it('toggles a collection off again, removing the card', async () => {
    (listCollections as jest.Mock).mockResolvedValue([
      { id: 1, name: 'Vintage', card_count: 2, created_at: '', updated_at: '' },
    ]);
    (addCardToCollection as jest.Mock).mockResolvedValue({});
    (removeCardFromCollection as jest.Mock).mockResolvedValue({});

    await renderSheet();
    await waitFor(() => expect(screen.getByText('Vintage')).toBeTruthy());

    await fireEvent.press(screen.getByText('Vintage'));
    await waitFor(() => expect(addCardToCollection).toHaveBeenCalledWith(1, 7));
    await waitFor(() => expect(listCollections).toHaveBeenCalledTimes(2));
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));

    await fireEvent.press(screen.getByText('Vintage'));
    await waitFor(() => expect(removeCardFromCollection).toHaveBeenCalledWith(1, 7));
    await waitFor(() => expect(listCollections).toHaveBeenCalledTimes(3));
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
  });

  it('calls onClose when Done is pressed', async () => {
    (listCollections as jest.Mock).mockResolvedValue([]);

    const { onClose } = await renderSheet();
    await waitFor(() => expect(screen.getByText("You don't have any collections yet.")).toBeTruthy());

    await fireEvent.press(screen.getByText('Done'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
