import AsyncStorage from '@react-native-async-storage/async-storage';

import { getLocalImageUri, removeLocalImageUri, setLocalImageUri } from './localImageMap';

describe('localImageMap', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns null for a card with no stored image', async () => {
    expect(await getLocalImageUri(1)).toBeNull();
  });

  it('stores and retrieves a local image URI for a card', async () => {
    await setLocalImageUri(1, 'file:///document/cards/card-1.jpg');

    expect(await getLocalImageUri(1)).toBe('file:///document/cards/card-1.jpg');
  });

  it('keeps separate entries per card', async () => {
    await setLocalImageUri(1, 'file:///document/cards/card-1.jpg');
    await setLocalImageUri(2, 'file:///document/cards/card-2.jpg');

    expect(await getLocalImageUri(1)).toBe('file:///document/cards/card-1.jpg');
    expect(await getLocalImageUri(2)).toBe('file:///document/cards/card-2.jpg');
  });

  it('removes a stored image URI', async () => {
    await setLocalImageUri(1, 'file:///document/cards/card-1.jpg');
    await removeLocalImageUri(1);

    expect(await getLocalImageUri(1)).toBeNull();
  });
});
