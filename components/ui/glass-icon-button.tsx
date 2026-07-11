import { BlurView } from 'expo-blur';
import {
  StyleSheet,
  TouchableOpacity,
  type StyleProp,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';

import { Colors, Radii } from '@/constants/theme';

type GlassIconButtonProps = {
  onPress: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
} & Omit<TouchableOpacityProps, 'onPress' | 'style'>;

/** A circular glassmorphic button — used over the camera preview where a solid surface would break the "live" context. */
export function GlassIconButton({ onPress, children, style, ...rest }: GlassIconButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.touchable, style]} {...rest}>
      <BlurView intensity={40} tint="dark" style={styles.blur}>
        {children}
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    borderRadius: Radii.full,
    overflow: 'hidden',
  },
  blur: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
});
