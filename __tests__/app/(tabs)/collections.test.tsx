import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import React from 'react';

import CollectionsScreen from '@/app/(tabs)/collections';
import { AnalyticsEvents } from '@/src/constants/analytics-events';
import { track } from '@/src/services/analytics/logger';
import { ApiError } from '@/src/services/api/client';
import { createCollection, listCollections } from '@/src/services/api/collectionsClient';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));
jest.mock('@/src/services/api/collectionsClient');
jest.mock('@/src/services/analytics/logger');

function renderCollections() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<CollectionsScreen />, { wrapper });
}

describe('CollectionsScreen', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('shows the empty state and opens the create modal from its CTA', async () => {
    (listCollections as jest.Mock).mockResolvedValue([]);

    await renderCollections();

    await waitFor(() => expect(screen.getByText('No collections yet.')).toBeTruthy());

    await fireEvent.press(screen.getByText('Create Collection'));

    expect(screen.getByPlaceholderText('Collection name')).toBeTruthy();
  });

  it('closes the create modal without creating anything when Cancel is pressed', async () => {
    (listCollections as jest.Mock).mockResolvedValue([]);

    await renderCollections();
    await waitFor(() => expect(screen.getByText('No collections yet.')).toBeTruthy());
    await fireEvent.press(screen.getByText('Create Collection'));

    await fireEvent.press(screen.getByText('Cancel'));

    expect(screen.queryByPlaceholderText('Collection name')).toBeNull();
    expect(createCollection).not.toHaveBeenCalled();
  });

  it('shows the error state and retries on demand', async () => {
    (listCollections as jest.Mock).mockRejectedValue(new Error('network down'));

    await renderCollections();

    await waitFor(() => expect(screen.getByText("Couldn't load collections")).toBeTruthy());

    await fireEvent.press(screen.getByText('Retry'));
    await waitFor(() => expect(listCollections).toHaveBeenCalledTimes(2));
  });

  it('renders the grid with a Create New tile and existing collections, navigating on tap', async () => {
    (listCollections as jest.Mock).mockResolvedValue([
      {
        id: 1,
        name: 'Vintage',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        card_count: 2,
      },
    ]);

    await renderCollections();

    await waitFor(() => expect(screen.getByText('Vintage')).toBeTruthy());
    expect(screen.getByText('Create New')).toBeTruthy();

    await fireEvent.press(screen.getByText('Vintage'));
    expect(router.push).toHaveBeenCalledWith('/collection/1');
  });

  it('renders correctly with an odd total tile count (Create New + collections)', async () => {
    // 2 collections + Create New = 3 tiles, an odd number for a 2-column
    // grid — a lone tile in the last row previously stretched to fill the
    // whole row (and, via aspectRatio:1, grew just as tall) with no
    // flex:1 sibling to share it with. A filler cell should keep it sized
    // the same as every other tile.
    (listCollections as jest.Mock).mockResolvedValue([
      { id: 1, name: 'Vintage', created_at: '', updated_at: '', card_count: 2 },
      { id: 2, name: 'Modern', created_at: '', updated_at: '', card_count: 0 },
    ]);

    await renderCollections();

    await waitFor(() => expect(screen.getByText('Vintage')).toBeTruthy());
    expect(screen.getByText('Modern')).toBeTruthy();
    expect(screen.getByText('Create New')).toBeTruthy();
  });

  it('creates a new collection and closes the modal on success', async () => {
    (listCollections as jest.Mock).mockResolvedValue([]);
    (createCollection as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Modern',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      card_count: 0,
    });

    await renderCollections();

    await waitFor(() => expect(screen.getByText('No collections yet.')).toBeTruthy());
    await fireEvent.press(screen.getByText('Create Collection'));

    await fireEvent.changeText(screen.getByPlaceholderText('Collection name'), 'Modern');
    await fireEvent.press(screen.getByText('Create'));

    await waitFor(() => expect(createCollection).toHaveBeenCalledWith({ name: 'Modern' }));
    await waitFor(() => expect(screen.queryByPlaceholderText('Collection name')).toBeNull());
    expect(track).toHaveBeenCalledWith(AnalyticsEvents.COLLECTION_CREATED, {
      collectionId: 1,
      name: 'Modern',
    });
  });

  it('shows the backend error message and keeps the modal open on a duplicate name', async () => {
    (listCollections as jest.Mock).mockResolvedValue([]);
    (createCollection as jest.Mock).mockRejectedValue(
      new ApiError('Request failed with status 409', {
        status: 409,
        body: { detail: 'Collection name already exists' },
      })
    );

    await renderCollections();

    await waitFor(() => expect(screen.getByText('No collections yet.')).toBeTruthy());
    await fireEvent.press(screen.getByText('Create Collection'));

    await fireEvent.changeText(screen.getByPlaceholderText('Collection name'), 'Vintage');
    await fireEvent.press(screen.getByText('Create'));

    await waitFor(() => expect(screen.getByText('Collection name already exists')).toBeTruthy());
    expect(screen.getByPlaceholderText('Collection name')).toBeTruthy();
  });
});
