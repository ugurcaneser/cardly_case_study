import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import React from 'react';

import CaptureScreen from '@/app/capture';
import { AnalyticsEvents } from '@/src/constants/analytics-events';
import { track } from '@/src/services/analytics/logger';
import { createCard } from '@/src/services/api/cardsClient';
import { enrichCardImage } from '@/src/services/api/enrichClient';
import { prepareImageForUpload, storeCardImage } from '@/src/services/files/imageStorage';
import { setLocalImageUri } from '@/src/services/files/localImageMap';
import { useCaptureStore } from '@/src/store/useCaptureStore';
import type { EnrichResult } from '@/src/types/enrichment';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
}));

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('@/src/services/api/cardsClient');
jest.mock('@/src/services/api/enrichClient');
jest.mock('@/src/services/analytics/logger');
jest.mock('@/src/services/files/imageStorage');
// Explicit factory (not an automock) — automocking would still `require` the
// real module to introspect its exports, which pulls in AsyncStorage's
// native module and fails outside a real app/test-mock environment.
jest.mock('@/src/services/files/localImageMap', () => ({
  setLocalImageUri: jest.fn(),
  getLocalImageUri: jest.fn(),
  removeLocalImageUri: jest.fn(),
}));

const matchedResult: EnrichResult = {
  status: 'matched',
  ocr: { rawText: 'Lightning Bolt', parsedName: 'Lightning Bolt', parsedNumber: null },
  match: {
    source: 'scryfall',
    scryfallId: 'abc-123',
    name: 'Lightning Bolt',
    setName: 'Masters 25',
    setCode: 'a25',
    collectorNumber: '133',
    rarity: 'common',
    manaCost: '{R}',
    typeLine: 'Instant',
    oracleText: null,
    imageUrl: 'https://example.com/card.jpg',
    prices: { usd: '0.25' },
  },
  timing: { ocrMs: 100, matchMs: 50, totalMs: 150 },
};

const unrecognizedResult: EnrichResult = {
  status: 'unrecognized',
  ocr: { rawText: null, parsedName: null, parsedNumber: null },
  match: null,
  reason: 'no_ocr_text',
  timing: { ocrMs: 80, matchMs: 0, totalMs: 80 },
};

function renderCaptureScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<CaptureScreen />, { wrapper });
}

async function captureAPhoto() {
  (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
  (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file:///tmp/photo.jpg' }],
  });

  const result = await renderCaptureScreen();
  await fireEvent.press(screen.getByText('Take Photo'));
  return result;
}

