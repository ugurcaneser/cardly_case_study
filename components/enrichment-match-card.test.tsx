import { render, screen } from '@testing-library/react-native';

import type { EnrichMatch } from '@/src/types/enrichment';

import { EnrichmentMatchCard } from './enrichment-match-card';

const baseMatch: EnrichMatch = {
  source: 'scryfall',
  scryfallId: 'abc-123',
  name: 'Lightning Bolt',
  setName: 'Masters 25',
  setCode: 'a25',
  collectorNumber: '133',
  rarity: 'common',
  manaCost: '{R}',
  typeLine: 'Instant',
  oracleText: 'Lightning Bolt deals 3 damage to any target.',
  imageUrl: 'https://example.com/card.jpg',
  prices: { usd: '0.25' },
};

describe('EnrichmentMatchCard', () => {
  it('renders the name, set/number/rarity, type line with mana cost, oracle text, and price', async () => {
    await render(<EnrichmentMatchCard match={baseMatch} />);

    expect(screen.getByText('Lightning Bolt')).toBeTruthy();
    expect(screen.getByText('Masters 25 · #133 · Common')).toBeTruthy();
    expect(screen.getByText('Instant  {R}')).toBeTruthy();
    expect(screen.getByText('Lightning Bolt deals 3 damage to any target.')).toBeTruthy();
    expect(screen.getByText('$0.25')).toBeTruthy();
  });

  it('omits the price when there is no USD price', async () => {
    await render(<EnrichmentMatchCard match={{ ...baseMatch, prices: {} }} />);

    expect(screen.queryByText('$0.25')).toBeNull();
  });

  it('omits oracle text when the match has none', async () => {
    await render(<EnrichmentMatchCard match={{ ...baseMatch, oracleText: null }} />);

    expect(screen.queryByText('Lightning Bolt deals 3 damage to any target.')).toBeNull();
  });

  it('shows the type line alone when there is no mana cost', async () => {
    await render(<EnrichmentMatchCard match={{ ...baseMatch, manaCost: null }} />);

    expect(screen.getByText('Instant')).toBeTruthy();
  });

  it('renders the card image when imageUrl is present', async () => {
    const { toJSON } = await render(<EnrichmentMatchCard match={baseMatch} />);

    expect(JSON.stringify(toJSON())).toContain('https://example.com/card.jpg');
  });

  it('omits the image when the match has no imageUrl', async () => {
    const { toJSON } = await render(<EnrichmentMatchCard match={{ ...baseMatch, imageUrl: null }} />);

    expect(JSON.stringify(toJSON())).not.toContain('https://example.com/card.jpg');
  });
});
