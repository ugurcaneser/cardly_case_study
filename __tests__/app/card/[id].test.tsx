import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import React from 'react';
import { Alert } from 'react-native';

import CardDetailScreen from '@/app/card/[id]';
import { deleteCard, getCard } from '@/src/services/api/cardsClient';
import { getLocalImageUri, removeLocalImageUri } from '@/src/services/files/localImageMap';
import { makeCard } from '@/src/testing/cardFixtures';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
  Stack: { Screen: () => null },
}));

jest.mock('@/src/services/api/cardsClient');
// Explicit factory (not an automock) — see project test-gotchas memory:
// automocking would still `require` the real module and pull in AsyncStorage's
// native module outside a real app/manually-mocked environment.
jest.mock('@/src/services/files/localImageMap', () => ({
  setLocalImageUri: jest.fn(),
  getLocalImageUri: jest.fn(),
  removeLocalImageUri: jest.fn(),
}));

function renderCardDetail() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<CardDetailScreen />, { wrapper });
}

describe('CardDetailScreen', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '7' });
    (getLocalImageUri as jest.Mock).mockResolvedValue(null);
  });

  it('shows a loading indicator while the card is fetched', async () => {
    (getCard as jest.Mock).mockResolvedValue(makeCard({ id: 7 }));

    await renderCardDetail();

    expect(screen.getByLabelText('Loading')).toBeTruthy();

    // Let the resolved query settle before the test ends, so its state
    // update doesn't land after RTL's auto-cleanup has already unmounted.
    await waitFor(() => expect(screen.getByText('Unrecognized card')).toBeTruthy());
  });

  it('shows an error state and retries on demand', async () => {
    (getCard as jest.Mock).mockRejectedValue(new Error('network down'));

    await renderCardDetail();

    await waitFor(() => expect(screen.getByText("Couldn't load this card")).toBeTruthy());

    await fireEvent.press(screen.getByText('Retry'));
    await waitFor(() => expect(getCard).toHaveBeenCalledTimes(2));
  });

  it('renders a matched card with its Scryfall details', async () => {
    (getCard as jest.Mock).mockResolvedValue(
      makeCard({
        id: 7,
        status: 'enriched',
        matched_name: 'Lightning Bolt',
        matched_set_name: 'Masters 25',
        matched_collector_number: '133',
        matched_data: {
          rarity: 'common',
          manaCost: '{R}',
          typeLine: 'Instant',
          oracleText: 'Deals 3 damage to any target.',
          prices: { usd: '0.25' },
        },
      })
    );

    await renderCardDetail();

    await waitFor(() => expect(screen.getByText('Lightning Bolt')).toBeTruthy());
    expect(screen.getByText('Masters 25 · #133 · Common')).toBeTruthy();
    expect(screen.getByText('Instant  {R}')).toBeTruthy();
    expect(screen.getByText('Deals 3 damage to any target.')).toBeTruthy();
    expect(screen.getByText('$0.25')).toBeTruthy();
  });

  it('renders an unrecognized card with its detected OCR text', async () => {
    (getCard as jest.Mock).mockResolvedValue(
      makeCard({ id: 7, status: 'unrecognized', raw_ocr_text: 'Blurry Text\n133' })
    );

    await renderCardDetail();

    await waitFor(() => expect(screen.getByText('Unrecognized card')).toBeTruthy());
    expect(screen.getByText('Detected text')).toBeTruthy();
    expect(screen.getByText('Blurry Text\n133')).toBeTruthy();
  });

  it('shows the enrichment error message when the card has one', async () => {
    (getCard as jest.Mock).mockResolvedValue(
      makeCard({ id: 7, status: 'error', enrichment_error: 'OCR provider error' })
    );

    await renderCardDetail();

    await waitFor(() => expect(screen.getByText('OCR provider error')).toBeTruthy());
  });

  it('prefers the local full-resolution image URI over the thumbnail when both exist', async () => {
    (getCard as jest.Mock).mockResolvedValue(makeCard({ id: 7, thumbnail_base64: 'BASE64DATA' }));
    (getLocalImageUri as jest.Mock).mockResolvedValue('file:///document/cards/card-7.jpg');

    await renderCardDetail();

    await waitFor(() => expect(getLocalImageUri).toHaveBeenCalledWith(7));
  });

  it('deletes the card and navigates back after confirming', async () => {
    (getCard as jest.Mock).mockResolvedValue(makeCard({ id: 7, matched_name: 'Lightning Bolt' }));
    (deleteCard as jest.Mock).mockResolvedValue(undefined);
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const destructiveButton = buttons?.find((button) => button.style === 'destructive');
      destructiveButton?.onPress?.();
    });

    await renderCardDetail();
    await waitFor(() => expect(screen.getByText('Lightning Bolt')).toBeTruthy());

    await fireEvent.press(screen.getByText('Delete Card'));

    await waitFor(() => expect(router.back).toHaveBeenCalledTimes(1));
    expect(deleteCard).toHaveBeenCalledWith(7);
    expect(removeLocalImageUri).toHaveBeenCalledWith(7);

    alertSpy.mockRestore();
  });

  it('does not delete the card when the confirmation is canceled', async () => {
    (getCard as jest.Mock).mockResolvedValue(makeCard({ id: 7, matched_name: 'Lightning Bolt' }));
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    await renderCardDetail();
    await waitFor(() => expect(screen.getByText('Lightning Bolt')).toBeTruthy());

    await fireEvent.press(screen.getByText('Delete Card'));

    expect(deleteCard).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });
});
