export type EnrichOcrResult = {
  rawText: string | null;
  parsedName: string | null;
  parsedNumber: string | null;
};

export type EnrichMatch = {
  source: 'scryfall';
  scryfallId: string;
  name: string;
  setName: string;
  setCode: string;
  collectorNumber: string;
  rarity: string;
  manaCost: string | null;
  typeLine: string;
  oracleText: string | null;
  imageUrl: string;
  prices: Record<string, string | null>;
};

export type EnrichTiming = {
  ocrMs: number;
  matchMs: number;
  totalMs: number;
};

export type EnrichUnrecognizedReason =
  | 'no_ocr_text'
  | 'no_scryfall_match'
  | 'scryfall_unavailable'
  | 'number_mismatch';

// Only the 2xx body shapes — a request-level failure (bad upload, missing
// config, Vision API error) surfaces as a thrown ApiError instead, it's not a
// variant of this result.
export type EnrichResult =
  | { status: 'matched'; ocr: EnrichOcrResult; match: EnrichMatch; timing: EnrichTiming }
  | {
      status: 'unrecognized';
      ocr: EnrichOcrResult;
      match: null;
      reason: EnrichUnrecognizedReason;
      timing: EnrichTiming;
    };
