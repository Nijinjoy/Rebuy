import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { requestPasswordReset } from '../../api/auth';
import { ApiError } from '../../api/client';
import Button from '../../components/ui/Button';
import Icon, { IconName } from '../../components/ui/Icon';
import TextField from '../../components/ui/TextField';
import type { RootStackScreenProps } from '../../navigation/types';
import { colors, fonts, withAlpha, palette } from '../../theme';
import { validateEmail } from '../../utils/validation';

type Props = RootStackScreenProps<'ForgotPassword'>;

const RESEND_SECONDS = 30;

function Badge({ icon }: { icon: IconName }) {
  return (
    <View style={styles.badge}>
      <Icon name={icon} color={colors.accent} size={30} />
    </View>
  );
}

function ForgotPasswordScreen({ navigation, route }: Props) {
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [error, setError] = useState<string>();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  // The address the link was sent to; switches to the "check your email" step.
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const send = async (address: string) => {
    setLoading(true);
    setError(undefined);
    try {
      await requestPasswordReset(address);
      setSentTo(address);
      setCooldown(RESEND_SECONDS);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "We couldn't send the link. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    const found = validateEmail(email);
    setSubmitted(true);
    setError(found);
    if (!found) {
      send(email.trim());
    }
  };

  const handleChange = (value: string) => {
    setEmail(value);
    if (submitted) {
      setError(validateEmail(value));
    }
  };

  const backToLogin = () => navigation.navigate('Login');

  return (
    <View style={styles.background}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.back, pressed && styles.pressed]}
            >
              <Icon name="back" color={colors.textPrimary} size={22} />
            </Pressable>

            {sentTo === null ? (
              <>
                <View style={styles.header}>
                  <Badge icon="lock" />
                  <Text style={styles.title} accessibilityRole="header">
                    Forgot password?
                  </Text>
                  <Text style={styles.subtitle}>
                    Enter the email you signed up with and we’ll send you a link
                    to reset your password.
                  </Text>
                </View>

                <View style={styles.form}>
                  <TextField
                    label="Email"
                    placeholder="you@example.com"
                    value={email}
                    onChangeText={handleChange}
                    error={error}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="send"
                    onSubmitEditing={handleSubmit}
                    editable={!loading}
                    autoFocus={!email}
                  />
                  <Button
                    title="Send reset link"
                    onPress={handleSubmit}
                    loading={loading}
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.header}>
                  <Badge icon="mail" />
                  <Text style={styles.title} accessibilityRole="header">
                    Check your email
                  </Text>
                  <Text style={styles.subtitle}>
                    If an account exists for{' '}
                    <Text style={styles.emailText}>{sentTo}</Text>, you’ll get a
                    link to reset your password. It may take a few minutes, so
                    check your spam folder too.
                  </Text>
                </View>

                <View style={styles.form}>
                  {!!error && (
                    <Text style={styles.error} accessibilityRole="alert">
                      {error}
                    </Text>
                  )}
                  <Button title="Back to sign in" onPress={backToLogin} />
                  <Button
                    variant="outline"
                    title={
                      cooldown > 0
                        ? `Resend link in ${cooldown}s`
                        : 'Resend link'
                    }
                    onPress={() => send(sentTo)}
                    loading={loading}
                    disabled={cooldown > 0}
                  />
                  <Pressable
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => {
                      setSentTo(null);
                      setSubmitted(false);
                      setError(undefined);
                    }}
                    style={({ pressed }) => [
                      styles.changeEmail,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.link}>Use a different email</Text>
                  </Pressable>
                </View>
              </>
            )}

            {sentTo === null && (
              <View style={styles.footer}>
                <Text style={styles.footerText}>Remembered it? </Text>
                <Pressable
                  accessibilityRole="link"
                  hitSlop={8}
                  onPress={backToLogin}
                >
                  <Text style={styles.link}>Sign in</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.background,
    backgroundImage: `linear-gradient(180deg, ${colors.background} 0%, ${colors.backgroundAlt} 100%)`,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
  header: {
    marginTop: 32,
    marginBottom: 28,
  },
  badge: {
    width: 64,
    height: 64,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: withAlpha(palette.gold, 0.14),
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 10,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  emailText: {
    fontFamily: fonts.label,
    color: colors.textPrimary,
  },
  form: {
    gap: 16,
  },
  error: {
    marginTop: -8,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.error,
  },
  changeEmail: {
    alignSelf: 'center',
    marginTop: 4,
  },
  link: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.accent,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 28,
  },
  footerText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
});

export default ForgotPasswordScreen;
