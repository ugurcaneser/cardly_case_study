import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EnrichmentMatchCard } from '@/components/enrichment-match-card';
import { EnrichmentUnrecognizedCard } from '@/components/enrichment-unrecognized-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassIconButton } from '@/components/ui/glass-icon-button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { AnalyticsEvents } from '@/src/constants/analytics-events';
import { track } from '@/src/services/analytics/logger';
import { useCreateCardMutation, useEnrichMutation } from '@/src/services/api/queries';
import { prepareImageForUpload, storeCardImage } from '@/src/services/files/imageStorage';
import { setLocalImageUri } from '@/src/services/files/localImageMap';
import { useCaptureStore } from '@/src/store/useCaptureStore';
import { buildCardCreateInput } from '@/src/utils/buildCardCreateInput';
import { getErrorMessage } from '@/src/utils/errors';

// Escalates the cold-start hint copy in two stages rather than a single
// message, since a genuine free-tier cold start (up to ~60s) reads very
// differently at 5s ("still working") than at 15s+ ("this is a cold start").
const COLD_START_HINT_MS = 5000;
const COLD_START_SEVERE_HINT_MS = 15000;

// This is the "Scan" tab's actual content — not a separate pushed/modal
// route, so the bottom tab bar stays visible and switching to it is a plain
// tab switch like Home/History/Collections/Settings, not a screen transition.
export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const step = useCaptureStore((state) => state.step);
  const previewUri = useCaptureStore((state) => state.previewUri);
  const enrichResult = useCaptureStore((state) => state.enrichResult);
  const coldStartHintVisible = useCaptureStore((state) => state.coldStartHintVisible);
  const saveError = useCaptureStore((state) => state.error);
  const setCaptured = useCaptureStore((state) => state.setCaptured);
  const startSubmitting = useCaptureStore((state) => state.startSubmitting);
  const showColdStartHint = useCaptureStore((state) => state.showColdStartHint);
  const setReviewing = useCaptureStore((state) => state.setReviewing);
  const startSaving = useCaptureStore((state) => state.startSaving);
  const setError = useCaptureStore((state) => state.setError);
  const reset = useCaptureStore((state) => state.reset);

  const createCardMutation = useCreateCardMutation();
  const enrichMutation = useEnrichMutation();

  const [isPicking, setIsPicking] = useState(false);
  const [pickError, setPickError] = useState<string | null>(null);
  const [isColdStartSevere, setIsColdStartSevere] = useState(false);

  useEffect(() => {
    if (step !== 'submitting') {
      setIsColdStartSevere(false);
      return;
    }
    const hintTimer = setTimeout(showColdStartHint, COLD_START_HINT_MS);
    const severeHintTimer = setTimeout(() => setIsColdStartSevere(true), COLD_START_SEVERE_HINT_MS);
    return () => {
      clearTimeout(hintTimer);
      clearTimeout(severeHintTimer);
    };
  }, [step, showColdStartHint]);

  function handlePickerResult(result: ImagePicker.ImagePickerResult) {
    if (!result.canceled) {
      setCaptured(result.assets[0].uri);
      track(AnalyticsEvents.CARD_CAPTURED);
    }
  }

  async function handleTakePhoto() {
    setPickError(null);
    setIsPicking(true);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setPickError('Camera access is required to scan a card.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.9 });
      handlePickerResult(result);
    } finally {
      setIsPicking(false);
    }
  }

  async function handleChooseFromLibrary() {
    setPickError(null);
    setIsPicking(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setPickError('Photo library access is required to import a card image.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.9 });
      handlePickerResult(result);
    } finally {
      setIsPicking(false);
    }
  }

  async function handleAnalyze() {
    if (!previewUri) {
      return;
    }
    startSubmitting();
    track(AnalyticsEvents.CARD_ANALYZE_STARTED);
    try {
      const uploadUri = await prepareImageForUpload(previewUri);
      const result = await enrichMutation.mutateAsync(uploadUri);
      setReviewing(result);
      track(AnalyticsEvents.CARD_ANALYZED, { status: result.status });
    } catch (error) {
      const message = getErrorMessage(error);
      setError(message);
      track(AnalyticsEvents.CARD_ANALYZE_FAILED, { message });
    }
  }

  async function handleSave() {
    if (!previewUri) {
      return;
    }
    startSaving();
    try {
      const stored = await storeCardImage(previewUri);
      const card = await createCardMutation.mutateAsync(
        buildCardCreateInput(stored.thumbnailBase64, enrichResult)
      );
      await setLocalImageUri(card.id, stored.localUri);
      track(AnalyticsEvents.CARD_SAVED, { cardId: card.id, status: card.status });
      reset();
      router.push(`/card/${card.id}`);
    } catch (error) {
      const message = getErrorMessage(error);
      setError(message);
      track(AnalyticsEvents.CARD_SAVE_FAILED, { message });
    }
  }

  function handleRetake() {
    reset();
  }

  function handleClose() {
    reset();
    router.replace('/');
  }

  const containerInsetStyle = { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 };

  let content: ReactNode;
  // The close button is only offered on the two steps where nothing is
  // in flight (idle and captured-but-not-yet-analyzed) — once analysis or
  // saving has started, "Discard"/"Retake" are the deliberate exits instead.
  let showCloseButton = false;

  if (step === 'saving') {
    content = (
      <ThemedView style={[styles.container, containerInsetStyle]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <ThemedText type="bodyLg" style={styles.savingText}>
          Saving…
        </ThemedText>
      </ThemedView>
    );
  } else if (step === 'error') {
    content = (
      <ThemedView style={[styles.container, containerInsetStyle]}>
        <ThemedText type="headlineSm" style={styles.hero}>
          Couldn&apos;t analyze this card
        </ThemedText>
        {saveError ? (
          <ThemedText type="bodyMd" style={[styles.errorText, { color: Colors.error }]}>
            {saveError}
          </ThemedText>
        ) : null}
        <View style={styles.buttons}>
          <PrimaryButton label="Retry" onPress={handleAnalyze} />
          <SecondaryButton label="Save without Analysis" onPress={handleSave} />
          <ThemedText
            type="titleLg"
            style={[styles.tertiaryButtonText, { color: Colors.onSurfaceVariant }]}
            onPress={handleRetake}>
            Discard
          </ThemedText>
        </View>
      </ThemedView>
    );
  } else if (step === 'submitting') {
    content = (
      <ThemedView style={[styles.container, containerInsetStyle]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <ThemedText type="bodyLg" style={styles.savingText}>
          Analyzing your card…
        </ThemedText>
        {coldStartHintVisible ? (
          <ThemedText type="bodyMd" style={[styles.hintText, { color: Colors.onSurfaceVariant }]}>
            {isColdStartSevere
              ? 'The server might be waking up from a cold start — this can take up to a minute.'
              : 'This is taking a little longer than usual…'}
          </ThemedText>
        ) : null}
      </ThemedView>
    );
  } else if (step === 'reviewing' && enrichResult) {
    content = (
      <ThemedView style={styles.reviewingContainer}>
        <ScrollView
          contentContainerStyle={[
            styles.reviewingContent,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
          ]}>
          {enrichResult.status === 'matched' ? (
            <EnrichmentMatchCard match={enrichResult.match} />
          ) : (
            <EnrichmentUnrecognizedCard
              previewUri={previewUri}
              ocr={enrichResult.ocr}
              reason={enrichResult.reason}
            />
          )}

          <View style={styles.buttons}>
            <PrimaryButton label="Save" onPress={handleSave} />
            <SecondaryButton label="Retake" onPress={handleRetake} />
          </View>
        </ScrollView>
      </ThemedView>
    );
  } else if (step === 'captured' && previewUri) {
    showCloseButton = true;
    content = (
      <ThemedView style={[styles.container, containerInsetStyle]}>
        <View style={styles.previewFrame}>
          <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="cover" />
        </View>

        <View style={styles.buttons}>
          <PrimaryButton label="Analyze Card" onPress={handleAnalyze} />
          <SecondaryButton label="Retake" onPress={handleRetake} />
        </View>
      </ThemedView>
    );
  } else {
    showCloseButton = true;
    content = (
      <ThemedView style={[styles.container, containerInsetStyle]}>
        <View style={styles.hero}>
          <IconSymbol name="camera.fill" size={44} color={Colors.tertiary} />
          <ThemedText type="headlineMd">Scan a Card</ThemedText>
          <ThemedText type="bodyMd" style={[styles.subtitle, { color: Colors.onSurfaceVariant }]}>
            Take a photo or choose one from your library.
          </ThemedText>
        </View>

        {pickError ? (
          <ThemedText type="bodyMd" style={[styles.errorText, { color: Colors.error }]}>
            {pickError}
          </ThemedText>
        ) : null}

        <View style={styles.buttons}>
          <PrimaryButton
            label="Take Photo"
            onPress={handleTakePhoto}
            disabled={isPicking}
            icon={<IconSymbol name="camera.fill" size={18} color={Colors.onPrimary} />}
          />
          <SecondaryButton label="Choose from Library" onPress={handleChooseFromLibrary} disabled={isPicking} />
        </View>

        {isPicking ? <ActivityIndicator style={styles.loadingIndicator} color={Colors.primary} /> : null}
      </ThemedView>
    );
  }

  return (
    <View style={styles.root}>
      {content}
      {showCloseButton ? (
        <GlassIconButton
          onPress={handleClose}
          style={[styles.closeButton, { top: insets.top + 12 }]}
          accessibilityRole="button"
          accessibilityLabel="Close">
          <IconSymbol name="xmark" size={20} color={Colors.onSurface} />
        </GlassIconButton>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    left: Spacing.containerMargin,
    zIndex: 10,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.containerMargin,
  },
  reviewingContainer: {
    flex: 1,
  },
  reviewingContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.containerMargin,
    gap: Spacing.stackMd,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.stackSm,
    marginBottom: 24,
  },
  subtitle: {
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  savingText: {
    marginTop: 16,
  },
  hintText: {
    marginTop: 8,
    textAlign: 'center',
  },
  buttons: {
    width: '100%',
    gap: Spacing.stackMd,
  },
  tertiaryButtonText: {
    textAlign: 'center',
    paddingVertical: 10,
  },
  loadingIndicator: {
    marginTop: 16,
  },
  previewFrame: {
    width: '100%',
    flex: 1,
    marginBottom: 16,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceContainerLowest,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
});
