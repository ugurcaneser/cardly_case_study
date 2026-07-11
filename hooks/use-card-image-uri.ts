import { useState } from 'react';

import type { Card } from '@/src/types/card';

/**
 * Picks the best available image for a card: Scryfall's canonical art when
 * the card is matched (falling back if that URL fails to load — offline,
 * broken link), then an optional caller-supplied local URI, then the
 * device-captured thumbnail stored on the card itself, which is always
 * available since it travels with the record.
 */
export function useCardImageUri(
  card: Pick<Card, 'matched_image_url' | 'thumbnail_base64'>,
  fallbackUri?: string | null
): { uri: string | null; onError: () => void } {
  const [remoteImageFailed, setRemoteImageFailed] = useState(false);

  if (card.matched_image_url && !remoteImageFailed) {
    return { uri: card.matched_image_url, onError: () => setRemoteImageFailed(true) };
  }

  const uri = fallbackUri ?? (card.thumbnail_base64 ? `data:image/jpeg;base64,${card.thumbnail_base64}` : null);
  return { uri, onError: () => {} };
}
