import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import React from 'react';

import HomeScreen from '@/app/(tabs)/index';
import { listCards } from '@/src/services/api/cardsClient';
import { listCollections } from '@/src/services/api/collectionsClient';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));
jest.mock('@/src/services/api/cardsClient');
jest.mock('@/src/services/api/collectionsClient');

function renderHome() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<HomeScreen />, { wrapper });
}

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders card/collection counts and the estimated value once data loads', async () => {
    (listCards as jest.Mock).mockResolvedValue([
      { id: 1, status: 'enriched', matched_data: { prices: { usd: '2.50' } } },
      { id: 2, status: 'pending', matched_data: null },
    ]);
    (listCollections as jest.Mock).mockResolvedValue([{ id: 1, name: 'Vintage', card_count: 1 }]);

    await renderHome();

    await waitFor(() => expect(screen.getByText('2')).toBeTruthy());

    expect(screen.getByText('$2.50')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
  });

  it('navigates to the capture modal when "Scan Now" is pressed', async () => {
    (listCards as jest.Mock).mockResolvedValue([]);
    (listCollections as jest.Mock).mockResolvedValue([]);

    await renderHome();

    await fireEvent.press(screen.getByText('Scan Now'));

    expect(router.push).toHaveBeenCalledWith('/capture');
  });

  it('renders a Recent Cards section and navigates to a card on press', async () => {
    (listCards as jest.Mock).mockResolvedValue([
      { id: 7, status: 'enriched', matched_name: 'Lightning Bolt', matched_data: null },
    ]);
    (listCollections as jest.Mock).mockResolvedValue([]);

    await renderHome();

    await waitFor(() => expect(screen.getByText('Lightning Bolt')).toBeTruthy());

    await fireEvent.press(screen.getByText('Lightning Bolt'));
    expect(router.push).toHaveBeenCalledWith('/card/7');

    await fireEvent.press(screen.getByText('See All'));
    expect(router.push).toHaveBeenCalledWith('/history');
  });

  it('hides the Recent Cards section when there are no cards', async () => {
    (listCards as jest.Mock).mockResolvedValue([]);
    (listCollections as jest.Mock).mockResolvedValue([]);

    await renderHome();

    await waitFor(() => expect(screen.getByText('Scan Now')).toBeTruthy());
    expect(screen.queryByText('Recent Cards')).toBeNull();
  });
});
