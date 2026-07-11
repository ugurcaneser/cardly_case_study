import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'cardly-device-id';

function generateDeviceId(): string {
  // RFC 4122 v4 shape - this is just an opaque per-device tenant key (not a
  // security credential), so Math.random is fine and avoids a new native
  // dependency (e.g. expo-crypto) just for this.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

/**
 * Stable per-device identifier used to scope all backend data (cards,
 * collections) to this device. There's no login, so this is the only thing
 * that separates one phone's data from another's. Generated once on first
 * use and persisted; never synced or reset.
 */
export async function getDeviceId(): Promise<string> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (stored) {
    return stored;
  }

  const generated = generateDeviceId();
  await AsyncStorage.setItem(STORAGE_KEY, generated);
  return generated;
}
