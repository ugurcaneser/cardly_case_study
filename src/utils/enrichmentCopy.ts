import type { EnrichUnrecognizedReason } from '@/src/types/enrichment';

export function getUnrecognizedReasonMessage(reason: EnrichUnrecognizedReason): string {
  switch (reason) {
    case 'no_ocr_text':
      return "We couldn't read any text from this photo. Try retaking with better lighting or a closer crop.";
    case 'no_scryfall_match':
      return "We read the card, but couldn't find a matching card in the database.";
    case 'scryfall_unavailable':
      return 'The card database is temporarily unavailable. You can still save this card and try analyzing again later.';
    case 'number_mismatch':
      return "We found a possible match, but the collector number didn't line up, so we're not confident enough to auto-fill it.";
  }
}

export function formatUsdPrice(prices: Record<string, string | null>): string | null {
  return prices.usd ? `$${prices.usd}` : null;
}

export function capitalize(value: string): string {
  return value.length ? value[0].toUpperCase() + value.slice(1) : value;
}
