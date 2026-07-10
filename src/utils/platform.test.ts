import { getApiBaseUrl } from './platform';

describe('getApiBaseUrl', () => {
  const originalEnv = process.env.EXPO_PUBLIC_API_BASE_URL;

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = originalEnv;
  });

  it('returns the configured base URL', () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:8000';
    expect(getApiBaseUrl()).toBe('http://localhost:8000');
  });

  it('throws when the env var is not set', () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    expect(() => getApiBaseUrl()).toThrow(/EXPO_PUBLIC_API_BASE_URL/);
  });
});
