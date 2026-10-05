import { useEffect } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { showAlert } from '../../components/ui/AlertProvider';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { logo } from '../../assets/images';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import FormTextField from '../../components/form/FormTextField';
import { register } from '../../services/api/auth/authService';
import type { RootStackScreenProps } from '../../navigation/types';
import { colors, fonts } from '../../theme';
import { signUpSchema } from '../../utils/authSchemas';

type Props = RootStackScreenProps<'SignUp'>;

function SignUpScreen({ navigation }: Props) {
  const {
    control,
    handleSubmit,
    setFocus,
    setError,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptedTerms: false,
    },
  });

  useEffect(() => {
    const { unsubscribe } = watch(() => clearErrors('root'));
    return unsubscribe;
  }, [watch, clearErrors]);

  const handleSignUp = handleSubmit(async ({ name, email, password }) => {
    try {
      await register({ name, email, password });
      showAlert('Account created', 'You can now sign in.', [
        { text: 'OK', onPress: () => navigation.popTo('Login') },
      ]);
    } catch (error) {
      if (__DEV__) {
        console.log(
          'Register error:',
          axios.isAxiosError(error)
            ? error.response?.data ?? error.message
            : error,
        );
      }
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      // A taken email belongs under the email field; anything else (offline,
      // server error) stays at the top of the form.
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setError(
          'email',
          { message: message ?? 'Email already registered' },
          { shouldFocus: true },
        );
        return;
      }
      setError('root', {
        message:
          message ?? "We couldn't create your account. Please try again.",
      });
    }
  });

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
              {!!errors.root?.message && (
                <Text style={styles.formError} accessibilityRole="alert">
                  {errors.root.message}
                </Text>
              )}

              <FormTextField
                control={control}
                name="name"
                label="Full name"
                placeholder="Your name"
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => setFocus('email')}
                editable={!isSubmitting}
              />

              <FormTextField
                control={control}
                name="email"
                label="Email"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => setFocus('password')}
                editable={!isSubmitting}
              />

              <FormTextField
                control={control}
                name="password"
                label="Password"
                placeholder="Create a password"
                password
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => setFocus('confirmPassword')}
                editable={!isSubmitting}
              />

              <FormTextField
                control={control}
                name="confirmPassword"
                label="Confirm password"
                placeholder="Re-enter your password"
                password
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="go"
                onSubmitEditing={() => handleSignUp()}
                editable={!isSubmitting}
              />

              <View style={styles.termsBlock}>
                <View style={styles.terms}>
                  <Controller
                    control={control}
                    name="acceptedTerms"
                    render={({ field: { value, onChange } }) => (
                      <Pressable
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: value }}
                        accessibilityLabel="I agree to the Terms and Privacy Policy"
                        hitSlop={8}
                        disabled={isSubmitting}
                        onPress={() => onChange(!value)}
                        style={[
                          styles.checkbox,
                          value && styles.checkboxChecked,
                          !!errors.acceptedTerms && styles.checkboxError,
                        ]}
                      >
                        {value && <Text style={styles.checkmark}>✓</Text>}
                      </Pressable>
                    )}
                  />
                  <Text style={styles.termsText}>
                    I agree to the{' '}
                    <Text
                      style={styles.link}
                      accessibilityRole="link"
                      onPress={() =>
                        showAlert(
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
                  <Text style={styles.fieldError}>
                    {errors.acceptedTerms.message}
                  </Text>
                )}
              </View>

              <Button
                title="Create account"
                onPress={handleSignUp}
                loading={isSubmitting}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Pressable
                accessibilityRole="link"
                hitSlop={8}
                onPress={() => navigation.popTo('Login')}
                disabled={isSubmitting}
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
