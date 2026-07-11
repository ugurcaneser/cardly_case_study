import { capitalize, formatUsdPrice, getUnrecognizedReasonMessage } from './enrichmentCopy';

describe('getUnrecognizedReasonMessage', () => {
  it('returns a distinct, non-empty message for every reason', () => {
    const reasons = ['no_ocr_text', 'no_scryfall_match', 'scryfall_unavailable', 'number_mismatch'] as const;
    const messages = reasons.map(getUnrecognizedReasonMessage);

    expect(messages.every((message) => message.length > 0)).toBe(true);
    expect(new Set(messages).size).toBe(reasons.length);
  });
});

describe('formatUsdPrice', () => {
  it('formats a present USD price with a dollar sign', () => {
    expect(formatUsdPrice({ usd: '0.25' })).toBe('$0.25');
  });

  it('returns null when there is no USD price', () => {
    expect(formatUsdPrice({ usd: null, eur: '1.00' })).toBeNull();
  });

  it('returns null when the prices object has no usd key at all', () => {
    expect(formatUsdPrice({})).toBeNull();
  });
});

describe('capitalize', () => {
  it('uppercases the first letter and leaves the rest untouched', () => {
    expect(capitalize('common')).toBe('Common');
  });

  it('returns an empty string unchanged', () => {
    expect(capitalize('')).toBe('');
  });
});
