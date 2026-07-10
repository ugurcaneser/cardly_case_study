import { fireEvent, render, screen } from '@testing-library/react-native';

import { CollectionTile } from './collection-tile';

const baseCollection = {
  id: 1,
  name: 'Vintage',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  card_count: 0,
};

describe('CollectionTile', () => {
  it('renders the collection name and card count', async () => {
    await render(<CollectionTile collection={{ ...baseCollection, card_count: 3 }} />);

    expect(screen.getByText('Vintage')).toBeTruthy();
    expect(screen.getByText('3 cards')).toBeTruthy();
  });

  it('uses singular "card" for a count of exactly 1', async () => {
    await render(<CollectionTile collection={{ ...baseCollection, card_count: 1 }} />);

    expect(screen.getByText('1 card')).toBeTruthy();
  });

  it('fires onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<CollectionTile collection={baseCollection} onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
