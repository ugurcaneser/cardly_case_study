import { render, screen } from '@testing-library/react-native';

import { StatTile } from './stat-tile';

describe('StatTile', () => {
  it('renders the value and label', async () => {
    await render(<StatTile emoji="🃏" value="12" label="Cards" />);

    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('Cards')).toBeTruthy();
  });
});
