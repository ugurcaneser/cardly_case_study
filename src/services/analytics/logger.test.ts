import { useAnalyticsStore } from '@/src/store/useAnalyticsStore';

import { flush, track } from './logger';

describe('track', () => {
  beforeEach(() => {
    useAnalyticsStore.getState().clear();
  });

  it('enqueues the event into the analytics store', () => {
    track('card_saved', { cardId: 7 });

    const { events } = useAnalyticsStore.getState();
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ name: 'card_saved', payload: { cardId: 7 } });
  });

  it('enqueues an event with no payload', () => {
    track('card_captured');

    expect(useAnalyticsStore.getState().events[0]).toMatchObject({
      name: 'card_captured',
      payload: undefined,
    });
  });
});

describe('flush', () => {
  beforeEach(() => {
    useAnalyticsStore.getState().clear();
  });

  it('clears the queue after flushing', () => {
    track('card_captured');
    track('card_saved', { cardId: 7 });

    flush();

    expect(useAnalyticsStore.getState().events).toEqual([]);
  });

  it('is a no-op when the queue is already empty', () => {
    expect(() => flush()).not.toThrow();
    expect(useAnalyticsStore.getState().events).toEqual([]);
  });
});
