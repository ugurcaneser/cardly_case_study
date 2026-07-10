import { fireEvent, render, screen } from '@testing-library/react-native';

import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('renders the title and description', async () => {
    await render(
      <EmptyState
        icon="clock.fill"
        title="History is empty."
        description="Scan your first card to get started"
      />
    );

    expect(screen.getByText('History is empty.')).toBeTruthy();
    expect(screen.getByText('Scan your first card to get started')).toBeTruthy();
  });

  it('omits the description when none is provided', async () => {
    await render(<EmptyState icon="clock.fill" title="Empty" />);

    expect(screen.queryByText('Scan your first card to get started')).toBeNull();
  });

  it('does not render an action button when none is provided', async () => {
    await render(<EmptyState icon="clock.fill" title="Empty" />);

    expect(screen.queryByText('Start Scanning')).toBeNull();
  });

  it('renders the action button and fires onAction when pressed', async () => {
    const onAction = jest.fn();
    await render(
      <EmptyState icon="clock.fill" title="Empty" actionLabel="Start Scanning" onAction={onAction} />
    );

    fireEvent.press(screen.getByText('Start Scanning'));

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
