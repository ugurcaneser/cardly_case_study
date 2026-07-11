import { Image, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import type { EnrichOcrResult, EnrichUnrecognizedReason } from '@/src/types/enrichment';
import { getUnrecognizedReasonMessage } from '@/src/utils/enrichmentCopy';

type EnrichmentUnrecognizedCardProps = {
  previewUri: string | null;
  ocr: EnrichOcrResult;
  reason: EnrichUnrecognizedReason;
};

export function EnrichmentUnrecognizedCard({ previewUri, ocr, reason }: EnrichmentUnrecognizedCardProps) {
  return (
    <View style={styles.container}>
      {previewUri ? (
        <View style={[styles.imageWrapper, { backgroundColor: `${Colors.icon}22` }]}>
          <Image source={{ uri: previewUri }} style={styles.image} resizeMode="cover" />
        </View>
      ) : null}

      <ThemedText type="subtitle" style={styles.heading}>
        Card not recognized
      </ThemedText>
      <ThemedText style={[styles.message, { color: Colors.icon }]}>
        {getUnrecognizedReasonMessage(reason)}
      </ThemedText>

      {ocr.rawText ? (
        <View style={styles.ocrBlock}>
          <ThemedText style={[styles.ocrLabel, { color: Colors.icon }]}>Detected text</ThemedText>
          <ThemedText style={styles.ocrText}>{ocr.rawText}</ThemedText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  imageWrapper: {
    width: 200,
    aspectRatio: 5 / 7,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heading: {
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
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
});
