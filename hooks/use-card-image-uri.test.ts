import { act, renderHook } from '@testing-library/react-native';

import { useCardImageUri } from './use-card-image-uri';

describe('useCardImageUri', () => {
  it('prefers the matched Scryfall image when present', async () => {
    const { result } = await renderHook(() =>
      useCardImageUri({ matched_image_url: 'https://example.com/card.jpg', thumbnail_base64: 'BASE64DATA' })
    );

    expect(result.current.uri).toBe('https://example.com/card.jpg');
  });

  it('falls back to the thumbnail when there is no matched image', async () => {
    const { result } = await renderHook(() =>
      useCardImageUri({ matched_image_url: null, thumbnail_base64: 'BASE64DATA' })
    );

    expect(result.current.uri).toBe('data:image/jpeg;base64,BASE64DATA');
  });

  it('prefers the caller-supplied fallback URI over the thumbnail', async () => {
    const { result } = await renderHook(() =>
      useCardImageUri(
        { matched_image_url: null, thumbnail_base64: 'BASE64DATA' },
        'file:///document/cards/card-7.jpg'
      )
    );

    expect(result.current.uri).toBe('file:///document/cards/card-7.jpg');
  });

  it('returns null when nothing is available', async () => {
    const { result } = await renderHook(() =>
      useCardImageUri({ matched_image_url: null, thumbnail_base64: null })
    );

    expect(result.current.uri).toBeNull();
  });

  it('falls back to the thumbnail once the matched image fails to load', async () => {
    const { result } = await renderHook(() =>
      useCardImageUri({ matched_image_url: 'https://example.com/card.jpg', thumbnail_base64: 'BASE64DATA' })
    );

    expect(result.current.uri).toBe('https://example.com/card.jpg');

    await act(async () => {
      result.current.onError();
    });

    expect(result.current.uri).toBe('data:image/jpeg;base64,BASE64DATA');
  });
});
