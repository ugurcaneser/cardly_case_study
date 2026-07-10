import { render, screen } from '@testing-library/react-native';

import { CardStateBadge } from './card-state-badge';

describe('CardStateBadge', () => {
  it.each([
    ['pending', 'Pending'],
    ['enriched', 'Matched'],
    ['unrecognized', 'Unrecognized'],
    ['error', 'Error'],
  ] as const)('renders the correct label for status "%s"', async (status, label) => {
    await render(<CardStateBadge status={status} />);

    expect(screen.getByText(label)).toBeTruthy();
  });
});
