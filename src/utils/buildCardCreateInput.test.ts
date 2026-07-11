import type { EnrichResult } from '@/src/types/enrichment';

import { buildCardCreateInput } from './buildCardCreateInput';

const matchedResult: EnrichResult = {
  status: 'matched',
  ocr: { rawText: 'Lightning Bolt\n133', parsedName: 'Lightning Bolt', parsedNumber: '133' },
  match: {
    source: 'scryfall',
    scryfallId: 'abc-123',
    name: 'Lightning Bolt',
    setName: 'Masters 25',
    setCode: 'a25',
    collectorNumber: '133',
    rarity: 'common',
    manaCost: '{R}',
    typeLine: 'Instant',
    oracleText: 'Deals 3 damage to any target.',
    imageUrl: 'https://example.com/card.jpg',
    prices: { usd: '0.25' },
  },
  timing: { ocrMs: 100, matchMs: 50, totalMs: 150 },
};

const unrecognizedResult: EnrichResult = {
  status: 'unrecognized',
  ocr: { rawText: 'Blurry', parsedName: null, parsedNumber: null },
  match: null,
  reason: 'no_scryfall_match',
  timing: { ocrMs: 80, matchMs: 20, totalMs: 100 },
};

describe('buildCardCreateInput', () => {
  it('builds a bare pending payload when there is no enrichment result', () => {
    expect(buildCardCreateInput('BASE64', null)).toEqual({
      status: 'pending',
      thumbnail_base64: 'BASE64',
    });
  });

  it('builds an enriched payload with matched fields and the full match as matched_data', () => {
    expect(buildCardCreateInput('BASE64', matchedResult)).toEqual({
      status: 'enriched',
      thumbnail_base64: 'BASE64',
      raw_ocr_text: 'Lightning Bolt\n133',
      ocr_parsed_name: 'Lightning Bolt',
      ocr_parsed_number: '133',
      matched_name: 'Lightning Bolt',
      matched_set_name: 'Masters 25',
      matched_set_code: 'a25',
      matched_collector_number: '133',
      matched_scryfall_id: 'abc-123',
      matched_image_url: 'https://example.com/card.jpg',
      matched_data: matchedResult.match,
    });
  });

  it('builds an unrecognized payload with OCR fields and no matched_* fields', () => {
    expect(buildCardCreateInput('BASE64', unrecognizedResult)).toEqual({
      status: 'unrecognized',
      thumbnail_base64: 'BASE64',
      raw_ocr_text: 'Blurry',
      ocr_parsed_name: null,
      ocr_parsed_number: null,
    });
  });
});
