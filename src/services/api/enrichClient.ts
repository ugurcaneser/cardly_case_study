import { apiFetch } from '@/src/services/api/client';
import type { EnrichResult } from '@/src/types/enrichment';

// Cold-start on the free-tier host plus OCR + Scryfall round-trips can run
// well past the default 15s timeout — see the capture flow's escalating
// cold-start hint copy, which assumes a wait in this range is normal.
const ENRICH_TIMEOUT_MS = 45000;

export function enrichCardImage(localUri: string): Promise<EnrichResult> {
  const formData = new FormData();
  formData.append('image', {
    uri: localUri,
    name: 'card.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  return apiFetch<EnrichResult>('/enrich', {
    method: 'POST',
    body: formData,
    timeoutMs: ENRICH_TIMEOUT_MS,
  });
}
