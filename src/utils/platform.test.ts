import { Platform } from 'react-native';

import { getApiBaseUrl } from './platform';

describe('getApiBaseUrl', () => {
  const originalEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  const originalOS = Platform.OS;

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = originalEnv;
    Platform.OS = originalOS;
  });

  it('returns the configured base URL', () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:8000';
    expect(getApiBaseUrl()).toBe('http://localhost:8000');
  });

  it('throws when the env var is not set', () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    expect(() => getApiBaseUrl()).toThrow(/EXPO_PUBLIC_API_BASE_URL/);
  });

  it('warns when running on the Android emulator against a localhost URL', () => {
    Platform.OS = 'android';
    process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:8000';
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(getApiBaseUrl()).toBe('http://localhost:8000');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('10.0.2.2'));

    warnSpy.mockRestore();
  });

  it('does not warn on Android when the URL is not localhost', () => {
    Platform.OS = 'android';
    process.env.EXPO_PUBLIC_API_BASE_URL = 'http://192.168.1.10:8000';
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    getApiBaseUrl();

    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});
