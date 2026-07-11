import { useAnalyticsStore } from '@/src/store/useAnalyticsStore';

/**
 * There's no analytics backend in this project's scope - `track` logs to the
 * console (for local debugging) and queues the event in memory; `flush`
 * simulates the batch-send a real provider integration would do here, then
 * clears the queue.
 */
export function track(name: string, payload?: Record<string, unknown>): void {
  console.log(`[analytics] ${name}`, payload ?? {});
  useAnalyticsStore.getState().enqueue(name, payload);
}

export function flush(): void {
  const { events, clear } = useAnalyticsStore.getState();
  if (events.length === 0) {
    return;
  }

  console.log(`[analytics] flushing ${events.length} event(s)`, events);
  clear();
}
