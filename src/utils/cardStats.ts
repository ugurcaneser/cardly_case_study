import type { Card } from '@/src/types/card';

/** Sums the Scryfall USD price across cards, skipping any without a parsable price. */
export function calculateEstimatedValueUsd(cards: Card[]): number {
  return cards.reduce((total, card) => {
    const price = extractUsdPrice(card.matched_data);
    return price !== null ? total + price : total;
  }, 0);
}

function extractUsdPrice(matchedData: Card['matched_data']): number | null {
  if (!matchedData || typeof matchedData !== 'object') {
    return null;
  }

  const prices = (matchedData as Record<string, unknown>).prices;
  if (!prices || typeof prices !== 'object') {
    return null;
  }

  const usd = (prices as Record<string, unknown>).usd;
  if (typeof usd !== 'string') {
    return null;
  }

  const parsed = Number.parseFloat(usd);
  return Number.isFinite(parsed) ? parsed : null;
}
