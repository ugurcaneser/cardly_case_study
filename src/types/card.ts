export type CardStatus = 'pending' | 'enriched' | 'unrecognized' | 'error';

// Field names mirror the backend's JSON wire format (snake_case) 1:1 —
// deliberately not translated to camelCase to avoid a second source of bugs.
export type Card = {
  id: number;
  status: CardStatus;
  thumbnail_base64: string | null;
  raw_ocr_text: string | null;
  ocr_parsed_name: string | null;
  ocr_parsed_number: string | null;
  matched_name: string | null;
  matched_set_name: string | null;
  matched_set_code: string | null;
  matched_collector_number: string | null;
  matched_scryfall_id: string | null;
  matched_image_url: string | null;
  matched_data: Record<string, unknown> | null;
  enrichment_error: string | null;
  created_at: string;
  updated_at: string;
};

export type CardCreateInput = { status: CardStatus } & Partial<
  Omit<Card, 'id' | 'status' | 'created_at' | 'updated_at'>
>;
