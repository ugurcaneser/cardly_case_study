import type { Card } from '@/src/types/card';

export type MatchedDetails = {
  rarity: string | null;
  manaCost: string | null;
  typeLine: string | null;
  oracleText: string | null;
  prices: Record<string, string | null> | null;
};

const EMPTY_DETAILS: MatchedDetails = {
  rarity: null,
  manaCost: null,
  typeLine: null,
  oracleText: null,
  prices: null,
};

/**
 * `Card.matched_data` is an untyped JSON blob on the wire (it's whatever
 * `buildCardCreateInput` sent as the full Scryfall match object) - this pulls
 * out the display-relevant fields defensively rather than trusting its shape.
 */
export function extractMatchedDetails(matchedData: Card['matched_data']): MatchedDetails {
  if (!matchedData || typeof matchedData !== 'object') {
    return EMPTY_DETAILS;
  }

  const data = matchedData as Record<string, unknown>;

  return {
    rarity: typeof data.rarity === 'string' ? data.rarity : null,
    manaCost: typeof data.manaCost === 'string' ? data.manaCost : null,
    typeLine: typeof data.typeLine === 'string' ? data.typeLine : null,
    oracleText: typeof data.oracleText === 'string' ? data.oracleText : null,
    prices:
      data.prices && typeof data.prices === 'object' ? (data.prices as Record<string, string | null>) : null,
  };
}
