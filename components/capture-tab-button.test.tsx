import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { CaptureTabButton } from './capture-tab-button';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

describe('CaptureTabButton', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('navigates to the capture modal when pressed, instead of switching tabs', async () => {
    await render(<CaptureTabButton />);

    fireEvent.press(screen.getByLabelText('Scan a card'));

    expect(router.push).toHaveBeenCalledWith('/capture');
    expect(router.push).toHaveBeenCalledTimes(1);
  });
});
