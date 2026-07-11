import { apiFetch } from '@/src/services/api/client';

import { enrichCardImage } from './enrichClient';

jest.mock('@/src/services/api/client');

describe('enrichClient', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('posts the image as multipart form data to /enrich with a long timeout', async () => {
    (apiFetch as jest.Mock).mockResolvedValue({ status: 'unrecognized' });

    await enrichCardImage('file:///cards/card-1.jpg');

    expect(apiFetch).toHaveBeenCalledWith(
      '/enrich',
      expect.objectContaining({ method: 'POST', timeoutMs: 45000, body: expect.any(FormData) })
    );

    // The appended value is React Native's `{uri, name, type}` file-part shape
    // (not a real Blob) - the test environment's FormData polyfill stringifies
    // it, so we can only assert an "image" part was attached here, not its
    // native-runtime representation.
    const formData = (apiFetch as jest.Mock).mock.calls[0][1].body as FormData;
    expect(formData.has('image')).toBe(true);
  });

  it('resolves with the enrichment result on success', async () => {
    const result = { status: 'matched', ocr: {}, match: {}, timing: {} };
    (apiFetch as jest.Mock).mockResolvedValue(result);

    await expect(enrichCardImage('file:///cards/card-1.jpg')).resolves.toEqual(result);
  });

  it('propagates a rejection when the request fails', async () => {
    (apiFetch as jest.Mock).mockRejectedValue(new Error('network down'));

    await expect(enrichCardImage('file:///cards/card-1.jpg')).rejects.toThrow('network down');
  });
});
