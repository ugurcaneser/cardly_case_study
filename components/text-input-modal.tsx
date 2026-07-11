import { useEffect, useState } from 'react';
import { Modal, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Colors, Radii, Spacing } from '@/constants/theme';

type TextInputModalProps = {
  visible: boolean;
  title: string;
  placeholder?: string;
  initialValue?: string;
  confirmLabel: string;
  submittingLabel?: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onCancel: () => void;
  onConfirm: (value: string) => void;
};

export function TextInputModal({
  visible,
  title,
  placeholder,
  initialValue = '',
  confirmLabel,
  submittingLabel,
  isSubmitting = false,
  errorMessage,
  onCancel,
  onConfirm,
}: TextInputModalProps) {
  const [value, setValue] = useState(initialValue);

  // Re-seed from initialValue each time the modal opens - covers both the
  // "always starts blank" (create) and "starts pre-filled" (rename) cases.
  useEffect(() => {
    if (visible) {
      setValue(initialValue);
    }
  }, [visible, initialValue]);

  function handleConfirm() {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    onConfirm(trimmed);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ThemedText type="headlineSm">{title}</ThemedText>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={Colors.onSurfaceVariant}
            value={value}
            onChangeText={setValue}
            autoFocus
          />
          {errorMessage ? (
            <ThemedText type="bodyMd" style={[styles.errorText, { color: Colors.error }]}>
              {errorMessage}
            </ThemedText>
          ) : null}
          <View style={styles.actions}>
            <PrimaryButton
              label={isSubmitting ? (submittingLabel ?? confirmLabel) : confirmLabel}
              onPress={handleConfirm}
              disabled={isSubmitting || !value.trim()}
            />
            <ThemedText
              type="titleLg"
              style={[styles.cancelText, { color: Colors.onSurfaceVariant }]}
              onPress={onCancel}>
              Cancel
            </ThemedText>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.containerMargin,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: 20,
    gap: Spacing.stackMd,
  },
  input: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.onSurface,
  },
  errorText: {
    marginTop: -4,
  },
  actions: {
    gap: Spacing.stackSm,
    marginTop: 4,
  },
  cancelText: {
    textAlign: 'center',
    paddingVertical: 10,
  },
});
