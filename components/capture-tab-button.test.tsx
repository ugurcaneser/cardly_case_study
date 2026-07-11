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

  it('renders as a floating button and navigates to /capture when pressed', async () => {
    await render(<CaptureTabButton />);

    const button = screen.getByRole('button');
    expect(button).toBeTruthy();

    await fireEvent.press(button);

    expect(router.push).toHaveBeenCalledWith('/capture');
  });
});
