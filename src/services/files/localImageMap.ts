import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_PREFIX = 'cardly-local-image:';

/** Per-device map of cardId -> local full-resolution image URI. Never synced to the backend. */
export async function setLocalImageUri(cardId: number, uri: string): Promise<void> {
  await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${cardId}`, uri);
}

export async function getLocalImageUri(cardId: number): Promise<string | null> {
  return AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${cardId}`);
}

export async function removeLocalImageUri(cardId: number): Promise<void> {
  await AsyncStorage.removeItem(`${STORAGE_KEY_PREFIX}${cardId}`);
}
