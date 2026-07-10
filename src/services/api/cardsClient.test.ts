import { apiFetch } from '@/src/services/api/client';

import { createCard, deleteCard, getCard, listCards } from './cardsClient';

jest.mock('@/src/services/api/client');

describe('cardsClient', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('listCards calls GET /cards', async () => {
    (apiFetch as jest.Mock).mockResolvedValue([]);

    await listCards();

    expect(apiFetch).toHaveBeenCalledWith('/cards');
  });

  it('getCard calls GET /cards/:id', async () => {
    (apiFetch as jest.Mock).mockResolvedValue({ id: 7 });

    await getCard(7);

    expect(apiFetch).toHaveBeenCalledWith('/cards/7');
  });

  it('createCard calls POST /cards with the input as the body', async () => {
    (apiFetch as jest.Mock).mockResolvedValue({ id: 1, status: 'pending' });

    await createCard({ status: 'pending', matched_name: 'Lightning Bolt' });

    expect(apiFetch).toHaveBeenCalledWith('/cards', {
      method: 'POST',
      body: { status: 'pending', matched_name: 'Lightning Bolt' },
    });
  });

  it('deleteCard calls DELETE /cards/:id', async () => {
    (apiFetch as jest.Mock).mockResolvedValue(undefined);

    await deleteCard(3);

    expect(apiFetch).toHaveBeenCalledWith('/cards/3', { method: 'DELETE' });
  });
});
