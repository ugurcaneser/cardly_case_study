import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import React from 'react';
import { Alert } from 'react-native';

import CollectionDetailScreen from '@/app/collection/[id]';
import { AnalyticsEvents } from '@/src/constants/analytics-events';
import { track } from '@/src/services/analytics/logger';
import { deleteCollection, getCollection, renameCollection } from '@/src/services/api/collectionsClient';
import { makeCard } from '@/src/testing/cardFixtures';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: jest.fn(),
  Stack: { Screen: () => null },
}));

jest.mock('@/src/services/api/collectionsClient');
jest.mock('@/src/services/analytics/logger');

function renderCollectionDetail() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<CollectionDetailScreen />, { wrapper });
}

describe('CollectionDetailScreen', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1' });
  });

  it('shows a loading indicator while the collection is fetched', async () => {
    (getCollection as jest.Mock).mockResolvedValue({ id: 1, name: 'Vintage', card_count: 0, cards: [] });

    await renderCollectionDetail();

    expect(screen.getByLabelText('Loading')).toBeTruthy();

    await waitFor(() => expect(screen.getByText('No cards yet.')).toBeTruthy());
  });

  it('shows an error state and retries on demand', async () => {
    (getCollection as jest.Mock).mockRejectedValue(new Error('network down'));

    await renderCollectionDetail();

    await waitFor(() => expect(screen.getByText("Couldn't load this collection")).toBeTruthy());

    await fireEvent.press(screen.getByText('Retry'));
    await waitFor(() => expect(getCollection).toHaveBeenCalledTimes(2));
  });

  it('shows the empty state when the collection has no cards', async () => {
    (getCollection as jest.Mock).mockResolvedValue({ id: 1, name: 'Vintage', card_count: 0, cards: [] });

    await renderCollectionDetail();

    await waitFor(() => expect(screen.getByText('No cards yet.')).toBeTruthy());
  });

  it('renders each card and navigates to its detail screen on press', async () => {
    const card = makeCard({ id: 42, matched_name: 'Lightning Bolt' });
    (getCollection as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Vintage',
      card_count: 1,
      cards: [card],
    });

    await renderCollectionDetail();

    await waitFor(() => expect(screen.getByText('Lightning Bolt')).toBeTruthy());

    await fireEvent.press(screen.getByText('Lightning Bolt'));
    expect(router.push).toHaveBeenCalledWith('/card/42');
  });

  it('closes the rename modal without renaming when Cancel is pressed', async () => {
    (getCollection as jest.Mock).mockResolvedValue({ id: 1, name: 'Vintage', card_count: 0, cards: [] });

    await renderCollectionDetail();
    await waitFor(() => expect(screen.getByText('No cards yet.')).toBeTruthy());
    await fireEvent.press(screen.getByText('Rename Collection'));

    await fireEvent.press(screen.getByText('Cancel'));

    expect(screen.queryByDisplayValue('Vintage')).toBeNull();
    expect(renameCollection).not.toHaveBeenCalled();
  });

  it('renames the collection', async () => {
    (getCollection as jest.Mock).mockResolvedValue({ id: 1, name: 'Vintage', card_count: 0, cards: [] });
    (renameCollection as jest.Mock).mockResolvedValue({ id: 1, name: 'Modern', card_count: 0 });

    await renderCollectionDetail();
    await waitFor(() => expect(screen.getByText('No cards yet.')).toBeTruthy());

    await fireEvent.press(screen.getByText('Rename Collection'));
    expect(screen.getByDisplayValue('Vintage')).toBeTruthy();

    await fireEvent.changeText(screen.getByDisplayValue('Vintage'), 'Modern');
    await fireEvent.press(screen.getByText('Save'));

    await waitFor(() => expect(renameCollection).toHaveBeenCalledWith(1, 'Modern'));
    await waitFor(() => expect(screen.queryByDisplayValue('Modern')).toBeNull());
    expect(track).toHaveBeenCalledWith(AnalyticsEvents.COLLECTION_RENAMED, {
      collectionId: 1,
      name: 'Modern',
    });
  });

  it('shows the backend error message and keeps the rename modal open on a duplicate name', async () => {
    (getCollection as jest.Mock).mockResolvedValue({ id: 1, name: 'Vintage', card_count: 0, cards: [] });
    (renameCollection as jest.Mock).mockRejectedValue(new Error('Collection name already exists'));

    await renderCollectionDetail();
    await waitFor(() => expect(screen.getByText('No cards yet.')).toBeTruthy());

    await fireEvent.press(screen.getByText('Rename Collection'));
    await fireEvent.press(screen.getByText('Save'));

    await waitFor(() => expect(screen.getByText('Collection name already exists')).toBeTruthy());
    expect(screen.getByDisplayValue('Vintage')).toBeTruthy();
  });

  it('deletes the collection and navigates back after confirming', async () => {
    (getCollection as jest.Mock).mockResolvedValue({ id: 1, name: 'Vintage', card_count: 0, cards: [] });
    (deleteCollection as jest.Mock).mockResolvedValue(undefined);
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const destructiveButton = buttons?.find((button) => button.style === 'destructive');
      destructiveButton?.onPress?.();
    });

    await renderCollectionDetail();
    await waitFor(() => expect(screen.getByText('No cards yet.')).toBeTruthy());

    await fireEvent.press(screen.getByText('Delete Collection'));

    await waitFor(() => expect(router.back).toHaveBeenCalledTimes(1));
    expect(deleteCollection).toHaveBeenCalledWith(1);
    expect(track).toHaveBeenCalledWith(AnalyticsEvents.COLLECTION_DELETED, { collectionId: 1 });

    alertSpy.mockRestore();
  });

  it('does not delete the collection when the confirmation is canceled', async () => {
    (getCollection as jest.Mock).mockResolvedValue({ id: 1, name: 'Vintage', card_count: 0, cards: [] });
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    await renderCollectionDetail();
    await waitFor(() => expect(screen.getByText('No cards yet.')).toBeTruthy());

    await fireEvent.press(screen.getByText('Delete Collection'));

    expect(deleteCollection).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });
});
