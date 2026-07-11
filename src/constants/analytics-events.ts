export const AnalyticsEvents = {
  CARD_CAPTURED: 'card_captured',
  CARD_ANALYZE_STARTED: 'card_analyze_started',
  CARD_ANALYZED: 'card_analyzed',
  CARD_ANALYZE_FAILED: 'card_analyze_failed',
  CARD_SAVED: 'card_saved',
  CARD_SAVE_FAILED: 'card_save_failed',
  CARD_DELETED: 'card_deleted',
  COLLECTION_CREATED: 'collection_created',
  COLLECTION_RENAMED: 'collection_renamed',
  COLLECTION_DELETED: 'collection_deleted',
  CARD_ADDED_TO_COLLECTION: 'card_added_to_collection',
  CARD_REMOVED_FROM_COLLECTION: 'card_removed_from_collection',
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
