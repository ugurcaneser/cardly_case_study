import { makeCard } from '@/src/testing/cardFixtures';

import { calculateEstimatedValueUsd } from './cardStats';

describe('calculateEstimatedValueUsd', () => {
  it('returns 0 for an empty list', () => {
    expect(calculateEstimatedValueUsd([])).toBe(0);
  });

  it('sums valid USD prices across multiple cards', () => {
    const cards = [
      makeCard({ matched_data: { prices: { usd: '0.25' } } }),
      makeCard({ matched_data: { prices: { usd: '12.50' } } }),
    ];

    expect(calculateEstimatedValueUsd(cards)).toBeCloseTo(12.75);
  });

  it('skips cards with no matched_data', () => {
    const cards = [makeCard({ matched_data: null }), makeCard({ matched_data: { prices: { usd: '5.00' } } })];

    expect(calculateEstimatedValueUsd(cards)).toBe(5);
  });

  it('skips cards with no prices field', () => {
    const cards = [makeCard({ matched_data: { name: 'Lightning Bolt' } })];

    expect(calculateEstimatedValueUsd(cards)).toBe(0);
  });

  it('skips cards with no usd price', () => {
    const cards = [makeCard({ matched_data: { prices: { eur: '1.00' } } })];

    expect(calculateEstimatedValueUsd(cards)).toBe(0);
  });

  it('skips cards with a non-numeric usd price', () => {
    const cards = [makeCard({ matched_data: { prices: { usd: 'n/a' } } })];

    expect(calculateEstimatedValueUsd(cards)).toBe(0);
  });
});
