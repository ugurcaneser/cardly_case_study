import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { CardStatus } from '@/src/types/card';

type StatusConfig = {
  label: string;
  backgroundColor: string;
  textColor: string;
};

// Fixed (theme-independent) colors — status chips like this conventionally
// stay recognizable regardless of light/dark mode.
const STATUS_CONFIG: Record<CardStatus, StatusConfig> = {
  pending: { label: 'Pending', backgroundColor: '#E5E7EB', textColor: '#374151' },
  enriched: { label: 'Matched', backgroundColor: '#DCFCE7', textColor: '#166534' },
  unrecognized: { label: 'Unrecognized', backgroundColor: '#FEF3C7', textColor: '#92400E' },
  error: { label: 'Error', backgroundColor: '#FEE2E2', textColor: '#991B1B' },
};

type CardStateBadgeProps = {
  status: CardStatus;
};

export function CardStateBadge({ status }: CardStateBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
      <ThemedText style={[styles.label, { color: config.textColor }]}>{config.label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
