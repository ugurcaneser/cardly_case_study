import { getApiBaseUrl } from '@/src/utils/platform';

export class ApiError extends Error {
  status?: number;
  body?: unknown;

  constructor(message: string, options?: { status?: number; body?: unknown; cause?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = options?.status;
    this.body = options?.body;
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

type ApiFetchOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: BodyInit | Record<string, unknown>;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 15000;

export async function apiFetch<T = void>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = 'GET', body, headers, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const url = `${getApiBaseUrl()}${path}`;

  const isJsonBody = body !== undefined && !(body instanceof FormData) && typeof body !== 'string';
  const requestInit: RequestInit = {
    method,
    headers: {
      ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: isJsonBody ? JSON.stringify(body) : (body as BodyInit | undefined),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  console.log(`[api] -> ${method} ${url}`);

  try {
    const response = await fetch(url, { ...requestInit, signal: controller.signal });
    const durationMs = Date.now() - startedAt;

    let responseBody: unknown;
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      responseBody = await response.json().catch(() => undefined);
    }

    if (!response.ok) {
      console.log(`[api] <- ${method} ${url} ${response.status} (${durationMs}ms) FAILED`, responseBody);
      throw new ApiError(`Request failed with status ${response.status}`, {
        status: response.status,
        body: responseBody,
      });
    }

    console.log(`[api] <- ${method} ${url} ${response.status} (${durationMs}ms)`);
    return responseBody as T;
  } catch (error) {
    const durationMs = Date.now() - startedAt;

    if (error instanceof ApiError) {
      throw error;
    }

    const isTimeout = error instanceof Error && error.name === 'AbortError';
    console.log(
      `[api] <- ${method} ${url} ${isTimeout ? 'TIMEOUT' : 'NETWORK ERROR'} (${durationMs}ms)`,
      error
    );
    throw new ApiError(isTimeout ? 'Request timed out' : 'Network request failed', { cause: error });
  } finally {
    clearTimeout(timeoutId);
  }
}
