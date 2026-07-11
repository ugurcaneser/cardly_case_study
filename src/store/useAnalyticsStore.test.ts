import { useAnalyticsStore } from './useAnalyticsStore';

describe('useAnalyticsStore', () => {
  beforeEach(() => {
    useAnalyticsStore.getState().clear();
  });

  it('starts with an empty event queue', () => {
    expect(useAnalyticsStore.getState().events).toEqual([]);
  });

  it('enqueue appends an event with a timestamp', () => {
    const before = Date.now();

    useAnalyticsStore.getState().enqueue('card_saved', { cardId: 7 });

    const { events } = useAnalyticsStore.getState();
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ name: 'card_saved', payload: { cardId: 7 } });
    expect(events[0].timestamp).toBeGreaterThanOrEqual(before);
  });

  it('enqueue works without a payload', () => {
    useAnalyticsStore.getState().enqueue('card_deleted');

    expect(useAnalyticsStore.getState().events[0]).toMatchObject({
      name: 'card_deleted',
      payload: undefined,
    });
  });

  it('enqueue appends to, rather than replaces, existing events', () => {
    useAnalyticsStore.getState().enqueue('card_captured');
    useAnalyticsStore.getState().enqueue('card_saved');

    expect(useAnalyticsStore.getState().events.map((event) => event.name)).toEqual([
      'card_captured',
      'card_saved',
    ]);
  });

  it('clear empties the queue', () => {
    useAnalyticsStore.getState().enqueue('card_captured');

    useAnalyticsStore.getState().clear();

    expect(useAnalyticsStore.getState().events).toEqual([]);
  });
});
