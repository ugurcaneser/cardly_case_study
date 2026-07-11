import { StyleSheet, View } from 'react-native';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

type TabIconProps = {
  name: IconSymbolName;
  focused: boolean;
};

/** A tab icon that switches to the primary color when its screen is active — no background treatment. */
export function TabIcon({ name, focused }: TabIconProps) {
  return (
    <View style={styles.wrapper}>
      <IconSymbol name={name} size={22} color={focused ? Colors.primary : Colors.outline} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
