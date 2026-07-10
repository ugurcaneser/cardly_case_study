import type { EnrichResult } from '@/src/types/enrichment';

import { useCaptureStore } from './useCaptureStore';

const matchedResult: EnrichResult = {
  status: 'matched',
  ocr: { rawText: 'Lightning Bolt', parsedName: 'Lightning Bolt', parsedNumber: null },
  match: {
    source: 'scryfall',
    scryfallId: 'abc-123',
    name: 'Lightning Bolt',
    setName: 'Masters 25',
    setCode: 'a25',
    collectorNumber: '133',
    rarity: 'common',
    manaCost: '{R}',
    typeLine: 'Instant',
    oracleText: null,
    imageUrl: 'https://example.com/card.jpg',
    prices: { usd: '0.25' },
  },
  timing: { ocrMs: 100, matchMs: 50, totalMs: 150 },
};

describe('useCaptureStore', () => {
  beforeEach(() => {
    useCaptureStore.getState().reset();
  });

  it('starts in the idle step with no data', () => {
    expect(useCaptureStore.getState()).toMatchObject({
      step: 'idle',
      previewUri: null,
      enrichResult: null,
      coldStartHintVisible: false,
      error: null,
    });
  });

  it('setCaptured moves to captured, stores the preview URI, and clears stale error/result state', () => {
    useCaptureStore.getState().setError('previous error');

    useCaptureStore.getState().setCaptured('file:///tmp/photo.jpg');

    expect(useCaptureStore.getState()).toMatchObject({
      step: 'captured',
      previewUri: 'file:///tmp/photo.jpg',
      error: null,
    });
  });

  it('startSubmitting moves to submitting and clears the cold-start hint', () => {
    useCaptureStore.setState({ coldStartHintVisible: true });

    useCaptureStore.getState().startSubmitting();

    expect(useCaptureStore.getState()).toMatchObject({
      step: 'submitting',
      coldStartHintVisible: false,
    });
  });

  it('showColdStartHint sets the flag without changing the step', () => {
    useCaptureStore.getState().startSubmitting();

    useCaptureStore.getState().showColdStartHint();

    expect(useCaptureStore.getState()).toMatchObject({
      step: 'submitting',
      coldStartHintVisible: true,
    });
  });

  it('setReviewing moves to reviewing and stores the enrich result', () => {
    useCaptureStore.getState().setReviewing(matchedResult);

    const state = useCaptureStore.getState();
    expect(state.step).toBe('reviewing');
    expect(state.enrichResult).toEqual(matchedResult);
    expect(state.coldStartHintVisible).toBe(false);
  });

  it('setError moves to error and stores the message', () => {
    useCaptureStore.getState().setError('Request timed out');

    expect(useCaptureStore.getState()).toMatchObject({
      step: 'error',
      error: 'Request timed out',
    });
  });

  it('startSaving moves to saving', () => {
    useCaptureStore.getState().startSaving();

    expect(useCaptureStore.getState().step).toBe('saving');
  });

  it('reset returns to the initial idle state from any step', () => {
    useCaptureStore.getState().setCaptured('file:///tmp/photo.jpg');
    useCaptureStore.getState().setError('boom');

    useCaptureStore.getState().reset();

    expect(useCaptureStore.getState()).toMatchObject({
      step: 'idle',
      previewUri: null,
      enrichResult: null,
      coldStartHintVisible: false,
      error: null,
    });
  });
});
