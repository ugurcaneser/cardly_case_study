import { ApiError } from '@/src/services/api/client';

import { getErrorMessage } from './errors';

describe('getErrorMessage', () => {
  it('prefers the backend detail message from an ApiError body', () => {
    const error = new ApiError('Request failed with status 409', {
      status: 409,
      body: { detail: 'Collection name already exists' },
    });

    expect(getErrorMessage(error)).toBe('Collection name already exists');
  });

  it('falls back to a generic message when the ApiError body has no detail', () => {
    const error = new ApiError('Request failed with status 500', { status: 500, body: {} });

    expect(getErrorMessage(error)).toBe('Something went wrong. Please try again.');
  });

  it('uses a plain Error message', () => {
    expect(getErrorMessage(new Error('network down'))).toBe('network down');
  });

  it('falls back to the generic message for unknown thrown values', () => {
    expect(getErrorMessage('just a string')).toBe('Something went wrong. Please try again.');
  });

  it('accepts a custom fallback', () => {
    expect(getErrorMessage(null, 'Custom fallback')).toBe('Custom fallback');
  });
});
