import { createQueryClient } from './queryClient';

describe('createQueryClient', () => {
  it('configures sensible retry/staleTime defaults for queries and mutations', () => {
    const client = createQueryClient();
    const defaults = client.getDefaultOptions();

    expect(defaults.queries?.retry).toBe(2);
    expect(defaults.queries?.staleTime).toBe(30_000);
    expect(defaults.mutations?.retry).toBe(0);
  });

  it('returns a fresh, independent client on each call', () => {
    const first = createQueryClient();
    const second = createQueryClient();

    expect(first).not.toBe(second);
  });
});
