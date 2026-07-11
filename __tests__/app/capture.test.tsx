import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import React from 'react';

import CaptureScreen from '@/app/capture';
import { createCard } from '@/src/services/api/cardsClient';
import { storeCardImage } from '@/src/services/files/imageStorage';
import { setLocalImageUri } from '@/src/services/files/localImageMap';
import { useCaptureStore } from '@/src/store/useCaptureStore';

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
jest.mock('@/src/services/files/imageStorage');
// Explicit factory (not an automock) — automocking would still `require` the
// real module to introspect its exports, which pulls in AsyncStorage's
// native module and fails outside a real app/test-mock environment.
jest.mock('@/src/services/files/localImageMap', () => ({
  setLocalImageUri: jest.fn(),
  getLocalImageUri: jest.fn(),
  removeLocalImageUri: jest.fn(),
}));

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

  await renderCaptureScreen();
  await fireEvent.press(screen.getByText('Take Photo'));
}

describe('CaptureScreen', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useCaptureStore.getState().reset();
  });

  it('renders the idle picker options', async () => {
    await renderCaptureScreen();

    expect(screen.getByText('Take Photo')).toBeTruthy();
    expect(screen.getByText('Choose from Library')).toBeTruthy();
  });

  it('shows an error and never opens the camera when permission is denied', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });

    await renderCaptureScreen();
    await fireEvent.press(screen.getByText('Take Photo'));

    expect(screen.getByText('Camera access is required to scan a card.')).toBeTruthy();
    expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
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
    expect(screen.getByText('Save')).toBeTruthy();
    expect(screen.queryByText('Take Photo')).toBeNull();
    expect(useCaptureStore.getState()).toMatchObject({
      step: 'captured',
      previewUri: 'file:///tmp/photo.jpg',
    });
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

  it('resets the store and navigates back when closed', async () => {
    await renderCaptureScreen();
    await fireEvent.press(screen.getByLabelText('Close'));

    expect(router.back).toHaveBeenCalledTimes(1);
    expect(useCaptureStore.getState().step).toBe('idle');
  });

  it('saves the card without enrichment and navigates to its detail screen', async () => {
    (storeCardImage as jest.Mock).mockResolvedValue({
      localUri: 'file:///document/cards/card-1.jpg',
      thumbnailBase64: 'BASE64DATA',
    });
    (createCard as jest.Mock).mockResolvedValue({ id: 7, status: 'pending' });

    await captureAPhoto();
    await fireEvent.press(screen.getByText('Save'));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/card/7'));

    expect(storeCardImage).toHaveBeenCalledWith('file:///tmp/photo.jpg');
    expect(createCard).toHaveBeenCalledWith({ status: 'pending', thumbnail_base64: 'BASE64DATA' });
    expect(setLocalImageUri).toHaveBeenCalledWith(7, 'file:///document/cards/card-1.jpg');
    expect(useCaptureStore.getState().step).toBe('idle');
  });

  it('shows the error step with a retry when saving fails', async () => {
    (storeCardImage as jest.Mock).mockResolvedValue({
      localUri: 'file:///document/cards/card-1.jpg',
      thumbnailBase64: 'BASE64DATA',
    });
    (createCard as jest.Mock).mockRejectedValue(new Error('network down'));

    await captureAPhoto();
    await fireEvent.press(screen.getByText('Save'));

    await waitFor(() => expect(screen.getByText("Couldn't save this card")).toBeTruthy());
    expect(screen.getByText('network down')).toBeTruthy();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('retries saving from the error step', async () => {
    (storeCardImage as jest.Mock).mockResolvedValue({
      localUri: 'file:///document/cards/card-1.jpg',
      thumbnailBase64: 'BASE64DATA',
    });
    (createCard as jest.Mock)
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce({ id: 9, status: 'pending' });

    await captureAPhoto();
    await fireEvent.press(screen.getByText('Save'));
    await waitFor(() => expect(screen.getByText("Couldn't save this card")).toBeTruthy());

    await fireEvent.press(screen.getByText('Retry'));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/card/9'));
  });

  it('discards and returns to idle from the error step', async () => {
    (storeCardImage as jest.Mock).mockResolvedValue({
      localUri: 'file:///document/cards/card-1.jpg',
      thumbnailBase64: 'BASE64DATA',
    });
    (createCard as jest.Mock).mockRejectedValue(new Error('network down'));

    await captureAPhoto();
    await fireEvent.press(screen.getByText('Save'));
    await waitFor(() => expect(screen.getByText("Couldn't save this card")).toBeTruthy());

    await fireEvent.press(screen.getByText('Discard'));

    expect(screen.getByText('Take Photo')).toBeTruthy();
    expect(useCaptureStore.getState().step).toBe('idle');
  });
});
