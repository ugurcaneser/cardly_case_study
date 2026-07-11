import { fireEvent, render, screen } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

import CaptureScreen from '@/app/capture';
import { useCaptureStore } from '@/src/store/useCaptureStore';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

describe('CaptureScreen', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useCaptureStore.getState().reset();
  });

  it('renders the idle picker options', async () => {
    await render(<CaptureScreen />);

    expect(screen.getByText('Take Photo')).toBeTruthy();
    expect(screen.getByText('Choose from Library')).toBeTruthy();
  });

  it('shows an error and never opens the camera when permission is denied', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });

    await render(<CaptureScreen />);
    await fireEvent.press(screen.getByText('Take Photo'));

    expect(screen.getByText('Camera access is required to scan a card.')).toBeTruthy();
    expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
  });

  it('stays on the idle step when the camera picker is canceled', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({ canceled: true, assets: null });

    await render(<CaptureScreen />);
    await fireEvent.press(screen.getByText('Take Photo'));

    expect(screen.getByText('Take Photo')).toBeTruthy();
    expect(useCaptureStore.getState().step).toBe('idle');
  });

  it('moves to the captured step with a preview after a successful camera capture', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///tmp/photo.jpg' }],
    });

    await render(<CaptureScreen />);
    await fireEvent.press(screen.getByText('Take Photo'));

    expect(screen.getByText('Retake')).toBeTruthy();
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

    await render(<CaptureScreen />);
    await fireEvent.press(screen.getByText('Choose from Library'));

    expect(useCaptureStore.getState().previewUri).toBe('file:///tmp/library.jpg');
  });

  it('returns to idle when Retake is pressed from the captured step', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///tmp/photo.jpg' }],
    });

    await render(<CaptureScreen />);
    await fireEvent.press(screen.getByText('Take Photo'));
    await fireEvent.press(screen.getByText('Retake'));

    expect(screen.getByText('Take Photo')).toBeTruthy();
    expect(useCaptureStore.getState().step).toBe('idle');
  });

  it('resets the store and navigates back when closed', async () => {
    await render(<CaptureScreen />);
    await fireEvent.press(screen.getByLabelText('Close'));

    expect(router.back).toHaveBeenCalledTimes(1);
    expect(useCaptureStore.getState().step).toBe('idle');
  });
});
