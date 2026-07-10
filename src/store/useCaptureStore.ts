import { create } from 'zustand';

import type { EnrichResult } from '@/src/types/enrichment';

export type CaptureStep = 'idle' | 'captured' | 'submitting' | 'reviewing' | 'saving' | 'error';

type CaptureState = {
  step: CaptureStep;
  previewUri: string | null;
  enrichResult: EnrichResult | null;
  coldStartHintVisible: boolean;
  error: string | null;
};

type CaptureActions = {
  setCaptured: (previewUri: string) => void;
  startSubmitting: () => void;
  showColdStartHint: () => void;
  setReviewing: (result: EnrichResult) => void;
  setError: (error: string) => void;
  startSaving: () => void;
  reset: () => void;
};

const initialState: CaptureState = {
  step: 'idle',
  previewUri: null,
  enrichResult: null,
  coldStartHintVisible: false,
  error: null,
};

export const useCaptureStore = create<CaptureState & CaptureActions>((set) => ({
  ...initialState,

  setCaptured: (previewUri) =>
    set({
      step: 'captured',
      previewUri,
      enrichResult: null,
      error: null,
      coldStartHintVisible: false,
    }),

  startSubmitting: () => set({ step: 'submitting', error: null, coldStartHintVisible: false }),

  showColdStartHint: () => set({ coldStartHintVisible: true }),

  setReviewing: (result) =>
    set({ step: 'reviewing', enrichResult: result, coldStartHintVisible: false }),

  setError: (error) => set({ step: 'error', error, coldStartHintVisible: false }),

  startSaving: () => set({ step: 'saving' }),

  reset: () => set(initialState),
}));
