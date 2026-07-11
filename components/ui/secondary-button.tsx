import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radii } from '@/constants/theme';

type SecondaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
} & Omit<PressableProps, 'onPress' | 'disabled' | 'style'>;

/** The design system's outlined pill — a lower-emphasis pairing for a PrimaryButton (e.g. Retake next to Save). */
export function SecondaryButton({ label, onPress, disabled = false, ...rest }: SecondaryButtonProps) {
  return (
    <Pressable
      onPress={() => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
      }}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled]}
      {...rest}>
      <ThemedText type="titleLg" color={Colors.primary}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: Colors.surfaceContainerHigh,
  },
  disabled: {
    opacity: 0.5,
  },
});
