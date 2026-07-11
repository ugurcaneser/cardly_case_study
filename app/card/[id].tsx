import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { CardStateBadge } from '@/components/card-state-badge';
import { EmptyState } from '@/components/empty-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useCardQuery, useDeleteCardMutation } from '@/src/services/api/queries';
import { getLocalImageUri, removeLocalImageUri } from '@/src/services/files/localImageMap';
import { capitalize, formatUsdPrice } from '@/src/utils/enrichmentCopy';
import { extractMatchedDetails } from '@/src/utils/extractMatchedDetails';

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cardId = Number(id);

  const cardQuery = useCardQuery(cardId);
  const deleteCardMutation = useDeleteCardMutation();

  const [localImageUri, setLocalImageUriState] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getLocalImageUri(cardId).then((uri) => {
      if (!cancelled) {
        setLocalImageUriState(uri);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [cardId]);

  function handleDelete() {
    Alert.alert('Delete this card?', "This can't be undone.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteCardMutation.mutateAsync(cardId);
          await removeLocalImageUri(cardId);
          router.back();
        },
      },
    ]);
  }

  if (cardQuery.isPending) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator accessibilityLabel="Loading" />
      </ThemedView>
    );
  }

  if (cardQuery.isError) {
    return (
      <EmptyState
        icon="clock.fill"
        title="Couldn't load this card"
        description="Check your connection and try again."
        actionLabel="Retry"
        onAction={() => cardQuery.refetch()}
      />
    );
  }

  const card = cardQuery.data;
  const title = card.matched_name ?? card.ocr_parsed_name ?? 'Unrecognized card';
  const imageUri =
    localImageUri ?? (card.thumbnail_base64 ? `data:image/jpeg;base64,${card.thumbnail_base64}` : null);
  const details = extractMatchedDetails(card.matched_data);
  const price = details.prices ? formatUsdPrice(details.prices) : null;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title }} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.imageWrapper, { backgroundColor: `${Colors.icon}22` }]}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" /> : null}
        </View>

        <CardStateBadge status={card.status} />

        <ThemedText type="subtitle" style={styles.name}>
          {title}
        </ThemedText>

        {card.matched_set_name ? (
          <ThemedText style={[styles.meta, { color: Colors.icon }]}>
            {card.matched_set_name}
            {card.matched_collector_number ? ` · #${card.matched_collector_number}` : ''}
            {details.rarity ? ` · ${capitalize(details.rarity)}` : ''}
          </ThemedText>
        ) : null}

        {details.typeLine ? (
          <ThemedText style={styles.typeLine}>
            {details.manaCost ? `${details.typeLine}  ${details.manaCost}` : details.typeLine}
          </ThemedText>
        ) : null}

        {details.oracleText ? <ThemedText style={styles.oracleText}>{details.oracleText}</ThemedText> : null}

        {price ? <ThemedText style={[styles.price, { color: Colors.tint }]}>{price}</ThemedText> : null}

        {card.enrichment_error ? (
          <ThemedText style={styles.errorText}>{card.enrichment_error}</ThemedText>
        ) : null}

        {!card.matched_name && card.raw_ocr_text ? (
          <View style={styles.ocrBlock}>
            <ThemedText style={[styles.ocrLabel, { color: Colors.icon }]}>Detected text</ThemedText>
            <ThemedText style={styles.ocrText}>{card.raw_ocr_text}</ThemedText>
          </View>
        ) : null}

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} accessibilityRole="button">
          <IconSymbol name="trash" size={18} color="#991B1B" />
          <ThemedText style={styles.deleteButtonText} color="#991B1B">
            Delete Card
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 24,
    gap: 4,
  },
  imageWrapper: {
    width: 220,
    aspectRatio: 5 / 7,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    textAlign: 'center',
    marginTop: 8,
  },
  meta: {
    fontSize: 13,
    textAlign: 'center',
  },
  typeLine: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  oracleText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  errorText: {
    color: '#991B1B',
    textAlign: 'center',
    marginTop: 12,
  },
  ocrBlock: {
    width: '100%',
    marginTop: 20,
    gap: 4,
  },
  ocrLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  ocrText: {
    fontSize: 14,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    paddingVertical: 10,
  },
  deleteButtonText: {
    fontWeight: '600',
    fontSize: 15,
  },
});
