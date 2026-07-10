import type { Card } from '@/src/types/card';

export function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 1,
    status: 'pending',
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
    matched_data: null,
    enrichment_error: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}
