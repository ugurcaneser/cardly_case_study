import { Platform } from 'react-native';

export function getApiBaseUrl(): string {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL is not set — check your .env file');
  }

  if (Platform.OS === 'android' && baseUrl.includes('localhost')) {
    console.warn(
      '[platform] EXPO_PUBLIC_API_BASE_URL points at localhost, which the Android emulator ' +
        "can't reach directly — use 10.0.2.2 instead (or a LAN IP for a physical device) in a .env.local override."
    );
  }

  return baseUrl;
}
