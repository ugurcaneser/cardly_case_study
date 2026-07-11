import AsyncStorage from '@react-native-async-storage/async-storage';

import { getDeviceId } from './deviceId';

describe('getDeviceId', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('generates and persists a device id on first use', async () => {
    const id = await getDeviceId();

    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('returns the same id on every subsequent call', async () => {
    const first = await getDeviceId();
    const second = await getDeviceId();

    expect(second).toBe(first);
  });

  it('generates a different id per device (no shared global state across storage)', async () => {
    const first = await getDeviceId();

    await AsyncStorage.clear();
    const second = await getDeviceId();

    expect(second).not.toBe(first);
  });
});
