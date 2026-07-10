import { apiFetch, ApiError } from './client';

function mockJsonResponse(status: number, ok: boolean, body: unknown) {
  return {
    ok,
    status,
    headers: { get: () => 'application/json' },
    json: async () => body,
  } as unknown as Response;
}

describe('apiFetch', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'http://test.local';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns parsed JSON on a successful response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockJsonResponse(200, true, { hello: 'world' }));

    const result = await apiFetch<{ hello: string }>('/ping');

    expect(result).toEqual({ hello: 'world' });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://test.local/ping',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('throws an ApiError with status and body on a non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockJsonResponse(404, false, { detail: 'Not found' })
    );

    await expect(apiFetch('/missing')).rejects.toMatchObject({
      status: 404,
      body: { detail: 'Not found' },
    });
  });

  it('serializes a plain object body as JSON with the right header', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockJsonResponse(201, true, { id: 1 }));

    await apiFetch('/cards', { method: 'POST', body: { name: 'Test' } });

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.body).toBe(JSON.stringify({ name: 'Test' }));
  });

  it('wraps a network failure in an ApiError', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network down'));

    await expect(apiFetch('/ping')).rejects.toThrow(ApiError);
  });
});
