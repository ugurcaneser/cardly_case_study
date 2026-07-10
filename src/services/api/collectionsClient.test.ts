import { apiFetch } from '@/src/services/api/client';

import {
  addCardToCollection,
  createCollection,
  deleteCollection,
  getCollection,
  listCollections,
  removeCardFromCollection,
  renameCollection,
} from './collectionsClient';

jest.mock('@/src/services/api/client');

describe('collectionsClient', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('listCollections calls GET /collections', async () => {
    (apiFetch as jest.Mock).mockResolvedValue([]);

    await listCollections();

    expect(apiFetch).toHaveBeenCalledWith('/collections');
  });

  it('getCollection calls GET /collections/:id', async () => {
    (apiFetch as jest.Mock).mockResolvedValue({ id: 2, cards: [] });

    await getCollection(2);

    expect(apiFetch).toHaveBeenCalledWith('/collections/2');
  });

  it('createCollection calls POST /collections with the name', async () => {
    (apiFetch as jest.Mock).mockResolvedValue({ id: 1, name: 'Vintage' });

    await createCollection({ name: 'Vintage' });

    expect(apiFetch).toHaveBeenCalledWith('/collections', {
      method: 'POST',
      body: { name: 'Vintage' },
    });
  });

  it('renameCollection calls PATCH /collections/:id with the new name', async () => {
    (apiFetch as jest.Mock).mockResolvedValue({ id: 1, name: 'New Name' });

    await renameCollection(1, 'New Name');

    expect(apiFetch).toHaveBeenCalledWith('/collections/1', {
      method: 'PATCH',
      body: { name: 'New Name' },
    });
  });

  it('deleteCollection calls DELETE /collections/:id', async () => {
    (apiFetch as jest.Mock).mockResolvedValue(undefined);

    await deleteCollection(5);

    expect(apiFetch).toHaveBeenCalledWith('/collections/5', { method: 'DELETE' });
  });

  it('addCardToCollection calls POST /collections/:id/cards/:cardId', async () => {
    (apiFetch as jest.Mock).mockResolvedValue({ id: 1, cards: [] });

    await addCardToCollection(1, 9);

    expect(apiFetch).toHaveBeenCalledWith('/collections/1/cards/9', { method: 'POST' });
  });

  it('removeCardFromCollection calls DELETE /collections/:id/cards/:cardId', async () => {
    (apiFetch as jest.Mock).mockResolvedValue({ id: 1, cards: [] });

    await removeCardFromCollection(1, 9);

    expect(apiFetch).toHaveBeenCalledWith('/collections/1/cards/9', { method: 'DELETE' });
  });
});
