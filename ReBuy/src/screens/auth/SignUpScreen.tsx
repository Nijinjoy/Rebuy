import { useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInputInstance,
  View,
} from 'react-native';
import { logo } from '../../assets/images';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import type { SignUpDetails } from '../../types/user';
import type { RootStackScreenProps } from '../../navigation/types';
import TextField from '../../components/ui/TextField';
import { colors, fonts } from '../../theme';

type Props = RootStackScreenProps<'SignUp'>;

type Values = SignUpDetails & {
  confirmPassword: string;
  acceptedTerms: boolean;
};

type Errors = {
  name?: string;
  confirmPassword?: string;
  acceptedTerms?: string;
  form?: string;
};

function validate(values: Values): Errors {
  const errors: Errors = {};
  const name = values.name.trim();

  if (!name) {
    errors.name = 'Enter your full name.';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (!values.acceptedTerms) {
    errors.acceptedTerms = 'Accept the terms to continue.';
  }

  return errors;
}

function hasErrors(errors: Errors) {
  return Object.values(errors).some(Boolean);
}

function SignUpScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [values, setValues] = useState<Values>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const confirmRef = useRef<TextInputInstance>(null);

  // After the first submit attempt, re-validate as the user types.
  const update = <K extends keyof Values>(key: K, value: Values[K]) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (submitted) {
      setErrors(validate(next));
    }
  };

  const handleSignUp = async () => {
    const found = validate(values);
    setSubmitted(true);
    setErrors(found);
    if (hasErrors(found)) {
      return;
    }

    setLoading(true);
    try {
      await signUp({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      });
    } catch {
      setErrors({
        form: "We couldn't create your account. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

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
            <View style={styles.brand}>
              <Image
                source={logo}
                style={styles.logo}
                accessibilityIgnoresInvertColors
              />
              <Text style={styles.wordmark}>REBUY</Text>
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Create an account</Text>
              <Text style={styles.subtitle}>
                Join ReBuy to buy and sell pre-owned items.
              </Text>
            </View>

            <View style={styles.form}>
              {!!errors.form && (
                <Text style={styles.formError} accessibilityRole="alert">
                  {errors.form}
                </Text>
              )}

              <TextField
                label="Full name"
                placeholder="Your name"
                value={values.name}
                onChangeText={v => update('name', v)}
                error={errors.name}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => emailRef.current?.focus()}
                editable={!loading}
              />

              <TextField
                ref={emailRef}
                label="Email"
                placeholder="you@example.com"
                value={values.email}
                onChangeText={v => update('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => passwordRef.current?.focus()}
                editable={!loading}
              />

              <TextField
                ref={passwordRef}
                label="Password"
                placeholder="Create a password"
                value={values.password}
                onChangeText={v => update('password', v)}
                password
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => confirmRef.current?.focus()}
                editable={!loading}
              />

              <TextField
                ref={confirmRef}
                label="Confirm password"
                placeholder="Re-enter your password"
                value={values.confirmPassword}
                onChangeText={v => update('confirmPassword', v)}
                error={errors.confirmPassword}
                password
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="go"
                onSubmitEditing={handleSignUp}
                editable={!loading}
              />

              <View style={styles.termsBlock}>
                <View style={styles.terms}>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: values.acceptedTerms }}
                    accessibilityLabel="I agree to the Terms and Privacy Policy"
                    hitSlop={8}
                    disabled={loading}
                    onPress={() =>
                      update('acceptedTerms', !values.acceptedTerms)
                    }
                    style={[
                      styles.checkbox,
                      values.acceptedTerms && styles.checkboxChecked,
                      !!errors.acceptedTerms && styles.checkboxError,
                    ]}
                  >
                    {values.acceptedTerms && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </Pressable>
                  <Text style={styles.termsText}>
                    I agree to the{' '}
                    <Text
                      style={styles.link}
                      accessibilityRole="link"
                      // Placeholder until the terms page exists.
                      onPress={() =>
                        Alert.alert(
                          'Terms and Privacy Policy',
                          'The full terms are coming soon.',
                        )
                      }
                    >
                      Terms and Privacy Policy
                    </Text>
                  </Text>
                </View>
                {!!errors.acceptedTerms && (
                  <Text style={styles.fieldError}>{errors.acceptedTerms}</Text>
                )}
              </View>

              <Button
                title="Create account"
                onPress={handleSignUp}
                loading={loading}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Pressable
                accessibilityRole="link"
                hitSlop={8}
                onPress={() => navigation.popTo('Login')}
                disabled={loading}
              >
                <Text style={styles.link}>Sign in</Text>
              </Pressable>
            </View>
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
    paddingTop: 24,
    paddingBottom: 32,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 16,
    letterSpacing: 5,
    color: colors.textPrimary,
  },
  header: {
    marginTop: 36,
    marginBottom: 28,
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
  form: {
    gap: 16,
  },
  formError: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.error,
  },
  termsBlock: {
    gap: 6,
  },
  terms: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxError: {
    borderColor: colors.error,
  },
  checkmark: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.onPrimary,
  },
  termsText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  fieldError: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.error,
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

export default SignUpScreen;