describe('CaptureScreen', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useCaptureStore.getState().reset();
    (prepareImageForUpload as jest.Mock).mockResolvedValue('file:///tmp/upload.jpg');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the idle picker options', async () => {
    await renderCaptureScreen();

    expect(screen.getByText('Take Photo')).toBeTruthy();
    expect(screen.getByText('Choose from Library')).toBeTruthy();
  });

  it('navigates back when the close button is pressed on the idle step', async () => {
    await renderCaptureScreen();

    await fireEvent.press(screen.getByLabelText('Close'));

    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('still shows the close button on the captured step', async () => {
    await captureAPhoto();

    await fireEvent.press(screen.getByLabelText('Close'));

    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('shows an error and never opens the camera when permission is denied', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });

    await renderCaptureScreen();
    await fireEvent.press(screen.getByText('Take Photo'));

    expect(screen.getByText('Camera access is required to scan a card.')).toBeTruthy();
    expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
  });

  it('shows an error and never opens the library when gallery permission is denied', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });

    await renderCaptureScreen();
    await fireEvent.press(screen.getByText('Choose from Library'));

    expect(screen.getByText('Photo library access is required to import a card image.')).toBeTruthy();
    expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
  });

  it('stays on the idle step when the camera picker is canceled', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({ canceled: true, assets: null });

    await renderCaptureScreen();
    await fireEvent.press(screen.getByText('Take Photo'));

    expect(screen.getByText('Take Photo')).toBeTruthy();
    expect(useCaptureStore.getState().step).toBe('idle');
  });

  it('moves to the captured step with a preview after a successful camera capture', async () => {
    await captureAPhoto();

    expect(screen.getByText('Retake')).toBeTruthy();
    expect(screen.getByText('Analyze Card')).toBeTruthy();
    expect(screen.queryByText('Take Photo')).toBeNull();
    expect(useCaptureStore.getState()).toMatchObject({
      step: 'captured',
      previewUri: 'file:///tmp/photo.jpg',
    });
    expect(track).toHaveBeenCalledWith(AnalyticsEvents.CARD_CAPTURED);
  });

  it('imports from the library when permission is granted', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///tmp/library.jpg' }],
    });

    await renderCaptureScreen();
    await fireEvent.press(screen.getByText('Choose from Library'));

    expect(useCaptureStore.getState().previewUri).toBe('file:///tmp/library.jpg');
  });

  it('returns to idle when Retake is pressed from the captured step', async () => {
    await captureAPhoto();

    await fireEvent.press(screen.getByText('Retake'));

    expect(screen.getByText('Take Photo')).toBeTruthy();
    expect(useCaptureStore.getState().step).toBe('idle');
  });

  it('resets the store on unmount, since the native modal gesture is the only way to close it', async () => {
    const { unmount } = await captureAPhoto();
    expect(useCaptureStore.getState().step).toBe('captured');

    await act(async () => unmount());

    expect(useCaptureStore.getState().step).toBe('idle');
    expect(useCaptureStore.getState().previewUri).toBeNull();
  });

  it('analyzes the card and shows the matched review view', async () => {
    (enrichCardImage as jest.Mock).mockResolvedValue(matchedResult);

    await captureAPhoto();
    await fireEvent.press(screen.getByText('Analyze Card'));

    await waitFor(() => expect(screen.getByText('Lightning Bolt')).toBeTruthy());

    expect(prepareImageForUpload).toHaveBeenCalledWith('file:///tmp/photo.jpg');
    expect(enrichCardImage).toHaveBeenCalledWith('file:///tmp/upload.jpg');
    expect(screen.getByText('Masters 25 · #133 · Common')).toBeTruthy();
    expect(useCaptureStore.getState().step).toBe('reviewing');
    expect(track).toHaveBeenCalledWith(AnalyticsEvents.CARD_ANALYZE_STARTED);
    expect(track).toHaveBeenCalledWith(AnalyticsEvents.CARD_ANALYZED, { status: 'matched' });
    // Once analysis has produced a result, "Save"/"Retake" are the
    // deliberate exits — the close button is idle/captured-only.
    expect(screen.queryByLabelText('Close')).toBeNull();
  });

  it('analyzes the card and shows the unrecognized review view', async () => {
    (enrichCardImage as jest.Mock).mockResolvedValue(unrecognizedResult);

    await captureAPhoto();
    await fireEvent.press(screen.getByText('Analyze Card'));

    await waitFor(() => expect(screen.getByText('Card not recognized')).toBeTruthy());
    expect(track).toHaveBeenCalledWith(AnalyticsEvents.CARD_ANALYZED, { status: 'unrecognized' });
  });

  it('saves an unrecognized card with its OCR fields and no matched_* fields', async () => {
    (enrichCardImage as jest.Mock).mockResolvedValue(unrecognizedResult);
    (storeCardImage as jest.Mock).mockResolvedValue({
      localUri: 'file:///document/cards/card-1.jpg',
      thumbnailBase64: 'BASE64DATA',
    });
    (createCard as jest.Mock).mockResolvedValue({ id: 12, status: 'unrecognized' });

    await captureAPhoto();
    await fireEvent.press(screen.getByText('Analyze Card'));
    await waitFor(() => expect(screen.getByText('Card not recognized')).toBeTruthy());

    await fireEvent.press(screen.getByText('Save'));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/card/12'));
    expect(createCard).toHaveBeenCalledWith({
      status: 'unrecognized',
      thumbnail_base64: 'BASE64DATA',
      raw_ocr_text: null,
      ocr_parsed_name: null,
      ocr_parsed_number: null,
    });
    expect(track).toHaveBeenCalledWith(AnalyticsEvents.CARD_SAVED, { cardId: 12, status: 'unrecognized' });
  });

  it('shows an escalating cold-start hint while the submitting step is active', async () => {
    // Drives the step directly through the store rather than via a real
    // Analyze press + pending mutation: fireEvent.press awaits the handler's
    // promise to completion (including react-query's mutateAsync), so it
    // can't be used to inspect an intentionally-still-pending in-flight
    // state without leaving an unresolved, overlapping act() scope. The
    // hint's escalation is purely a function of `step === 'submitting'`, so
    // driving that directly is also the more precise unit boundary - the
    // mutation's success/failure paths are already covered separately above.
    await renderCaptureScreen();

    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask', 'hrtime', 'performance'] });
    try {
      await act(() => {
        useCaptureStore.setState({ step: 'submitting', previewUri: 'file:///tmp/photo.jpg' });
      });

      expect(screen.getByText('Analyzing your card…')).toBeTruthy();
      expect(screen.queryByText('This is taking a little longer than usual…')).toBeNull();

      await act(() => {
        jest.advanceTimersByTime(5000);
      });
      expect(screen.getByText('This is taking a little longer than usual…')).toBeTruthy();

      await act(() => {
        jest.advanceTimersByTime(11000);
      });
      expect(
        screen.getByText('The server might be waking up from a cold start — this can take up to a minute.')
      ).toBeTruthy();
    } finally {
      jest.useRealTimers();
    }
  });

  it('shows the error step when analysis fails', async () => {
    (enrichCardImage as jest.Mock).mockRejectedValue(new Error('OCR provider error'));

    await captureAPhoto();
    await fireEvent.press(screen.getByText('Analyze Card'));

    await waitFor(() => expect(screen.getByText("Couldn't analyze this card")).toBeTruthy());
    expect(screen.getByText('OCR provider error')).toBeTruthy();
    expect(track).toHaveBeenCalledWith(AnalyticsEvents.CARD_ANALYZE_FAILED, {
      message: 'OCR provider error',
    });
  });

  it('retries analysis from the error step', async () => {
    (enrichCardImage as jest.Mock)
      .mockRejectedValueOnce(new Error('OCR provider error'))
      .mockResolvedValueOnce(matchedResult);

    await captureAPhoto();
    await fireEvent.press(screen.getByText('Analyze Card'));
    await waitFor(() => expect(screen.getByText("Couldn't analyze this card")).toBeTruthy());

    await fireEvent.press(screen.getByText('Retry'));

    await waitFor(() => expect(screen.getByText('Lightning Bolt')).toBeTruthy());
  });

  it('discards and returns to idle from the error step', async () => {
    (enrichCardImage as jest.Mock).mockRejectedValue(new Error('OCR provider error'));

    await captureAPhoto();
    await fireEvent.press(screen.getByText('Analyze Card'));
    await waitFor(() => expect(screen.getByText("Couldn't analyze this card")).toBeTruthy());

    await fireEvent.press(screen.getByText('Discard'));

    expect(screen.getByText('Take Photo')).toBeTruthy();
    expect(useCaptureStore.getState().step).toBe('idle');
  });

  it('saves the reviewed card and navigates to its detail screen', async () => {
    (enrichCardImage as jest.Mock).mockResolvedValue(matchedResult);
    (storeCardImage as jest.Mock).mockResolvedValue({
      localUri: 'file:///document/cards/card-1.jpg',
      thumbnailBase64: 'BASE64DATA',
    });
    (createCard as jest.Mock).mockResolvedValue({ id: 7, status: 'enriched' });

    await captureAPhoto();
    await fireEvent.press(screen.getByText('Analyze Card'));
    await waitFor(() => expect(screen.getByText('Lightning Bolt')).toBeTruthy());

    await fireEvent.press(screen.getByText('Save'));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/card/7'));

    expect(storeCardImage).toHaveBeenCalledWith('file:///tmp/photo.jpg');
    expect(createCard).toHaveBeenCalledWith({
      status: 'enriched',
      thumbnail_base64: 'BASE64DATA',
      raw_ocr_text: 'Lightning Bolt',
      ocr_parsed_name: 'Lightning Bolt',
      ocr_parsed_number: null,
      matched_name: 'Lightning Bolt',
      matched_set_name: 'Masters 25',
      matched_set_code: 'a25',
      matched_collector_number: '133',
      matched_scryfall_id: 'abc-123',
      matched_image_url: 'https://example.com/card.jpg',
      matched_data: matchedResult.match,
    });
    expect(setLocalImageUri).toHaveBeenCalledWith(7, 'file:///document/cards/card-1.jpg');
    expect(useCaptureStore.getState().step).toBe('idle');
    expect(track).toHaveBeenCalledWith(AnalyticsEvents.CARD_SAVED, { cardId: 7, status: 'enriched' });
  });

  it('saves without analysis from the error step and navigates to its detail screen', async () => {
    (enrichCardImage as jest.Mock).mockRejectedValue(new Error('OCR provider error'));
    (storeCardImage as jest.Mock).mockResolvedValue({
      localUri: 'file:///document/cards/card-1.jpg',
      thumbnailBase64: 'BASE64DATA',
    });
    (createCard as jest.Mock).mockResolvedValue({ id: 9, status: 'pending' });

    await captureAPhoto();
    await fireEvent.press(screen.getByText('Analyze Card'));
    await waitFor(() => expect(screen.getByText("Couldn't analyze this card")).toBeTruthy());

    await fireEvent.press(screen.getByText('Save without Analysis'));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/card/9'));

    expect(createCard).toHaveBeenCalledWith({ status: 'pending', thumbnail_base64: 'BASE64DATA' });
    expect(setLocalImageUri).toHaveBeenCalledWith(9, 'file:///document/cards/card-1.jpg');
    expect(track).toHaveBeenCalledWith(AnalyticsEvents.CARD_SAVED, { cardId: 9, status: 'pending' });
  });

  it('tracks a save failure and stays on the error step', async () => {
    (enrichCardImage as jest.Mock).mockResolvedValue(matchedResult);
    (storeCardImage as jest.Mock).mockResolvedValue({
      localUri: 'file:///document/cards/card-1.jpg',
      thumbnailBase64: 'BASE64DATA',
    });
    (createCard as jest.Mock).mockRejectedValue(new Error('network down'));

    await captureAPhoto();
    await fireEvent.press(screen.getByText('Analyze Card'));
    await waitFor(() => expect(screen.getByText('Lightning Bolt')).toBeTruthy());

    await fireEvent.press(screen.getByText('Save'));

    await waitFor(() => expect(screen.getByText('network down')).toBeTruthy());
    expect(router.replace).not.toHaveBeenCalled();
    expect(track).toHaveBeenCalledWith(AnalyticsEvents.CARD_SAVE_FAILED, { message: 'network down' });
  });
});
