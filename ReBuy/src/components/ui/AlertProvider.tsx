import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, fonts, withAlpha } from '../../theme';
import Icon, { IconName } from './Icon';

export type AlertButton = {
  text: string;
  // 'cancel' is outlined and also runs when the alert is dismissed;
  // 'destructive' is red.
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

export type AlertOptions = {
  // Shown in a circle above the title.
  icon?: IconName;
  // Colours the icon circle; 'danger' suits destructive confirmations.
  tone?: 'default' | 'success' | 'danger';
  // Whether tapping outside or Android back closes the alert. Defaults to
  // true when there's a cancel button.
  cancelable?: boolean;
};

type AlertRequest = {
  title: string;
  message?: string;
  buttons: AlertButton[];
  options: AlertOptions;
};

let enqueue: ((request: AlertRequest) => void) | null = null;

// Same call shape as React Native's Alert.alert, drawn in the app's style.
// Falls back to the native alert if AlertProvider isn't mounted.
export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options: AlertOptions = {},
) {
  const request: AlertRequest = {
    title,
    message,
    buttons: buttons?.length ? buttons : [{ text: 'OK' }],
    options,
  };
  if (enqueue) {
    enqueue(request);
  } else {
    Alert.alert(title, message, buttons);
  }
}

const TONE_COLORS = {
  default: { background: colors.accentSoft, icon: colors.textPrimary },
  success: { background: colors.accentSoft, icon: colors.accent },
  danger: { background: withAlpha(colors.error, 0.12), icon: colors.error },
};

// Renders alerts one at a time; alerts shown while one is open wait their
// turn. Mount once near the root of the app.
export function AlertProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<AlertRequest[]>([]);
  const [active, setActive] = useState<AlertRequest | null>(null);
  const [visible, setVisible] = useState(false);
  // Keeps the content on screen while the modal fades out.
  const lastShown = useRef<AlertRequest | null>(null);
  // Button action to run once the modal has closed.
  const pendingAction = useRef<(() => void) | null>(null);
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    enqueue = request => setQueue(current => [...current, request]);
    return () => {
      enqueue = null;
    };
  }, []);

  useEffect(() => {
    if (active || queue.length === 0) {
      return;
    }
    const [next, ...rest] = queue;
    lastShown.current = next;
    setActive(next);
    setQueue(rest);
    setVisible(true);
    scale.setValue(0.92);
    Animated.spring(scale, {
      toValue: 1,
      friction: 7,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [active, queue, scale]);

  const finish = () => {
    const action = pendingAction.current;
    pendingAction.current = null;
    setActive(null);
    action?.();
  };

  const close = (action?: () => void) => {
    if (!visible) {
      return;
    }
    pendingAction.current = action ?? null;
    setVisible(false);
    // iOS can't present the camera, pickers or another modal until this one
    // is fully gone, so wait for onDismiss there.
    if (Platform.OS !== 'ios') {
      setTimeout(finish, 0);
    }
  };

  const request = active ?? lastShown.current;
  const cancelButton = request?.buttons.find(b => b.style === 'cancel');
  const cancelable = request?.options.cancelable ?? !!cancelButton;
  const dismiss = () => {
    if (cancelable) {
      close(cancelButton?.onPress);
    }
  };

  const stacked = (request?.buttons.length ?? 0) > 2;
  const tone = TONE_COLORS[request?.options.tone ?? 'default'];

  return (
    <>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={dismiss}
        onDismiss={Platform.OS === 'ios' ? finish : undefined}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={dismiss}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          {request && (
            <Animated.View
              style={[styles.card, { transform: [{ scale }] }]}
              accessibilityViewIsModal
              accessibilityRole="alert"
            >
              {!!request.options.icon && (
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: tone.background },
                  ]}
                >
                  <Icon
                    name={request.options.icon}
                    color={tone.icon}
                    size={24}
                  />
                </View>
              )}
              <Text style={styles.title} accessibilityRole="header">
                {request.title}
              </Text>
              {!!request.message && (
                <Text style={styles.message}>{request.message}</Text>
              )}

              <View style={[styles.buttons, stacked && styles.buttonsStacked]}>
                {request.buttons.map((button, index) => {
                  const kind = button.style ?? 'default';
                  return (
                    <Pressable
                      key={`${button.text}-${index}`}
                      accessibilityRole="button"
                      onPress={() => close(button.onPress)}
                      style={({ pressed }) => [
                        styles.button,
                        !stacked && styles.buttonInRow,
                        kind === 'default' && styles.buttonDefault,
                        kind === 'cancel' && styles.buttonCancel,
                        kind === 'destructive' && styles.buttonDestructive,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          kind === 'cancel'
                            ? styles.buttonTextCancel
                            : styles.buttonTextFilled,
                        ]}
                        numberOfLines={1}
                      >
                        {button.text}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>
          )}
        </View>
      </Modal>
    </>
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
    maxWidth: 340,
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    borderRadius: 22,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    textAlign: 'center',
    fontFamily: fonts.display,
    fontSize: 17,
    color: colors.textPrimary,
  },
  message: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  buttons: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  buttonsStacked: {
    flexDirection: 'column',
  },
  button: {
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  buttonInRow: {
    flex: 1,
  },
  buttonDefault: {
    backgroundColor: colors.primary,
  },
  buttonCancel: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  buttonDestructive: {
    backgroundColor: colors.error,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontFamily: fonts.label,
    fontSize: 14,
  },
  buttonTextFilled: {
    color: colors.onPrimary,
  },
  buttonTextCancel: {
    color: colors.textPrimary,
  },
});
