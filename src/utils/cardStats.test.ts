import type { Card } from '@/src/types/card';

import { calculateEstimatedValueUsd } from './cardStats';

function makeCard(matchedData: Card['matched_data']): Card {
  return {
    id: 1,
    status: 'enriched',
    thumbnail_base64: null,
    raw_ocr_text: null,
    ocr_parsed_name: null,
    ocr_parsed_number: null,
    matched_name: null,
    matched_set_name: null,
    matched_set_code: null,
    matched_collector_number: null,
    matched_scryfall_id: null,
    matched_image_url: null,
    matched_data: matchedData,
    enrichment_error: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };
}

describe('calculateEstimatedValueUsd', () => {
  it('returns 0 for an empty list', () => {
    expect(calculateEstimatedValueUsd([])).toBe(0);
  });

  it('sums valid USD prices across multiple cards', () => {
    const cards = [
      makeCard({ prices: { usd: '0.25' } }),
      makeCard({ prices: { usd: '12.50' } }),
    ];

    expect(calculateEstimatedValueUsd(cards)).toBeCloseTo(12.75);
  });

  it('skips cards with no matched_data', () => {
    const cards = [makeCard(null), makeCard({ prices: { usd: '5.00' } })];

    expect(calculateEstimatedValueUsd(cards)).toBe(5);
  });

  it('skips cards with no prices field', () => {
    const cards = [makeCard({ name: 'Lightning Bolt' })];

    expect(calculateEstimatedValueUsd(cards)).toBe(0);
  });

  it('skips cards with no usd price', () => {
    const cards = [makeCard({ prices: { eur: '1.00' } })];

    expect(calculateEstimatedValueUsd(cards)).toBe(0);
  });

  it('skips cards with a non-numeric usd price', () => {
    const cards = [makeCard({ prices: { usd: 'n/a' } })];

    expect(calculateEstimatedValueUsd(cards)).toBe(0);
  });
});
