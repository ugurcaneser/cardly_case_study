import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Text } from 'react-native';

import { CaptureTabButton } from './capture-tab-button';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

describe('CaptureTabButton', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders its icon/label like a normal tab, but navigates to /capture instead of the default tab switch', async () => {
    const defaultOnPress = jest.fn();

    // PlatformPressable (used by HapticTab) reads React Navigation's theme
    // via context, so it needs a ThemeProvider ancestor even in isolation.
    await render(
      <ThemeProvider value={DefaultTheme}>
        <CaptureTabButton onPress={defaultOnPress}>
          <Text>Scan</Text>
        </CaptureTabButton>
      </ThemeProvider>
    );

    expect(screen.getByText('Scan')).toBeTruthy();

    await fireEvent.press(screen.getByText('Scan'));

    expect(router.push).toHaveBeenCalledWith('/capture');
    expect(defaultOnPress).not.toHaveBeenCalled();
  });
});
