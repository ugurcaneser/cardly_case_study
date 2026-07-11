import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCaptureStore } from '@/src/store/useCaptureStore';

export default function CaptureScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const step = useCaptureStore((state) => state.step);
  const previewUri = useCaptureStore((state) => state.previewUri);
  const setCaptured = useCaptureStore((state) => state.setCaptured);
  const reset = useCaptureStore((state) => state.reset);

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

  function handleClose() {
    reset();
    router.back();
  }

  function handleRetake() {
    reset();
  }

  if (step === 'captured' && previewUri) {
    return (
      <ThemedView style={styles.container}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Close">
          <IconSymbol name="xmark" size={24} color={colors.text} />
        </TouchableOpacity>

        <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="contain" />

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.tint }]}
            onPress={handleRetake}
            accessibilityRole="button">
            <ThemedText style={[styles.secondaryButtonText, { color: colors.tint }]}>
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
        <IconSymbol name="xmark" size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.hero}>
        <IconSymbol name="camera.fill" size={48} color={colors.tint} />
        <ThemedText type="title">Scan a Card</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
          Take a photo or choose one from your library.
        </ThemedText>
      </View>

      {pickError ? <ThemedText style={styles.errorText}>{pickError}</ThemedText> : null}

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.tint }]}
          onPress={handleTakePhoto}
          disabled={isPicking}
          accessibilityRole="button">
          <IconSymbol name="camera.fill" size={20} color="#fff" />
          <ThemedText style={styles.primaryButtonText} lightColor="#fff" darkColor="#fff">
            Take Photo
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.tint }]}
          onPress={handleChooseFromLibrary}
          disabled={isPicking}
          accessibilityRole="button">
          <ThemedText style={[styles.secondaryButtonText, { color: colors.tint }]}>
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
