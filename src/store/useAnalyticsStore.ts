import { create } from 'zustand';

export type AnalyticsEventRecord = {
  name: string;
  payload?: Record<string, unknown>;
  timestamp: number;
};

type AnalyticsState = {
  events: AnalyticsEventRecord[];
};

type AnalyticsActions = {
  enqueue: (name: string, payload?: Record<string, unknown>) => void;
  clear: () => void;
};

export const useAnalyticsStore = create<AnalyticsState & AnalyticsActions>((set) => ({
  events: [],

  enqueue: (name, payload) =>
    set((state) => ({
      events: [...state.events, { name, payload, timestamp: Date.now() }],
    })),

  clear: () => set({ events: [] }),
}));
