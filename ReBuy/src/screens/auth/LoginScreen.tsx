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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { logo } from '../../assets/images';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import FormTextField from '../../components/form/FormTextField';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../services/api/auth/authService';
import type { RootStackScreenProps } from '../../navigation/types';
import { colors, fonts } from '../../theme';
import { loginSchema } from '../../utils/authSchemas';

type Props = RootStackScreenProps<'Login'>;

const comingSoon = (feature: string) =>
  showAlert(feature, `${feature} is coming soon.`);

function LoginScreen({ navigation }: Props) {
  const { setSession, continueAsGuest } = useAuth();
  const {
    control,
    handleSubmit,
    setFocus,
    setError,
    clearErrors,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    const { unsubscribe } = watch(() => clearErrors('root'));
    return unsubscribe;
  }, [watch, clearErrors]);

  const handleLogin = handleSubmit(async values => {
    try {
      const response = await login(values);
      if (!response.token || !response.user) {
        throw new Error('Login response is missing the token or user');
      }
      setSession(response.user, response.token);
    } catch (error) {
      if (__DEV__) {
        console.log(
          'Login error:',
          axios.isAxiosError(error)
            ? error.response?.data ?? error.message
            : error,
        );
      }
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      // The backend names the field that was wrong, so the error shows under
      // it; anything else (offline, server error) stays at the top of the form.
      const field = axios.isAxiosError(error)
        ? error.response?.data?.field
        : undefined;
      if (message && (field === 'email' || field === 'password')) {
        setError(field, { message }, { shouldFocus: true });
        return;
      }
      setError('root', {
        message: message ?? "We couldn't sign you in. Please try again.",
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
              <Pressable
                style={styles.skip}
                accessibilityRole="button"
                accessibilityLabel="Skip sign in"
                hitSlop={8}
                onPress={continueAsGuest}
                disabled={isSubmitting}
              >
                <Text style={styles.link}>Skip</Text>
              </Pressable>
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>
                Sign in to buy and sell pre-owned items.
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
                placeholder="Enter your password"
                password
                autoCapitalize="none"
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={() => handleLogin()}
                editable={!isSubmitting}
              />

              <Pressable
                style={styles.forgot}
                accessibilityRole="link"
                hitSlop={8}
                onPress={() =>
                  navigation.navigate('ForgotPassword', {
                    email: getValues('email').trim(),
                  })
                }
              >
                <Text style={styles.link}>Forgot password?</Text>
              </Pressable>

              <Button
                title="Sign in"
                onPress={handleLogin}
                loading={isSubmitting}
              />
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.social}>
              <Button
                variant="outline"
                title="Continue with Google"
                onPress={() => comingSoon('Google sign-in')}
                disabled={isSubmitting}
              />
              {Platform.OS === 'ios' && (
                <Button
                  variant="outline"
                  title="Continue with Apple"
                  onPress={() => comingSoon('Apple sign-in')}
                  disabled={isSubmitting}
                />
              )}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>New to ReBuy? </Text>
              <Pressable
                accessibilityRole="link"
                hitSlop={8}
                onPress={() => navigation.navigate('SignUp')}
              >
                <Text style={styles.link}>Create an account</Text>
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
  skip: {
    marginLeft: 'auto',
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
  forgot: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  link: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.accent,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: fonts.label,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textSecondary,
  },
  social: {
    gap: 12,
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

export default LoginScreen;
