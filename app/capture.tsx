import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useCreateCardMutation } from '@/src/services/api/queries';
import { storeCardImage } from '@/src/services/files/imageStorage';
import { setLocalImageUri } from '@/src/services/files/localImageMap';
import { useCaptureStore } from '@/src/store/useCaptureStore';
import { getErrorMessage } from '@/src/utils/errors';

export default function CaptureScreen() {
  const step = useCaptureStore((state) => state.step);
  const previewUri = useCaptureStore((state) => state.previewUri);
  const saveError = useCaptureStore((state) => state.error);
  const setCaptured = useCaptureStore((state) => state.setCaptured);
  const startSaving = useCaptureStore((state) => state.startSaving);
  const setError = useCaptureStore((state) => state.setError);
  const reset = useCaptureStore((state) => state.reset);

  const createCardMutation = useCreateCardMutation();

  const [isPicking, setIsPicking] = useState(false);
  const [pickError, setPickError] = useState<string | null>(null);

  function handlePickerResult(result: ImagePicker.ImagePickerResult) {
    if (!result.canceled) {
      setCaptured(result.assets[0].uri);
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

  async function handleSave() {
    if (!previewUri) {
      return;
    }
    startSaving();
    try {
      const stored = await storeCardImage(previewUri);
      const card = await createCardMutation.mutateAsync({
        status: 'pending',
        thumbnail_base64: stored.thumbnailBase64,
      });
      await setLocalImageUri(card.id, stored.localUri);
      reset();
      router.replace(`/card/${card.id}`);
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }

  function handleClose() {
    reset();
    router.back();
  }

  function handleRetake() {
    reset();
  }

  if (step === 'saving') {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.savingText}>Saving…</ThemedText>
      </ThemedView>
    );
  }

  if (step === 'error') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle" style={styles.hero}>
          Couldn&apos;t save this card
        </ThemedText>
        {saveError ? <ThemedText style={styles.errorText}>{saveError}</ThemedText> : null}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: Colors.tint }]}
            onPress={handleSave}
            accessibilityRole="button">
            <ThemedText style={styles.primaryButtonText} color="#fff">
              Retry
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: Colors.tint }]}
            onPress={handleRetake}
            accessibilityRole="button">
            <ThemedText style={[styles.secondaryButtonText, { color: Colors.tint }]}>
              Discard
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  if (step === 'captured' && previewUri) {
    return (
      <ThemedView style={styles.container}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Close">
          <IconSymbol name="xmark" size={24} color={Colors.text} />
        </TouchableOpacity>

        <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="contain" />

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: Colors.tint }]}
            onPress={handleSave}
            accessibilityRole="button">
            <ThemedText style={styles.primaryButtonText} color="#fff">
              Save
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: Colors.tint }]}
            onPress={handleRetake}
            accessibilityRole="button">
            <ThemedText style={[styles.secondaryButtonText, { color: Colors.tint }]}>
              Retake
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleClose}
        accessibilityRole="button"
        accessibilityLabel="Close">
        <IconSymbol name="xmark" size={24} color={Colors.text} />
      </TouchableOpacity>

      <View style={styles.hero}>
        <IconSymbol name="camera.fill" size={48} color={Colors.tint} />
        <ThemedText type="title">Scan a Card</ThemedText>
        <ThemedText style={[styles.subtitle, { color: Colors.icon }]}>
          Take a photo or choose one from your library.
        </ThemedText>
      </View>

      {pickError ? <ThemedText style={styles.errorText}>{pickError}</ThemedText> : null}

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: Colors.tint }]}
          onPress={handleTakePhoto}
          disabled={isPicking}
          accessibilityRole="button">
          <IconSymbol name="camera.fill" size={20} color="#fff" />
          <ThemedText style={styles.primaryButtonText} color="#fff">
            Take Photo
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: Colors.tint }]}
          onPress={handleChooseFromLibrary}
          disabled={isPicking}
          accessibilityRole="button">
          <ThemedText style={[styles.secondaryButtonText, { color: Colors.tint }]}>
            Choose from Library
          </ThemedText>
        </TouchableOpacity>
      </View>

      {isPicking ? <ActivityIndicator style={styles.loadingIndicator} /> : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 8,
  },
  hero: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  subtitle: {
    textAlign: 'center',
  },
  errorText: {
    color: '#991B1B',
    textAlign: 'center',
    marginBottom: 16,
  },
  savingText: {
    marginTop: 16,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 28,
  },
  primaryButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  loadingIndicator: {
    marginTop: 16,
  },
  preview: {
    width: '100%',
    flex: 1,
    marginBottom: 16,
  },
  actions: {
    width: '100%',
  },
});
