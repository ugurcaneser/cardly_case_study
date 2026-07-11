import { ApiError } from '@/src/services/api/client';

/** Extracts a user-facing message from a caught error, preferring the backend's own detail text. */
export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  // Handled as its own branch (not merged into the generic Error check below)
  // because ApiError extends Error and its own .message is just our wrapper
  // text ("Request failed with status 500"), not something to show a user.
  if (error instanceof ApiError) {
    // Most endpoints raise FastAPI's HTTPException, whose body is {detail}.
    // /enrich returns its own error shape, {status, code, message} — check
    // both rather than assuming one.
    const body = error.body as { detail?: unknown; message?: unknown } | undefined;
    if (typeof body?.detail === 'string') return body.detail;
    if (typeof body?.message === 'string') return body.message;
    return fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
