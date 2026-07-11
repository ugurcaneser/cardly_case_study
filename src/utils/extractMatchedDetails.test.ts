import { extractMatchedDetails } from './extractMatchedDetails';

describe('extractMatchedDetails', () => {
  it('returns all-null details when matched_data is null', () => {
    expect(extractMatchedDetails(null)).toEqual({
      rarity: null,
      manaCost: null,
      typeLine: null,
      oracleText: null,
      prices: null,
    });
  });

  it('extracts every known field from a well-formed match object', () => {
    const details = extractMatchedDetails({
      rarity: 'common',
      manaCost: '{R}',
      typeLine: 'Instant',
      oracleText: 'Deals 3 damage to any target.',
      prices: { usd: '0.25' },
    });

    expect(details).toEqual({
      rarity: 'common',
      manaCost: '{R}',
      typeLine: 'Instant',
      oracleText: 'Deals 3 damage to any target.',
      prices: { usd: '0.25' },
    });
  });

  it('nulls out fields with the wrong type instead of throwing', () => {
    const details = extractMatchedDetails({
      rarity: 42,
      manaCost: null,
      typeLine: undefined,
      prices: 'not-an-object',
    });

    expect(details).toEqual({
      rarity: null,
      manaCost: null,
      typeLine: null,
      oracleText: null,
      prices: null,
    });
  });

  it('handles a matched_data value that is not an object at all', () => {
    expect(extractMatchedDetails('unexpected-string' as never)).toEqual({
      rarity: null,
      manaCost: null,
      typeLine: null,
      oracleText: null,
      prices: null,
    });
  });
});
