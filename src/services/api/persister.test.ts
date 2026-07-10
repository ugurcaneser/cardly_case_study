import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

import { asyncStoragePersister, QUERY_CACHE_STORAGE_KEY } from './persister';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

describe('asyncStoragePersister', () => {
  it('builds a persister with the expected persist/restore/remove contract', () => {
    expect(typeof asyncStoragePersister.persistClient).toBe('function');
    expect(typeof asyncStoragePersister.restoreClient).toBe('function');
    expect(typeof asyncStoragePersister.removeClient).toBe('function');
  });

  it('uses a stable, dedicated storage key', () => {
    expect(QUERY_CACHE_STORAGE_KEY).toBe('cardly-query-cache');
  });
});
