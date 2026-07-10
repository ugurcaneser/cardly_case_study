import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type EmptyStateProps = {
  icon: IconSymbolName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: `${colors.icon}22` }]}>
        <IconSymbol name={icon} size={32} color={colors.tint} />
      </View>

      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>

      {description ? (
        <ThemedText style={[styles.description, { color: colors.icon }]}>{description}</ThemedText>
      ) : null}

      {actionLabel && onAction ? (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={onAction}
          accessibilityRole="button">
          <ThemedText style={styles.buttonText} lightColor="#fff" darkColor="#fff">
            {actionLabel}
          </ThemedText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 8,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    fontWeight: '600',
  },
});
