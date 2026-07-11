import { useEffect, useState } from 'react';
import { Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';

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
        <ThemedView style={[styles.card, { borderColor: Colors.icon }]}>
          <ThemedText type="subtitle">{title}</ThemedText>
          <TextInput
            style={[styles.input, { borderColor: Colors.icon, color: Colors.text }]}
            placeholder={placeholder}
            placeholderTextColor={Colors.icon}
            value={value}
            onChangeText={setValue}
            autoFocus
          />
          {errorMessage ? <ThemedText style={styles.errorText}>{errorMessage}</ThemedText> : null}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onCancel} accessibilityRole="button">
              <ThemedText>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={isSubmitting || !value.trim()}
              accessibilityRole="button">
              <ThemedText style={[styles.confirmLabel, { color: Colors.tint }]}>
                {isSubmitting ? (submittingLabel ?? confirmLabel) : confirmLabel}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 24,
    marginTop: 4,
  },
  confirmLabel: {
    fontWeight: '600',
  },
});
