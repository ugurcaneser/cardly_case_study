import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import React from 'react';

import HistoryScreen from '@/app/(tabs)/history';
import { listCards } from '@/src/services/api/cardsClient';
import { makeCard } from '@/src/testing/cardFixtures';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));
jest.mock('@/src/services/api/cardsClient');

function renderHistory() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<HistoryScreen />, { wrapper });
}

describe('HistoryScreen', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('shows the empty state and navigates to capture from "Start Scanning"', async () => {
    (listCards as jest.Mock).mockResolvedValue([]);

    await renderHistory();

    await waitFor(() => expect(screen.getByText('History is empty.')).toBeTruthy());

    await fireEvent.press(screen.getByText('Start Scanning'));
    expect(router.push).toHaveBeenCalledWith('/scan');
  });

  it('shows the error state and retries on demand', async () => {
    (listCards as jest.Mock).mockRejectedValue(new Error('network down'));

    await renderHistory();

    await waitFor(() => expect(screen.getByText("Couldn't load history")).toBeTruthy());

    await fireEvent.press(screen.getByText('Retry'));
    await waitFor(() => expect(listCards).toHaveBeenCalledTimes(2));
  });

  it('renders a card row and navigates to its detail screen on press', async () => {
    const card = makeCard({ id: 42, status: 'enriched', matched_name: 'Lightning Bolt' });
    (listCards as jest.Mock).mockResolvedValue([card]);

    await renderHistory();

    await waitFor(() => expect(screen.getByText('Lightning Bolt')).toBeTruthy());

    await fireEvent.press(screen.getByRole('button'));
    expect(router.push).toHaveBeenCalledWith('/card/42');
  });
});
