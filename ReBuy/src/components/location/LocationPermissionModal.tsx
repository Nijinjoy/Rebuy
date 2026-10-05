import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { LocationStatus } from '../../utils/locationPermission';
import { colors, fonts, withAlpha } from '../../theme';
import Icon from '../ui/Icon';

type Props = {
  visible: boolean;
  // What's stopping ReBuy from reading the location; picks the wording.
  status: Exclude<LocationStatus, 'granted'>;
  // Shows a spinner on the main button, e.g. while the system prompt is up.
  busy?: boolean;
  onEnable: () => void;
  onDismiss: () => void;
};

const COPY: Record<
  Props['status'],
  { title: string; message: string; action: string }
> = {
  denied: {
    title: 'Enable location',
    message:
      'ReBuy uses your location to show listings and sellers near you. We only use it while you have the app open.',
    action: 'Allow location',
  },
  blocked: {
    title: 'Location access is off',
    message: Platform.select({
      ios: 'Open Settings and set Location to "While Using the App" to see listings near you.',
      default:
        'Open Settings, tap Permissions › Location and choose "Allow only while using the app".',
    }),
    action: 'Open Settings',
  },
  services_off: {
    title: 'Turn on location',
    message: Platform.select({
      ios: 'Location Services is off. Go to Settings › Privacy & Security › Location Services to turn it on.',
      default:
        "Your phone's location is switched off. Turn it on to see listings near you.",
    }),
    action: Platform.select({
      ios: 'Open Settings',
      default: 'Turn on location',
    }),
  },
};

function LocationPermissionModal({
  visible,
  status,
  busy = false,
  onEnable,
  onDismiss,
}: Props) {
  const scale = useRef(new Animated.Value(0.92)).current;
  const copy = COPY[status];

  useEffect(() => {
    if (!visible) {
      return;
    }
    scale.setValue(0.92);
    Animated.spring(scale, {
      toValue: 1,
      friction: 7,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [visible, scale]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.backdrop}>
        <Animated.View
          style={[styles.card, { transform: [{ scale }] }]}
          accessibilityViewIsModal
        >
          <View style={styles.halo}>
            <View style={styles.iconCircle}>
              <Icon name="locate" color={colors.onPrimary} size={30} />
            </View>
          </View>

          <Text style={styles.title} accessibilityRole="header">
            {copy.title}
          </Text>
          <Text style={styles.message}>{copy.message}</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy }}
            disabled={busy}
            onPress={onEnable}
            style={({ pressed }) => [
              styles.button,
              styles.primary,
              pressed && styles.pressed,
            ]}
          >
            {busy ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={[styles.buttonText, styles.primaryText]}>
                {copy.action}
              </Text>
            )}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onDismiss}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonText}>Not now</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: withAlpha(colors.primary, 0.45),
  },
  card: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 16,
    borderRadius: 24,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  halo: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    backgroundColor: colors.accentSoft,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  title: {
    textAlign: 'center',
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.textPrimary,
  },
  message: {
    marginTop: 10,
    marginBottom: 22,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  button: {
    alignSelf: 'stretch',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    marginBottom: 6,
    backgroundColor: colors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontFamily: fonts.label,
    fontSize: 15,
    color: colors.textSecondary,
  },
  primaryText: {
    color: colors.onPrimary,
  },
});

export default LocationPermissionModal;
