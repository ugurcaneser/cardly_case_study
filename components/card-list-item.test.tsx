import { fireEvent, render, screen } from '@testing-library/react-native';

import { makeCard } from '@/src/testing/cardFixtures';

import { CardListItem } from './card-list-item';

describe('CardListItem', () => {
  it('prefers matched_name for the title', async () => {
    await render(
      <CardListItem card={makeCard({ matched_name: 'Lightning Bolt', ocr_parsed_name: 'Lite Bolt' })} />
    );

    expect(screen.getByText('Lightning Bolt')).toBeTruthy();
  });

  it('falls back to ocr_parsed_name when there is no match', async () => {
    await render(
      <CardListItem card={makeCard({ matched_name: null, ocr_parsed_name: 'Lite Bolt' })} />
    );

    expect(screen.getByText('Lite Bolt')).toBeTruthy();
  });

  it('falls back to a generic label when nothing was recognized', async () => {
    await render(<CardListItem card={makeCard({ matched_name: null, ocr_parsed_name: null })} />);

    expect(screen.getByText('Unrecognized card')).toBeTruthy();
  });

  it('renders the set name as a subtitle only when present', async () => {
    await render(
      <CardListItem card={makeCard({ matched_name: 'Lightning Bolt', matched_set_name: 'Masters 25' })} />
    );

    expect(screen.getByText('Masters 25')).toBeTruthy();
  });

  it('renders the status badge for the card', async () => {
    await render(<CardListItem card={makeCard({ status: 'enriched' })} />);

    expect(screen.getByText('Matched')).toBeTruthy();
  });

  it('fires onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<CardListItem card={makeCard()} onPress={onPress} />);

    fireEvent.press(screen.getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
