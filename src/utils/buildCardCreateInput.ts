import type { CardCreateInput } from '@/src/types/card';
import type { EnrichResult } from '@/src/types/enrichment';

/**
 * Maps a capture's local thumbnail plus whatever enrichment result (if any)
 * was obtained into the payload `/cards` expects — `null` covers both "never
 * analyzed" and "analysis failed", both of which save as a bare `pending`
 * card with no match data.
 */
export function buildCardCreateInput(
  thumbnailBase64: string,
  enrichResult: EnrichResult | null
): CardCreateInput {
  if (!enrichResult) {
    return { status: 'pending', thumbnail_base64: thumbnailBase64 };
  }

  const { ocr } = enrichResult;

  if (enrichResult.status === 'unrecognized') {
    return {
      status: 'unrecognized',
      thumbnail_base64: thumbnailBase64,
      raw_ocr_text: ocr.rawText,
      ocr_parsed_name: ocr.parsedName,
      ocr_parsed_number: ocr.parsedNumber,
    };
  }

  const { match } = enrichResult;
  return {
    status: 'enriched',
    thumbnail_base64: thumbnailBase64,
    raw_ocr_text: ocr.rawText,
    ocr_parsed_name: ocr.parsedName,
    ocr_parsed_number: ocr.parsedNumber,
    matched_name: match.name,
    matched_set_name: match.setName,
    matched_set_code: match.setCode,
    matched_collector_number: match.collectorNumber,
    matched_scryfall_id: match.scryfallId,
    matched_image_url: match.imageUrl,
    matched_data: match,
  };
}
