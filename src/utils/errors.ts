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
    const body = error.body as { detail?: unknown } | undefined;
    return typeof body?.detail === 'string' ? body.detail : fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
